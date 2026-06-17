<?php
require_once __DIR__ . '/env.php';
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/status.php';
require_once __DIR__ . '/response.php';

use Predis\Client;
use Exception; // Import base Exception class

$redis = new Client([
    'scheme' => 'tcp',
    'host'   => env('REDIS_HOST', '127.0.0.1'),
    'port'   => env('REDIS_PORT', 6379)
]);

function serveFromCacheIfAvailable($cacheKey, $message) {
    global $redis;
    try {
        if ($redis->exists($cacheKey)) {
            response(HttpStatus('OK'), $message, [
                'source' => 'redis',
                'data' => json_decode($redis->get($cacheKey), true)
            ]);
        }
    } catch (Exception $e) {
        // Log error to server file
        error_log("Redis Cache Error: " . $e->getMessage());
    }
}

function saveToCache($cacheKey, $data, $ttl = 3600) {
    global $redis;
    try {
        $redis->setex($cacheKey, $ttl, json_encode($data));
    } catch (Exception $e) {
        error_log("Redis Cache Error: " . $e->getMessage());
    }
}

function deleteFromCache($keys) {
    global $redis;
    try {
        if (!is_array($keys)) {
            $keys = [$keys];
        }
        foreach ($keys as $key) {
            $redis->del($key);
        }
    } catch (Exception $e) {
        error_log("Redis Cache Error: " . $e->getMessage());
    }
}

function storeResetToken($email, $token) {
    global $redis;
    try {
        $redis->setex("password_reset:{$email}", 900, $token);
    } catch (Exception $e) {
        error_log("Redis Cache Error: " . $e->getMessage());
    }
}

function getStoredResetToken($email) {
    global $redis;
    try {
        return $redis->get("password_reset:{$email}");
    } catch (Exception $e) {
        error_log("Redis Cache Error: " . $e->getMessage());
        return null;
    }
}

function deleteResetToken($email) {
    global $redis;
    try {
        $redis->del("password_reset:{$email}");
    } catch (Exception $e) {
        error_log("Redis Cache Error: " . $e->getMessage());
    }
}