<?php

function applyFilters(string $baseQuery, array $allowedFields, array $bindings = [], array $operatorMap = []): array {
    $query = $baseQuery;
    
    foreach ($allowedFields as $field) {
        if (isset($_GET[$field]) && $_GET[$field] !== '') {
            $paramName = str_replace('.', '_', $field);
            $value = $_GET[$field];
            
            // Determine operator and column from operatorMap
            $operator = '=';
            $column = $field;
            if (isset($operatorMap[$field])) {
                if (is_array($operatorMap[$field])) {
                    $operator = $operatorMap[$field][0];
                    $column = $operatorMap[$field][1];
                } else {
                    $operator = $operatorMap[$field];
                }
            }
            
            if ($operator === '=' && strpos($column, 'date') !== false && strlen($value) === 10) {
                $query .= " AND DATE($column) = :$paramName";
            } elseif (strtoupper($operator) === 'LIKE') {
                $query .= " AND $column LIKE :$paramName";
                $value = '%' . $value . '%';
            } else {
                $query .= " AND $column $operator :$paramName";
            }
            
            $bindings[":$paramName"] = $value;
        }
    }
    
    return [
        'sql' => $query,
        'bindings' => $bindings
    ];
}
