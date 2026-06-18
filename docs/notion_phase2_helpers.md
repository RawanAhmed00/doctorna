# 🛠️ Doctorna API - The Core Helpers Ecosystem

| Property | Details |
| :--- | :--- |
| **Author** | Architecture Team |
| **Date Saved** | Current Build |
| **Status** | 🟢 Unified & Active |
| **Module** | Core Helpers |
| **Topic Tags** | Helpers, DRY, Reusability, Validation, Caching |

---

## 🎯 1. Objective of the Helpers Ecosystem
The core philosophy of the Doctorna API is **D.R.Y.** (Don't Repeat Yourself). The `helper/` directory is the engine that powers the entire application. Controllers and Repositories are strictly forbidden from writing manual repetitive logic (like checking headers, building JSON responses, or raw SQL preparation). Instead, they strictly call these unified helpers.

This ensures that if a core logic change is required (e.g., changing from Redis to Memcached), only **one file** needs to be updated, instantly upgrading all 6 modules simultaneously.

---

## 🧩 2. Code Walkthrough: Every Helper Explained

### A. Database Execution (`db.php`)
> 💡 **Concept:** Eliminates raw `PDO::prepare` and `execute()` boilerplate from the Repositories, enforcing named-parameter security natively.

*   **Function:** `runQuery(PDO $conn, string $query, array $params = [])`
*   **Input:** The global `$conn` object, the SQL string, and an associative array of bindings.
*   **Output:** Returns a fully executed `PDOStatement` object.
*   **Specific Project Usage:** Used in *every single Repository file* (`DoctorRepo.php`, `AuthRepo.php`, etc.). 
    ```php
    // Example usage in PatientRepo:
    $stmt = runQuery($conn, "SELECT * FROM users WHERE id = :id", ['id' => 5]);
    return $stmt->fetch();
    ```

### B. Request Handling (`request.php`)
> 💡 **Concept:** Defensively blocks malformed JSON payloads and strictly enforces required data before it ever reaches the Controller's business logic.

*   **Function 1:** `getJsonInput(array $requiredFields = [])`
    *   **Purpose:** Parses `php://input` into an array. If any key in `$requiredFields` is missing or empty, it instantly kills the request with a `422 UNPROCESSABLE ENTITY`.
*   **Function 2:** `getRequiredId()`
    *   **Purpose:** Safely extracts `$_GET['id']` ensuring it is strictly numeric. Kills the request with a `400 BAD REQUEST` if it fails.
*   **Specific Project Usage:** Used at the top of almost every Controller (e.g., `handleCreateDoctor`, `handleUpdatePatient`).

### C. Response Handling (`response.php` & `status.php`)
> 💡 **Concept:** Guarantees that every single endpoint outputs the exact same JSON signature format.

*   **Function:** `response($code, $message = "", $data = null)`
    *   **Purpose:** Formats the final JSON output: `{"status_code": 200, "message": "...", "data": [...]}` and calls `exit;`.
*   **Function:** `HttpStatus(string $status)`
    *   **Purpose:** Translates readable strings (e.g., `'CREATED'`) into strict HTTP integers (`201`).
*   **Specific Project Usage:** The final line of every single Controller endpoint.

### D. Stateless Security (`JWT.php`)
> 💡 **Concept:** Manages the mathematical verification of user identities without server-side sessions.

*   **Function 1:** `GenerateToken($user)`
    *   **Output:** Returns a signed JWT string embedding the `user_id` and `role`.
    *   **Usage:** Called during `/auth/login` and `/auth/register`.
*   **Function 2:** `VerifyToken()`
    *   **Output:** Reads the `Authorization: Bearer` header. Returns the decoded payload object or throws `401 UNAUTHORIZED`.
*   **Function 3:** `checkAdminPrivileges()`
    *   **Purpose:** A composite guard. Calls `VerifyToken()` and immediately checks if `role === 'admin'`. Throws `403 FORBIDDEN` if false.
    *   **Specific Project Usage:** Locks down all `POST/PUT/DELETE` actions in the controllers.

### E. Dynamic Filtering (`filtration.php`)
> 💡 **Concept:** A highly secure query-builder that allows the frontend to send URL query parameters and dynamically injects them into the SQL `WHERE` clauses.

*   **Function:** `applyFilters(string $baseQuery, array $allowedFields, array $bindings = [])`
    *   **Input:** The raw base SQL string, an array of exactly which `$_GET` keys are permitted to be queried, and any existing bindings.
    *   **Output:** `['sql' => "SELECT ... AND gender = :gender", 'bindings' => [':gender' => 'male']]`
    *   **Specific Project Usage:** Passed directly into `runQuery()` inside the Repositories (`getAllDoctors`, `getAllSubServices`). Safely ignores any non-whitelisted URL params.

### F. High-Performance Caching (`cache.php`)
> 💡 **Concept:** Connects the API to Redis to serve complex queries in ~1ms, avoiding expensive DB operations.

*   **Function 1:** `serveFromCacheIfAvailable($cacheKey, $message)`
    *   **Purpose:** If the key exists, instantly returns the `response()` and kills execution.
*   **Function 2:** `generateFilteredCacheKey(string $prefix, array $allowedFilters)`
    *   **Purpose:** Intercepts active `$_GET` parameters, alphabetically sorts them via `ksort()`, and generates a deterministic string (e.g., `doctors:filter:gender=female&rank=intern`). This guarantees that URL parameter ordering doesn't bloat the cache.
*   **Specific Project Usage:** Called in all `handleGetAll...` controller endpoints to bypass database queries for repetitive fetches.
