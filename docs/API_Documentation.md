# Doctorna API — Complete Developer & Architecture Manual 

## 1. Executive Summary & System Vision

Doctorna is a highly specialized, high-performance RESTful Application Programming Interface (API) meticulously engineered to serve as the digital backbone for modern medical clinic operations. The system is designed from the ground up to securely, efficiently, and predictably manage the clinic's most critical entities: doctors, patients, appointments, and specialized sub-services. 

The core philosophy driving the Doctorna architecture is pure, raw procedural PHP. By utilizing strict procedural programming paradigms, the system guarantees absolute transparency in execution flow. Every incoming HTTP request follows a rigid, top-down execution path that is explicitly readable from start to finish. There is no hidden state, no complex inheritance structures, and no obscured lifecycle hooks. This ensures that any developer joining the project can trace the exact journey of data—from the moment a JSON payload hits the server, through the validation layers, down to the raw SQL query, and back out as a standardized HTTP response.

Performance and reliability are the twin pillars of the Doctorna system. To achieve millisecond response times, the API integrates a robust caching layer utilizing Redis. To guarantee the privacy of sensitive medical and user data, the system relies on JSON Web Tokens (JWT) for stateless authentication and bcrypt for cryptographic password hashing. Furthermore, the API employs strict "Graceful Degradation" patterns. If an external service, such as the Redis memory cache or the SMTP mailing server, experiences an outage, the API is programmed to silently log the failure and fall back to the primary MySQL database, ensuring that clinic operations are never interrupted by localized service failures.

This manual serves as the definitive source of truth for the Doctorna platform. It exhaustively details the architectural patterns, the environmental configurations required for local development and production deployment, the deep security posture maintained by the system, and the precise specifications for every available endpoint.

---

## 2. Architectural Deep Dive

### 2.1 The Pure Procedural Paradigm
The Doctorna API is built exclusively using Procedural PHP. In this paradigm, the application is modeled as a sequence of distinct computational steps. Data is passed explicitly as arguments into specialized functions, transformed, and returned. 

This approach forces a strict decoupling of data and behavior. The database connection variable (`$conn`), for example, is established exactly once at the boot of the application and is explicitly passed down the call chain only to the functions that strictly require it (the repositories). This creates a highly predictable state machine where functions perform exactly one job and have no side effects on the global application state. 

### 2.2 Strict Separation of Concerns & Directory Structure
To prevent the codebase from deteriorating into unstructured scripts, Doctorna enforces a strict, multi-layered directory structure. Each directory represents a specific boundary of responsibility.

#### The `routes/` Directory (The Gatekeepers)
Files within this directory act as the primary entry points for the Apache server. When a request targets the API, it lands in a specific route file (e.g., `AuthRoute.php` or `DoctorRoute.php`). The sole responsibility of a route file is URL parsing and HTTP method detection. It examines the raw `$_SERVER["REQUEST_URI"]`, strips away the base path using `parse_url` and `basename`, and determines the `$module` and `$action`. Once the routing logic identifies the intended destination via a simple `switch` statement, it immediately forwards execution to the appropriate Controller. Absolutely no database connections, data validation, or business logic are permitted in this layer.

#### The `Controllers/` Directory (The Brains)
The Controllers act as the orchestrators of the system. A controller function (e.g., `handleRegister`) receives execution from the route. Its responsibilities include:
1.  **Payload Extraction:** Utilizing the `getJsonInput()` helper to read raw `php://input` streams and convert them into associative arrays.
2.  **Data Validation:** Checking for missing fields, validating email formats via `filter_var`, enforcing password strength through Regular Expressions, and verifying ENUM values (like age, gender, and role constraints).
3.  **Business Logic:** Checking if a user already exists before allowing registration, or verifying if an action requires administrative privileges.
4.  **Orchestration:** Calling the appropriate Repository functions to read or write data, and calling Cache helpers to store or invalidate Redis keys.
5.  **Response Generation:** Terminating the request by sending a standardized JSON response back to the client.

#### The `repos/` Directory (The Data Access Layer)
This is the only layer in the entire Doctorna architecture that is permitted to communicate with the MySQL database. Repository functions are deliberately "dumb"—they contain zero business logic, zero validation, and zero HTTP awareness. A repository function (e.g., `getUserByEmail`) accepts the `$conn` object and an `$email` string, prepares a raw SQL statement, binds the parameters safely to prevent injection, executes the query, and returns the raw array result. This strict isolation means that if the database schema ever changes, or if the system migrates to PostgreSQL, only the `repos/` folder needs to be updated; the rest of the application remains entirely untouched.

