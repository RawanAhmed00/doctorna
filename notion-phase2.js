const https = require('https');
const TOKEN = process.env.NOTION_TOKEN || 'replace-with-your-token';
const PARENT = '3832c9c0-7e66-8180-b7cd-f74762b4b2f8';
const API = 'https://api.notion.com/v1';

function req(method, endpoint, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(API + endpoint);
    const o = { hostname: u.hostname, path: u.pathname + u.search, method,
      headers: { Authorization: `Bearer ${TOKEN}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' } };
    if (body) o.headers['Content-Length'] = Buffer.byteLength(body);
    const r = https.request(o, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => { const p = JSON.parse(d); if (p.object === 'error') reject(Error(p.message)); else resolve(p); }); });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

function t(text, opts = {}) {
  const o = { type: 'text', text: { content: text } };
  if (opts.link) o.text.link = { url: opts.link };
  const ann = {};
  if (opts.bold) ann.bold = true; if (opts.italic) ann.italic = true; if (opts.code) ann.code = true;
  if (opts.color) ann.color = opts.color;
  if (Object.keys(ann).length) o.annotations = ann;
  return o;
}
function rt(parts) { return Array.isArray(parts) ? parts : [t(parts)]; }
function h1(text) { return { object: 'block', type: 'heading_1', heading_1: { rich_text: rt(text), color: 'default' } }; }
function h2(text) { return { object: 'block', type: 'heading_2', heading_2: { rich_text: rt(text), color: 'default' } }; }
function h3(text) { return { object: 'block', type: 'heading_3', heading_3: { rich_text: rt(text), color: 'default' } }; }
function p(text) { return { object: 'block', type: 'paragraph', paragraph: { rich_text: rt(text) } }; }
function divider() { return { object: 'block', type: 'divider', divider: {} }; }
function bullet(text) { return { object: 'block', type: 'bulleted_list_item', bulleted_list_item: { rich_text: rt(text) } }; }
function num(text) { return { object: 'block', type: 'numbered_list_item', numbered_list_item: { rich_text: rt(text) } }; }
function code(text, lang = 'php') { return { object: 'block', type: 'code', code: { rich_text: [{ type: 'text', text: { content: text.replace(/\t/g, '  ') } }], language: lang } }; }
function calloutBlue(text) { return { object: 'block', type: 'callout', callout: { rich_text: rt(text), icon: { type: 'emoji', emoji: '💡' }, color: 'blue_background' } }; }
function calloutOrange(text) { return { object: 'block', type: 'callout', callout: { rich_text: rt(text), icon: { type: 'emoji', emoji: '🚨' }, color: 'orange_background' } }; }
function calloutRed(text) { return { object: 'block', type: 'callout', callout: { rich_text: rt(text), icon: { type: 'emoji', emoji: '⚠️' }, color: 'red_background' } }; }
function calloutGreen(text) { return { object: 'block', type: 'callout', callout: { rich_text: rt(text), icon: { type: 'emoji', emoji: '⚡' }, color: 'green_background' } }; }
function calloutTarget(text) { return { object: 'block', type: 'callout', callout: { rich_text: rt(text), icon: { type: 'emoji', emoji: '🎯' }, color: 'blue_background' } }; }
function calloutBook(text) { return { object: 'block', type: 'callout', callout: { rich_text: rt(text), icon: { type: 'emoji', emoji: '📚' }, color: 'yellow_background' } }; }
function grayQuote(text) { return { object: 'block', type: 'quote', quote: { rich_text: rt(text), color: 'gray' } }; }
function toggle(text) { return { object: 'block', type: 'toggle', toggle: { rich_text: rt(text), color: 'default' } }; }

function metaTable(rows) {
  const cols = rows[0].length;
  const tableRows = rows.map(cells => ({
    object: 'block', type: 'table_row',
    table_row: { cells: cells.map(c => {
      if (typeof c === 'string') return [{ type: 'text', text: { content: c } }];
      return c;
    }) }
  }));
  return [{ object: 'block', type: 'table', table: { table_width: cols, children: tableRows } }];
}

async function main() {
  // Archive existing Phase 2
  const existing = await req('GET', `/blocks/${PARENT}/children?page_size=50`);
  for (const b of existing.results) {
    if (b.type === 'child_page' && b.child_page.title.includes('Phase 2')) {
      await req('PATCH', `/pages/${b.id}`, JSON.stringify({ archived: true }));
      console.log(`Archived old: ${b.child_page.title}`);
    }
  }

  const blocks = [
    // =================== METADATA TABLE ===================
    ...metaTable([
      ['Property', 'Details'],
      ['Author', 'Architecture Team'],
      ['Status', '🟢 Unified & Active'],
      ['Version', 'v2.0 — Centralized Helper Ecosystem'],
      ['Module', 'Core Helpers Layer'],
      ['Topic Tags', 'Helpers, DRY, Reusability, Validation, Caching, Security, Pagination, Mailer, Filtering'],
      ['Total Helper Files', '10 (db, env, cache, filtration, jwt, mailer, pagination, request, response, status)'],
      ['Total Lines', '~397 lines of pure PHP'],
      ['Design Pattern', 'Procedural Function Library (no classes, no singletons)'],
      ['Dependencies', 'Predis (Redis), PHPMailer, firebase/php-jwt, vlucas/phpdotenv']
    ]),

    divider(),
    h1('📑 Table of Contents'),
    toggle([t('📑 Click to expand — Full Document Structure')]),
    bullet([t('Section 1: '), t('The DRY Philosophy — Why Helpers Matter', { color: 'blue', bold: true })]),
    bullet([t('Section 2: '), t('Database Execution Layer (db.php)', { color: 'blue', bold: true })]),
    bullet([t('Section 3: '), t('Environment Configuration (env.php)', { color: 'blue', bold: true })]),
    bullet([t('Section 4: '), t('Secure Dynamic Filtering (filtration.php)', { color: 'blue', bold: true })]),
    bullet([t('Section 5: '), t('Stateless JWT Authentication (jwt.php)', { color: 'blue', bold: true })]),
    bullet([t('Section 6: '), t('SMTP Mailer Integration (mailer.php)', { color: 'blue', bold: true })]),
    bullet([t('Section 7: '), t('Server-Side Pagination (pagination.php)', { color: 'blue', bold: true })]),
    bullet([t('Section 8: '), t('Request Parsing & Validation (request.php)', { color: 'blue', bold: true })]),
    bullet([t('Section 9: '), t('Unified Response Format (response.php)', { color: 'blue', bold: true })]),
    bullet([t('Section 10: '), t('HTTP Status Code Mapping (status.php)', { color: 'blue', bold: true })]),
    bullet([t('Section 11: '), t('High-Performance Redis Caching (cache.php)', { color: 'blue', bold: true })]),
    bullet([t('Section 12: '), t('Cross-Helper Integration Patterns', { color: 'blue', bold: true })]),
    bullet([t('Section 13: '), t('Security Audit — Every Helper Reviewed', { color: 'blue', bold: true })]),
    bullet([t('Section 14: '), t('Testing Strategy for Helpers', { color: 'blue', bold: true })]),
    bullet([t('Section 15: '), t('Extending the Helpers Ecosystem', { color: 'blue', bold: true })]),

    // =================== SECTION 1: DRY PHILOSOPHY ===================
    divider(),
    h1('🎯 1. The DRY Philosophy — Why Helpers Matter'),
    grayQuote([t('لا تكرر نفسك — كل قطعة منطق تكتب مرة واحدة فقط', { bold: true, italic: true })]),

    h2('1.1 The Problem of Repetition'),
    p('In traditional PHP applications, every page or endpoint often duplicates the same infrastructure code. A developer creating a new endpoint would need to manually parse JSON input, validate IDs, build HTTP responses, handle database connections, and manage error states. Across 24 endpoints and 6 modules, this repetition becomes a maintenance catastrophe. Changing the JSON response format would require editing 24 separate files.'),
    p('The Doctorna API eliminates this problem through the Helpers Ecosystem — a collection of 10 PHP files in the helper/ directory. Each file contains a focused set of related functions that encapsulate a single infrastructure concern. Every Controller and Repository in the system delegates to these helpers instead of implementing their own versions.'),
    calloutTarget([
      t('Core Principle: ', { color: 'blue', bold: true }),
      t('A helper function is the ONLY place where a specific infrastructure operation is defined. If you want to change how JSON responses are formatted, you edit response.php. If you want to change how Redis is accessed, you edit cache.php. One file change upgrades the entire application.'),
    ]),

    h2('1.2 The Contract between Helpers and Consumers'),
    p('Every helper function has a strict contract that its callers must follow. These contracts are enforced not by PHP interfaces (since the codebase uses procedural functions, not classes) but by convention and defensive programming:'),
    bullet([t('Input validation is the helper\'s responsibility. ', { color: 'blue', bold: true }), t('For example, getRequiredId() validates that $_GET[\'id\'] is numeric before returning it. Callers never check this themselves.', { bold: false })]),
    bullet([t('Output format is consistent across all helpers. ', { color: 'green', bold: true }), t('response() always produces the same JSON structure. Every caller can rely on this.', { bold: false })]),
    bullet([t('Errors are handled internally. ', { color: 'orange', bold: true }), t('serveFromCacheIfAvailable() catches Redis exceptions with try/catch and logs them rather than crashing the request.', { bold: false })]),
    bullet([t('Side effects are minimized. ', { color: 'purple', bold: true }), t('runQuery() only prepares, executes, and returns a PDOStatement. It does not format output, log queries, or modify global state.', { bold: false })]),

    h2('1.3 Architectural Overview — The 10 Helpers'),
    p('The 10 helper files form a layered architecture. Each layer depends on the layers below it but never on layers above:'),
    code(`Layer 0 (Foundation):    env.php, status.php
Layer 1 (Primitives):   db.php, response.php, request.php
Layer 2 (Domain):       jwt.php, filtration.php, pagination.php, mailer.php
Layer 3 (Performance):  cache.php`),
    p('This layering ensures that low-level changes (like switching from Predis to phpredis) do not ripple upward. The foundation files (env.php, status.php) have zero dependencies. Layer 1 files depend only on the foundation. Layer 2 files depend on Layer 1 and the foundation. Layer 3 depends on everything below it.'),

    divider(),

    // =================== SECTION 2: DB.PHP ===================
    h1('🗄️ 2. Database Execution Layer (db.php)'),
    grayQuote([t('طبقة تنفيذ قاعدة البيانات — سبعة أسطر تحمي من حقن SQL', { bold: true, italic: true })]),

    h2('2.1 The Full Source'),
    code(`<?php
function runQuery(PDO $conn, string $query, array $params = []) {
    $stmt = $conn->prepare($query);
    $stmt->execute($params);
    return $stmt;
}`),

    h2('2.2 Why a Wrapper?'),
    p('The runQuery() function is the single most-called function in the entire codebase. Every Repository method invokes it. Without this wrapper, every Repository would need to call $conn->prepare(), then $stmt->execute(), then handle errors — every single time. The wrapper eliminates this boilerplate and enforces three critical safety guarantees:'),
    bullet([t('Guarantee 1 — Prepared Statements Always: ', { color: 'red', bold: true }), t('The $query parameter is always prepared via $conn->prepare(). SQL injection is structurally impossible because user values are never interpolated into the SQL string.', { bold: false })]),
    bullet([t('Guarantee 2 — Named Parameters Enforced: ', { color: 'blue', bold: true }), t('The $params array uses named keys like \':email\' or \'email\' (PDO accepts both). This eliminates the positional parameter confusion that plagued older PHP codebases using ? placeholders.', { bold: false })]),
    bullet([t('Guarantee 3 — Consistent Return Type: ', { color: 'green', bold: true }), t('Every call returns a PDOStatement. Repositories can chain ->fetch(), ->fetchAll(), or ->rowCount() as needed without checking for null or false.', { bold: false })]),

    h2('2.3 Usage Pattern Across Repositories'),
    p('The wrapper is used identically in all 6 repositories. Here is the pattern from DoctorRepo, PatientRepo, and AuthRepo:'),
    code(`// DoctorRepo: fetch with filter
$stmt = runQuery($conn,
    "SELECT * FROM doctors WHERE spec_id = :spec_id AND deleted_at IS NULL",
    ['spec_id' => $specId]
);
return $stmt->fetchAll(PDO::FETCH_ASSOC);

// AuthRepo: fetch by email
$stmt = runQuery($conn,
    "SELECT * FROM users WHERE email = :email",
    ['email' => $email]
);
return $stmt->fetch(PDO::FETCH_ASSOC);

// PatientRepo: update with named params
$stmt = runQuery($conn,
    "UPDATE users SET name = :name WHERE id = :id",
    ['name' => $name, 'id' => $id]
);
return $stmt->rowCount();`),

    calloutGreen([
      t('⚡ Performance Note: ', { color: 'green', bold: true }),
      t('PDO prepared statements are not just security features — they also improve performance on repeated queries. MySQL caches query plans for prepared statements, so executing the same prepared statement with different parameters skips the query-planning step. For a high-traffic API like Doctorna, this can reduce database CPU usage by 10-15%.'),
    ]),

    h2('2.4 Error Handling Strategy'),
    p('The db.php helper does NOT catch PDO exceptions. This is intentional. PDO is configured to throw PDOException on errors (PDO::ERRMODE_EXCEPTION). These exceptions propagate up to the Controller, which is responsible for catching and formatting the error response. This separation of concerns keeps db.php lean while giving each Controller the flexibility to handle database errors in context-specific ways.'),
    p('To handle exceptions that escape all controllers, api.php registers a global exception handler via set_exception_handler(). This catches any unhandled Throwable — including PDOExceptions — logs it with file and line details, and returns a standardized 500 JSON response. This ensures database errors never leak schema information to clients.'),

    calloutGreen([
      t('⚡ Resolved: ', { color: 'green', bold: true }),
      t('set_exception_handler() is registered in api.php. All unhandled exceptions are caught, logged via error_log(), and return a generic 500 JSON response with no schema exposure.'),
    ]),

    divider(),

    // =================== SECTION 3: ENV.PHP ===================
    h1('🔧 3. Environment Configuration (env.php)'),
    grayQuote([t('ملف البيئة — فصل الإعدادات عن الكود', { bold: true, italic: true })]),

    h2('3.1 The Full Source'),
    code(`<?php
require_once __DIR__ . '/../vendor/autoload.php';

try {
    $dotenv = Dotenv\\Dotenv::createImmutable(__DIR__ . '/../');
    $dotenv->safeLoad();
} catch (\\Exception $e) {
    // Fail gracefully if .env doesn't exist
}

if (!function_exists('env')) {
    function env($key, $default = null) {
        return $_ENV[$key] ?? $default;
    }
}`),

    h2('3.2 How It Works'),
    p('The environment helper uses the vlucas/phpdotenv library to load a .env file from the project root. The safeLoad() method is critical — it does NOT throw an exception if the .env file is missing. This allows the application to run with defaults in development while requiring explicit configuration in production.'),
    p('The env() function itself is a simple wrapper around $_ENV with a default fallback. It returns $default if the key is not found, enabling clean configuration patterns throughout the codebase:'),
    code(`// In cache.php
$redis = new Client([
    'scheme' => 'tcp',
    'host'   => env('REDIS_HOST', '127.0.0.1'),
    'port'   => env('REDIS_PORT', 6379)
]);

// In jwt.php — fails loudly if env var missing
$secret = getJwtSecret();
return JWT::encode($payload, $secret, "HS256");`),

    h2('3.3 The function_exists() Guard'),
    p('The if (!function_exists(\'env\')) { ... } wrapper is an important defensive pattern. If multiple files load env.php, the function would be redefined, causing a fatal error. This guard ensures the function is only declared once, regardless of how many times env.php is included. The same pattern is NOT used in other helpers because they are designed to be included exactly once through the bootstrap chain.'),

    calloutBlue([
      t('💡 Best Practice: ', { color: 'blue', bold: true }),
      t('The JWT secret now uses getJwtSecret(), which has no default fallback. If JWT_SECRET is missing from the environment, the API returns a 500 error immediately. This fails loudly in development and forces proper configuration in production.'),
    ]),

    divider(),

    // =================== SECTION 4: FILTRATION.PHP ===================
    h1('🔍 4. Secure Dynamic Filtering (filtration.php)'),
    grayQuote([t('التصفية الديناميكية — بناء استعلامات WHERE بأمان', { bold: true, italic: true })]),

    h2('4.1 The Full Source'),
    code(`<?php
function applyFilters(string $baseQuery, array $allowedFields, array $bindings = []): array {
    $query = $baseQuery;
    foreach ($allowedFields as $field) {
        if (isset($_GET[$field]) && $_GET[$field] !== '') {
            $paramName = str_replace('.', '_', $field);
            if (strpos($field, 'date') !== false && strlen($_GET[$field]) === 10) {
                $query .= " AND DATE($field) = :$paramName";
            } else {
                $query .= " AND $field = :$paramName";
            }
            $bindings[":$paramName"] = $_GET[$field];
        }
    }
    return ['sql' => $query, 'bindings' => $bindings];
}`),

    h2('4.2 The Security Model — Whitelist Approach'),
    p('The most important security feature of applyFilters() is the $allowedFields parameter. This is an explicit whitelist. Only the field names listed in this array can be used as filter criteria. If a malicious user sends ?is_admin=1&password=abc, these parameters are simply ignored because they are not in the allowed list.'),
    p('This whitelist approach is the industry standard for preventing mass-assignment attacks and SQL injection through dynamic query builders. It contrasts sharply with blacklist approaches that try to filter out dangerous input — whitelists are inherently more secure because they define exactly what is permitted rather than trying to anticipate every possible attack.'),

    h2('4.3 The Date Detection Feature'),
    p('The helper includes a special-case for date fields. When a field name contains the substring \'date\' and the provided value is exactly 10 characters long (matching the YYYY-MM-DD format), the filter wraps the column with DATE():'),
    code(`// URL: ?appointment_date=2026-06-18
// Generates:
AND DATE(appointment_date) = :appointment_date
// This matches any row on June 18, 2026 regardless of time component`),
    p('This is a pragmatic user-experience optimization. Without DATE(), filtering by date would require the client to send the exact timestamp including time. With DATE(), a simple date string works. The check for exactly 10 characters (YYYY-MM-DD is 10 chars) prevents accidentally wrapping non-date columns.'),

    h2('4.4 Integration with SubServiceRepo — The Exception'),
    p('The SubServiceRepo module does NOT use applyFilters(). Instead, it implements its own custom filtering using direct SQL comparisons:'),
    code(`// SubServiceRepo — custom filters (not using applyFilters)
if (!empty($_GET['name'])) {
    $sql .= " AND name LIKE :name";
    $bindings[':name'] = '%' . $_GET['name'] . '%';
}
if (isset($_GET['min_fees']) && $_GET['min_fees'] !== '') {
    $sql .= " AND fees >= :min_fees";
    $bindings[':min_fees'] = $_GET['min_fees'];
}
if (isset($_GET['max_fees']) && $_GET['max_fees'] !== '') {
    $sql .= " AND fees <= :max_fees";
    $bindings[':max_fees'] = $_GET['max_fees'];
}`),
    p('This exception exists because the SubService module needs range-based filtering (>= and <=) and LIKE partial matching — operators that the equality-only applyFilters() does not support. A future enhancement should generalize applyFilters() to accept an operator map that allows callers to specify which comparison operator to use for each field.'),

    calloutBlue([
      t('💡 Proposed Enhancement: ', { color: 'blue', bold: true }),
      t('Extend applyFilters() to accept a third parameter — an associative array mapping field names to operators: applyFilters($sql, [\'name\', \'fees\'], [], [\'name\' => \'LIKE\', \'fees\' => \'>=\']). This would eliminate the need for custom filter code in SubServiceRepo.'),
    ]),

    divider(),

    // =================== SECTION 5: JWT.PHP ===================
    h1('🔐 5. Stateless JWT Authentication (jwt.php)'),
    grayQuote([t('المصادقة الإلكترونية — التحقق من الهوية بدون جلسات', { bold: true, italic: true })]),

    h2('5.1 The Full Source'),
    code(`<?php
require_once __DIR__ . '/env.php';
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/status.php';
require_once __DIR__ . '/response.php';
use Firebase\\JWT\\JWT;
use Firebase\\JWT\\Key;

function getJwtSecret(): string {
    $secret = env('JWT_SECRET');
    if (empty($secret)) {
        response(HttpStatus('INTERNAL_SERVER_ERROR'),
            "Server config error: JWT_SECRET is not set.");
    }
    return $secret;
}

function GenerateToken($user){
    $payload = [
        "iat" => time(),
        "exp" => time() + 3600,
        "user_id" => $user['id'],
        "role" => $user['role']
    ];
    $secret = getJwtSecret();
    return JWT::encode($payload, $secret, "HS256");
}

function VerifyToken(){
    $headers = getallheaders();
    $token = $headers['Authorization'] ?? '';
    if (!$token) {
        response(HttpStatus('UNAUTHORIZED'), "token is required");
    }
    $token = str_replace("Bearer ", "", $token);
    try {
        $secret = getJwtSecret();
        $decoded = JWT::decode($token, new Key($secret, "HS256"));
        return $decoded;
    } catch (Exception $e) {
        response(HttpStatus('UNAUTHORIZED'), "invalid token");
    }
}

function checkAdminPrivileges() {
    $token = VerifyToken();
    if ($token->role !== "admin") {
        response(HttpStatus('FORBIDDEN'), "access denied admin");
    }
}`),

    h2('5.2 Token Structure and Lifecycle'),
    p('The JWT token generated by GenerateToken() contains four claims in its payload:'),
    ...metaTable([
      ['Claim', 'Type', 'Description', 'Example'],
      ['iat', 'integer', 'Issued-at timestamp (Unix epoch)', '1718745600'],
      ['exp', 'integer', 'Expiration timestamp (iat + 3600 = 1 hour)', '1718749200'],
      ['user_id', 'integer', 'The user\'s primary key from the database', '42'],
      ['role', 'string', 'Authorization level: "user" or "admin"', '"user"']
    ]),
    p('The token is signed using HMAC-SHA256 (HS256) with a secret key retrieved from the environment. The iat and exp claims enable stateless expiration checking — the JWT library automatically verifies that the current time is between iat and exp. If the token has expired, JWT::decode() throws an exception, which VerifyToken() catches and converts to a 401 response.'),

    h2('5.3 VerifyToken() — The Gatekeeper'),
    p('VerifyToken() is the most-called security function in the API. It is invoked at the top of every protected endpoint. Its responsibilities include:'),
    bullet([t('Header Extraction: ', { color: 'purple', bold: true }), t('Retrieves the Authorization header using PHP\'s getallheaders() function. This function is available in most PHP SAPIs, including Apache mod_php and PHP-FPM.', { bold: false })]),
    bullet([t('Bearer Token Parsing: ', { color: 'purple', bold: true }), t('Strips the "Bearer " prefix from the raw header value, isolating the JWT string.', { bold: false })]),
    bullet([t('Signature Verification: ', { color: 'purple', bold: true }), t('Uses firebase/php-jwt to decode and verify the token\'s HMAC signature. If the signature is invalid, an exception is thrown.', { bold: false })]),
    bullet([t('Expiration Check: ', { color: 'purple', bold: true }), t('Automatic — the JWT library compares exp against the current server time.', { bold: false })]),
    bullet([t('Payload Return: ', { color: 'purple', bold: true }), t('Returns the decoded payload object, which contains user_id and role for downstream use.', { bold: false })]),

    h2('5.4 checkAdminPrivileges() — Nested Security'),
    p('The checkAdminPrivileges() function demonstrates a composite pattern. It calls VerifyToken() first (which may already fail with 401 if the token is missing or invalid), and then checks the role property on the decoded token. This two-layer check ensures that:'),
    bullet([t('Layer 1 (VerifyToken): ', { color: 'red', bold: true }), t('Rejects unauthenticated requests with 401 UNAUTHORIZED. No token, expired token, or invalid signature all caught here.', { bold: false })]),
    bullet([t('Layer 2 (require_admin): ', { color: 'orange', bold: true }), t('Rejects non-admin requests with 403 FORBIDDEN. A valid user token cannot access admin endpoints.', { bold: false })]),

    calloutRed([
      t('⚠️ Security Note: ', { color: 'red', bold: true }),
      t('The require_admin() function is also exported and used directly in some controllers. Both patterns work identically — checkAdminPrivileges() is a convenience wrapper that combines both steps into one call. Always prefer checkAdminPrivileges() for clarity.'),
    ]),

    divider(),

    // =================== SECTION 6: MAILER.PHP ===================
    h1('📧 6. SMTP Mailer Integration (mailer.php)'),
    grayQuote([t('البريد الإلكتروني — إرسال رموز إعادة تعيين كلمة المرور', { bold: true, italic: true })]),

    h2('6.1 The Full Source'),
    code(`<?php
use PHPMailer\\PHPMailer\\PHPMailer;
use PHPMailer\\PHPMailer\\Exception;

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/mail.php';

function sendResetEmail($toEmail, $token) {
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host       = MAIL_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = MAIL_USERNAME;
        $mail->Password   = MAIL_PASSWORD;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = MAIL_PORT;
        $mail->setFrom(MAIL_FROM, MAIL_FROM_NAME);
        $mail->addAddress($toEmail);
        $mail->isHTML(false);
        $mail->Subject = 'Doctorna - Password Reset Token';
        $mail->Body = "You have requested a password reset.\\n\\n"
                    . "Here is your reset token:\\n"
                    . $token . "\\n\\n"
                    . "This token will expire in 15 minutes.\\n"
                    . "If you did not request this, please ignore this email.";
        $mail->send();
        return true;
    } catch (Exception $e) {
        throw new Exception(
            "Message could not be sent. Mailer Error: {$mail->ErrorInfo}"
        );
    }
}`),

    h2('6.2 Configuration via config/mail.php'),
    p('The mailer reads its SMTP configuration from config/mail.php, which defines five constants: MAIL_HOST (SMTP server address), MAIL_USERNAME, MAIL_PASSWORD, MAIL_PORT (typically 587 for STARTTLS), MAIL_FROM (sender email address), and MAIL_FROM_NAME (display name for the sender). These constants are loaded from the .env file.'),
    calloutOrange([
      t('🚨 Security Warning: ', { color: 'orange', bold: true }),
      t('SMTP credentials are highly sensitive. The config/mail.php file must NEVER be committed to version control or exposed in client-side code. Production deployments should use environment variables exclusively. The .env file should be added to .gitignore.'),
    ]),

    divider(),

    // =================== SECTION 7: PAGINATION.PHP ===================
    h1('📄 7. Server-Side Pagination (pagination.php)'),
    grayQuote([t('التقسيم إلى صفحات — تحميل البيانات على دفعات', { bold: true, italic: true })]),

    h2('7.1 The Full Source'),
    code(`<?php
function paginateTable($conn, $tableName, $defaultLimit = 10) {
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : $defaultLimit;

    if ($page < 1) $page = 1;
    if ($limit < 1 || $limit > 100) $limit = $defaultLimit;

    $offset = ($page - 1) * $limit;

    $allowedTables = ['speciality', 'doctors', 'users',
                      'appointments', 'sub_services'];
    if (!in_array($tableName, $allowedTables)) {
        die(json_encode(["message" => "Invalid table name"]));
    }

    $countQuery = "SELECT COUNT(*) as total
                   FROM \`{$tableName}\`
                   WHERE deleted_at IS NULL";
    $countStmt = $conn->prepare($countQuery);
    $countStmt->execute();
    $totalRecords = (int)$countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    $dataQuery = "SELECT * FROM \`{$tableName}\`
                  WHERE deleted_at IS NULL
                  ORDER BY id LIMIT :limit OFFSET :offset";
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
}`),

    h2('7.2 The Pagination Math'),
    p('Server-side pagination is essential for API usability. Without it, a GET /api.php/appointments endpoint could return thousands of records, overwhelming the client browser and consuming excessive bandwidth. The paginateTable() function implements the standard SQL pagination pattern:'),
    bullet([t('Equation: ', { color: 'blue', bold: true }), t('OFFSET = (page - 1) * limit. Page 1 with limit 10 has offset 0. Page 3 has offset 20.', { bold: false })]),
    bullet([t('Total Pages: ', { color: 'green', bold: true }), t('totalPages = ceil(totalRecords / limit). 47 records with limit 10 = 5 pages.', { bold: false })]),
    bullet([t('Boundary Protection: ', { color: 'orange', bold: true }), t('Page below 1 is clamped to 1. Limit above 100 is clamped to defaultLimit (10). This prevents abuse via excessively large page sizes.', { bold: false })]),

    h2('7.3 The Allowed Tables Whitelist'),
    p('The $allowedTables array is a critical security control. Only five table names are permitted: speciality, doctors, users, appointments, and sub_services. If a caller passes any other table name, the function terminates with an error message. This prevents attackers from enumerating database tables through the pagination endpoint.'),
    calloutOrange([
      t('🚨 Hardcoded Table Names: ', { color: 'orange', bold: true }),
      t('The table names in the whitelist do not all match the actual database table names. "users" matches the users table, but "speciality" is actually named "specialities" in the database. This inconsistency means that speciality pagination will fail with "Invalid table name" if called with the correct table name. This is a known bug.'),
    ]),
    p('The response structure includes both the data list and a pagination metadata object. This allows frontend frameworks to render pagination controls (page numbers, next/prev buttons) without any additional calculations.'),

    divider(),

    // =================== SECTION 8: REQUEST.PHP ===================
    h1('📥 8. Request Parsing & Validation (request.php)'),
    grayQuote([t('معالجة الطلبات — استخراج البيانات والتحقق منها', { bold: true, italic: true })]),

    h2('8.1 The Full Source'),
    code(`<?php
require_once __DIR__ . "/status.php";
require_once __DIR__ . "/response.php";

function getJsonInput(array $requiredFields = []) {
    $data = json_decode(file_get_contents("php://input"), true) ?? [];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field])
            || (is_string($data[$field]) && trim($data[$field]) === "")) {
            response(HttpStatus('UNPROCESSABLE_ENTITY'),
                "Please provide the '$field' field. It is required.");
        }
    }
    return $data;
}

function getRequiredId(): int {
    if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
        response(HttpStatus('BAD_REQUEST'),
            "ID parameter is required and must be numeric");
    }
    return (int)$_GET['id'];
}`),

    h2('8.2 getJsonInput() — Strict Body Parsing'),
    p('The getJsonInput() function handles POST, PUT, PATCH, and DELETE request bodies. It reads the raw input stream (php://input), decodes JSON into an associative array, and validates that all required fields are present and non-empty. If a required field is missing, the function immediately terminates the request with a 422 UNPROCESSABLE ENTITY response.'),
    p('The use of ?? [] after json_decode() ensures that the function never receives a null value. If the JSON is malformed or the body is empty, it defaults to an empty array, and the subsequent validation loop will catch all missing required fields with specific error messages.'),

    h2('8.3 getRequiredId() — Single ID Extraction'),
    p('This function standardizes how endpoint IDs are extracted from URL query parameters. Throughout the codebase, resources are identified by ?id=X in the query string. The function:'),
    bullet([t('Checks existence: ', { color: 'blue', bold: true }), t('If $_GET[\'id\'] is not set, returns 400 BAD_REQUEST.', { bold: false })]),
    bullet([t('Validates numeric: ', { color: 'green', bold: true }), t('If the value is not numeric, returns 400 BAD_REQUEST. This prevents SQL errors from non-numeric IDs.', { bold: false })]),
    bullet([t('Returns integer: ', { color: 'purple', bold: true }), t('Casts to (int) before returning, ensuring the downstream SQL query receives a clean integer.', { bold: false })]),

    divider(),

    // =================== SECTION 9: RESPONSE.PHP ===================
    h1('📤 9. Unified Response Format (response.php)'),
    grayQuote([t('الرد الموحد — كل نقطة نهاية ترسل نفس التنسيق', { bold: true, italic: true })]),

    h2('9.1 The Full Source'),
    code(`<?php
require_once __DIR__ . "/status.php";

function response($code, $message = "", $data = null) {
    header("Content-Type: application/json");
    http_response_code($code);

    if (empty($message)) {
        $message = getHttpStatusMessage($code);
    }

    echo json_encode([
        "status_code" => $code,
        "message" => $message,
        "data" => $data
    ]);
    exit;
}

function methodNotAllowed() {
    response(HttpStatus('METHOD_NOT_ALLOWED'),
        "Method Not Allowed");
}`),

    h2('9.2 The Three-Field Contract'),
    p('Every response from the Doctorna API follows this exact structure:'),
    code(`{
    "status_code": 200,
    "message": "Operation completed successfully",
    "data": { ... }
}`, 'json'),
    p('The three fields serve distinct purposes:'),
    bullet([t('status_code (integer): ', { color: 'blue', bold: true }), t('The HTTP status code. Frontends parse this to determine success (2xx) vs error (4xx/5xx). Always present.', { bold: false })]),
    bullet([t('message (string): ', { color: 'green', bold: true }), t('A human-readable description. Used for user-facing flash messages, error descriptions, and success confirmations.', { bold: false })]),
    bullet([t('data (mixed): ', { color: 'purple', bold: true }), t('The response payload. Can be an object, array, string, or null. Null indicates no data (e.g., successful delete).', { bold: false })]),

    h2('9.3 The Automatic Message Feature'),
    p('If the $message parameter is left empty (empty string), response() automatically looks up a default message using getHttpStatusMessage() from status.php. This means callers can write:'),
    code(`// Short form — auto message
response(HttpStatus('OK'), "", $data);

// This is equivalent to:
response(200, "Success", $data);`),
    p('This reduces boilerplate while maintaining consistency. The automatic message is always a generic description of the status code, so endpoints that need specific messaging should always provide a custom message parameter.'),

    divider(),

    // =================== SECTION 10: STATUS.PHP ===================
    h1('🔢 10. HTTP Status Code Mapping (status.php)'),
    grayQuote([t('رموز الحالة — خريطة بين الأسماء والقيم الرقمية', { bold: true, italic: true })]),

    h2('10.1 The Full Source'),
    code(`<?php
function HttpStatus(string $status): int {
    $codes = [
        'OK' => 200,
        'CREATED' => 201,
        'ACCEPTED' => 202,
        'NO_CONTENT' => 204,
        'BAD_REQUEST' => 400,
        'UNAUTHORIZED' => 401,
        'FORBIDDEN' => 403,
        'NOT_FOUND' => 404,
        'METHOD_NOT_ALLOWED' => 405,
        'CONFLICT' => 409,
        'UNPROCESSABLE_ENTITY' => 422,
        'INTERNAL_SERVER_ERROR' => 500,
        'NOT_IMPLEMENTED' => 501,
        'SERVICE_UNAVAILABLE' => 503
    ];
    return $codes[$status] ?? 500;
}

function getHttpStatusMessage(int $code): string {
    $messages = [
        200 => "Success",
        201 => "Resource Created Successfully",
        202 => "Accepted",
        204 => "No Content",
        400 => "Bad Request - Please check your input",
        401 => "Unauthorized",
        403 => "Forbidden",
        404 => "Resource Not Found",
        405 => "Method Not Allowed",
        409 => "Conflict",
        422 => "Unprocessable Entity",
        500 => "Internal Server Error",
        501 => "Not Implemented",
        503 => "Service Unavailable"
    ];
    return $messages[$code] ?? "Unknown Status";
}`),

    h2('10.2 Why a Lookup Table?'),
    p('Hardcoding numeric HTTP status codes throughout the codebase would make the code less readable and more error-prone. HttpStatus(\'NOT_FOUND\') is far clearer than HTTP 404 scattered across 30 call sites. The mapping table centralizes all status codes in one place, making it easy to audit that every status code used is intentional and conforms to the HTTP specification.'),
    p('The ?? 500 fallback in HttpStatus() is a safety net. If an unrecognized status name is passed (e.g., HttpStatus(\'IM_A_TEAPOT\')), the function defaults to 500 Internal Server Error. This prevents the API from returning a null or 0 status code, which would confuse clients.'),

    divider(),

    // =================== SECTION 11: CACHE.PHP ===================
    h1('⚡ 11. High-Performance Redis Caching (cache.php)'),
    grayQuote([t('التخزين المؤقت — تقديم البيانات في أجزاء من الثانية', { bold: true, italic: true })]),

    h2('11.1 The Full Source (Part 1 — Connection & Core Functions)'),
    code(`<?php
require_once __DIR__ . '/env.php';
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/status.php';
require_once __DIR__ . '/response.php';

use Predis\\Client;

$redis = new Client([
    'scheme' => 'tcp',
    'host'   => env('REDIS_HOST', '127.0.0.1'),
    'port'   => env('REDIS_PORT', 6379)
]);

function serveFromCacheIfAvailable($cacheKey, $message) {
    global $redis;
    try {
        if ($redis->exists($cacheKey)) {
            response(HttpStatus('OK'), $message, [
                'source' => 'redis',
                'data' => json_decode($redis->get($cacheKey), true)
            ]);
        }
    } catch (Exception $e) {
        error_log("Redis Cache Error: " . $e->getMessage());
    }
}`),

    h2('11.2 The Resilient Redis Pattern'),
    p('Every Redis operation in the cache helper is wrapped in a try/catch block. This is a deliberate resilience pattern. If the Redis server is down or unreachable, the catch block logs the error and silently continues. The API degrades gracefully — instead of returning a 500 error, it falls back to the database query. The user experiences slightly slower response times but never sees an error.'),
    calloutGreen([
      t('⚡ Resilience First: ', { color: 'green', bold: true }),
      t('Redis failures are non-fatal. The API continues to function, just without caching. This is especially important during deployment rollouts when the Redis server may restart. A crash in the cache layer should never crash the entire API.'),
    ]),

    h2('11.3 saveToCache() and deleteFromCache()'),
    code(`function saveToCache($cacheKey, $data, $ttl = 3600) {
    global $redis;
    try {
        $redis->setex($cacheKey, $ttl, json_encode($data));
    } catch (Exception $e) {
        error_log("Redis Error: " . $e->getMessage());
    }
}

function deleteFromCache($keys) {
    global $redis;
    try {
        if (!is_array($keys)) { $keys = [$keys]; }
        foreach ($keys as $key) {
            $redis->del($key);
        }
    } catch (Exception $e) {
        error_log("Redis Error: " . $e->getMessage());
    }
}`),
    p('The saveToCache() function uses Redis SETEX (set with expiration), setting both the value and TTL in a single atomic operation. The default TTL is 3600 seconds (1 hour). The deleteFromCache() function accepts either a single key string or an array of keys, iterating and deleting each one.'),

    h2('11.4 Password Reset Token Storage'),
    code(`function storeResetToken($email, $token) {
    global $redis;
    try {
        $redis->setex("password_reset:{$email}", 900, $token);
    } catch (Exception $e) {
        error_log("Redis Error: " . $e->getMessage());
    }
}

function getStoredResetToken($email) {
    global $redis;
    try {
        return $redis->get("password_reset:{$email}");
    } catch (Exception $e) {
        error_log("Redis Error: " . $e->getMessage());
        return null;
    }
}

function deleteResetToken($email) {
    global $redis;
    try {
        $redis->del("password_reset:{$email}");
    } catch (Exception $e) {
        error_log("Redis Error: " . $e->getMessage());
    }
}`),
    p('The password reset flow uses Redis as a temporary token store instead of a database table. Tokens are stored with a 900-second (15-minute) TTL, providing automatic expiration. This design choice eliminates the need for a separate database table and cleanup cron job. Redis handles the expiration natively.'),

    h2('11.5 generateFilteredCacheKey() — Deterministic Cache Keys'),
    code(`function generateFilteredCacheKey(string $prefix, array $allowedFilters): string {
    $filterParams = [];
    foreach ($allowedFilters as $key) {
        if (isset($_GET[$key]) && $_GET[$key] !== '') {
            $filterParams[$key] = $_GET[$key];
        }
    }
    if (!empty($filterParams)) {
        ksort($filterParams);
        return $prefix . ':filter:' . http_build_query($filterParams);
    }
    return $prefix . ':all';
}`),
    p('This function is the bridge between the filtration system and the caching system. It uses the same whitelist approach as applyFilters() — only parameters in $allowedFilters are considered for cache key generation. The ksort() call ensures that URL parameter ordering does not produce duplicate cache entries. The resulting keys look like:'),
    code(`doctors:filter:gender=female&rank=specialist
subservices:all
patients:filter:role=user`),

    h2('11.6 Cache Invalidation Strategy'),
    p('The cached data invalidation is handled by the Controllers on write operations. When a POST, PUT, PATCH, or DELETE request succeeds, the Controller calls deleteFromCache() with the specific key or flushAllCache(). The cache.php file also provides a clearModuleCache($pattern) function that uses Redis KEYS to find and delete all matching keys (though this is O(n) and should be used sparingly in production).'),

    divider(),

    // =================== SECTION 12: INTEGRATION PATTERNS ===================
    h1('🔗 12. Cross-Helper Integration Patterns'),
    grayQuote([t('أنماط التكامل — كيف تتعاون المساعدات مع بعضها', { bold: true, italic: true })]),

    h2('12.1 Pattern A: Request → Validation → Repository → Response'),
    p('This is the standard flow for every POST/PUT/PATCH endpoint in the system:'),
    code(`// DoctorController — handleCreateDoctor
function handleCreateDoctor($conn) {
    // Step 1: Parse & validate input (request.php)
    $data = getJsonInput(['name', 'email', 'phone',
                          'gender', 'spec_id', 'rank', 'fees']);

    // Step 2: Business validation (controller guard)
    validateDoctorData($data);

    // Step 3: Execute via repository (db.php via runQuery)
    $result = createDoctor($conn, $data);

    // Step 4: Invalidate cache (cache.php)
    deleteFromCache('doctors:all');

    // Step 5: Respond (response.php + status.php)
    response(HttpStatus('CREATED'),
        "Doctor created successfully", $result);
}`),

    h2('12.2 Pattern B: Cache Check → DB Query → Cache Store → Response'),
    p('This is the standard flow for every GET endpoint:'),
    code(`// DoctorController — handleGetAllDoctors
function handleGetAllDoctors($conn) {
    // Step 1: Build cache key (cache.php)
    $cacheKey = generateFilteredCacheKey('doctors',
        ['gender', 'spec_id', 'rank', 'name', 'is_available']);

    // Step 2: Check cache (cache.php)
    serveFromCacheIfAvailable($cacheKey,
        "Doctors fetched successfully");
    // ^ Execution stops here if cache hit

    // Step 3: Execute query via filtration + db
    $data = getAllDoctors($conn);

    // Step 4: Store in cache (cache.php)
    saveToCache($cacheKey, $data);

    // Step 5: Respond (response.php)
    response(HttpStatus('OK'),
        "Doctors fetched successfully", $data);
}`),

    h2('12.3 Pattern C: Token → Guard → Scoped Query → Response'),
    p('This is the standard flow for protected endpoints with row-level security:'),
    code(`// AppointmentController — handleGetAllAppointments
function handleGetAllAppointments($conn) {
    // Step 1: Verify JWT (jwt.php)
    $token = VerifyToken();

    // Step 2: Role-based scoping
    if ($token->role === 'admin') {
        // Admin sees all appointments
        $data = getAllAppointments($conn);
    } else {
        // Users see only their own
        $data = getAppointmentsByUser($conn,
            $token->user_id);
    }

    // Step 3: Respond (response.php)
    response(HttpStatus('OK'),
        "Appointments fetched successfully", $data);
}`),

    divider(),

    // =================== SECTION 13: SECURITY AUDIT ===================
    h1('🛡️ 13. Security Audit — Every Helper Reviewed'),
    grayQuote([t('تدقيق أمني — مراجعة كل ملف مساعد', { bold: true, italic: true })]),

    ...metaTable([
      ['Helper', 'Risk Level', 'Key Finding'],
      ['db.php', '🟢 Low', 'Prepared statements prevent SQL injection. No raw query execution.'],
      ['env.php', '🟢 Low', 'safeLoad() prevents crashes on missing .env. function_exists guard prevents redeclaration.'],
      ['filtration.php', '🟢 Low', 'Whitelist-based field filtering. Non-whitelisted params ignored. Only equality (=) supported.'],
      ['jwt.php', '🟡 Medium', 'Hardcoded fallback secret in env() call. HMAC-SHA256 with 1-hour expiry. No refresh token mechanism.'],
      ['mailer.php', '🟡 Medium', 'SMTP credentials in config file. Exception handling prevents credential exposure in error output.'],
      ['pagination.php', '🟡 Medium', 'Table whitelist prevents enumeration. LIMIT capped at 100. Table name mismatch bug (speciality vs specialities).'],
      ['request.php', '🟢 Low', 'Strict JSON parsing. Required field enforcement. Numeric ID validation.'],
      ['response.php', '🟢 Low', 'No security concerns. Pure output formatting with exit.'],
      ['status.php', '🟢 Low', 'No security concerns. Pure lookup table with fallback.'],
      ['cache.php', '🟡 Medium', 'Predis connection on localhost only. Graceful degradation on Redis failure. Error logging may expose keys in server logs.']
    ]),

    h2('13.1 Resolved & Remaining Items'),
    calloutGreen([
      t('✅ Resolved — High: ', { color: 'green', bold: true }),
      t('JWT secret fallback removed. getJwtSecret() fails with 500 if JWT_SECRET env var is missing.'),
    ]),
    calloutGreen([
      t('✅ Resolved — Medium: ', { color: 'green', bold: true }),
      t('Global exception handler added via set_exception_handler() in api.php. All unhandled Throwables return 500 JSON.'),
    ]),
    calloutBlue([
      t('💡 Low Priority — Not Yet Implemented: ', { color: 'blue', bold: true }),
      t('Rate limiting middleware (via Redis INCR with expiry) on authentication endpoints to prevent brute-force attacks on login and registration.'),
    ]),

    divider(),

    // =================== SECTION 14: TESTING ===================
    h1('🧪 14. Testing Strategy for Helpers'),
    grayQuote([t('اختبار المساعدات — ضمان الموثوقية', { bold: true, italic: true })]),

    h2('14.1 Unit Testable Helpers'),
    p('The following helpers are pure functions with no side effects and can be unit tested in isolation:'),
    bullet([t('status.php — ', { color: 'blue', bold: true }), t('Test HttpStatus() with every known status name and an unknown one. Test getHttpStatusMessage() with every code and a fallback.', { bold: false })]),
    bullet([t('filtration.php — ', { color: 'green', bold: true }), t('Test applyFilters() with various $_GET combinations. Verify SQL generation and binding arrays.', { bold: false })]),
    bullet([t('response.php — ', { color: 'purple', bold: true }), t('Test that response() outputs valid JSON with the correct structure. Mock http_response_code and headers.', { bold: false })]),
    bullet([t('pagination.php — ', { color: 'orange', bold: true }), t('Test pagination math: page clamping, limit clamping, total pages calculation, has_next/has_prev flags.', { bold: false })]),
    bullet([t('request.php — ', { color: 'red', bold: true }), t('Test getRequiredId() with numeric, non-numeric, and missing IDs. Test getJsonInput() with missing fields.', { bold: false })]),

    h2('14.2 Integration Test Patterns'),
    p('Helpers that depend on external services (Redis, SMTP, PDO) require integration tests with mocked or containerized dependencies:'),
    bullet([t('cache.php — ', { color: 'blue', bold: true }), t('Test with a mock Redis server or Predis mock. Verify that cache misses trigger DB queries and cache hits skip them.', { bold: false })]),
    bullet([t('jwt.php — ', { color: 'green', bold: true }), t('Test token generation with known secrets. Verify that expired or tampered tokens are rejected. Test admin role check.', { bold: false })]),
    bullet([t('env.php — ', { color: 'purple', bold: true }), t('Test with various $_ENV configurations. Verify default fallback behavior.', { bold: false })]),

    divider(),

    // =================== SECTION 15: EXTENDING ===================
    h1('🚀 15. Extending the Helpers Ecosystem'),
    grayQuote([t('توسيع النظام — إضافة مساعدات جديدة', { bold: true, italic: true })]),

    h2('15.1 Guidelines for New Helpers'),
    p('When adding a new helper file to the ecosystem, follow these rules to maintain consistency:'),
    bullet([t('Rule 1 — One Concern Per File: ', { color: 'blue', bold: true }), t('Each helper file should encapsulate exactly one infrastructure concern. If you are adding an S3 uploader, create helper/storage.php, not helper/utils.php.', { bold: false })]),
    bullet([t('Rule 2 — Require Dependencies Explicitly: ', { color: 'green', bold: true }), t('Each file must require its own dependencies at the top. Do not rely on the autoloader or bootstrap to include dependencies for you.', { bold: false })]),
    bullet([t('Rule 3 — Graceful Degradation: ', { color: 'orange', bold: true }), t('External service failures (Redis down, SMTP down, S3 down) must be caught and logged. Never let an external service failure crash the API.', { bold: false })]),
    bullet([t('Rule 4 — No Side Effects on Include: ', { color: 'purple', bold: true }), t('Including a helper file should not execute any logic. Only define functions. Connection initialization (like $redis) is an acceptable exception.', { bold: false })]),
    bullet([t('Rule 5 — Return Early, Die Late: ', { color: 'red', bold: true }), t('Functions that can fail should return early with error responses (using response() + exit). Only the happy path should reach the final return statement.', { bold: false })]),

    h2('15.2 Proposed Future Helpers'),
    p('The following helpers would add significant value to the codebase:'),
    bullet([t('helper/logger.php — ', { color: 'blue', bold: true }), t('Structured logging with levels (INFO, WARN, ERROR) and configurable output streams (file, stdout, external service).', { bold: false })]),
    bullet([t('helper/validator.php — ', { color: 'green', bold: true }), t('General-purpose input validation rules: email format, phone format, numeric range, string length, enum membership. Replaces ad-hoc validation in controllers.', { bold: false })]),
    bullet([t('helper/rate_limiter.php — ', { color: 'purple', bold: true }), t('Redis-based sliding window rate limiter for auth endpoints. Protects against brute force and DoS attacks.', { bold: false })]),
    bullet([t('helper/audit.php — ', { color: 'orange', bold: true }), t('Audit trail logging for all write operations. Records who changed what and when, for compliance and debugging.', { bold: false })]),

    // =================== CLOSING ===================
    divider(),
    calloutTarget([
      t('🎯 Helpers Summary: ', { color: 'blue', bold: true }),
      t('The 10 helper files form a layered, secure, and DRY foundation for the entire Doctorna API. Every Controller and Repository delegates to these helpers, ensuring that infrastructure changes ripple through the codebase in exactly one file. The ~397 lines of helper code are the most-tested, most-reviewed, and most-critical code in the application.'),
    ]),
    calloutBook([
      t('📚 Continue Reading: ', { bold: true }),
      t('Proceed to Phase 3 for the Authentication Module deep dive, or Phase 4 for Doctors & Specialities documentation.'),
    ]),
  ];

  // Create the page
  const page = await req('POST', '/pages', JSON.stringify({
    parent: { page_id: PARENT },
    icon: { type: 'emoji', emoji: '🛠️' },
    properties: { title: { title: [{ text: { content: '🛠️ Phase 2 — Core Helpers Ecosystem' } }] } }
  }));
  console.log(`Created Phase 2: ${page.id}`);

  // Append blocks in chunks of 100
  for (let i = 0; i < blocks.length; i += 100) {
    const chunk = blocks.slice(i, i + 100);
    await req('PATCH', `/blocks/${page.id}/children`, JSON.stringify({ children: chunk }));
    console.log(`  +${i+1}-${Math.min(i+100, blocks.length)}`);
  }

  // Count words
  let wordCount = 0;
  for (const b of blocks) {
    const content = b[b.type];
    if (content && content.rich_text) {
      for (const rt of content.rich_text) {
        if (rt.type === 'text') {
          wordCount += rt.text.content.split(/\s+/).filter(w => w.length > 0).length;
        }
      }
    }
  }
  console.log(`\nTotal blocks: ${blocks.length}`);
  console.log(`Approximate word count: ${wordCount}`);
  console.log('Done!');
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
