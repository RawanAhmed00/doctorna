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
  const existing = await req('GET', `/blocks/${PARENT}/children?page_size=50`);
  for (const b of existing.results) {
    if (b.type === 'child_page' && b.child_page.title.includes('Phase 2') && b.child_page.title.includes('مصري')) {
      await req('PATCH', `/pages/${b.id}`, JSON.stringify({ archived: true }));
      console.log(`Archived old: ${b.child_page.title}`);
    }
  }

  const blocks = [
    ...metaTable([
      ['الخاصية', 'القيمة'],
      ['المؤلف', 'Architecture Team'],
      ['الحالة', '🟢 Unified & Active'],
      ['الإصدار', 'v2.0 — Centralized Helper Ecosystem'],
      ['الوحدة', 'Core Helpers Layer'],
      ['الوسوم', 'Helpers, DRY, Reusability, Validation, Caching, Security'],
      ['عدد الملفات', '10 helpers — ~397 lines PHP'],
      ['النمط', 'Procedural Function Library'],
      ['الاعتماديات', 'Predis, PHPMailer, firebase/php-jwt, vlucas/phpdotenv']
    ]),

    divider(),
    h1('📑 جدول المحتويات'),
    toggle([t('اضغط عشان توسع')]),
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
    bullet([t('Section 13: '), t('Security Audit & Resolved Items', { color: 'blue', bold: true })]),
    bullet([t('Section 14: '), t('Testing Strategy for Helpers', { color: 'blue', bold: true })]),
    bullet([t('Section 15: '), t('Extending the Helpers Ecosystem', { color: 'blue', bold: true })]),

    divider(),
    h1('🎯 Section 1: The DRY Philosophy — Why Helpers Matter'),
    grayQuote([t('لا تكرر نفسك — كل قطعة منطق تكتب مرة واحدة', { bold: true, italic: true })]),

    h2('1.1 The Problem of Repetition'),
    p('في تطبيقات PHP التقليدية، كل صفحة أو endpoint بتكرر نفس كود البنية التحتية. المطور لما يعمل endpoint جديد، لازم يدويًا ي parse JSON، يتأكد من IDs، يبني HTTP responses، يدير اتصال الداتابيز، ويتعامل مع ال errors. عبر ٢٤ endpoint و ٦ وحدات، التكرار ده بتحول لكارثة صيانة. تغيير صيغة JSON response هيحتاج تعديل ٢٤ ملف.'),
    p('Doctorna API بتحل المشكلة دي عن طريق Helpers Ecosystem — مجموعة ١٠ ملفات PHP في مجلد helper/. كل ملف بيحتوي على مجموعة دوال مركزة بتغلف concern واحد من concerns البنية التحتية. كل Controller و Repository في النظام بيديله هذه ال helpers بدل ما ينفذ نسخته الخاصة.'),

    calloutTarget([
      t('Core Principle: ', { color: 'blue', bold: true }),
      t('الـ helper function هو المكان الوحيد اللي فيه عملية بنية تحتية محددة. عايز تغير طريقة تنسيق JSON؟ عدّل response.php. عايز تغير طريقة الوصول لـ Redis؟ عدّل cache.php. تغيير file واحد يرقّي التطبيق كله.'),
    ]),

    h2('1.2 The Contract between Helpers and Consumers'),
    p('كل helper function عنده contract محدد مع اللي بيستدعيه. الـ contracts دي مش مفروضة بـ PHP interfaces (لأن الكود procedural مش class-based)، لكن بالاتفاق و defensive programming:'),
    bullet([t('Input validation مسؤولية الـ helper. ', { color: 'blue', bold: true }), t('getRequiredId() بتتأكد من إن $_GET[\'id\'] numeric قبل ما ترده.', { bold: false })]),
    bullet([t('Output format ثابت عبر كل ال helpers. ', { color: 'green', bold: true }), t('response() دايمًا بتنتج نفس هيكل JSON.', { bold: false })]),
    bullet([t('Errors بتت dealt معاها جوه الـ helper. ', { color: 'orange', bold: true }), t('serveFromCacheIfAvailable() بت catch Redis exceptions وتعمل log بدل ما تكسر الطلب.', { bold: false })]),
    bullet([t('Side effects مقللين. ', { color: 'purple', bold: true }), t('runQuery() بس بت prepare, execute, وترجع PDOStatement. مبتنسقش output ولا تعدل global state.', { bold: false })]),

    h2('1.3 Architectural Layers'),
    p('الـ 10 helpers بيكوّنوا layered architecture. كل طبقة بتعتمد على اللي تحتها بس:'),
    code(`Layer 0 (Foundation):    env.php, status.php
Layer 1 (Primitives):   db.php, response.php, request.php
Layer 2 (Domain):       jwt.php, filtration.php, pagination.php, mailer.php
Layer 3 (Performance):  cache.php`),

    divider(),

    h1('🗄️ Section 2: Database Execution Layer (db.php)'),
    grayQuote([t('سبعة أسطر تحمي من SQL Injection', { bold: true, italic: true })]),

    code(`<?php
function runQuery(PDO $conn, string $query, array $params = []) {
    $stmt = $conn->prepare($query);
    $stmt->execute($params);
    return $stmt;
}`),

    p('دى أشهر دالة في codebase — كل Repository method بيستدعيها. بدونها، كل Repository كان محتاج يعمل prepare/execute/handle errors كل مرة. الـ wrapper بيقدم ٣ ضمانات أمان:'),
    bullet([t('Guarantee 1 — Prepared Statements Always: ', { color: 'red', bold: true }), t('SQL injection مستحيل هيكليًا لأن القيم مبتتحرفش في الـ SQL string.', { bold: false })]),
    bullet([t('Guarantee 2 — Named Parameters: ', { color: 'blue', bold: true }), t('الـ params array بتستخدم keys زي :email بدل ? placeholders.', { bold: false })]),
    bullet([t('Guarantee 3 — Consistent Return: ', { color: 'green', bold: true }), t('دايمًا بترجع PDOStatement. الـ Repository يختار fetch()/fetchAll()/rowCount().', { bold: false })]),

    calloutGreen([
      t('Performance: ', { color: 'green', bold: true }),
      t('PDO prepared statements مش بس أمان — كمان بيحسنوا الأداء. MySQL بي cache خطط الاستعلام للـ prepared statements. تكرار نفس الاستعلام ببرامترات مختلفة بي skip مرحلة الـ query planning.'),
    ]),

    divider(),

    h1('🔧 Section 3: Environment Configuration (env.php)'),
    grayQuote([t('فصل الإعدادات عن الكود', { bold: true, italic: true })]),

    code(`<?php
require_once __DIR__ . '/../vendor/autoload.php';
try {
    $dotenv = Dotenv\\Dotenv::createImmutable(__DIR__ . '/../');
    $dotenv->safeLoad();
} catch (\\Exception $e) { }
if (!function_exists('env')) {
    function env($key, $default = null) {
        return $_ENV[$key] ?? $default;
    }
}`),

    p('بيستخدم vlucas/phpdotenv عشان يحمل .env. الـ safeLoad() مش بي throw exception لو الـ .env مش موجود — التطبيق يقدر يشتغل بالـ defaults في development. env() بتيجي بقيمة من $_ENV أو $default:'),
    code(`$redis = new Client([
    'host' => env('REDIS_HOST', '127.0.0.1'),
    'port' => env('REDIS_PORT', 6379)
]);
$secret = getJwtSecret();  // بيفشل بصوت عالي لو JWT_SECRET مش موجود`),

    calloutBlue([
      t('function_exists() Guard: ', { color: 'blue', bold: true }),
      t('الـ wrapper بيضمن إن env() ماتتعرفش تاني لو env.php اتضمن كذا مرة. نفس النمط مش مستخدم في helpers تانية لأنهم بيتضمنوا مرة واحدة في الـ bootstrap.'),
    ]),

    divider(),

    h1('🔍 Section 4: Secure Dynamic Filtering (filtration.php)'),
    grayQuote([t('بناء WHERE queries بأمان', { bold: true, italic: true })]),

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

    h2('4.1 The Whitelist Security Model'),
    p('أهم ميزة أمان في applyFilters() هي $allowedFields. دي whitelist صريحة. الحقول اللي مش في القائمة بيت ignore. لو مستخدم خبيث بعت ?is_admin=1&password=abc, البرامترات دي مش في الـ whitelist فبتت تجاهل. ده standard industry practice لمنع mass-assignment و SQL injection.'),
    p('فيه special case للـ date fields. لما اسم الحقل فيه "date" و القيمة 10 أحرف (YYYY-MM-DD)، الـ filter بيزود DATE() على العمود عشان الـ time component ماتأثرش.'),

    h2('4.2 SubServiceRepo Exception'),
    p('SubServiceRepo مش بتستخدم applyFilters(). عشان محتاجة LIKE و >=/<= range filtering:'),
    code(`if (!empty($_GET['name'])) {
    $sql .= " AND name LIKE :name";
}
if (isset($_GET['min_fees'])) {
    $sql .= " AND fees >= :min_fees";
}`),

    calloutBlue([
      t('Proposed Enhancement: ', { color: 'blue', bold: true }),
      t('نقدر نعمم applyFilters() عشان تقبل operator map — applyFilters($sql, $fields, [], [\'name\' => \'LIKE\', \'fees\' => \'>=\']). ده هيخلي SubServiceRepo يستخدمها بدل الكود المخصص.'),
    ]),

    divider(),

    h1('🔐 Section 5: Stateless JWT Authentication (jwt.php)'),
    grayQuote([t('التأكد من هوية المستخدم من غير جلسات', { bold: true, italic: true })]),

    code(`<?php
use Firebase\\JWT\\JWT;
use Firebase\\JWT\\Key;

function getJwtSecret(): string {
    $secret = env('JWT_SECRET');
    if (empty($secret)) {
        response(HttpStatus('INTERNAL_SERVER_ERROR'),
            "JWT_SECRET not set.");
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
    if (!$token) response(HttpStatus('UNAUTHORIZED'), "token required");
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
        response(HttpStatus('FORBIDDEN'), "access denied");
    }
}`),

    h2('5.1 Token Structure'),
    p('الـ JWT token بيحمل 4 claims:'),
    ...metaTable([
      ['Claim', 'Type', 'Usage'],
      ['iat', 'int', 'Issued-at timestamp'],
      ['exp', 'int', 'Expiration (iat + 3600 = 1 hour)'],
      ['user_id', 'int', 'User primary key'],
      ['role', 'string', '"user" or "admin"']
    ]),

    h2('5.2 VerifyToken() — The Gatekeeper'),
    p('أكتر دالة أمان استدعاءً في الـ API. بتنادي في بداية كل protected endpoint:'),
    bullet([t('Header Extraction: ', { color: 'purple', bold: true }), t('getallheaders() تجيب Authorization header.', { bold: false })]),
    bullet([t('Bearer Parsing: ', { color: 'purple', bold: true }), t('بت strip "Bearer " prefix.', { bold: false })]),
    bullet([t('Signature Verification: ', { color: 'purple', bold: true }), t('firebase/php-jwt بت decode وتتحقق من HMAC signature.', { bold: false })]),
    bullet([t('Expiration: ', { color: 'purple', bold: true }), t('Automatic — JWT library بتقارن exp مع وقت السيرفر.', { bold: false })]),

    h2('5.3 getJwtSecret() — Fail Loudly'),
    p('الحل محل الـ hardcoded fallback القديم. لو JWT_SECRET مش موجود في الـ env، الدالة بترجع 500 Internal Server Error. مفيش default silent تاني. ده يضمن إن الإنتاج لازم يكون عنده secret قوي قبل ما يشتغل.'),

    divider(),

    h1('📧 Section 6: SMTP Mailer Integration (mailer.php)'),
    grayQuote([t('إرسال رموز إعادة تعيين كلمة المرور', { bold: true, italic: true })]),

    code(`<?php
use PHPMailer\\PHPMailer\\PHPMailer;
function sendResetEmail($toEmail, $token) {
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host = MAIL_HOST;
        $mail->SMTPAuth = true;
        $mail->Username = MAIL_USERNAME;
        $mail->Password = MAIL_PASSWORD;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = MAIL_PORT;
        $mail->setFrom(MAIL_FROM, MAIL_FROM_NAME);
        $mail->addAddress($toEmail);
        $mail->isHTML(false);
        $mail->Subject = 'Doctorna - Password Reset Token';
        $mail->Body = "Your reset token: $token\\nExpires in 15 mins.";
        $mail->send();
        return true;
    } catch (Exception $e) {
        throw new Exception("Mailer Error: {$mail->ErrorInfo}");
    }
}`),

    p('SMTP configuration جاي من config/mail.php — MAIL_HOST, MAIL_USERNAME, MAIL_PASSWORD, MAIL_PORT, MAIL_FROM. دول بيتحملوا من .env.'),

    calloutOrange([
      t('Security Warning: ', { color: 'orange', bold: true }),
      t('SMTP credentials حساسة جدًا. config/mail.php مينفعش يت commit في version control. استخدم .env وضيفه لـ .gitignore.'),
    ]),

    divider(),

    h1('📄 Section 7: Server-Side Pagination (pagination.php)'),
    grayQuote([t('تحميل البيانات على دفعات', { bold: true, italic: true })]),

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
    $countQuery = "SELECT COUNT(*) as total FROM \`{$tableName}\`
                   WHERE deleted_at IS NULL";
    $countStmt = $conn->prepare($countQuery);
    $countStmt->execute();
    $totalRecords = (int)$countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    $dataQuery = "SELECT * FROM \`{$tableName}\` WHERE deleted_at IS NULL
                  ORDER BY id LIMIT :limit OFFSET :offset";
    $dataStmt = $conn->prepare($dataQuery);
    $dataStmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $dataStmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $dataStmt->execute();
    $list = $dataStmt->fetchAll(PDO::FETCH_ASSOC);

    $totalPages = ceil($totalRecords / $limit);
    return ['list' => $list, 'pagination' => [
        'current_page' => $page, 'per_page' => $limit,
        'total_records' => $totalRecords, 'total_pages' => $totalPages,
        'has_next' => $page < $totalPages, 'has_prev' => $page > 1
    ]];
}`),

    p('Standard SQL pagination: OFFSET = (page - 1) * limit. الحدود: page < 1 يت clamp لـ 1. limit > 100 يت clamp للـ default. الـ allowedTables array هي security control — فقط ٥ جداول مسموحة.'),

    calloutOrange([
      t('Known Bug: ', { color: 'orange', bold: true }),
      t('الـ allowed table names فيها mismatch. "speciality" مش اسم الجدول الفعلي — الجدول اسمه "specialities". Pagination على التخصصات هتفشل مع "Invalid table name".'),
    ]),

    divider(),

    h1('📥 Section 8: Request Parsing & Validation (request.php)'),
    grayQuote([t('استخراج البيانات والتحقق منها', { bold: true, italic: true })]),

    code(`<?php
