# 🏥 Doctorna API (Task-06)

![PHP](https://img.shields.io/badge/PHP-8.x-777BB4?style=for-the-badge&logo=php&logoColor=white)
![Composer](https://img.shields.io/badge/Composer-2.x-885630?style=for-the-badge&logo=composer&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?style=for-the-badge&logo=redis&logoColor=white)

## 📖 Project Overview
Doctorna is the core RESTful API backend for managing tasks, users, and operations. It is built entirely in raw PHP using an elegant, custom MVC-like architecture modeled after Task-05. It relies heavily on strict separation of concerns: routing HTTP requests to Controllers, executing database logic in Repositories, and standardizing outputs via Helpers.

## ✨ Features
- **Strict Separation of Concerns:** Router -> Controller -> Repository.
- **PSR-4 Autoloading:** Object-oriented namespacing managed automatically by Composer.
- **JWT Authentication:** Secure endpoints using `firebase/php-jwt`.
- **Redis Caching:** High-performance data caching utilizing `predis/predis`.
- **Standardized JSON Responses:** Uniform output structures for 100% of API endpoints.

---

## 🛠️ Requirements & Prerequisites
To run this project locally, ensure your machine has the following installed:
1. **PHP 8.0+** (Added to your system PATH)
2. **Composer 2.x** (Global installation)
3. **MySQL / MariaDB** (Easily available via XAMPP)
4. **Redis Server** (Running locally on default port `6379`)

---

## 🚀 Team Setup Guide & Installation

Follow these precise steps to effortlessly onboard and run the repository:

**1. Clone the repository:**
```bash
git clone <repository_url>
cd doctorna
```

**2. Install Dependencies:**
Just like running `npm install` for Node.js, we use Composer for PHP. This single command will read the `composer.json` file and automatically install all required packages (Firebase JWT, Predis, and PHPMailer) for you:
```bash
composer install
```

**3. Configure your Environment:**
```bash
cp .env.example .env
```
Open `.env` and fill in your local MySQL and Redis credentials.

**4. Start the Application Locally:**
You can serve the API directly via PHP's built-in development server. By pointing the server directly at the API router, all requests will seamlessly route through the application.
```bash
php -S localhost:8000 routes/api.php
```

---

## 📂 Folder Structure (Flat Architecture)

```text
doctorna/
├── config/          # Environment parsers and database connection wrappers
├── Controllers/     # HTTP Request handlers, validation, and JSON delivery
├── database/        # SQL schema dumps and migrations
├── helper/          # Core reusable functions (DB mapping, Responses, Status codes)
├── repos/           # Database queries and PDO interaction logic
├── routes/          # Central API routing (api.php)
├── diagrams/        # ERDs and Architectural mapping diagrams
├── .env.example     # Template for required environment variables
├── composer.json    # Dependency and Autoload mapping configuration
└── README.md        # The document you are reading right now!
```

---

## 🔄 Single-Branch Team Workflow

Since the entire team is collaborating directly on the **same branch (`main`)**, it is critical to follow these rules to prevent merge conflicts and lost work:

### Collaboration Rules
1. **Always Pull First:** Before you start writing any code, run `git pull` to ensure you have the latest updates from your teammates.
2. **Communicate:** Coordinate with your team in your chat/workspace before editing core files (like `routes/api.php` or `helper/db.php`) to ensure two people aren't changing the same file simultaneously.
3. **Commit Frequently:** Make small, logical commits so your changes are easy to track.

### Pushing Your Code
When you are ready to share your work, always pull to check for updates *before* you push:
```bash
git pull --rebase
git push
```
*(Using `--rebase` applies your new commits cleanly on top of whatever your teammates just pushed, keeping the history linear and avoiding messy merge commits).*

### Commit Conventions
Prefix all commit messages using standard conventional commits:
- `feat:` A new feature (e.g., `feat: add AirlineController`).
- `fix:` A bug fix.
- `docs:` Documentation updates.
- `refactor:` Code changes.
- `chore:` Maintenance or configuration.

---

## 🚑 Troubleshooting & FAQ

**Q: I get a "Class not found" error when adding a new Controller.**
**A:** Run `composer dump-autoload` in your terminal to regenerate the PSR-4 autoloader maps.

**Q: Connection refused error for Redis.**
**A:** Ensure your Redis server is actively running. On Windows, this might require starting the Redis service via WSL or your native Redis installation. On Mac/Linux, try `redis-server`.

**Q: Where are the `vendor/` files?**
**A:** They are intentionally excluded from version control to keep the repository fast. Running `composer install` will download them locally.

---

## 📋 Sprint Tasks & Team Assignments

To avoid merge conflicts, team members should focus exclusively on their assigned modules and controllers.

**👩‍💻 Rawan**
- **Authentication:** POST Login, POST Register
- **Database:** Finalize Database Creation/Migrations
- **Docs:** API Documentation

**👨‍💻 Tayson**
- **Authentication:** POST Forget Password, POST Reset Password, PHPMailer Integration
- **Doctor Module (DoctorController):** GET by ID, GET All, POST, PUT, DELETE, PATCH Availability
- **Features:** Redis Caching for Doctor Module

**👨‍💻 Abdullah & Adham**
- **Patients Module (PatientController / UserController):** GET by ID, GET All, POST, PUT, DELETE
- **Features:** Soft Delete implementation (Abdullah), Global Pagination

**👩‍💻 Maryam**
- **Appointment Module (AppointmentController):** GET by ID, GET All, POST
- **Features:** Filtration / Searching

**👩‍💻 Nada**
- **Sub Services Module (SubServiceController):** GET by ID, GET All, POST
- **Features:** Redis Caching for Sub Services

**👩‍💻 Tassneem**
- **Speciality Module (SpecialityController):** GET by ID, GET All, POST, PUT
- **Features:** Redis Caching for Specialities
