# 👨‍⚕️ Doctorna API — Doctors & Specialities Module

## 1. Module Overview
The Doctors and Specialities modules manage the medical staff directory and hospital departments. Doctors are assigned to specialities via a foreign key. Both modules support public read access and admin-only write operations.

## 2. Doctors Module

### Endpoint Reference

#### GET `/api.php/doctors`
- **Auth:** Public
- **Description:** Returns all doctors. Supports dynamic query filtering.
- **Query Parameters:** Any field from the allowed filter list: `gender`, `spec_id`, `rank`, `name`, `is_available`
- **Caching:** Redis cache key pattern: `doctors:filter:{sorted-params}`
- **Code:** `DoctorController::handleGetAllDoctors()`

#### GET `/api.php/doctors?id={id}`
- **Auth:** Public
- **Description:** Returns single doctor by ID.
- **Caching:** Redis cache key pattern: `doctor:id:{id}`
- **Code:** `DoctorController::handleGetDoctorById()`

#### POST `/api.php/doctors`
- **Auth:** Admin Only (`checkAdminPrivileges()`)
- **Required Fields:** name, email, phone, gender, spec_id, rank, fees
- **Validations:**
  - `validateDoctorData()` — checks email format, phone not empty, gender (male/female), fees positive numeric
  - `getRequiredId()` — validates spec_id as numeric
  - Duplicate email → 409 Conflict via `getDoctorByEmail()`
- **Cache Eviction:** Clears `doctors:*` pattern from Redis
- **Code:** `DoctorController::handleCreateDoctor()`

#### PATCH `/api.php/doctors?id={id}`
- **Auth:** Admin Only
- **Description:** Partial update of doctor fields (name, email, phone, fees, rank, is_available, gender, spec_id)
- **Validations:** Same as create via `validateDoctorData()`
- **Cache Eviction:** Clears `doctors:*` and `doctor:id:{id}`
- **Code:** `DoctorController::handleUpdateDoctor()`

#### DELETE `/api.php/doctors?id={id}`
- **Auth:** Admin Only
- **Description:** Soft delete — sets `deleted_at` timestamp
- **Cache Eviction:** Clears `doctors:*` and `doctor:id:{id}`
- **Code:** `DoctorController::handleDeleteDoctor()`

### Repository Layer

| Function | SQL Pattern | Purpose |
| :--- | :--- | :--- |
| `getAllDoctors($conn, $filters)` | `SELECT * FROM doctors WHERE deleted_at IS NULL` + dynamic filters | List with filtering |
| `getDoctorById($conn, $id)` | `SELECT * FROM doctors WHERE id = :id AND deleted_at IS NULL` | Single fetch |
| `getDoctorByEmail($conn, $email)` | `SELECT id FROM doctors WHERE email = :email` | Duplicate check |
| `createDoctor($conn, $data)` | `INSERT INTO doctors (...) VALUES (...)` | Create |
| `updateDoctor($conn, $id, $data)` | `UPDATE doctors SET ... WHERE id = :id` | Update |
| `deleteDoctor($conn, $id)` | `UPDATE doctors SET deleted_at = NOW() WHERE id = :id` | Soft delete |

## 3. Specialities Module

### Endpoint Reference

#### GET `/api.php/specialities`
- **Auth:** Public
- **Description:** Returns all specialities. Supports `?name=` filtering.
- **Caching:** Redis cache key pattern: `specialities:all` or `specialities:filter:name={value}`
- **Code:** `SpecialityController::handleGetAllSpecialities()`

#### GET `/api.php/specialities?id={id}`
- **Auth:** Public
- **Description:** Returns single speciality. Supports `?include_doctors=1` for JOIN with doctor count.
- **Caching:** Redis cache key pattern: `speciality:id:{id}` or `speciality:id:{id}:withdoctors`
- **Code:** `SpecialityController::handleGetSpecialityById()`

#### POST `/api.php/specialities`
- **Auth:** Admin Only
- **Required Fields:** name
- **Validations:** `validateSpecialityData()` — name not empty
- **Cache Eviction:** Clears `specialities:*`
- **Code:** `SpecialityController::handleCreateSpeciality()`

#### PATCH `/api.php/specialities?id={id}`
- **Auth:** Admin Only
- **Cache Eviction:** Clears `specialities:*` and `speciality:id:{id}*`
- **Code:** `SpecialityController::handleUpdateSpeciality()`

#### DELETE `/api.php/specialities?id={id}`
- **Auth:** Admin Only
- **Description:** Soft delete
- **Cache Eviction:** Clears `specialities:*` and `speciality:id:{id}*`
- **Code:** `SpecialityController::handleDeleteSpeciality()`

### Repository Layer

| Function | SQL Pattern | Purpose |
| :--- | :--- | :--- |
| `getAllSpecialities($conn, $filters)` | `SELECT * FROM specialities WHERE deleted_at IS NULL` + optional name filter | List |
| `getSpecialityById($conn, $id)` | `SELECT * FROM specialities WHERE id = :id` | Single fetch |
| `getSpecialityWithDoctors($conn, $id)` | `SELECT s.*, COUNT(d.id) as doctor_count FROM specialities s LEFT JOIN doctors d ON s.id = d.spec_id WHERE s.id = :id` | With doctor count |
| `createSpeciality($conn, $data)` | `INSERT INTO specialities (name) VALUES (:name)` | Create |
| `updateSpeciality($conn, $id, $data)` | `UPDATE specialities SET name = :name WHERE id = :id` | Update |
| `deleteSpeciality($conn, $id)` | `UPDATE specialities SET deleted_at = NOW() WHERE id = :id` | Soft delete |

## 4. Validation Guards

### `validateDoctorData($data, $isUpdate = false)`
- Email: `filter_var(FILTER_VALIDATE_EMAIL)`
- Phone: must be provided and non-empty
- Gender: must be `male` or `female`
- Fees: numeric check via `is_numeric()` and `> 0`
- On update: each field is optional (only validated if present)

### `validateSpecialityData($data)`
- Name: must be non-empty string

## 5. Special Queries
- **include_doctors=1:** Triggers LEFT JOIN with doctors table to return `doctor_count` alongside speciality data
- **Redis caching with filter key:** Uses `generateFilteredCacheKey('specialities', ['name'])` for deterministic cache keys
