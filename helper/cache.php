<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Predis\Client;

class Cache {
    private static ?Client $client = null;
    private static bool $isUnavailable = false;

    private static function getClient(): ?Client {
        if (self::$isUnavailable) {
            return null;
        }

        if (self::$client === null) {
            try {
                self::$client = new Client([
                    'scheme' => 'tcp',
                    'host'   => '127.0.0.1',
                    'port'   => 6379,
                    'timeout' => 1.0, 
                ]);
                self::$client->connect();
            } catch (Exception $e) {
                self::$client = null;
                self::$isUnavailable = true; 
                return null;
            }
        }
        return self::$client;
    }

    public static function get(string $key) {
        try {
            $client = self::getClient();
            if ($client === null) {
                return null;
            }
            $value = $client->get($key);
            return $value ? json_decode($value, true) : null;
        } catch (Exception $e) {
            return null;
        }
    }

    public static function set(string $key, $value, int $expire = 3600): void {
        try {
            $client = self::getClient();
            if ($client === null) {
                return;
            }
            $client->setex($key, $expire, json_encode($value));
        } catch (Exception $e) {
        }
    }

    public static function delete(string $key): void {
        try {
            $client = self::getClient();
            if ($client === null) {
                return;
            }
            $client->del([$key]);
        } catch (Exception $e) {
           
        }
    }
}
