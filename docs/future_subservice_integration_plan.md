# Future Implementation Plan: Doctor-SubService "Offers" Integration

## 1. Memory Context & Background
**Current Architecture State:**
The application is a medical booking system unified under a highly structured, centralized architecture:
- **Routing:** All requests go through `routes/api.php` using hybrid routing (`/api.php/module?action=...` or `api.php?module=doctors&id=1`).
- **Controllers:** Enforce strict Separation of Concerns. Validation is done via controller-level guard functions (e.g., `validateDoctorData()`) utilizing `getJsonInput()` and `getRequiredId()`.
- **Repositories:** Handle all DB logic securely using the `runQuery()` helper. Dynamic searching uses the `applyFilters()` helper.
- **Caching:** Uses Redis (`serveFromCacheIfAvailable`, `saveToCache`, `deleteFromCache`). Dynamic cache keys are generated using `generateFilteredCacheKey()`.

**The Problem Being Solved:**
Currently, looking at the ERD, a `Doctor` and a `Subservice` are only connected through an `Appointment` (via the `Includes` relationship). The system only knows what subservice a doctor performed *after* the appointment happens. 
Because there is no "Offers" relationship directly between `Doctor` and `Subservice`, the system cannot answer: "Which doctors offer MRI Scans?" Furthermore, a patient could accidentally book a doctor for an X-Ray even if that doctor doesn't perform X-Rays.

**The Solution:**
Introduce a Many-to-Many (M:N) relationship between `Doctors` and `Subservices` representing what a doctor **Offers**. This upgrades the platform to a "Smart Booking System."

---

## 2. The User Flow
Adding this integration drastically changes the UX for the better.

### Flow A: The Discovery Phase (Search by Service)
1. **Action:** A Patient searches the frontend for "MRI Scan".
2. **System Response:** The API returns the SubService details AND a nested list of all Doctors who are certified to perform it.
3. **UX Win:** The patient clicks "Book Now" directly on the MRI service, and is presented strictly with doctors who offer it. Zero guesswork.

### Flow B: The Profile Phase (Doctor Menu)
1. **Action:** A Patient clicks on Dr. Alice's profile.
2. **System Response:** The API returns Dr. Alice's basic info, PLUS her specific "Menu of Services" (e.g., X-Ray, Blood Test) drawn from the new relationship table.
3. **UX Win:** Patients see exactly what procedures the doctor is capable of before booking.

### Flow C: The Validation Phase (Smart Booking)
1. **Action:** A Patient attempts to book an Appointment with Dr. Bob, requesting an "MRI Scan".
2. **System Response:** The Controller checks the `doctor_subservices` table. If Dr. Bob does not offer MRIs, the API instantly rejects the payload with a `400 BAD REQUEST: Doctor does not provide the requested subservices.`
3. **UX Win:** Clinic time is never wasted on mismatched appointments.

---

## 3. Database Architecture (What changes?)
We are not modifying existing tables, ensuring zero data loss. We are adding standard M:N pivot tables.

**Table 1: `doctor_subservices` (The "Offers" relationship)**
*   `id` (INT, Primary Key)
*   `doctor_id` (INT, Foreign Key references `doctors(id)`)
*   `subservice_id` (INT, Foreign Key references `sub_services(id)`)

**Table 2: `appointment_subservices` (The "Includes" relationship from the ERD)**
*If this doesn't already exist in the DB, it must be created to satisfy the ERD.*
*   `id` (INT, Primary Key)
*   `appointment_id` (INT, Foreign Key references `appointments(id)`)
*   `subservice_id` (INT, Foreign Key references `sub_services(id)`)

---

## 4. Exact Coding Implementation Plan (Phased)

To the AI Agent reading this in the future: **DO NOT** write raw `$stmt->prepare()`, do not use manual Redis checks, and do not bypass `routes/api.php`. Use the established helpers.

### Phase 1: Database Migration
*   Create an SQL script to create `doctor_subservices` and `appointment_subservices`.
*   Ensure cascading deletes are configured (if a doctor is hard-deleted, their subservice mappings disappear).

### Phase 2: Repository Updates
*   **Target:** `repos/DoctorRepo.php`
    *   Add `getDoctorSubServices($conn, $doctor_id)`: Runs a `JOIN` to fetch all `sub_services` linked to the doctor.
    *   Add `assignSubServiceToDoctor($conn, $doctor_id, $subservice_id)`: Inserts into `doctor_subservices`.
*   **Target:** `repos/SubServiceRepo.php`
    *   Add `getDoctorsBySubService($conn, $subservice_id)`: Runs a `JOIN` to fetch all `doctors` offering this service.

### Phase 3: Controller Feature Injection
*   **Target:** `Controllers/DoctorController.php`
    *   In `handleGetDoctorById()`, detect a query param `?include_subservices=1`. If true, fetch and append the doctor's menu of services to the JSON response.
    *   Create `handleAssignSubService($conn)` (Admin only) to link services to doctors.
    *   **Cache Rule:** Assigning a subservice must trigger `clearDoctorCache($doctor_id)` AND `clearSubServiceCache()`.
*   **Target:** `Controllers/SubServiceController.php`
    *   In `handleGetSubServiceById()`, detect `?include_doctors=1`. If true, append the list of capable doctors.
*   **Target:** `Controllers/AppointmentController.php`
    *   **Crucial Validation Update:** Update `handleCreateAppointment($conn)`. When creating an appointment, if the JSON body includes an array of `subservice_ids`, the controller MUST loop through them and query `doctor_subservices` to verify the chosen `doc_id` actually offers *all* requested services. Throw `HttpStatus('BAD_REQUEST')` if a mismatch occurs.

### Phase 4: Route Expansion & Postman
*   **Target:** `routes/api.php`
    *   Inside the `doctors` switch case, add routing for assigning subservices (e.g., a `POST` or `PATCH` depending on REST preference).
*   **Target:** `Doctorna_API_v2.postman_collection.json`
    *   Add new endpoints: "Assign SubService to Doctor (Admin)".
    *   Update documentation on "Get Doctor by ID" to explain the `?include_subservices=1` query flag.
    *   Update documentation on "Create Appointment" to show how to pass subservices in the JSON body.

---

## 5. Answering the "Whys" for Future Context

*   **Why use Bridge Tables instead of a comma-separated string in the DB?**
    Relational databases (MySQL/MariaDB) cannot safely or efficiently query comma-separated lists. Pivot tables allow indexed, blazing-fast `JOIN` queries and enforce foreign key constraints (so you can't assign a deleted service to a doctor).
*   **Why check the capabilities inside `AppointmentController`?**
    Security. Even if the frontend UI hides invalid services, a malicious or buggy client could force a POST request asking an Eye Doctor to do an MRI. The backend controller is the final wall of defense.
*   **Why use `include_subservices=1` instead of making a new endpoint?**
    It keeps the API RESTful and avoids endpoint bloat. It allows frontend developers to fetch exactly the amount of data they need in a single HTTP round-trip without making 3 separate requests.
*   **Why must we clear both caches when a doctor is assigned a service?**
    Because the data flows both ways. The Doctor's cached profile now needs to show the new service, and the SubService's cached list of capable doctors now needs to include the new doctor. Failing to clear both creates asymmetric, stale data.