function getJsonInput(array $requiredFields = []) {
    $data = json_decode(file_get_contents("php://input"), true) ?? [];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || (is_string($data[$field]) && trim($data[$field]) === "")) {
            response(HttpStatus('UNPROCESSABLE_ENTITY'),
                "Please provide '$field'.");
        }
    }
    return $data;
}

function getRequiredId(): int {
    if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
        response(HttpStatus('BAD_REQUEST'),
            "ID must be numeric.");
    }
    return (int)$_GET['id'];
}`),

    p('getJsonInput() بتقرا php://input, تفك JSON, وتتحقق من الحقول المطلوبة. لو حقل ناقص = 422. getRequiredId() بتستخرج $_GET[\'id\']: check existence, validate numeric, cast to int. استخدام ?? [] بيمنع null لو JSON malformed.'),

    divider(),

    h1('📤 Section 9: Unified Response Format (response.php)'),
    grayQuote([t('كل نقطة نهاية بنفس التنسيق', { bold: true, italic: true })]),

    code(`<?php
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
    response(HttpStatus('METHOD_NOT_ALLOWED'), "Method Not Allowed");
}`),

    p('كل response من Doctorna API بيتبع الـ structure ده: status_code (int) → success/failure, message (string) → user-facing msg, data (mixed) → payload. لو الـ $message فاضي، بي auto-lookup من getHttpStatusMessage().'),

    divider(),

    h1('🔢 Section 10: HTTP Status Code Mapping (status.php)'),
    grayQuote([t('خريطة الأسماء والرموز', { bold: true, italic: true })]),

    code(`<?php
