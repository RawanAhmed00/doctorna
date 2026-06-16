<?php
require_once __DIR__ . '/../vendor/autoload.php';

// Load .env file safely
try {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
    $dotenv->safeLoad();
} catch (\Exception $e) {
    // Fail gracefully if .env doesn't exist
}

// Get .env value or default
if (!function_exists('env')) {
    function env($key, $default = null) {
        return $_ENV[$key] ?? $default;
    }
}