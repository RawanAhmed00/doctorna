# 🏥 Doctorna API — Smart Medical Booking System

![PHP](https://img.shields.io/badge/PHP-8.x-777BB4?style=for-the-badge&logo=php&logoColor=white)
![Composer](https://img.shields.io/badge/Composer-2.x-885630?style=for-the-badge&logo=composer&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?style=for-the-badge&logo=redis&logoColor=white)

## 📖 Project Overview
Doctorna is the core RESTful API backend for managing hospital operations, doctor availability, and patient appointments. It is built entirely in raw PHP using an elegant, custom MVC-like architecture. The system relies heavily on strict separation of concerns, high-performance Redis caching, and robust stateless authentication.

The application has been fully integrated into a unified `main` branch, bringing together modules from 6 different core developers into a single, cohesive ecosystem.

## ✨ Key Features
- **Centralized Master Router (`api.php`):** All HTTP requests route through a single entry point utilizing a hybrid `/module/action` parsing system, guaranteeing uniform error handling across the entire API.
- **Defensive Security & RBAC:** Stateless JWT Authentication secures the endpoints. Row-Level Security prevents IDOR (Insecure Direct Object Reference) by injecting `user_id` directly from tokens, and strict validation guards prevent Mass Assignment.
- **Smart Data Filtering:** Advanced `applyFilters()` utilizing an Operator Map handles complex `LIKE` searches and `>=`, `<=` range filtering dynamically without writing custom SQL.
- **High-Performance Caching:** Every `GET` endpoint leverages Redis. Dynamic cache keys are generated deterministically using sorted query parameters, guaranteeing instant sub-millisecond responses.
- **Database Reliability:** Utilizing `PDO` Prepared Statements to eliminate SQL injection, global Soft Deletion across models (to maintain referential integrity), and a unified Server-Side Pagination helper.
- **Standardized JSON Responses:** A uniform output structure (`status_code`, `message`, `data`) for 100% of API endpoints, making frontend consumption incredibly smooth.

---

## 🛠️ Requirements & Prerequisites
To run this project locally, ensure your machine has the following installed:
1. **PHP 8.0+** (Added to your system PATH)
2. **Composer 2.x** (Global installation)
3. **MySQL / MariaDB** (Easily available via XAMPP)
4. **Redis Server** (Running locally on default port `6379`)

---

## 🚀 Installation & Setup Guide

**1. Clone the repository:**
```bash
git clone <repository_url>
cd doctorna
```

**2. Install Dependencies:**
We use Composer to install required packages (Firebase JWT, Predis, and PHPMailer):
```bash
composer install
```

**3. Configure your Environment:**
```bash
cp .env.example .env
```
Open `.env` and fill in your local MySQL, Redis, and SMTP credentials. **Critically: Provide a secure, 32+ character `JWT_SECRET`.**

**4. Database Migration:**
Import the provided SQL dump from the `database/` directory into your local MySQL instance to create the necessary tables (`users`, `doctors`, `speciality`, `appointments`, `sub_services`).

**5. Start the Application Locally:**
You can serve the API directly via PHP's built-in development server.
```bash
php -S localhost:8000 routes/api.php
```

---

## 📂 Folder Structure (Flat Architecture)

```text
doctorna/
├── config/          # Environment parsers and database connection wrappers
├── Controllers/     # HTTP Request handlers, private validation guards, and JSON delivery
├── database/        # SQL schema dumps and migrations
├── docs/            # Markdown backups of official architectural documentation
├── helper/          # Core reusable ecosystem (filtration, cache, jwt, response, pagination)
├── repos/           # Database Data Access Layer (PDO execution and soft deletes)
├── routes/          # Central API routing (api.php is the sole entry point)
├── diagrams/        # ERDs and Architectural mapping diagrams
├── .env.example     # Template for required environment variables
├── composer.json    # Dependency and Autoload mapping configuration
└── README.md        # The document you are reading right now!
```

---

## 📚 Comprehensive Documentation
The entire Doctorna architecture, from high-level philosophy to code-level security patterns, has been fully documented across 6 distinct phases. These are available in both **English** (in the `docs/` folder) and **Egyptian Arabic** (synced to our Notion workspace).

1. **Phase 1:** Project Overview & Master Architecture
2. **Phase 2:** Core Helpers Ecosystem (The DRY Philosophy)
3. **Phase 3:** Controllers & Routing Layer (Business Logic & Flow)
4. **Phase 4:** Repositories & Data Access Layer (PDO & Soft Delete)
5. **Phase 5:** Security & Authentication Deep Dive (Defense in Depth)
6. **Phase 6:** Future Integration Plans (M:N Smart Booking Architecture)

For API endpoint testing, a comprehensive **Postman Collection V2** is included in the root directory.

---

## 🏆 Core Contributors & Modules

This project was built collaboratively. Each developer owned specific architectural layers and domain modules:

- **👩‍💻 Rawan**
  - **Core Integration:** Master Router implementation and overall API Architecture.
  - **Authentication:** `POST` Login, `POST` Register, JWT Auto-login.
  - **Documentation:** Phase 1-6 Documentation and Postman Collection V2.

- **👨‍💻 Tayson (AhmedTyson)**
  - **Authentication & Security:** Forget/Reset Password flow, PHPMailer Integration.
  - **Doctor Module:** Full CRUD operations and Availability patching.
  - **Performance:** Redis Caching ecosystem and invalidation strategy.

- **👨‍💻 Abdullah & Adham**
  - **Patients Module:** Admin-scoped endpoints and filtering.
  - **Architecture:** Soft Delete pattern enforcement and Database schema.
  - **Utilities:** Global Server-Side Pagination helper.

- **👩‍💻 Maryam**
  - **Appointments Module:** Full CRUD, Row-Level Security, and JWT User ID injection.
  - **Search & Filtration:** Advanced dynamic searching logic and Operator Map generation.

- **👩‍💻 Nada**
  - **Sub Services Module:** Full CRUD and specific Hard-Delete enforcement.
  - **Features:** Range-based price filtering and Redis caching integration.

- **👩‍💻 Tassneem**
  - **Speciality Module:** Full CRUD operations.
  - **Features:** Advanced `LEFT JOIN` logic for doctor counts and Redis cache segregation.

---

## 🚑 Troubleshooting & FAQ

**Q: I get a "Class not found" error or 500 Server Error on startup.**
**A:** Run `composer dump-autoload` to regenerate the PSR-4 autoloader maps. Also, ensure your `JWT_SECRET` is properly set in the `.env` file, as the system will fail loudly without it.

**Q: Connection refused error for Redis.**
**A:** Ensure your Redis server is actively running on port `6379`. On Windows, start the Redis service via WSL. On Mac/Linux, run `redis-server`.

**Q: Where are the `vendor/` files?**
**A:** They are intentionally excluded from version control to keep the repository fast. Running `composer install` will download them locally.