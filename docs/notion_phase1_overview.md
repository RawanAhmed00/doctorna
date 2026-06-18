# 🏥 Doctorna API - Project Overview & Master Architecture

| Property | Details |
| :--- | :--- |
| **Author** | Architecture Team |
| **Date Saved** | Current Build |
| **Status** | 🟢 Unified & Active |
| **Module** | Core Architecture & Ecosystem |
| **Topic Tags** | Architecture, Routing, User Flows, Permissions, Endpoints |

---

## 🎯 1. Project Objectives & Goals

The overarching objective of the **Doctorna API** is to provide a highly scalable, enterprise-grade backend ecosystem for a medical booking platform. It transitions a standard clinic database into a "Smart Booking System."

**Core Architectural Goals:**
1. **Strict Separation of Concerns:** Eliminating "spaghetti code." Routes act only as traffic cops, Controllers manage business logic, Validators enforce rules, and Repositories handle strict database interactions.
2. **High-Performance Caching:** Every single `GET` request in the system is backed by Redis. The system uses dynamic, alphabetically-sorted cache keys to instantly serve complex filtered data, while utilizing wildcard deletion (`keys *`) on `POST/PUT/DELETE` to guarantee data is never stale.
3. **Stateless Security:** Implementing JSON Web Tokens (JWT) to ensure that the server doesn't need to track active sessions. Every request mathematically proves the user's identity and exact role.
4. **Defensive Validation:** Controllers never trust frontend data. Every module utilizes a centralized guard function (e.g., `validateDoctorData`) to instantly reject malformed emails, invalid enum statuses, or illogical integers with a `400 BAD REQUEST` before touching the database.

---

## 🧩 2. The Modules Ecosystem

The project is divided into 6 highly cohesive modules. Here is the deep dive into what each module does and the exact endpoints it exposes to the frontend.

### 1. Authentication Module (`/auth`)
*   **Purpose:** The gateway to the system. Handles user onboarding, identity verification, and secure credential recovery.
*   **Endpoints:**
    *   `POST /api.php/auth/register` - Validates strict password rules, hashes credentials, creates the user, and auto-generates a login JWT.
    *   `POST /api.php/auth/login` - Verifies hashes and dispenses the JWT token payload.
    *   `POST /api.php/auth/forgot-password` - Generates a secure, 32-byte hex token and simulates a mailer dispatch.
    *   `POST /api.php/auth/reset-password` - Consumes the reset token to overwrite the user's hashed password safely.

### 2. Doctors Module (`/doctors`)
*   **Purpose:** Manages the medical staff directory. Heavily utilized by public users for discovery.
*   **Endpoints:**
    *   `GET /api.php/doctors` - Public. Returns all doctors. Supports dynamic query filtering (`?gender=male&rank=specialist`).
    *   `GET /api.php/doctors?id={id}` - Public. Returns a single doctor's profile.
    *   `POST /api.php/doctors` - Admin Only. Adds a new doctor to the directory.
    *   `PATCH /api.php/doctors?id={id}` - Admin Only. Updates specific fields (e.g., toggling `is_available` to 0 if a doctor goes on vacation).
    *   `DELETE /api.php/doctors?id={id}` - Admin Only. Soft-deletes a doctor (sets `deleted_at`).

### 3. Appointments Module (`/appointments`)
*   **Purpose:** The core transactional engine of the application. Links authenticated patients to specific doctors for a scheduled time.
*   **Endpoints:**
    *   `GET /api.php/appointments` - User/Admin. Users see *only* their own bookings. Admins see the entire hospital schedule.
    *   `GET /api.php/appointments?id={id}` - Admin Only. Fetches a specific booking.
    *   `POST /api.php/appointments` - User Only. Creates a booking. System extracts the `user_id` strictly from the JWT, never trusting the JSON body.
    *   `PATCH /api.php/appointments?id={id}` - Admin Only. Used to transition statuses (e.g., `pending` -> `confirmed` -> `completed`).