function HttpStatus(string $status): int {
    $codes = [
        'OK' => 200, 'CREATED' => 201, 'ACCEPTED' => 202,
        'NO_CONTENT' => 204, 'BAD_REQUEST' => 400,
        'UNAUTHORIZED' => 401, 'FORBIDDEN' => 403,
        'NOT_FOUND' => 404, 'METHOD_NOT_ALLOWED' => 405,
        'CONFLICT' => 409, 'UNPROCESSABLE_ENTITY' => 422,
        'INTERNAL_SERVER_ERROR' => 500, 'NOT_IMPLEMENTED' => 501,
        'SERVICE_UNAVAILABLE' => 503
    ];
    return $codes[$status] ?? 500;
}

function getHttpStatusMessage(int $code): string {
    $messages = [
        200 => "Success", 201 => "Resource Created",
        400 => "Bad Request", 401 => "Unauthorized",
        403 => "Forbidden", 404 => "Not Found",
        405 => "Method Not Allowed", 409 => "Conflict",
        422 => "Unprocessable Entity",
        500 => "Internal Server Error"
    ];
    return $messages[$code] ?? "Unknown Status";
}`),

    p('HttpStatus(\'NOT_FOUND\') أقرأ من 404. الـ ?? 500 fallback safety net — لو status name مش معروف, بيرجع 500 بدل null/0. كل status code مستخدم في codebase لازم يكون في الخريطة دي.'),

    divider(),

    h1('⚡ Section 11: High-Performance Redis Caching (cache.php)'),
    grayQuote([t('تقديم البيانات في أجزاء من الثانية', { bold: true, italic: true })]),

    code(`<?php