#### The `helper/` Directory (The Toolkit)
Helpers are globally available, single-purpose utility scripts that provide core infrastructure to the controllers and repositories.
- `db.php`: Standardizes the execution of PDO queries.
- `jwt.php`: Manages the cryptographic signing and verification of authentication tokens.
- `cache.php`: Manages the TCP connection to the Redis server and provides safe wrapper functions for setting, getting, and deleting keys.
- `mailer.php`: Wraps the PHPMailer library to standardize outbound SMTP communications.
- `status.php` and `response.php`: Standardize HTTP status codes and JSON payload formatting.

---

## 3. Environment & Deployment Guide

### 3.1 Managing Secrets with `.env`
Hardcoding database passwords, API keys, or JWT secrets directly into the source code is a critical security vulnerability. Doctorna solves this by utilizing the `vlucas/phpdotenv` package. This package intercepts a hidden `.env` file located at the root of the project and loads its contents securely into PHP's `$_ENV` superglobal array. 

The `.env` file is strictly ignored by Git (`.gitignore`). Developers pulling the repository for the first time must duplicate the provided `.env.example` file, rename it to `.env`, and populate it with their local credentials.

### 3.2 Anatomy of the `.env` Configuration
Below is an exhaustive breakdown of every configuration parameter required to boot the Doctorna API.

```env
# Database Credentials
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=doctorna
```
*   `DB_HOST`: The IP address or hostname of the MySQL server. In local XAMPP environments, this is universally `localhost` or `127.0.0.1`.
*   `DB_USER` / `DB_PASS`: The authentication credentials for MySQL.
*   `DB_NAME`: The specific database schema the application will connect to.

```env
# Cryptography
JWT_SECRET=YOUR_RANDOM_SECURE_STRING_HERE
```
*   `JWT_SECRET`: A highly complex, random string of characters used as the cryptographic salt to sign JSON Web Tokens. If this secret is ever compromised, malicious actors can forge admin tokens. It should be at least 64 characters long in production.

```env
# Mailing System (Google SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_16_char_app_password
MAIL_FROM=your_email@gmail.com
MAIL_FROM_NAME="Doctorna System"
```
*   `MAIL_HOST` & `MAIL_PORT`: The outbound SMTP server details. For Gmail, this is `smtp.gmail.com` over the secure TLS port `587`.
*   `MAIL_USERNAME`: The authenticating email address.
*   `MAIL_PASSWORD`: Because major providers block standard password authentication for SMTP, this requires a generated "App Password" (a 16-character string explicitly authorized for API mailing).
*   `MAIL_FROM`: The address that will appear in the recipient's inbox as the sender.

```env
# Memory Cache
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```
*   `REDIS_HOST` & `REDIS_PORT`: The TCP binding for the Redis in-memory data structure store. 

### 3.3 Bootstrapping the Infrastructure
To successfully run Doctorna locally, the following stack must be operational:
1.  **Apache & PHP 8+**: Served via XAMPP. The `php.ini` must have the `pdo_mysql` extension enabled.
2.  **Composer**: The PHP dependency manager must be installed to pull in the `vendor/` directory via `composer install`.
3.  **Redis Server**: Redis must be running as a background service. On Windows, this is most effectively achieved by running Redis via a Docker container (`docker run -d -p 6379:6379 redis`) or through the Windows Subsystem for Linux (WSL).

---

## 4. Advanced Security Posture

### 4.1 Defeating SQL Injection via PDO
Doctorna enforces a zero-trust policy for all user inputs. By utilizing PHP Data Objects (PDO) exclusively, the application completely neutralizes SQL Injection attacks. Instead of concatenating user strings directly into SQL queries (which allows attackers to inject malicious `DROP TABLE` or `1=1` clauses), Doctorna uses Prepared Statements with Named Parameters.
When a repository executes:
`SELECT * FROM users WHERE email = :email`
The PDO driver sends the SQL template to the MySQL server first. The MySQL server compiles the query execution plan. Only after the plan is compiled does PDO send the actual `$email` variable. Because the variable is sent separately, MySQL treats it strictly as a string literal, stripping it of any executable SQL meaning.

