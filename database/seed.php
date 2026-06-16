<?php
/**
 * seed.php - Standalone seeder: mirrors doctorna.sql (50 users) with hashed passwords.
 * Uses PASSWORD_DEFAULT to match AuthController password_hash() call exactly.
 * Safe to re-run: truncates users first, then re-inserts all 50 rows.
 *
 * Usage: php database/seed.php
 */

// ─── DB Connection ────────────────────────────────────────────────────────────
$host     = '127.0.0.1';
$dbname   = 'doctorna';
$username = 'root';
$password = '';

try {
    $pdo = new PDO(
        "mysql:host={$host};dbname={$dbname};charset=utf8mb4",
        $username,
        $password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    die("[ERROR] DB connection failed: " . $e->getMessage() . PHP_EOL);
}

// ─── Seed Data (exact copy of doctorna.sql INSERT, plain-text passwords) ──────
$users = [
    ['id'=>1,  'name'=>'Ahmed Ali',       'email'=>'ahmed.ali@example.com',    'password'=>'pass1234',      'age'=>28,'gender'=>'male',  'phone'=>'1012345678','role'=>'user'],
    ['id'=>2,  'name'=>'Sara Hassan',     'email'=>'sara.hassan@example.com',  'password'=>'sara@2026',     'age'=>24,'gender'=>'female','phone'=>'1123456789','role'=>'user'],
    ['id'=>3,  'name'=>'Mohamed Omar',    'email'=>'mohamed.omar@example.com', 'password'=>'doctor#1',      'age'=>35,'gender'=>'male',  'phone'=>'1234567890','role'=>'admin'],
    ['id'=>4,  'name'=>'Aya Ibrahim',     'email'=>'aya.ibrahim@example.com',  'password'=>'aya_pass',      'age'=>22,'gender'=>'female','phone'=>'1545678901','role'=>'user'],
    ['id'=>5,  'name'=>'Mahmoud Khaled',  'email'=>'mahmoud.k@example.com',    'password'=>'khaled99',      'age'=>31,'gender'=>'male',  'phone'=>'1098765432','role'=>'user'],
    ['id'=>6,  'name'=>'Fatma Mostafa',   'email'=>'fatma.m@example.com',      'password'=>'fatma@@',       'age'=>29,'gender'=>'female','phone'=>'1198765432','role'=>'user'],
    ['id'=>7,  'name'=>'Hany Youssef',    'email'=>'hany.y@example.com',       'password'=>'hany_secure',   'age'=>42,'gender'=>'male',  'phone'=>'1298765432','role'=>'admin'],
    ['id'=>8,  'name'=>'Amira Tarek',     'email'=>'amira.t@example.com',      'password'=>'amira123',      'age'=>26,'gender'=>'female','phone'=>'1598765432','role'=>'user'],
    ['id'=>9,  'name'=>'Mustafa Reda',    'email'=>'mustafa.r@example.com',    'password'=>'mustafa77',     'age'=>33,'gender'=>'male',  'phone'=>'1011122233','role'=>'user'],
    ['id'=>10, 'name'=>'Nour El-Din',     'email'=>'nour.edin@example.com',    'password'=>'nour_pass',     'age'=>27,'gender'=>'female','phone'=>'1111122233','role'=>'user'],
    ['id'=>11, 'name'=>'Kareem Adel',     'email'=>'kareem.a@example.com',     'password'=>'kareem88',      'age'=>30,'gender'=>'male',  'phone'=>'1211122233','role'=>'user'],
    ['id'=>12, 'name'=>'Rania Sayed',     'email'=>'rania.s@example.com',      'password'=>'rania_secure',  'age'=>25,'gender'=>'female','phone'=>'1511122233','role'=>'user'],
    ['id'=>13, 'name'=>'Eslam Gamal',     'email'=>'eslam.g@example.com',      'password'=>'eslam123',      'age'=>23,'gender'=>'male',  'phone'=>'1022233344','role'=>'user'],
    ['id'=>14, 'name'=>'Dina Amr',        'email'=>'dina.amr@example.com',     'password'=>'dina@pass',     'age'=>34,'gender'=>'female','phone'=>'1122233344','role'=>'admin'],
    ['id'=>15, 'name'=>'Sherif Hussein',  'email'=>'sherif.h@example.com',     'password'=>'sherif90',      'age'=>45,'gender'=>'male',  'phone'=>'1222333444','role'=>'user'],
    ['id'=>16, 'name'=>'Mona Mahmoud',    'email'=>'mona.m@example.com',       'password'=>'mona2026',      'age'=>28,'gender'=>'female','phone'=>'1522233344','role'=>'user'],
    ['id'=>17, 'name'=>'Tarek Anwar',     'email'=>'tarek.a@example.com',      'password'=>'tarek_pass',    'age'=>38,'gender'=>'male',  'phone'=>'1033344455','role'=>'admin'],
    ['id'=>18, 'name'=>'Yasmine Fouad',   'email'=>'yasmine.f@example.com',    'password'=>'yasmine11',     'age'=>24,'gender'=>'female','phone'=>'1133344455','role'=>'user'],
    ['id'=>19, 'name'=>'Waleed Ashour',   'email'=>'waleed.a@example.com',     'password'=>'waleed66',      'age'=>29,'gender'=>'male',  'phone'=>'1233344455','role'=>'user'],
    ['id'=>20, 'name'=>'Noha Kamal',      'email'=>'noha.k@example.com',       'password'=>'noha_pass',     'age'=>31,'gender'=>'female','phone'=>'1533344455','role'=>'user'],
    ['id'=>21, 'name'=>'Hassan Soliman',  'email'=>'hassan.s@example.com',     'password'=>'hassan77',      'age'=>36,'gender'=>'male',  'phone'=>'1044455566','role'=>'user'],
    ['id'=>22, 'name'=>'Mai Abdelrahman', 'email'=>'mai.a@example.com',        'password'=>'mai_secure',    'age'=>22,'gender'=>'female','phone'=>'1144455566','role'=>'user'],
    ['id'=>23, 'name'=>'Hazem Emad',      'email'=>'hazem.e@example.com',      'password'=>'hazem123',      'age'=>27,'gender'=>'male',  'phone'=>'1244455566','role'=>'user'],
    ['id'=>24, 'name'=>'Farida Wael',     'email'=>'farida.w@example.com',     'password'=>'farida99',      'age'=>26,'gender'=>'female','phone'=>'1544455566','role'=>'user'],
    ['id'=>25, 'name'=>'Amr Saad',        'email'=>'amr.saad@example.com',     'password'=>'amr_pass',      'age'=>40,'gender'=>'male',  'phone'=>'1055566677','role'=>'admin'],
    ['id'=>26, 'name'=>'Reem Nabil',      'email'=>'reem.n@example.com',       'password'=>'reem2026',      'age'=>25,'gender'=>'female','phone'=>'1155566677','role'=>'user'],
    ['id'=>27, 'name'=>'Sameh Magdy',     'email'=>'sameh.m@example.com',      'password'=>'sameh88',       'age'=>32,'gender'=>'male',  'phone'=>'1255566677','role'=>'user'],
    ['id'=>28, 'name'=>'Laila Hassan',    'email'=>'laila.h@example.com',      'password'=>'laila_pass',    'age'=>28,'gender'=>'female','phone'=>'1555666777','role'=>'user'],
    ['id'=>29, 'name'=>'Ramy Saeed',      'email'=>'ramy.s@example.com',       'password'=>'ramy1234',      'age'=>33,'gender'=>'male',  'phone'=>'1066677788','role'=>'user'],
    ['id'=>30, 'name'=>'Heidi Mohamed',   'email'=>'heidi.m@example.com',      'password'=>'heidi@@',       'age'=>30,'gender'=>'female','phone'=>'1166677788','role'=>'user'],
    ['id'=>31, 'name'=>'Youssef Nasser',  'email'=>'youssef.n@example.com',    'password'=>'youssef99',     'age'=>35,'gender'=>'male',  'phone'=>'1266677788','role'=>'admin'],
    ['id'=>32, 'name'=>'Aisha Ahmed',     'email'=>'aisha.a@example.com',      'password'=>'aisha_pass',    'age'=>23,'gender'=>'female','phone'=>'1566677788','role'=>'user'],
    ['id'=>33, 'name'=>'Khaled Mansour',  'email'=>'khaled.m@example.com',     'password'=>'khaled77',      'age'=>41,'gender'=>'male',  'phone'=>'1077788899','role'=>'user'],
    ['id'=>34, 'name'=>'Nadine Sherif',   'email'=>'nadine.s@example.com',     'password'=>'nadine123',     'age'=>24,'gender'=>'female','phone'=>'1177788899','role'=>'user'],
    ['id'=>35, 'name'=>'Maged Raafat',    'email'=>'maged.r@example.com',      'password'=>'maged_pass',    'age'=>29,'gender'=>'male',  'phone'=>'1277788899','role'=>'user'],
    ['id'=>36, 'name'=>'Salma Ezzat',     'email'=>'salma.e@example.com',      'password'=>'salma2026',     'age'=>27,'gender'=>'female','phone'=>'1577788899','role'=>'user'],
    ['id'=>37, 'name'=>'Ibrahim Awad',    'email'=>'ibrahim.a@example.com',    'password'=>'ibrahim88',     'age'=>37,'gender'=>'male',  'phone'=>'1088899900','role'=>'user'],
    ['id'=>38, 'name'=>'Habiba Alaa',     'email'=>'habiba.a@example.com',     'password'=>'habiba_secure', 'age'=>21,'gender'=>'female','phone'=>'1188899900','role'=>'user'],
    ['id'=>39, 'name'=>'Hisham Gaber',    'email'=>'hisham.g@example.com',     'password'=>'hisham99',      'age'=>44,'gender'=>'male',  'phone'=>'1288899900','role'=>'admin'],
    ['id'=>40, 'name'=>'Malak Omar',      'email'=>'malak.o@example.com',      'password'=>'malak123',      'age'=>25,'gender'=>'female','phone'=>'1588899900','role'=>'user'],
    ['id'=>41, 'name'=>'Bassem Talaat',   'email'=>'bassem.t@example.com',     'password'=>'bassem_pass',   'age'=>32,'gender'=>'male',  'phone'=>'1099900011','role'=>'user'],
    ['id'=>42, 'name'=>'Jana Waleed',     'email'=>'jana.w@example.com',       'password'=>'jana2026',      'age'=>23,'gender'=>'female','phone'=>'1199900011','role'=>'user'],
    ['id'=>43, 'name'=>'Ziad Karim',      'email'=>'ziad.k@example.com',       'password'=>'ziad88',        'age'=>28,'gender'=>'male',  'phone'=>'1299900011','role'=>'user'],
    ['id'=>44, 'name'=>'Mariam Zakaria',  'email'=>'mariam.z@example.com',     'password'=>'mariam_pass',   'age'=>26,'gender'=>'female','phone'=>'1599900011','role'=>'user'],
    ['id'=>45, 'name'=>'Ashraf Helmy',    'email'=>'ashraf.h@example.com',     'password'=>'ashraf99',      'age'=>46,'gender'=>'male',  'phone'=>'1012131415','role'=>'admin'],
    ['id'=>46, 'name'=>'Rowan Mahmoud',   'email'=>'rowan.m@example.com',      'password'=>'rowan123',      'age'=>22,'gender'=>'female','phone'=>'1112131415','role'=>'user'],
    ['id'=>47, 'name'=>'Belal Hamdy',     'email'=>'belal.h@example.com',      'password'=>'belal_pass',    'age'=>30,'gender'=>'male',  'phone'=>'1212131415','role'=>'user'],
    ['id'=>48, 'name'=>'Ghada Ali',       'email'=>'ghada.a@example.com',      'password'=>'ghada2026',     'age'=>34,'gender'=>'female','phone'=>'1512131415','role'=>'user'],
    ['id'=>49, 'name'=>'Ayman Fathy',     'email'=>'ayman.f@example.com',      'password'=>'ayman88',       'age'=>39,'gender'=>'male',  'phone'=>'1016171819','role'=>'user'],
    ['id'=>50, 'name'=>'Shahd Samir',     'email'=>'shahd.s@example.com',      'password'=>'shahd_secure',  'age'=>24,'gender'=>'female','phone'=>'1116171819','role'=>'user'],
];

// ─── Truncate & Re-insert ─────────────────────────────────────────────────────
echo "Truncating users table..." . PHP_EOL;
$pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
$pdo->exec("TRUNCATE TABLE `users`");
$pdo->exec("SET FOREIGN_KEY_CHECKS = 1");

$stmt = $pdo->prepare(
    "INSERT INTO `users` (`id`,`name`,`email`,`password`,`age`,`gender`,`phone`,`role`)
     VALUES (:id,:name,:email,:password,:age,:gender,:phone,:role)"
);

$inserted = 0;
foreach ($users as $u) {
    $stmt->execute([
        ':id'       => $u['id'],
        ':name'     => $u['name'],
        ':email'    => $u['email'],
        ':password' => password_hash($u['password'], PASSWORD_DEFAULT),
        ':age'      => $u['age'],
        ':gender'   => $u['gender'],
        ':phone'    => $u['phone'],
        ':role'     => $u['role'],
    ]);
    $inserted++;
    echo "  [OK] #{$u['id']} {$u['name']} ({$u['role']}) — {$u['email']}" . PHP_EOL;
}

echo PHP_EOL . "[DONE] {$inserted} users seeded with hashed passwords." . PHP_EOL;
echo PHP_EOL . "Admins (role=admin):" . PHP_EOL;
echo "  mohamed.omar@example.com / doctor#1" . PHP_EOL;
echo "  hany.y@example.com       / hany_secure" . PHP_EOL;
echo "  dina.amr@example.com     / dina@pass" . PHP_EOL;
echo "  tarek.a@example.com      / tarek_pass" . PHP_EOL;
echo "  amr.saad@example.com     / amr_pass" . PHP_EOL;
echo "  youssef.n@example.com    / youssef99" . PHP_EOL;
echo "  hisham.g@example.com     / hisham99" . PHP_EOL;
echo "  ashraf.h@example.com     / ashraf99" . PHP_EOL;
echo PHP_EOL . "Users (role=user):" . PHP_EOL;
echo "  ahmed.ali@example.com    / pass1234" . PHP_EOL;
echo "  sara.hassan@example.com  / sara@2026" . PHP_EOL;
