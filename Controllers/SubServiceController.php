<?php

namespace App\Controllers;

require_once __DIR__ . '/../helper/response.php';
require_once __DIR__ . '/../helper/request.php';
require_once __DIR__ . '/../helper/JWT.php';
require_once __DIR__ . '/../helper/cache.php';

use App\repos\SubServiceRepo;

class SubServiceController {
    private SubServiceRepo $repo;

    public function __construct() {
        global $conn;
        if (!isset($conn)) {
            require_once __DIR__ . '/../config/database.php';
        }
        $this->repo = new SubServiceRepo($conn);
    }

    

    public function getAll(): void {

        VerifyToken();


        $cacheKey = 'subservices:all';
        $cachedData = \Cache::get($cacheKey);
        if ($cachedData !== null) {
            response(200, "Sub services retrieved successfully from cache", $cachedData);
        }

    
        $data = $this->repo->getAll();

    
        \Cache::set($cacheKey, $data, 3600); 
        response(200, "Sub services retrieved successfully", $data);
    }

    public function getById(int $id): void {
        
        VerifyToken();

    
        $cacheKey = "subservices:id:{$id}";
        $cachedData = \Cache::get($cacheKey);
        if ($cachedData !== null) {
            response(200, "Sub service retrieved successfully from cache", $cachedData);
        }

        
        $data = $this->repo->getById($id);
        if ($data === null) {
            response(404, "Sub service not found");
        }

    
        \Cache::set($cacheKey, $data, 3600);
        response(200, "Sub service retrieved successfully", $data);
    }


    public function create(): void {
    
        $token = VerifyToken();
        require_admin($token);

    
        $input = getJsonInput(['name', 'fees', 'description']);

    
        if (strlen($input['name']) > 15) {
            response(422, "The name field must not exceed 15 characters.");
        }

    
        if (!is_numeric($input['fees']) || $input['fees'] < 0) {
            response(422, "The fees field must be a non-negative number.");
        }

    
        $newSubService = $this->repo->create($input);
        if ($newSubService === null) {
            response(500, "Failed to create sub service.");
        }

    
        \Cache::delete('subservices:all');

    
        response(201, "Sub service created successfully", $newSubService);
    }
}