use Predis\\Client;
$redis = new Client([
    'host' => env('REDIS_HOST', '127.0.0.1'),
    'port' => env('REDIS_PORT', 6379)
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
        error_log("Redis Error: " . $e->getMessage());
    }
}

function saveToCache($cacheKey, $data, $ttl = 3600) {
    global $redis;
    try {
        $redis->setex($cacheKey, $ttl, json_encode($data));
    } catch (Exception $e) {
        error_log("Redis Error: " . $e->getMessage());
    }
}

function deleteFromCache($keys) {
    global $redis;
    try { if (!is_array($keys)) $keys = [$keys];
        foreach ($keys as $key) $redis->del($key);
    } catch (Exception $e) {
        error_log("Redis Error: " . $e->getMessage());
    }
}`),

    h2('11.1 The Resilient Redis Pattern'),
    p('كل Redis operation متغلفة في try/catch. لو Redis down, الـ catch بت log وتكمل بصمت. الـ API بت degrade gracefully — بدل 500 error, بت fallback لاستعلام قاعدة البيانات. الأداء بيقل شوية بس المستخدم مبيفهمش.'),

    h2('11.2 Password Reset Token Storage'),
    p('الـ password reset flow بيستخدم Redis كـ temporary token store بدل جدول قاعدة بيانات. TTL = 900 ثانية (15 دقيقة). استخدم storeResetToken(), getStoredResetToken(), deleteResetToken().'),

    h2('11.3 generateFilteredCacheKey()'),
    code(`function generateFilteredCacheKey(string $prefix, array $allowedFilters): string {
    $filterParams = [];
    foreach ($allowedFilters as $key) {
        if (isset($_GET[$key]) && $_GET[$key] !== '') {
            $filterParams[$key] = $_GET[$key];
        }
    }
    ksort($filterParams);
    $qs = http_build_query($filterParams);
    return $qs ? "{$prefix}:filter:{$qs}" : "{$prefix}:all";
}`),
    p('ksort() بيضمن إن ترتيب الـ URL params مأثرش على cache key. ?gender=female&rank=specialist و ?rank=specialist&gender=female ينتجوا نفس المفتاح. مثال: doctors:filter:gender=female&rank=specialist.'),

    divider(),

    h1('🔗 Section 12: Cross-Helper Integration Patterns'),
    grayQuote([t('إزاي الـ helpers بتشتغل مع بعض', { bold: true, italic: true })]),

    h2('12.1 Pattern A: Request → Validation → Repository → Response'),
    p('ده الـ standard flow لكل POST/PUT/PATCH endpoint:'),
    code(`function handleCreateDoctor($conn) {
    // 1. Parse input (request.php)
    $data = getJsonInput(['name','email','phone','gender','spec_id','rank','fees']);
    // 2. Business validation (controller guard)
    validateDoctorData($data);
    // 3. Execute (db.php via runQuery)
    $result = createDoctor($conn, $data);
    // 4. Invalidate cache (cache.php)
    deleteFromCache('doctors:all');
    // 5. Respond (response.php)
    response(HttpStatus('CREATED'), "Doctor created", $result);
}`),

    h2('12.2 Pattern B: Cache Check → DB Query → Cache Store → Response'),
    p('ده الـ standard flow لكل GET endpoint:'),
    code(`function handleGetAllDoctors($conn) {
    $cacheKey = generateFilteredCacheKey('doctors',
        ['gender','spec_id','rank','name','is_available']);
    serveFromCacheIfAvailable($cacheKey, "Fetched");
    // Cache miss → DB query
    $doctors = getAllDoctors($conn);
    saveToCache($cacheKey, $doctors, 300);
    response(HttpStatus('OK'), "Fetched", $doctors);
}`),

    h2('12.3 Pattern C: Token → Guard → Scoped Query → Response'),
    p('ده الـ standard flow للمحمية endpoints مع row-level security:'),
    code(`function handleGetAllAppointments($conn) {
    $token = VerifyToken();
    if ($token->role === 'admin') {
        $data = getAllAppointments($conn);
    } else {
        $data = getAppointmentsByUser($conn, $token->user_id);
    }
    response(HttpStatus('OK'), "Fetched", $data);
}`),

    divider(),

    h1('🛡️ Section 13: Security Audit & Resolved Items'),
    grayQuote([t('مراجعة أمنية لكل ملف مساعد', { bold: true, italic: true })]),

    ...metaTable([
      ['Helper', 'Risk', 'Finding'],
      ['db.php', '🟢 Low', 'Prepared statements تمنع SQL injection'],
      ['env.php', '🟢 Low', 'safeLoad() + function_exists guard'],
      ['filtration.php', '🟢 Low', 'Whitelist-based filtering'],
      ['jwt.php', '🟢 Low', 'getJwtSecret() — no hardcoded fallback'],
      ['mailer.php', '🟡 Medium', 'SMTP creds in config file'],
      ['pagination.php', '🟡 Medium', 'Table whitelist + limit cap. speciality/specialities bug.'],
      ['request.php', '🟢 Low', 'Strict JSON parsing + numeric ID validation'],
      ['response.php', '🟢 Low', 'No security concerns'],
      ['status.php', '🟢 Low', 'Pure lookup with fallback'],
      ['cache.php', '🟡 Medium', 'Predis localhost. Graceful degradation on Redis failure.']
    ]),

    h2('13.1 Resolved & Remaining'),
    calloutGreen([
      t('✅ JWT Secret: ', { color: 'green', bold: true }),
      t('Removed hardcoded fallback. getJwtSecret() fails with 500 if JWT_SECRET missing.'),
    ]),
    calloutGreen([
      t('✅ Exception Handler: ', { color: 'green', bold: true }),
      t('set_exception_handler() in api.php catches all Throwables → 500 JSON.'),
    ]),
    calloutBlue([
      t('💡 Not Yet: ', { color: 'blue', bold: true }),
      t('Rate limiting on auth endpoints (Redis INCR).'),
    ]),

    divider(),

    h1('🧪 Section 14: Testing Strategy for Helpers'),
    grayQuote([t('ضمان موثوقية الـ helpers', { bold: true, italic: true })]),

    h2('14.1 Unit-Testable Helpers'),
    p('الـ helpers اللي pure functions (مفيش side effects):'),
    bullet([t('status.php — ', { color: 'blue', bold: true }), t('HttpStatus() مع كل status name معروف وواحد مش معروف.', { bold: false })]),
    bullet([t('filtration.php — ', { color: 'green', bold: true }), t('applyFilters() مع مجموعات $_GET مختلفة. تأكد من SQL generation.', { bold: false })]),
    bullet([t('response.php — ', { color: 'purple', bold: true }), t('تأكد من JSON output صحيح مع الـ 3 fields.', { bold: false })]),
    bullet([t('pagination.php — ', { color: 'orange', bold: true }), t('Clamping, total pages, has_next/has_prev.', { bold: false })]),
    bullet([t('request.php — ', { color: 'red', bold: true }), t('getRequiredId() numeric/non-numeric/missing. getJsonInput() missing fields.', { bold: false })]),

    h2('14.2 Integration-Testable Helpers'),
    p('الـ helpers اللي بتعتمد على external services:'),
    bullet([t('cache.php — ', { color: 'blue', bold: true }), t('Mock Redis. Cache hit → skip DB, cache miss → query DB.', { bold: false })]),
    bullet([t('jwt.php — ', { color: 'green', bold: true }), t('Token generation + expired/tampered token rejection.', { bold: false })]),
    bullet([t('env.php — ', { color: 'purple', bold: true }), t('Configurations مختلفة. Default fallback.', { bold: false })]),

    divider(),

    h1('🚀 Section 15: Extending the Helpers Ecosystem'),
    grayQuote([t('إضافة helpers جديدة', { bold: true, italic: true })]),

    h2('15.1 Guidelines'),
    bullet([t('Rule 1 — One Concern Per File: ', { color: 'blue', bold: true }), t('كل ملف helper بيغلف concern واحد.', { bold: false })]),
    bullet([t('Rule 2 — Explicit Dependencies: ', { color: 'green', bold: true }), t('كل file require dependencies بتاعته في أوله.', { bold: false })]),
    bullet([t('Rule 3 — Graceful Degradation: ', { color: 'orange', bold: true }), t('External service failures متكسرش الـ API.', { bold: false })]),
    bullet([t('Rule 4 — No Side Effects on Include: ', { color: 'purple', bold: true }), t('Including الملف ميعملش execute لأي logic.', { bold: false })]),
    bullet([t('Rule 5 — Return Early, Die Late: ', { color: 'red', bold: true }), t('الفشل يرجع error response فوراً.', { bold: false })]),

    h2('15.2 Proposed Future Helpers'),
    bullet([t('helper/logger.php — ', { color: 'blue', bold: true }), t('Structured logging: INFO, WARN, ERROR levels + file/stdout.', { bold: false })]),
    bullet([t('helper/validator.php — ', { color: 'green', bold: true }), t('Input validation rules: email, phone, numeric range, enum. يريح الـ controllers من ad-hoc validation.', { bold: false })]),
    bullet([t('helper/rate_limiter.php — ', { color: 'purple', bold: true }), t('Redis sliding window rate limiter لأماكن auth.', { bold: false })]),
    bullet([t('helper/audit.php — ', { color: 'orange', bold: true }), t('Audit trail لكل write operation. مين غير إيه وإمتى.', { bold: false })]),

    divider(),
    calloutTarget([
      t('Helpers Summary: ', { color: 'blue', bold: true }),
      t('الـ 10 helpers بيكوّنوا أساس layered, secure, و DRY لكل Doctorna API. كل Controller و Repository بيديلهم. ~397 سطر helper code هما أكثر كود testability و criticality في التطبيق.'),
    ]),
    calloutBook([
      t('Phase 3: ', { bold: true }),
      t('Authentication Module documentation.'),
    ]),
  ];

  const page = await req('POST', '/pages', JSON.stringify({
    parent: { page_id: PARENT },
    icon: { type: 'emoji', emoji: '🇪🇬' },
    properties: { title: { title: [{ text: { content: '🇪🇬 Phase 2 — Core Helpers Ecosystem (مصري)' } }] } }
  }));
  console.log(`Created Arabic Phase 2: ${page.id}`);

  for (let i = 0; i < blocks.length; i += 100) {
    const chunk = blocks.slice(i, i + 100);
    await req('PATCH', `/blocks/${page.id}/children`, JSON.stringify({ children: chunk }));
    console.log(`  +${i+1}-${Math.min(i+100, blocks.length)}`);
  }

  let wc = 0;
  for (const b of blocks) {
    const c = b[b.type];
    if (c && c.rich_text) {
      for (const rt of c.rich_text) {
        if (rt.type === 'text') wc += rt.text.content.split(/\s+/).filter(w => w.length).length;
      }
    }
  }
  console.log(`\nBlocks: ${blocks.length}, Words: ${wc}`);
  console.log('Done!');
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
