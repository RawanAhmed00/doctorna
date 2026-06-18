# 🔐 Doctorna API — Authentication Module

## 1. Module Overview
The Authentication module is the gateway to the Doctorna system. It handles user registration, login, password recovery, and credential reset. Every request flows through centralized validation guards and JWT-based stateless authentication.

## 2. Endpoint Reference

### POST `/api.php/auth/register`
- **Auth:** Public
- **Description:** Creates a new user account. Auto-generates JWT on success (same response as login).
- **Required Fields:** name, email, password, age, gender, phone, role
- **Validations:**
  - Email format checked via `validateAuthEmail()` using `filter_var(FILTER_VALIDATE_EMAIL)`
  - Password strength checked via `validatePasswordStrength()` — regex requiring: 8+ chars, uppercase, lowercase, number, special char
  - Age: numeric, 1-120 range
  - Gender: must be `male` or `female`
  - Role: must be `user` (prevents self-admin registration)
  - Duplicate email → 409 Conflict
  - Duplicate phone → 409 Conflict
- **Response:** 201 Created + JWT token
- **Code:** `AuthController::handleRegister()`

### POST `/api.php/auth/login`
- **Auth:** Public
- **Description:** Authenticates existing user. Verifies email existence then password hash.
- **Required Fields:** email, password
- **Validations:**
  - Email format via `validateAuthEmail()`
  - User existence check via `getUserByEmail()`
  - Password verified via `password_verify()`
- **Response:** 200 OK + JWT token
- **Code:** `AuthController::handleLogin()`

### POST `/api.php/auth/forgot-password`
- **Auth:** Public
- **Description:** Generates a 64-character hex reset token (`bin2hex(random_bytes(32))`) and dispatches simulated mailer.
- **Security:** Always returns 200 OK regardless of email existence (prevents email enumeration)
- **Code:** `AuthController::handleForgotPassword()`

### POST `/api.php/auth/reset-password`
- **Auth:** Public
- **Description:** Consumes reset token to overwrite password hash.
- **Required Fields:** email, token, new_password
- **Validations:**
  - Token stored via `storeResetToken()`
  - Token comparison (strict `!==`)
  - `validatePasswordStrength()` on new password
- **Code:** `AuthController::handleResetPassword()`

## 3. Validation Guards

### `validateAuthEmail($email)`
- Uses PHP's `filter_var(FILTER_VALIDATE_EMAIL)`
- Kills execution with 400 BAD REQUEST on invalid format

### `validatePasswordStrength($pass)`
- Regex: `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#?!@$%^&*-]).{8,}$`
- Kills execution with 400 BAD REQUEST on weak password

## 4. Repository Layer

### `AuthRepo.php`
| Function | SQL | Purpose |
| :--- | :--- | :--- |
| `getUserByEmail($conn, $email)` | `SELECT * FROM users WHERE email = :email` | Login + duplicate check |
| `getUserByPhone($conn, $phone)` | `SELECT * FROM users WHERE phone = :phone` | Duplicate phone check |
| `createUser($conn, $data)` | `INSERT INTO users (name, email, password, age, gender, phone, role)` | Registration |
| `updateUserPassword($conn, $email, $hashedPassword)` | `UPDATE users SET password = :password WHERE email = :email` | Password reset |

All queries use `runQuery()` helper — never raw `prepare()`.

## 5. JWT Integration
- **GenerateToken($user):** Called after login and registration. Embeds `user_id` and `role` in the JWT payload.
- **VerifyToken():** Called by protected endpoints. Reads `Authorization: Bearer` header.
- **checkAdminPrivileges():** Composite guard: VerifyToken + role check. Throws 403 FORBIDDEN if not admin.

## 6. Key Architectural Decisions
- Registration auto-generates JWT — frontend receives token immediately, no separate login step
- Reset tokens are 64-char hex strings (32 random bytes) stored independently from user table
- Forgot-password always returns 200 OK — prevents email enumeration attack
- Password hashes stored via `password_hash(PASSWORD_DEFAULT)` — bcrypt default
