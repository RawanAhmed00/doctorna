# 📋 Doctorna API — SubServices Module & Future Plans

## 1. Module Overview
The SubServices module manages granular medical procedures offered at the clinic. Each procedure has a name, fees, and optional description. The module supports advanced range-based filtering and LIKE name search.

## 2. Endpoint Reference

### GET `/api.php/subservices`
- **Auth:** Public
- **Description:** Returns all sub-services. Supports advanced filtering.
- **Filter Parameters:**
  - `name` → `LIKE %:name%` search
  - `min_fees` → `>= :min_fees`
  - `max_fees` → `<= :max_fees`
- **Caching:** Redis cache key: `subservices:filter:{sorted-params}`
- **Code:** `SubServiceController::handleGetAllSubServices()`

### GET `/api.php/subservices?id={id}`
- **Auth:** Public
- **Description:** Returns single sub-service by ID.
- **Caching:** Redis cache key: `subservice:id:{id}`
- **Code:** `SubServiceController::handleGetSubServiceById()`

### POST `/api.php/subservices`
- **Auth:** Admin Only (`checkAdminPrivileges()`)
- **Required Fields:** name, fees
- **Validations:** `validateSubServiceData()` — name not empty, fees positive numeric
- **Cache Eviction:** Clears `subservices:*` from Redis
- **Code:** `SubServiceController::handleCreateSubService()`

### PATCH `/api.php/subservices?id={id}`
- **Auth:** Admin Only
- **Validations:** Same as create
- **Cache Eviction:** Clears `subservices:*` and `subservice:id:{id}`
- **Code:** `SubServiceController::handleUpdateSubService()`

### DELETE `/api.php/subservices?id={id}`
- **Auth:** Admin Only
- **Cache Eviction:** Clears `subservices:*` and `subservice:id:{id}`
- **Code:** `SubServiceController::handleDeleteSubService()`

## 3. Repository Layer

| Function | SQL Pattern | Purpose |
| :--- | :--- | :--- |
| `getAllSubServices($conn, $filters)` | `SELECT * FROM sub_services WHERE 1=1` + dynamic WHERE | List with range/name filters |
| `getSubServiceById($conn, $id)` | `SELECT * FROM sub_services WHERE id = :id` | Single fetch |
| `createSubService($conn, $data)` | `INSERT INTO sub_services (name, fees, description) VALUES (...)` | Create |
| `updateSubService($conn, $id, $data)` | `UPDATE sub_services SET name = :name, fees = :fees, description = :description WHERE id = :id` | Update |
| `deleteSubService($conn, $id)` | `DELETE FROM sub_services WHERE id = :id` | Hard delete |

### Unique Behavior
- Unlike other modules, SubService uses **hard delete** (`DELETE FROM`) instead of soft delete (`SET deleted_at = NOW()`).
- Range filtering (`min_fees`, `max_fees`) is implemented with direct SQL `>=` / `<=` comparisons in the repository, not through the generic `applyFilters()` helper.

## 4. Validation Guard
- **`validateSubServiceData($data, $isUpdate = false):`**
  - `name`: must be non-empty string
  - `fees`: must be numeric and > 0
  - On update: each field optional (validated only if present in input)

## 5. Caching Strategy
All SubService GET endpoints are cached via Redis:
- `getAllSubServices` uses `generateFilteredCacheKey('subservices', ['name', 'min_fees', 'max_fees'])` for deterministic keys
- Cache cleared on every POST/PUT/PATCH/DELETE via `clearSubServiceCache($id)` which deletes `subservices:*` and `subservice:id:{id}`

## 6. Future Plans: Doctor-SubService "Offers" Integration

### Overview
A future M:N relationship between doctors and sub-services is planned. Each doctor will offer specific sub-services at optionally different prices than the catalog default.

### Proposed Database Schema
```sql
CREATE TABLE offers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL,
    sub_service_id INT NOT NULL,
    custom_fees DECIMAL(10,2) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (sub_service_id) REFERENCES sub_services(id) ON DELETE CASCADE,
    UNIQUE KEY unique_offer (doctor_id, sub_service_id)
);
```

### Phased Implementation Plan

#### Phase A: Database Migration
- Create `offers` table with composite unique key
- Seed with default offers mapping all sub-services to all active doctors

#### Phase B: Backend CRUD
- New `OfferController` with standard 5 endpoints
- Custom fee override: if `custom_fees` is null, frontend displays the sub-service catalog price
- New `OffersRepo` following `runQuery()` pattern

#### Phase C: Doctor Profile Enhancement
- Modify `GET /api.php/doctors?id={id}` to include `include_offers=1` query param
- JOIN `offers` and `sub_services` tables to return each doctor's service catalog

#### Phase D: Appointment Validation
- Enhance appointment creation to verify the doctor offers the requested sub-service
- Prevent booking a doctor for a service they don't offer

### Full Implementation Details
See `docs/future_subservice_integration_plan.md` for complete implementation guide.

## 7. Allowed Route Aliases
The SubService module accepts three URL prefixes:
- `/api.php/subservices`
- `/api.php/subservice`
- `/api.php/sub-services`
