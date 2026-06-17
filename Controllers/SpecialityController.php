<?php
// controllers/SpecialityController.php
// Handles HTTP requests for Speciality module

require_once __DIR__ . '/../config/redis.php';
require_once __DIR__ . '/../repos/SpecialityRepo.php';
require_once __DIR__ .'/../helper/status.php';

// Cache keys
define('CACHE_SPECIALITIES_ALL', 'specialities:all');
define('CACHE_SPECIALITY_BY_ID', 'speciality:id:');
define('CACHE_TTL_SPECIALITIES', 3600); // 1 hour

function getAllSpecialitiesController($conn) {
    global $redis;
    
    // 1. Check cache first (Cache-Aside pattern)
    $cacheKey = CACHE_SPECIALITIES_ALL;
    $cachedData = $redis->get($cacheKey);
    
    if ($cachedData !== false) {
        // Cache hit → return cached data
        //response(200, "Specialities retrieved from cache", json_decode($cachedData, true));
        response(HttpStatus('OK'),"Specialities retrieved from cache", json_decode($cachedData, true));
    }
    
    // 2. Cache miss → Query database
    $specialities = getAllSpecialities($conn);
    
    if (empty($specialities)) {
        //response(404, "No specialities found");
        response(HttpStatus('NOT_FOUND'),"No specialities found");
    }
    
    // 3. Store result in Redis with TTL
    $redis->setex($cacheKey, CACHE_TTL_SPECIALITIES, json_encode($specialities));
    response(HttpStatus('OK'),"Specialities retrieved successfully",$specialities);
    //response(200, "Specialities retrieved successfully", $specialities);
}

function getSpecialityByIdController($conn, $id) {
    global $redis;
    
    // Validate ID
    if (!is_numeric($id) || $id <= 0) {
        //response(400, "Invalid speciality ID");
        respons(HttpStatus('BAD_REQUEST'),"Invalid speciality ID");
    }
    
    // 1. Check cache first (Cache-Aside pattern)
    $cacheKey = CACHE_SPECIALITY_BY_ID . $id;
    $cachedData = $redis->get($cacheKey);
    
    if ($cachedData !== false) {
        // Cache hit → return cached data
        //response(200, "Speciality retrieved from cache", json_decode($cachedData, true));
        response(HttpStatus('OK'),"Speciality retrieved from cache",json_decode($cachedData, true));
    }
    
    // 2. Cache miss → Query database
    $speciality = getSpecialityById($conn, $id);
    
    if (!$speciality) {
        //response(404, "Speciality not found");
        response(HttpStatus('NOT_FOUND'),"Speciality not found");
    }
    
    // 3. Store result in Redis with TTL
    $redis->setex($cacheKey, CACHE_TTL_SPECIALITIES, json_encode($speciality));
    response(HttpStatus('OK'),"Speciality retrieved successfully",$speciality);
   // response(200, "Speciality retrieved successfully", $speciality);
}
//Only admin has access to this action
function createSpecialityController($conn) {
    global $redis;
    $verifiedToken=VerifyToken();
    // Require admin access
    require_admin($verifiedToken);
    
    // Get input from request body
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
       // response(400, "Invalid input format. JSON expected.");
        respons(HttpStatus('BAD_REQUEST'),"Invalid input format. JSON expected.");
    
    }
    
    // Validate required fields
    //Trim(): cleaning, trimming input from spaces,(left and right not middle!)
    $name = trim($input['name'] ?? '');
    $description = trim($input['description'] ?? '');
    
    if (empty($name)) {
        //response(400, "Speciality name is required");
        respons(HttpStatus('BAD_REQUEST'),"Speciality name is required");
    }
    
    if (empty($description)) {
        //response(400, "Speciality description is required");
        respons(HttpStatus('BAD_REQUEST'),"Speciality description is required");

    }
    
    // Check if speciality already exists
    $existing = getSpecialityByName($conn, $name);
    if ($existing) {
        response(409, "Speciality already exists");
    }
    
    // Create speciality
    $newId = createSpeciality($conn, $name, $description);
    
    if (!$newId) {
        response(500, "Failed to create speciality");
    }
    
    // Get the created speciality
    $newSpeciality = getSpecialityById($conn, $newId);
    
    // Clear cache (Write-Through pattern - Invalidation)
    $redis->del(CACHE_SPECIALITIES_ALL);
    
    // Also clear any individual caches that might exist
    $keys = $redis->keys(CACHE_SPECIALITY_BY_ID . '*');
    if (!empty($keys)) {
        $redis->del($keys);
    }
    
    response(201, "Speciality created successfully", $newSpeciality);
}

function updateSpecialityController($conn, $id) {
    global $redis;
    $verifiedToken=VerifyToken();
    // Require admin access
    require_admin($verifiedToken);
    
    // Validate ID
    if (!is_numeric($id) || $id <= 0) {
        //response(400, "Invalid speciality ID");
        response(HttpStatus('OK'),"Invalid speciality ID");
    }
    
    // Check if speciality exists
    $existing = getSpecialityById($conn, $id);
    if (!$existing) {
        //response(404, "Speciality not found");
        response(HttpStatus('NOT_FOUND'),"Speciality not found");
    }
    
    // Get input from request body
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        //response(400, "Invalid input format. JSON expected.");
        response(HttpStatus('BAD_REQUEST'),"Invalid input format. JSON expected.");
    }
    
    // Validate required fields
    $name = trim($input['name'] ?? '');
    $description = trim($input['description'] ?? '');
    
    if (empty($name)) {
        //response(400, "Speciality name is required");
        respons(HttpStatus('BAD_REQUEST'),"Speciality name is required");
    }
    
    if (empty($description)) {
        //response(400, "Speciality description is required");
         respons(HttpStatus('BAD_REQUEST'),"Speciality description is required");
    }
    
    // Update speciality
    $updated = updateSpeciality($conn, $id, $name, $description);
    
    if (!$updated) {
        response(500, "Failed to update speciality");
    }
    
    // Get the updated speciality
    $updatedSpeciality = getSpecialityById($conn, $id);
    
    // Clear cache (Write-Through pattern - Invalidation)
    $redis->del(CACHE_SPECIALITIES_ALL);
    $redis->del(CACHE_SPECIALITY_BY_ID . $id);
    
    //response(200, "Speciality updated successfully", $updatedSpeciality);
    response(HttpStatus('OK'),"Speciality updated successfully", $updatedSpeciality);
}

function deleteSpecialityController($conn, $id) {
    global $redis;
    $verifiedToken=VerifyToken();
    // Require admin access
    require_admin($verfiedToken);
    
    // Validate ID
    if (!is_numeric($id) || $id <= 0) {
        //response(400, "Invalid speciality ID");
        response(HttpStatus('BAD_REQUEST'),"Invalid speciality ID");
    }
    
    // Check if speciality exists
    $existing = getSpecialityById($conn, $id);
    if (!$existing) {
        //response(404, "Speciality not found");
        respons(HttpStatus('NOT_FOUND'),"Speciality not found");
    }
    
    // Soft delete speciality
    $deleted = softDeleteSpeciality($conn, $id);
    
    if (!$deleted) {
        response(500, "Failed to delete speciality");
    }
    
    // Clear cache (Write-Through pattern - Invalidation)
    $redis->del(CACHE_SPECIALITIES_ALL);
    $redis->del(CACHE_SPECIALITY_BY_ID . $id);
    
    //response(200, "Speciality deleted successfully");
    response(HttpStatus('OK'),"Speciality deleted successfully");
}



?>


