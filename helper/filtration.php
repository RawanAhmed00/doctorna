<?php

function applyFilters(string $baseQuery, array $allowedFields, array $bindings = []): array {
    $query = $baseQuery;
    
    foreach ($allowedFields as $field) {
        // If query param exists and isn't empty
        if (isset($_GET[$field]) && $_GET[$field] !== '') {
            // Strip any table aliases (like 'd.status') to make a clean PDO parameter name
            $paramName = str_replace('.', '_', $field);
            
            // If the field is a date/time column but only a date (YYYY-MM-DD) is provided, match the whole day
            if (strpos($field, 'date') !== false && strlen($_GET[$field]) === 10) {
                $query .= " AND DATE($field) = :$paramName";
            } else {
                $query .= " AND $field = :$paramName";
            }
            
            $bindings[":$paramName"] = $_GET[$field];
        }
    }
    
    return [
        'sql' => $query,
        'bindings' => $bindings
    ];
}