### 4. Patients Module (`/patients`)
*   **Purpose:** Administrative management of standard users. (Note: Patients *create* themselves via the Auth module, but Admins *manage* them here).
*   **Endpoints:**
    *   `GET /api.php/patients` - Admin Only. Returns a directory of users. Prevents Admins from accidentally fetching other Admins by hardcoding `WHERE role='user'`.
    *   `GET /api.php/patients?id={id}` - Admin Only. Fetch a specific patient profile.
    *   `PATCH /api.php/patients?id={id}` - Admin Only. Update patient contact info or age.
    *   `DELETE /api.php/patients?id={id}` - Admin Only. Soft-deletes a patient account.

### 5. Specialities Module (`/specialities`)
*   **Purpose:** Categorizes the hospital's departments (e.g., Cardiology, Neurology).
*   **Endpoints:**
    *   `GET /api.php/specialities` - Public. Directory of departments. Supports `?name=` filtering.
    *   `GET /api.php/specialities?id={id}` - Public. Fetches department details. Supports `?include_doctors=1` to run a heavy SQL `JOIN` returning the exact count of active doctors in that department.
    *   `POST /api.php/specialities` - Admin Only. Creates a department.
    *   `PATCH /api.php/specialities?id={id}` - Admin Only. Updates department details.
    *   `DELETE /api.php/specialities?id={id}` - Admin Only. Soft-deletes a department.

### 6. SubServices Module (`/subservices`)
*   **Purpose:** Granular medical procedures offered at the clinic (e.g., MRI Scan, X-Ray, Blood Test). 
*   **Endpoints:**
    *   `GET /api.php/subservices` - Public. Lists procedures. Supports advanced range filtering (`?min_fees=100&max_fees=500`).
    *   `GET /api.php/subservices?id={id}` - Public. Fetches specific procedure details.
    *   `POST /api.php/subservices` - Admin Only. Creates a new procedure.
    *   `PATCH /api.php/subservices?id={id}` - Admin Only. Updates procedure pricing or naming.
    *   `DELETE /api.php/subservices?id={id}` - Admin Only. Removes a procedure from the catalog.

---

## 🔐 3. Global Permissions & Auth Matrix

Security is handled via a strict, multi-layered approach.

> 💡 **Concept:** The system utilizes "Stateless Security." Because we use JWTs, the PHP server does not use `$_SESSION`. Every single HTTP request must include the `Bearer Token` in the headers.

### 🟢 Public (No Authentication)
* **Scope:** Discovery and Entry.
* **Mechanism:** Endpoints simply do not call `VerifyToken()`. 
* **Allowed Actions:** A guest can browse Specialities, find a Doctor they like, and see how much an MRI costs. They can then Register an account.

### 🟡 User (Authenticated Patient)
* **Scope:** Personal Health Management.
* **Mechanism:** The endpoint calls `$token = VerifyToken();`. If the token is missing or tampered with, execution dies with `401 UNAUTHORIZED`.
* **Allowed Actions:** The user can `POST` to `/appointments`. The system ignores any `user_id` sent in the JSON body (preventing them from booking an appointment for someone else) and securely injects `$token->user_id` into the database query.

### 🔴 Admin (Superuser)
* **Scope:** Hospital Administration.
* **Mechanism:** The endpoint calls `checkAdminPrivileges();` which intrinsically checks `if ($token->role !== 'admin') throw 403 FORBIDDEN`.
* **Allowed Actions:** Can modify pricing on SubServices, fire Doctors (Soft Delete), and change Appointment statuses.

---

## 🛤️ 4. In-Depth User Flows

### Flow A: The Patient Booking Journey
1. **Discovery:** Patient navigates the frontend. The frontend hits `GET /api.php/specialities` to render a dropdown.
2. **Selection:** Patient clicks "Cardiology". Frontend hits `GET /api.php/doctors?spec_id=1` to get all heart doctors.
3. **Authentication:** Patient clicks "Book". Frontend hits `POST /api.php/auth/login` to get the JWT.
4. **Transaction:** Frontend sends `POST /api.php/appointments` with `{"doc_id": 5, "date_time": "2026-07-01 10:00:00", "status": "pending"}` and the JWT in the header.
5. **System Response:** Controller intercepts, validates date regex, verifies JWT, writes to DB, and returns the successful booking.

