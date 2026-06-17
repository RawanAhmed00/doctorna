 <?php
$host = "localhost";
$database = "doctorna";
$user = "root";
$pass = "";
$port = "3307";
try {
    $conn = new PDO("mysql:host=$host;port=$port;dbname=$database", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $err) {
    echo "connection Failed" . $err->getMessage();
}
?> 