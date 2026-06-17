<?php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/status.php';
require_once __DIR__ . '/response.php';

use Predis\Client;

$redis = new Client([
    'scheme' => 'tcp',
    'host'   => '127.0.0.1',
    'port'   => 6379
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
    } catch (\Exception $e) {
        // Redis is down, fail gracefully and let it fetch from database
    }
}

function saveToCache($cacheKey, $data, $ttl = 3600) {
    global $redis;
    try {
        $redis->setex($cacheKey, $ttl, json_encode($data));
    } catch (\Exception $e) {
        // Redis is down, fail gracefully
    }
}
