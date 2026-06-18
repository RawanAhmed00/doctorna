<div align="center">

# 🏥 Doctorna REST API

A lightning-fast, framework-less PHP RESTful API designed for clinic management and medical appointment booking.

[![PHP Version](https://img.shields.io/badge/PHP-8.0%2B-777BB4?logo=php&logoColor=white)](#)
[![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?logo=mysql&logoColor=white)](#)
[![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?logo=redis&logoColor=white)](#)
[![JWT](https://img.shields.io/badge/JWT-Auth-black?logo=jsonwebtokens)](#)

</div>

---

## 🚀 Overview

Doctorna is a modern, stateless backend API built entirely in **Vanilla PHP** (no frameworks like Laravel or Symfony). It was engineered from the ground up to demonstrate clean architecture, high performance, and strict security practices without the overhead of heavy external libraries.

The system handles user authentication, medical staff management, clinic specialities, granular sub-services, and real-time appointment booking.

## ✨ Core Architecture & Features

- **Zero-Framework Architecture:** Built with pure PHP 8 to maximize execution speed and maintain absolute control over the request lifecycle.
- **Stateless Authentication:** Secure endpoints using `firebase/php-jwt`. No server-side sessions (`$_SESSION`) are used.
- **Repository Pattern:** Database logic is strictly decoupled from business logic. Controllers never write SQL; Repositories handle all PDO operations.
- **High-Speed Caching:** Integrated with `predis/predis`. Expensive database reads are cached in **Redis** and automatically invalidated upon data mutation.
- **Centralized Routing:** All HTTP traffic is funneled through a single Master Router, ensuring unified exception handling and CORS management.
- **SQL Injection Prevention:** 100% adherence to PDO Prepared Statements with named parameters.
- **Unified JSON Responses:** Every endpoint returns a predictable, standardized JSON structure.

---

## ⚙️ Prerequisites

To run this application locally, your development environment must have:

- **PHP 8.0** or higher
- **Composer** (Dependency Manager for PHP)
- **MySQL** or **MariaDB**
- **Redis Server** (Running on `127.0.0.1:6379`)

---

## 🛠️ Installation & Setup

**1. Clone the repository**
```bash
git clone https://github.com/your-username/doctorna.git
cd doctorna
```

**2. Install dependencies**
Install the minimal required packages (JWT, Predis, Dotenv) via Composer:
```bash
composer install
```

**3. Environment Configuration**
Copy the example environment file and configure your local credentials:
```bash
cp .env.example .env
```
*Note: You must generate and set a strong, random 32-character string for `JWT_SECRET` in your `.env` file, or the application will throw a 500 Internal Server Error.*

**4. Database Migration**
Create a new MySQL database named `doctorna`. Import the provided SQL schema to generate the required tables and relationships:
```bash
mysql -u root -p doctorna < database/doctorna.sql
```

**5. Start the Development Server**
Serve the application using PHP's built-in web server, pointing all traffic to the central router:
```bash
php -S localhost:8000 routes/api.php
```

---

## 📂 Project Structure

```text
/
├── config/          # Environment loading and database connection
├── Controllers/     # Request parsing, validation, and business logic
├── helper/          # Global utilities (Response formatting, caching, filtration)
├── repos/           # Data Access Layer (SQL queries and PDO)
├── routes/          # API Gateway (api.php)
├── .env.example     # Environment variable template
└── composer.json    # Autoloading and dependency mapping
```

---

## 📡 API Interaction & Postman

A comprehensive **Postman Collection** is included in the root directory (`Doctorna_API_v2.postman_collection.json`). 

Import this file into Postman to instantly access all configured endpoints, complete with example request bodies, expected responses, and authentication workflows.

### Standard Response Format
Regardless of success or failure, the API will always respond with the following JSON signature:

```json
{
    "status_code": 200,
    "message": "Operation successful",
    "data": { ... }
}
```

---

## 🔒 Security Practices

- **Mass Assignment Prevention:** Input is strictly whitelisted before hitting the database.
- **Row-Level Security:** Appointment and user data access is tightly scoped using the `user_id` decoded directly from the verified JWT, bypassing easily manipulated client-side IDs.
- **Soft Deletion:** Records are preserved with a `deleted_at` timestamp rather than hard-deleted, maintaining referential database integrity.
- **Rate Limiting Preparation:** The architecture supports Redis-based IP throttling for future horizontal scaling.

---

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
