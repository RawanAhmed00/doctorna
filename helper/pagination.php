<?php
// helper/pagination.php
//Pgintation concept: 
function paginateTable($conn, $tableName, $defaultLimit = 10) {
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : $defaultLimit;
    
    if ($page < 1) $page = 1;
    if ($limit < 1 || $limit > 100) $limit = $defaultLimit;

    $offset = ($page - 1) * $limit;

    
    $allowedTables = ['speciality', 'doctors', 'users', 'appointments','sub_services']; 
    if (!in_array($tableName, $allowedTables)) {
        die(json_encode(["message" => "Invalid table name"]));
    }

    $countQuery = "SELECT COUNT(*) as total FROM `{$tableName}` WHERE deleted_at IS NULL";
    $countStmt = $conn->prepare($countQuery);
    $countStmt->execute();
    $totalRecords = (int)$countStmt->fetch(PDO::FETCH_ASSOC)['total'];


    $dataQuery = "SELECT * FROM `{$tableName}` WHERE deleted_at IS NULL ORDER BY id LIMIT :limit OFFSET :offset";
    $dataStmt = $conn->prepare($dataQuery);
    $dataStmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $dataStmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $dataStmt->execute();
    $list = $dataStmt->fetchAll(PDO::FETCH_ASSOC);

    $totalPages = ceil($totalRecords / $limit);

    return [
        'list' => $list,
        'pagination' => [
            'current_page' => $page,
            'per_page'     => $limit,
            'total_records'=> $totalRecords,
            'total_pages'  => $totalPages,
            'has_next'     => $page < $totalPages,
            'has_prev'     => $page > 1
        ]
    ];
}