### Flow B: The Admin Catalog Update
1. **Login:** Admin logs in via `/auth/login` and receives an Admin-tier JWT.
2. **Price Update:** Admin realizes MRIs are too cheap. Frontend sends `PATCH /api.php/subservices?id=3` with `{"fees": 600}`.
3. **System Response:** 
   - `api.php` routes to `SubServiceController`.
   - `checkAdminPrivileges()` verifies the token.
   - `getRequiredId()` safely extracts `3`.
   - `validateSubServiceData()` ensures `600` is a positive numeric value.
   - `updateSubService()` runs the SQL `UPDATE`.
   - `clearSubServiceCache(3)` fires, instantly wiping `subservices:all` and `subservices:filter:name=MRI` from Redis so the public website immediately reflects the new $600 price.

---

## 💻 5. Code Walkthrough: The Master Router (`api.php`)

> 📝 **Context:** To mimic modern frameworks (like Laravel), 100% of API traffic flows through a single gatekeeper: `routes/api.php`. This completely eliminates the need for maintaining dozens of scattered routing files.

### A. The Parsing Engine
**Purpose:** Extract the required Module and Action from the URL string, regardless of how the server folders are structured.

```php
// 1. Get the HTTP Method (GET, POST, etc.)
$method = $_SERVER["REQUEST_METHOD"];

// 2. Safely extract the path
$path = $_SERVER['PATH_INFO'] ?? str_replace($_SERVER['SCRIPT_NAME'], '', parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$path = trim($path, '/');

// 3. Slice the path into an array
$segments = explode('/', $path);

// 4. Securely assign variables
$module = strtolower($segments[0] ?? '');
$action = strtolower($segments[1] ?? '');

// 5. RESTful ID Trick: Convert path IDs to Query IDs
if (is_numeric($action)) {
    $_GET['id'] = $action;
}
```
*   **Input Example:** `http://localhost/api.php/doctors/5`
*   **Execution:** 
    *   `$segments[0]` becomes `'doctors'`.
    *   `$segments[1]` becomes `'5'`.
    *   The "RESTful ID Trick" realizes `'5'` is numeric, and secretly assigns `$_GET['id'] = 5`.
*   **Output:** The system knows we want the `doctors` module, and the controllers can seamlessly use their existing `isset($_GET['id'])` logic without rewriting the entire application.

### B. The Master Switch
**Purpose:** To explicitly whitelist and direct traffic to the correct Controller based on the parsed `$module`.

```php
switch ($module) {
    case 'doctors':
    case 'doctor':
        switch ($method) {
            case 'GET':     isset($_GET['id']) ? handleGetDoctorById($conn) : handleGetAllDoctors($conn); break;
            case 'POST':    handleCreateDoctor($conn); break;
            case 'PUT':
            case 'PATCH':   handleUpdateDoctor($conn); break;
            case 'DELETE':  handleDeleteDoctor($conn); break;
            default:        methodNotAllowed(); // Rejects anything else
        }
        break;
        
    // ... other module cases ...

    default:
        response(HttpStatus('NOT_FOUND'), "API Module Not Found");
        break;
}
```
*   **Why this is perfect architecture:** 
    1. **Strict Mapping:** It is impossible to hit an endpoint that hasn't been explicitly defined. 
    2. **Graceful Degradation:** If a frontend developer makes a typo (`GET /api.php/doctrs`), the `default` case at the very bottom catches it and returns a clean `404 NOT FOUND` JSON response instead of a fatal PHP crash.
    3. **Method Guards:** If someone tries to `POST` to an endpoint that only accepts `GET` (e.g., a patient trying to POST to Specialities), the inner `default` case throws a `405 Method Not Allowed`, providing extreme application stability.