<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Predis\Client;

function getRedisClient(): ?Client {
    static $client = null;
    static $isUnavailable = false;

    if ($isUnavailable) {
        return null;
    }

    if ($client === null) {
        try {
            $client = new Client([
                'scheme' => 'tcp',
                'host'   => '127.0.0.1',
                'port'   => 6379,
                'timeout' => 1.0, 
            ]);
            $client->connect();
        } catch (Exception $e) {
            $client = null;
            $isUnavailable = true; 
            return null;
        }
    }
    return $client;
}

function cacheGet(string $key) {
    try {
        $client = getRedisClient();
        if ($client === null) {
            return null;
        }
        $value = $client->get($key);
        return $value ? json_decode($value, true) : null;
    } catch (Exception $e) {
        return null;
    }
}

function cacheSet(string $key, $value, int $expire = 3600): void {
    try {
        $client = getRedisClient();
        if ($client === null) {
            return;
        }
        $client->setex($key, $expire, json_encode($value));
    } catch (Exception $e) {
    }
}

function cacheDelete(string $key): void {
    try {
        $client = getRedisClient();
        if ($client === null) {
            return;
        }
        $client->del([$key]);
    } catch (Exception $e) {
    }
}

function serveFromCacheIfAvailable(string $key, string $message = ""): void {
    $cachedData = cacheGet($key);
    if ($cachedData !== null) {
        response(200, $message, [
            'source' => 'cache',
            'data' => $cachedData
        ]);
    }
}

function saveToCache(string $key, $value, int $expire = 3600): void {
    cacheSet($key, $value, $expire);
}

function deleteFromCache(string $key): void {
    cacheDelete($key);
}