### 4.2 Cryptographic Identity Verification (JWT)
Stateful authentication (using PHP Sessions) requires the server to store session files for every logged-in user, which severely limits the API's ability to scale across multiple servers. Doctorna uses JSON Web Tokens (JWT) to achieve stateless, infinitely scalable authentication.
1.  **The Header**: Specifies the algorithm used (HMAC SHA-256).
2.  **The Payload**: Contains public claims, including the `user_id`, their `role` (user or admin), the `iat` (Issued At timestamp), and the `exp` (Expiration timestamp, strictly set to 1 hour).
3.  **The Signature**: A cryptographic hash generated by combining the encoded Header, the encoded Payload, and the secret `JWT_SECRET` from the `.env` file. 
When a client sends a request to a protected Doctor endpoint (e.g., `POST /doctors`), the Controller intercepts the `Authorization: Bearer <token>` header. It recalculates the signature using its own `.env` secret. If the calculated signature matches the one in the token, the server guarantees the payload was not tampered with. It then inspects the `role` claim to ensure the user is an `admin` before granting access.

### 4.3 Asymmetric Password Hashing
Storing passwords in plaintext, or even using outdated hashing algorithms like MD5 or SHA1, is a catastrophic security failure. Doctorna uses the `password_hash()` function utilizing the `PASSWORD_DEFAULT` algorithm, which currently defaults to `bcrypt`. 
Bcrypt is deliberately designed to be computationally slow. It incorporates a randomly generated "salt" into every single hash. This means that if two users have the exact same password, their database hashes will look completely different, completely neutralizing "Rainbow Table" attacks. When a user logs in, `password_verify()` applies the same cryptographic timing to compare the input against the stored hash, preventing timing attacks.

### 4.4 Data Integrity via Soft Deletes
In medical applications, the permanent deletion of a record (a `DELETE` SQL query) destroys historical relational integrity. If a Doctor is permanently deleted, all historical Appointments tied to that `spec_id` or `doctor_id` will become orphaned or cascade-delete, erasing medical history.
To solve this, Doctorna utilizes a "Soft Delete" pattern. When an Admin sends a `DELETE /doctors?id=1` request, the API does not remove the row. Instead, it executes an `UPDATE` query, setting the `deleted_at` column to the current `CURRENT_TIMESTAMP`. 
All subsequent `GET` requests to the repository strictly append `WHERE deleted_at IS NULL` to their SQL queries. This creates the illusion to the end-user that the doctor is gone, while preserving the raw data safely in the database for auditing and historical relational integrity.

---

## 5. The Authentication Module Mechanics

The Authentication module is the heavily guarded gateway to the Doctorna system. It exposes four strictly controlled endpoints. Unlike the Doctor module, which utilizes RESTful HTTP methods on a single endpoint, the Authentication module uses explicit action routes.

