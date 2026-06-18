# 👥 Doctorna API — Patients & Appointments Module

## 1. Module Overview
The Patients module provides admin management of user accounts. The Appointments module is the core transactional engine, linking authenticated patients to specific doctors for scheduled time slots.

## 2. Patients Module

### Endpoint Reference

#### GET `/api.php/patients`
- **Auth:** Admin Only (`checkAdminPrivileges()`)
- **Description:** Returns all patient accounts. Hardcoded `WHERE role='user'` prevents admin leakage.
- **Code:** `PatientController::handleGetAllPatients()`

#### GET `/api.php/patients?id={id}`
- **Auth:** Admin Only
- **Description:** Returns single patient profile.
- **Code:** `PatientController::handleGetPatientById()`

#### PATCH `/api.php/patients?id={id}`
- **Auth:** Admin Only
- **Required Fields (at least one):** name, email, age, gender, phone
- **Validations:** `validatePatientData()` — email format, age range 1-120, gender male/female
- **Cache:** Clears `patients:*` and `patient:id:{id}`
- **Code:** `PatientController::handleUpdatePatient()`

#### DELETE `/api.php/patients?id={id}`
- **Auth:** Admin Only
- **Description:** Soft delete — sets `deleted_at` on the users table
- **Code:** `PatientController::handleDeletePatient()`

### Repository Layer

| Function | SQL Pattern | Purpose |
| :--- | :--- | :--- |
| `getAllPatients($conn)` | `SELECT * FROM users WHERE role = 'user' AND deleted_at IS NULL` | Admin list |
| `getPatientById($conn, $id)` | `SELECT * FROM users WHERE id = :id AND role = 'user' AND deleted_at IS NULL` | Single fetch |
| `updatePatient($conn, $id, $data)` | `UPDATE users SET ... WHERE id = :id AND role = 'user'` | Update |
| `deletePatient($conn, $id)` | `UPDATE users SET deleted_at = NOW() WHERE id = :id AND role = 'user'` | Soft delete |

### Validation Guard
- **`validatePatientData($data, $isUpdate = false)`** — email format (filter_var), age range 1-120, gender male/female
- Authorization: `checkAdminPrivileges()` called at endpoint level

## 3. Appointments Module

### Endpoint Reference

#### GET `/api.php/appointments`
- **Auth:** User/Admin
- **Permission Logic:**
  - User → sees only own bookings (`WHERE user_id = token->user_id`)
  - Admin → sees all appointments (full hospital schedule)
- **Code:** `AppointmentController::handleGetAllAppointments()`

#### GET `/api.php/appointments?id={id}`
- **Auth:** Admin Only
- **Description:** Fetches specific booking details.
- **Code:** `AppointmentController::handleGetAppointmentById()`

#### POST `/api.php/appointments`
- **Auth:** User Only (patient authenticated)
- **Security:** `user_id` extracted strictly from JWT token — never from JSON body
- **Required Fields:** doc_id, date_time, status
- **Validations:** `validateAppointmentData()` — doc_id numeric, date_time regex `^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$`, status must be `pending`
- **Code:** `AppointmentController::handleCreateAppointment()`

#### PATCH `/api.php/appointments?id={id}`
- **Auth:** Admin Only
- **Description:** Transitions appointment statuses (pending → confirmed → completed)
- **Validations:** Status must be one of: pending, confirmed, cancelled, completed
- **Code:** `AppointmentController::handleUpdateAppointment()`

### Repository Layer

| Function | SQL Pattern | Purpose |
| :--- | :--- | :--- |
| `getAppointmentsByUser($conn, $userId)` | `SELECT * FROM appointments WHERE user_id = :user_id` | User's bookings |
| `getAllAppointments($conn)` | `SELECT * FROM appointments` | Admin full schedule |
| `getAppointmentById($conn, $id)` | `SELECT * FROM appointments WHERE id = :id` | Single booking |
| `createAppointment($conn, $data)` | `INSERT INTO appointments (user_id, doc_id, date_time, status) VALUES (...) ` | Book |
| `updateAppointmentStatus($conn, $id, $status)` | `UPDATE appointments SET status = :status WHERE id = :id` | Change status |

### Validation Guard
- **`validateAppointmentData($data, $isUpdate = false):`**
  - Create: `doc_id` must be numeric, `date_time` must match YYYY-MM-DD HH:MM:SS regex, status must be `pending`
  - Update: status must be one of `[pending, confirmed, cancelled, completed]`

## 4. Security Architecture
- **User ID Injection:** `handleCreateAppointment()` extracts `$token->user_id` from the verified JWT. Any `user_id` sent in the POST body is ignored. Prevents patient A from booking for patient B.
- **Row-Level Security:** `handleGetAllAppointments()` checks `if ($token->role !== 'admin')` and appends `WHERE user_id = :user_id` for non-admin users.
- **Admin Escalation Prevention:** `getPatientById()` hardcodes `AND role = 'user'` — an admin cannot fetch another admin's data through the Patients endpoint.
