# 🏥 Doctor Module: Code Walkthrough & Architecture

Welcome to the documentation for the `DoctorModule-branch`. This document serves as a complete walkthrough of the architecture, design patterns, and decisions made while building the Doctor module.

The goal of this branch was to implement a clean, highly readable, and performant REST API using raw PHP, strictly following raw native PHP routing paradigms, while introducing **Redis Caching** and **DRY (Don't Repeat Yourself)** principles.

---

## 🏗️ 1. Routing Architecture

To keep the routing extremely predictable, we avoided complex regex routers and stuck entirely to native PHP `$_SERVER` superglobals.

**File:** `routes/DoctorRoute.php`

Instead of a centralized `api.php` file mapping every single module, the server is designed to treat `DoctorRoute.php` as an entry point. 
We read the route via `PATH_INFO` and extract variables via standard `$_GET` parameters (`?id=5`).

```php
$path = $_SERVER["PATH_INFO"] ?? "/";
$method = $_SERVER["REQUEST_METHOD"];

if ($path === "/doctors") {
    switch ($method) {
        case "GET":
            if (isset($_GET['id'])) {
                handleGetDoctorById($conn);
            } else {
                handleGetAllDoctors($conn);
            }
            break;
        // ... POST, PUT, PATCH, DELETE
    }
}
```

---

## 🧹 2. Controllers & Extreme DRY Principles

The Controller layer (`Controllers/DoctorController.php`) is where the business logic lives. To make the handlers as readable as plain English, we abstracted repeated logic into tiny, descriptive helper functions.

### The Helpers
- `checkAdminPrivileges()`: Automatically extracts the JWT, verifies it, and throws a `403 Forbidden` if the user is not an admin.
- `getRequiredId()`: Checks `$_GET['id']`, casting it to an integer or throwing a `400 Bad Request`.
- `getDoctor($conn, $id)`: Queries the database and automatically throws a `404 Not Found` if the doctor doesn't exist or was deleted.

### The Resulting Controller
By using these helpers, our endpoints are incredibly short and focus purely on HTTP logic:

```php
function handleDeleteDoctor($conn) {
    checkAdminPrivileges();             // 1. Auth Guard
    $id = getRequiredId();              // 2. Input Validation
    getDoctor($conn, $id);              // 3. 404 Guard
    
    deleteDoctor($conn, $id);           // 4. Database Action
    clearDoctorCache($id);              // 5. Cache Invalidation
    
    response(HttpStatus('OK'), "Doctor deleted successfully");
}
```

---

## ⚡ 3. High-Performance Redis Caching

To prevent the MySQL database from becoming a bottleneck under heavy load, we integrated **Predis** (`helper/cache.php`) and implemented standard caching strategies.

### Strategy 1: Cache-Aside (For Reading Data)
When `GET /doctors` is called, the API checks memory *before* touching the database. We created readable wrappers to handle this:

```php
function handleGetAllDoctors($conn) {
    $cacheKey = 'doctors:all';
    
    // Checks Redis. If it exists, it instantly returns the JSON and halts execution.
    serveFromCacheIfAvailable($cacheKey, "Doctors fetched successfully");

    // If cache missed, run the SQL query
    $doctors = getAllDoctors($conn);
    
    // Save the result to RAM for 1 hour
    saveToCache($cacheKey, $doctors);

    response(HttpStatus('OK'), "Doctors fetched successfully", ['data' => $doctors]);
}
```

### Strategy 2: Cache Invalidation (For Writing Data)
Whenever a doctor is created, updated, or deleted, the cached data becomes "stale". To prevent users from seeing old data, we wipe the cache keys immediately.

```php
function clearDoctorCache($id = null) {
    global $redis;
    $redis->del('doctors:all');         // Wipe the global list
    if ($id) {
        $redis->del('doctor:' . $id);   // Wipe the specific doctor
    }
}
```

---

## 💾 4. The Database Repository (Logic-Less SQL)

**File:** `repos/DoctorRepo.php`

The repository pattern separates SQL queries from HTTP logic. A core rule we applied here was **"The Repo is not for logic"**. It should not validate requests; it should simply execute SQL.

### Dynamic Partial Updates (`PATCH`)
Instead of hardcoding a massive array of potential fields or writing loops inside the repo, the Controller validates the input, and the repo just builds the query:

```php
// The Repo function is brutally simple:
function patchDoctor($conn, $id, $field, $value) {
    $sql = "UPDATE doctors SET `$field` = :value WHERE id = :id AND deleted_at IS NULL";
    runQuery($conn, $sql, ['id' => $id, 'value' => $value]);
}
```
If an admin patches multiple fields, the Controller handles the iteration.

### Soft Deletes
Instead of physically wiping records (which breaks appointment history), we use a `deleted_at` timestamp.
- **Deleting:** `UPDATE doctors SET deleted_at = NOW() WHERE id = :id`
- **Fetching:** `SELECT * FROM doctors WHERE deleted_at IS NULL`

---

## 🚦 5. Function-Based HTTP Status Codes

**File:** `helper/status.php`

To avoid hardcoding raw numbers like `404` or `500` (which are hard to read), but without violating the constraint of "No PHP Classes", we implemented a clever function-based enum replacement.

Instead of `HttpStatus::NOT_FOUND` (Class) or `404` (Raw Integer), we use:

```php
response(HttpStatus('NOT_FOUND'), "Doctor not found");
```

This passes the string `'NOT_FOUND'` into the `HttpStatus()` helper function, which returns `404`. It provides all the readability of Object-Oriented constants while strictly remaining a global functional architecture.
