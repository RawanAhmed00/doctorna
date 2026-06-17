<?php
// helper/pagination.php
/*Pagintation concept: 

Display Number ($limit) of Elemnts in one page

$Page -> current page number

$limit -> number of elements in one page

offset -> Start From What Elemnt? OR:How many records to skip before beginning?

-offset->beginning = ($page -1 ) * $limit

Array that has the allowed tables to determine tabes we want to engage

if table name is not in allowed tables, display "invalid table name"

To Display Number Of Pages: 
$totalPages =
ceil($totalRecords / $limit);
ceil() -> used to round the number up to nearest integer

Number Of Records ->Number Of Rows Of This Table

*/

function paginateTable($conn, $tableName, $defaultLimit = 10) {
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : $defaultLimit;
    
    //Secuirty: Page should not be less than one AND Limit should not be  less than one or more than 100
    if ($page < 1) $page = 1;
    if ($limit < 1 || $limit > 100) $limit = $defaultLimit;

    //OFFSET: How many records to skip before beginning, it has a specefic equation
    $offset = ($page - 1) * $limit;

    //Array to specify Allowed tables:
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

    //Total pages = totalrecords(rows we have in the table)/limit(no of rows in one page)
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