### 5.1 Registration Flow (POST /auth/register)
The registration endpoint is responsible for securely onboarding new users. The controller begins by invoking the getJsonInput() helper, mandating the presence of seven distinct fields: 
ame, mail, password, ge, gender, phone, and ole. 
Once the payload is extracted, an exhaustive validation phase begins:
1.  **Sanitization:** The gender and ole fields are converted to lowercase to prevent case-sensitive mismatching in the database ENUM fields.
2.  **Email Validation:** The native PHP ilter_var() function is applied with FILTER_VALIDATE_EMAIL to ensure cryptographic and structural validity of the email string.
3.  **Boundary Checks:** The ge is checked using is_numeric() and bound between 0 and 120.
4.  **Password Complexity:** A strict Regular Expression (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#?!@$%^&*-]).{8,}$/) enforces that the user's password contains at least 8 characters, one uppercase letter, one lowercase letter, one digit, and one special symbol. This protects against dictionary and brute-force attacks.
5.  **Role Escaping:** The system strictly rejects any attempt to register a user with the dmin role. Administrative accounts must be provisioned directly within the database by authorized personnel.
If all checks pass, the system utilizes password_hash() and commits the user to the database, returning a 201 Created status code.

### 5.2 Login Flow (POST /auth/login)
The login controller receives the user's email and plaintext password. It queries the database for the email. If the user exists, the system passes the plaintext password and the retrieved database hash into password_verify(). If the cryptographic timing matches, the user's data (ID and Role) is passed to the GenerateToken() helper. The resulting JWT is returned to the client in the JSON response payload. The client is then responsible for attaching this token as a Bearer header in all subsequent protected requests.

### 5.3 Forgot Password Flow (POST /auth/forgot-password)
Traditional password reset flows require creating a new password_resets table in the database, requiring background cron jobs to clean up expired tokens. Doctorna employs a highly modern, memory-driven approach using Redis.
When an email is submitted, the system checks if the user exists. If they do, the API uses in2hex(random_bytes(32)) to generate a 64-character, cryptographically secure random hexadecimal token. 
Instead of saving this to MySQL, the system executes a Redis SETEX command:
SETEX password_reset:{email} 900 {token}
This instructs the Redis memory server to hold the token for exactly 900 seconds (15 minutes) before automatically purging it from memory. 
The token is then injected into an email payload and dispatched securely via PHPMailer over Google's SMTP network. 
Crucially, regardless of whether the email exists in the system or not, the API returns the exact same 200 OK response. This security mechanism guarantees that malicious scripts cannot use the endpoint to blindly guess and harvest valid user emails.

### 5.4 Reset Password Flow (POST /auth/reset-password)
The final phase requires the user to submit their email, the 64-character token, and their new password.
The controller executes a GET command against the Redis server using the password_reset:{email} key. 
- If Redis returns null, it implies the 15-minute window has expired, and the API returns a 410 Gone.
- If the token exists but does not perfectly match the client's token, the API returns a 401 Unauthorized.
If the token is valid, the new password undergoes the same strict Regex validation as the registration flow. It is hashed, updated in the MySQL database, and finally, the token is explicitly deleted from Redis (DEL password_reset:{email}) to prevent Replay Attacks where a user might attempt to use the same token twice within the 15-minute window.

---

## 6. The Doctor Module Mechanics

The Doctor module is designed to manage the clinic's roster of medical professionals. It adheres strictly to RESTful architecture, meaning the URL never changes (/doctors), but the action performed is dictated entirely by the HTTP Request Method.

### 6.1 The Cache-Aside Invalidation Cycle
Because the list of doctors rarely changes minute-by-minute, querying the MySQL database for every patient browsing the clinic's website is a massive waste of computational resources. Doctorna utilizes Redis to achieve sub-millisecond response times.
When a GET /doctors request is fired, the controller checks the doctors:all key in Redis. If the data is found, the PHP script terminates immediately and echoes the JSON. If the data is missing, MySQL is queried, the result is written to doctors:all in Redis, and then echoed.
However, caching introduces the problem of "Stale Data". If an admin updates a doctor's rank, the cache must reflect this instantly. 
To solve this, every single Write Operation (POST, PUT, PATCH, DELETE) is programmed to call the deleteFromCache() helper immediately after a successful database query. This function connects to Redis and destroys the doctors:all key, as well as the specific doctor:{id} key. This guarantees that the very next GET request will be forced to query MySQL and fetch the newly updated data, ensuring perfect consistency.

### 6.2 Full Replacement vs. Partial Updates
The module supports two distinct methods for modifying a doctor's record, respecting strict HTTP standards:
- **PUT (Full Replacement):** The PUT endpoint requires the client to send the entire payload (
ame, mail, ank, gender, is_available, spec_id). Even if the admin only wants to change the doctor's name, they must send all other existing fields as well. The database row is completely overwritten.
- **PATCH (Partial Update):** The PATCH endpoint is designed for extreme flexibility. The client can send a single field, such as {"is_available": 0}. The controller dynamically iterates over the incoming JSON keys. It cross-references them against an "allowed list" array to prevent SQL injection or modification of protected columns (like id or created_at). For every valid key found, it fires a highly specific, single-column UPDATE query.

### 6.3 Soft Deletion Mechanics
As detailed in the security posture section, doctors are never permanently DELETEd from the MySQL tables. When a DELETE request is received, the repository executes:
UPDATE doctors SET deleted_at = NOW() WHERE id = :id AND deleted_at IS NULL
By checking deleted_at IS NULL in the WHERE clause, the system ensures that it does not accidentally overwrite the original deletion timestamp if an admin accidentally fires the delete command twice on the same doctor.

---

## 7. The Generic Helper Ecosystem

To maintain the purity of the Procedural PHP architecture, the Doctorna API abstracts repetitive tasks into a suite of highly specific Helper files. These files are universally required across the application and act as the core infrastructure.

### 7.1 Environment Loader (helper/env.php)
This file is the bedrock of the application. It utilizes a 	ry/catch block to securely load the hidden .env file using the lucas/phpdotenv library. It then defines a globally accessible nv(, ) function. This allows any file in the system to request a configuration variable simply by calling nv('DB_HOST'), shielding the application from breaking if an environment variable is temporarily missing by relying on safe fallback defaults.

### 7.2 Database Singleton (helper/db.php)
This file exposes the unQuery(, , ) function. Instead of writing the repetitive PDO prepare() and xecute() boilerplate dozens of times across the repositories, developers simply pass their raw SQL string and an associative array of parameters into this function. The helper handles the binding, executes the query safely, and returns the active PDO Statement object for the repository to extract using etch() or etchAll().

### 7.3 Cache Manager (helper/cache.php)
This file instantiates the global $redis connection object using the credentials provided by the nv() helper. It abstracts the complexities of TCP communication into highly readable functions. The serveFromCacheIfAvailable() function is particularly powerful; it takes a cache key, checks if it exists, and if so, it directly invokes the HTTP Response formatter and calls xit;, halting the entire PHP script dead in its tracks to save processing time. 

### 7.4 Standardized Responses (helper/response.php & status.php)
Inconsistent JSON structures are a nightmare for Frontend developers. To solve this, Doctorna forces all outputs through a single esponse(, , ) function.
This function automatically injects the Content-Type: application/json header, applies the raw HTTP response code to the Apache server, and structures the JSON payload identically every single time:
`json
{
    "status_code": 200,
    "message": "Human readable success or error message",
    "data": { ... }
}
`
The status.php file complements this by abstracting raw integers into readable string constants via the HttpStatus() function, allowing developers to type HttpStatus('UNAUTHORIZED') instead of remembering the number 401.

---

## 8. Database Schema & Relational Integrity

The Doctorna database is designed for strict data integrity and high-speed indexing. All tables are engineered using the InnoDB storage engine to support row-level locking and strict ACID compliance, ensuring that concurrent API requests do not corrupt medical records.

### 8.1 The `users` Table
The `users` table acts as the central authentication authority for the entire system. It stores both standard patients and administrative staff.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT` | Primary Key, Auto Increment | The unique identifier for the user. Automatically indexed. |
| `name` | `VARCHAR(255)` | NOT NULL | The user's full legal name. |
| `email` | `VARCHAR(255)` | NOT NULL, UNIQUE | The login identifier. Enforced at the database level to prevent duplicate registrations even if API validation fails. |
| `password` | `VARCHAR(255)` | NOT NULL | The bcrypt cryptographic hash. Needs 255 characters to support future algorithm migrations (e.g., Argon2). |
| `age` | `INT` | NOT NULL | The user's age in years. |
| `gender` | `ENUM('male', 'female')` | NOT NULL | Strictly enforces data consistency. Invalid strings will trigger an SQL error. |
| `phone` | `VARCHAR(20)` | NULL | The user's contact number. |
| `role` | `ENUM('admin', 'user')` | DEFAULT 'user' | The Role-Based Access Control (RBAC) flag. Used by the JWT payload to dictate permissions. |
| `deleted_at` | `TIMESTAMP` | NULL | The tombstone column for soft deletions. |
| `created_at` | `TIMESTAMP` | DEFAULT CURRENT_TIMESTAMP | Automatically generated upon insertion. |

### 8.2 The `doctors` Table
The `doctors` table manages the professional medical roster. It contains relational links to the specialized services table.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT` | Primary Key, Auto Increment | The unique identifier for the doctor. |
| `name` | `VARCHAR(255)` | NOT NULL | The doctor's professional name. |
| `email` | `VARCHAR(255)` | NOT NULL, UNIQUE | The doctor's professional contact and potential future login identity. |
| `rank` | `ENUM(...)` | NOT NULL | Allowed values: 'intern', 'resident', 'specialist', 'senior specialist', 'consultant'. |
| `gender` | `ENUM('male', 'female')` | NOT NULL | Standardized gender identity. |
| `is_available` | `TINYINT(1)` | DEFAULT 1 | A boolean flag (1 = True/Active, 0 = False/Inactive) used by front-end clients to hide doctors who are on leave. |
| `spec_id` | `INT` | Foreign Key | Links to the `speciality` table. Ensures a doctor cannot be assigned to a non-existent medical department. |
| `deleted_at` | `TIMESTAMP` | NULL | The tombstone column for soft deletions. Required to keep historical appointments intact. |
| `created_at` | `TIMESTAMP` | DEFAULT CURRENT_TIMESTAMP | Automatically generated upon insertion. |

---

## 9. The Postman Testing Framework

To ensure the API functions exactly as specified, a complete Postman Collection (`Doctorna_API_v2.postman_collection.json`) is included in the project root. This file contains pre-configured HTTP requests for every endpoint, complete with headers, query parameters, and JSON bodies.

### 9.1 Environment Variables
The collection relies on dynamic Postman variables to function across different local machines or staging servers.
- `{{base_url}}`: This variable dictates the root path of the API. By default, it should be set to `http://localhost/threedos-backend/tasks/task-06/doctorna/routes`. If you move the project folder, simply update this one variable to update all 10+ requests simultaneously.
- `{{admin_token}}`: This variable holds your active JSON Web Token.

### 9.2 Testing the Authentication Lifecycle
1.  **Register a Test User:** Open the `POST /auth/register` request. Hit "Send". Ensure you receive a `201 Created` status code.
2.  **Authenticate:** Open the `POST /auth/login` request. Input the exact credentials used in step 1. Hit "Send". The response body will contain a long encrypted string under `"token"`.
3.  **Capture the Token:** Copy this token to your clipboard. Edit your Postman Environment Variables and paste the string into the `admin_token` value.

### 9.3 Testing Protected Endpoints
Once the `{{admin_token}}` is populated, you can test the protected Doctor endpoints.
1.  Navigate to `POST /doctors` (Create Doctor).
2.  Click the "Authorization" tab in Postman.
3.  Observe that it is set to "Bearer Token" and the token field contains `{{admin_token}}`.
4.  Hit "Send". If your registered user was manually upgraded to `'admin'` in the MySQL database, the request will succeed with `201 Created`. If you are still a `'user'`, the API will actively reject you with a `403 Forbidden`.

---

## 10. Exhaustive Payload Specifications

Consistent, predictable JSON responses are the hallmark of a professional REST API. Doctorna never returns raw text, HTML, or empty bodies. Every response, whether successful or a catastrophic failure, is wrapped in the standard Doctorna Response Envelope.

### 10.1 The Success Envelopes (2xx)

**200 OK (Standard Fetch)**
Returned when a resource is successfully retrieved. Includes caching metadata.
```json
{
    "status_code": 200,
    "message": "Doctor fetched successfully",
    "data": {
        "source": "database",
        "data": {
            "id": 1,
            "name": "Dr. House",
            "email": "house@doctorna.com",
            "rank": "consultant",
            "gender": "male",
            "is_available": 1,
            "spec_id": 4,
            "deleted_at": null,
            "created_at": "2026-06-16 10:00:00"
        }
    }
}
```

**201 Created (Resource Instantiation)**
Returned exclusively by POST requests that successfully write new rows to MySQL.
```json
{
    "status_code": 201,
    "message": "User registered successfully !",
    "data": null
}
```

### 10.2 The Client Error Envelopes (4xx)

**400 Bad Request (Validation Failure)**
Returned when the client sends data that violates business logic (e.g., weak passwords, invalid ENUMs).
```json
{
    "status_code": 400,
    "message": "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
    "data": null
}
```

**401 Unauthorized (Authentication Failure)**
Returned when a token is missing, tampered with, or when login credentials do not match.
```json
{
    "status_code": 401,
    "message": "Wrong Password !",
    "data": null
}
```

**403 Forbidden (Authorization Failure)**
Returned when a valid JWT is provided, but the user lacks the `'admin'` role required to execute the action.
```json
{
    "status_code": 403,
    "message": "access denied admin",
    "data": null
}
```

**404 Not Found (Resource Missing)**
Returned when a specific ID does not exist, or if the ID belongs to a soft-deleted row.
```json
{
    "status_code": 404,
    "message": "Doctor not found",
    "data": null
}
```

**409 Conflict (Duplicate State)**
Returned when a unique constraint is violated, such as registering an email that already exists.
```json
{
    "status_code": 409,
    "message": "Email Already Exists !",
    "data": null
}
```

**422 Unprocessable Entity (Missing Parameters)**
Returned strictly by the `getJsonInput()` helper when the client fails to provide a mandatory JSON key.
```json
{
    "status_code": 422,
    "message": "Please provide the 'email' field. It is required to proceed.",
    "data": null
}
```

### 10.3 The Server Error Envelopes (5xx)

**500 Internal Server Error (System Failure)**
Returned when an external service crashes, such as a failure to dispatch an SMTP email.
```json
{
    "status_code": 500,
    "message": "Failed to send reset email.",
    "data": null
}
```

---


