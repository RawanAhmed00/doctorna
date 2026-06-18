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
  // Archive existing Phase 1
  const existing = await req('GET', `/blocks/${PARENT}/children?page_size=50`);
  for (const b of existing.results) {
    if (b.type === 'child_page' && b.child_page.title.includes('Phase 1')) {
      await req('PATCH', `/pages/${b.id}`, JSON.stringify({ archived: true }));
      console.log(`Archived old: ${b.child_page.title}`);
    }
  }

  // ======================================================================
  // BUILD PHASE 1 — 10,000+ WORD DOCUMENT
  // ======================================================================
  const blocks = [

    // =================== METADATA TABLE ===================
    ...metaTable([
      ['Property', 'Details'],
      ['Author', 'Architecture Team'],
      ['Status', '🟢 Unified & Active'],
      ['Version', 'v2.0 — Post-Merge Standardization'],
      ['Module', 'Core Architecture & Ecosystem'],
      ['Topic Tags', 'Architecture, Routing, Permissions, Endpoints, Caching, Security, Database'],
      ['Total Endpoints', '24 (6 modules × 4 methods)'],
      ['Caching Layer', 'Redis (all GET requests)'],
      ['Auth Mechanism', 'Stateless JWT (JSON Web Tokens)'],
      ['Database', 'MySQL via PDO with named parameters']
    ]),

    // =================== TABLE OF CONTENTS ===================
    divider(),
    h1('📑 Table of Contents'),
    toggle([t('📑 Click to expand — Full Document Structure')]),
    bullet([t('Section 1: '), t('Project Vision & Strategic Objectives', { color: 'blue', bold: true })]),
    bullet([t('Section 2: '), t('Technology Stack & Architecture Philosophy', { color: 'blue', bold: true })]),
    bullet([t('Section 3: '), t('The Six Modules Ecosystem — Deep Dive', { color: 'blue', bold: true })]),
    bullet([t('Section 4: '), t('Global Permissions & Auth Matrix', { color: 'blue', bold: true })]),
    bullet([t('Section 5: '), t('In-Depth User Flows & Transaction Patterns', { color: 'blue', bold: true })]),
    bullet([t('Section 6: '), t('Code Walkthrough — The Master Router (api.php)', { color: 'blue', bold: true })]),
    bullet([t('Section 7: '), t('Standardized Error Handling Patterns', { color: 'blue', bold: true })]),
    bullet([t('Section 8: '), t('High-Performance Caching Architecture', { color: 'blue', bold: true })]),
    bullet([t('Section 9: '), t('Security Model — Defense in Depth', { color: 'blue', bold: true })]),
    bullet([t('Section 10: '), t('Database Schema & Relationship Design', { color: 'blue', bold: true })]),
    bullet([t('Section 11: '), t('Testing Strategy & API Verification', { color: 'blue', bold: true })]),
    bullet([t('Section 12: '), t('Deployment & Configuration Guide', { color: 'blue', bold: true })]),

    // =================== SECTION 1: PROJECT VISION ===================
    divider(),
    h1('🎯 1. Project Vision & Strategic Objectives'),
    grayQuote([t('الرؤية العامة — تحويل عيادة تقليدية إلى منصة حجز ذكية', { bold: true, italic: true })]),

    h2('1.1 The Problem Domain'),
    p('The healthcare industry has long struggled with fragmented booking systems. Patients juggle phone calls, paper calendars, and unreliable third-party platforms to schedule appointments with medical professionals. Clinic administrators waste countless hours on manual data entry, duplicate records, and reconciliation between disparate systems. The Doctorna API was conceived to solve these pain points by providing a unified, programmatic backend that any frontend application — whether web, mobile, or kiosk — can interface with to deliver a seamless medical booking experience.'),
    p('Traditional clinic management software often suffers from monolithic architectures where business logic is tightly coupled to the database layer. This creates a maintenance nightmare: a single change ripples unpredictably across the codebase, testing becomes impractical, and onboarding new developers takes weeks instead of hours. Doctorna rejects this approach entirely.'),
    calloutTarget([
      t('Core Mission: ', { color: 'blue', bold: true }),
      t('Build a modular, API-first medical booking platform where each component has a single responsibility, every endpoint is cacheable, security is baked in at every layer, and the entire system can be understood and modified by a single developer within minutes.'),
    ]),

    h2('1.2 Strategic Objectives'),
    p('The architecture was guided by five non-negotiable principles that shaped every decision from routing to caching:'),

    h3('Objective A: Strict Separation of Concerns'),
    p('The classic MVC (Model-View-Controller) pattern is adapted here into a variant more suitable for API development. Instead of a single "Model" layer, we split data access into dedicated Repository classes and business logic into Controller functions. The routing layer (api.php) is purely a traffic cop — it reads the URL, determines which Controller to invoke, and passes the database connection. Controllers never touch SQL directly. Repositories never format HTTP responses.'),
    p('This separation means that if the team decides to migrate from MySQL to PostgreSQL, only the Repositories need to change. If they want to switch from JSON to a different response format, only the response helper changes. If routing logic evolves, only api.php is affected. The modularity is enforced not by convention but by the absence of cross-layer imports — a Controller simply cannot run a raw query because it has no access to PDO directly.'),

    h3('Objective B: High-Performance Caching'),
    p('Medical directory listings — doctors, specialities, sub-services — are read-heavy workloads. Patients browse profiles far more often than administrators update them. Every millisecond of latency in the API response translates directly to a degraded user experience, especially on mobile networks.'),
    p('The solution is aggressive Redis caching at the endpoint level. Every single GET request in the system first checks Redis for a cached response. If the key exists, the API returns the data in approximately 1 millisecond without ever touching MySQL. If the key is missing, the query executes normally and the result is stored in Redis with a configurable TTL.'),
    p('The cache invalidation strategy is equally important. Any POST, PUT, PATCH, or DELETE operation — regardless of which module it targets — triggers a wildcard cache flush for that module\'s key namespace. This ensures that stale data is never served to end users while maintaining the performance benefits of aggressive caching.'),

    h3('Objective C: Stateless JWT Security'),
    p('The API explicitly avoids PHP sessions ($_SESSION) and server-side token storage. Every authenticated request carries a JSON Web Token (JWT) in the Authorization header. This token is cryptographically signed and contains the user\'s identity (user_id) and role (user or admin). The server verifies the token\'s signature on every protected endpoint without consulting a database or session store.'),
    p('This stateless approach enables horizontal scaling: if traffic spikes, additional API servers can be spun up instantly without any shared session state. Any server can authenticate any request as long as it possesses the shared JWT secret key. The tokens themselves have configurable expiration times, after which the client must re-authenticate through the login endpoint.'),

    h3('Objective D: Defensive Validation'),
    p('The API operates on a "never trust the client" philosophy. Every incoming request — whether from a first-party web application, a mobile app, or a third-party integration — undergoes rigorous validation before any business logic executes. This validation is enforced through centralized guard functions that are called at the top of every Controller method.'),
    p('These guards check email formats via PHP\'s filter_var() with FILTER_VALIDATE_EMAIL, enforce password complexity through regular expressions, verify that numeric fields (age, fees, IDs) are actually numeric and within acceptable ranges, and confirm that enum fields (gender, role, status) contain only permitted values. If any validation fails, the request is immediately rejected with a 400 Bad Request response and a descriptive error message — no partial writes, no inconsistent data, no silent failures.'),

    h3('Objective E: Unified Response Format'),
    p('Consistency in API responses is crucial for frontend developers who consume the API. Every single endpoint — whether it returns a list of doctors, creates a new appointment, or reports an error — follows the exact same JSON structure:'),
    code(`{
    "status_code": 200,
    "message": "Operation completed successfully",
    "data": { ... }
}`),
    p('This uniformity means that frontend error handling can be standardized. The frontend parses the status_code to determine success or failure, reads the message for user-facing feedback, and extracts the data payload for rendering. There are no surprises, no undocumented response shapes, and no consistency violations across different modules.'),

    divider(),

    // =================== SECTION 2: TECHNOLOGY STACK ===================
    h1('⚙️ 2. Technology Stack & Architecture Philosophy'),
    grayQuote([t('كومة التكنولوجيا — الأدوات والمكتبات التي تدير النظام', { bold: true, italic: true })]),

    h2('2.1 Server & Runtime'),
    p('The entire API runs on vanilla PHP 8.x without any framework. This was a deliberate architectural decision. While frameworks like Laravel or Symfony provide excellent tooling, they also impose significant overhead in terms of file count, autoloading complexity, and learning curve. For a focused medical booking API with precisely 24 endpoints across 6 modules, a framework would introduce more complexity than it solves.'),
    p('The PHP runtime is served through Apache/Nginx on XAMPP or any standard LAMP stack. The entry point is a single file — api.php — which receives all HTTP traffic through URL rewriting. This is configured either through Apache\'s mod_rewrite or through direct PATH_INFO parsing, ensuring compatibility across different server environments.'),
    p('PHP 8.x features used include: named arguments (for clarity in helper calls), match expressions (for cleaner status code mapping), typed properties (in data transfer objects), and nullsafe operator (for safe nested access). The codebase also relies on PDO for database access, ensuring consistent error handling and prepared statement security across all modules.'),

    h2('2.2 Database Layer — MySQL with PDO'),
    p('MySQL serves as the primary data store. All database interactions go through PHP\'s PDO (PHP Data Objects) extension with named parameter binding. This is critical for SQL injection prevention: user-supplied values are never interpolated directly into SQL strings. Instead, they are bound to named parameters like :email or :id, and PDO handles the proper escaping and quoting.'),
    p('The connection is established once in config/database.php and passed as a reference ($conn) to every function that needs it. This eliminates the overhead of creating multiple connections while maintaining a clean dependency injection pattern. The connection uses UTF-8 encoding and sets PDO error mode to exceptions, ensuring that any database error is caught and handled gracefully rather than causing a silent failure.'),

    h2('2.3 Caching Layer — Redis'),
    p('Redis is the caching backbone. It runs as a separate service (typically on localhost:6379) and is accessed through the PhpRedis extension. The cache helper (helper/cache.php) encapsulates all Redis interactions behind a clean API:'),
    bullet([t('serveFromCacheIfAvailable($key, $message) — ', { color: 'blue', bold: true }), t('Checks Redis for the key. If found, immediately returns cached response and exits. If not found, execution continues to the database query.', { bold: false })]),
    bullet([t('generateFilteredCacheKey($prefix, $allowedFilters) — ', { color: 'green', bold: true }), t('Builds deterministic cache keys from URL query parameters. Uses ksort() to alphabetically sort parameters before building the key string, preventing duplicate caches for the same data with different parameter ordering.', { bold: false })]),
    bullet([t('clearModuleCache($pattern) — ', { color: 'orange', bold: true }), t('Deletes all keys matching a wildcard pattern. Called on every write operation to ensure data freshness.', { bold: false })]),
    p('The TTL (Time To Live) for cached entries is set at 300 seconds (5 minutes) by default. This balances performance against data freshness. For frequently updated data like appointment slots, a shorter TTL may be configured. For relatively static data like specialities and sub-service catalogs, the TTL could be extended to 1 hour or more.'),

    h2('2.4 Authentication Layer — JWT'),
    p('The custom JWT implementation (helper/JWT.php) handles token generation and verification without external libraries. The tokens use HMAC-SHA256 signing with a secret key defined in the configuration. Each token contains three parts:'),
    bullet([t('Header: ', { color: 'purple', bold: true }), t('Algorithm identifier (HS256) and token type (JWT)', { bold: false })]),
    bullet([t('Payload: ', { color: 'purple', bold: true }), t('user_id, role (user/admin), issued-at timestamp (iat), and expiration timestamp (exp)', { bold: false })]),
    bullet([t('Signature: ', { color: 'purple', bold: true }), t('HMAC-SHA256 of the base64-encoded header and payload, signed with the server\'s secret key', { bold: false })]),
    p('Token expiration is set to 24 hours by default. After expiration, the client must re-authenticate through the login endpoint. The VerifyToken() function automatically checks the expiration timestamp and returns 401 UNAUTHORIZED if the token has expired, prompting the frontend to redirect to the login screen.'),

    h2('2.5 Why No Framework?'),
    p('The decision to build without a framework warrants explicit discussion. Modern PHP frameworks like Laravel offer routing, ORM, authentication, caching, and testing tools out of the box. However, for this specific project, a framework would introduce:'),
    bullet([t('~30 MB of vendor files', { bold: false })]),
    bullet([t('A steep learning curve for new contributors', { bold: false })]),
    bullet([t('Framework-specific upgrade paths that may break custom logic', { bold: false })]),
    bullet([t('Unused features that add maintenance surface area', { bold: false })]),
    p('Instead, the Doctorna API implements a "lean framework" approach — only the exact patterns needed, implemented in clean, readable PHP. The result is a codebase that can be fully understood by reading approximately 1,500 lines of code across 12 files (6 Controllers + 6 Repositories). There is no magic, no hidden auto-wiring, and no configuration files that mysteriously influence behavior.'),

    divider(),

    // =================== SECTION 3: SIX MODULES ===================
    h1('🧩 3. The Six Modules Ecosystem — Deep Dive'),
    grayQuote([t('النظام البيئي للوحدات — ست وحدات مترابطة تغطي كل وظائف المنصة', { bold: true, italic: true })]),

    p('The API is organized into six modules, each responsible for a distinct domain within the medical booking ecosystem. Every module follows the same internal structure: a Controller (business logic and validation), a Repository (database queries), and validation guard functions (input sanitization). This consistency means that once a developer understands one module, they effectively understand all six.'),

    // AUTH MODULE
    h2('3.1 🔐 Authentication Module (/auth)'),
    grayQuote([t('وحدة المصادقة — البوابة الإلكترونية للنظام', { bold: true, italic: true })]),
    p('The Authentication module is the only publicly writable module — anyone can register and login. It handles four operations, all via POST requests:'),

    h3('🔹 POST /api.php/auth/register'),
    p('The registration endpoint accepts seven required fields: name, email, password, age, gender, phone, and role. The validation chain is extensive:'),
    bullet([t('Empty field check: ', { color: 'red', bold: true }), t('All seven fields must be non-empty. Missing any field returns 400 BAD REQUEST with a specific message.', { bold: false })]),
    bullet([t('Email validation: ', { color: 'blue', bold: true }), t('PHP\'s filter_var() with FILTER_VALIDATE_EMAIL rejects malformed addresses before any database query.', { bold: false })]),
    bullet([t('Password strength: ', { color: 'orange', bold: true }), t('A regex enforces: minimum 8 characters, at least one uppercase letter (A-Z), one lowercase letter (a-z), one digit (0-9), and one special character from the set #?!@$%^&*-.', { bold: false })]),
    bullet([t('Age validation: ', { color: 'purple', bold: true }), t('Must be numeric and between 1 and 120. This prevents obviously invalid data like negative ages or implausible values.', { bold: false })]),
    bullet([t('Gender validation: ', { color: 'purple', bold: true }), t('Must be exactly "male" or "female" (case-insensitive, normalized to lowercase).', { bold: false })]),
    bullet([t('Role restriction: ', { color: 'red', bold: true }), t('Only "user" role is permitted through public registration. Admin accounts must be created through a separate, secured process.', { bold: false })]),
    bullet([t('Duplicate detection: ', { color: 'orange', bold: true }), t('Both email and phone are checked against existing records. Duplicates return 409 CONFLICT.', { bold: false })]),
    p('After validation passes, the password is hashed using PHP\'s password_hash() with the PASSWORD_DEFAULT algorithm (currently bcrypt). The user record is inserted into the database, and a JWT token is generated for immediate authentication. The response includes the token in the data payload, enabling the frontend to skip the separate login step.'),
    calloutGreen([
      t('⚡ Auto-Login Feature: ', { color: 'green', bold: true }),
      t('Unlike traditional registration flows that require a separate login step, Doctorna generates and returns a JWT immediately upon registration. This provides a seamless onboarding experience — the user registers once and is immediately authenticated.'),
    ]),
    p('Sample successful response:'),
    code(`{
    "status_code": 201,
    "message": "User registered successfully !",
    "data": {
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
    }
}`, 'json'),
    p('Sample validation error:'),
    code(`{
    "status_code": 400,
    "message": "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character."
}`, 'json'),

    h3('🔹 POST /api.php/auth/login'),
    p('The login endpoint accepts email and password. It first retrieves the user record by email using getUserByEmail(). If no user is found, it returns 404 NOT FOUND with a message suggesting registration. If the user exists but the password hash does not match (verified via password_verify()), it returns 401 UNAUTHORIZED.'),
    p('On successful authentication, a JWT token is generated via GenerateToken($user) and returned in the response. The token embeds the user\'s ID and role, which are extracted by VerifyToken() on subsequent protected requests.'),

    h3('🔹 POST /api.php/auth/forgot-password'),
    p('This endpoint initiates the password reset flow. It accepts an email address, validates its format, and — regardless of whether the email exists in the database — returns the same success message. This is a deliberate security measure to prevent email enumeration attacks. An attacker cannot determine which emails are registered because the response is identical whether the email exists or not.'),
    p('If the email IS registered, a 64-character hex token is generated (bin2hex(random_bytes(32))) and stored in the reset_tokens table (or equivalent storage). The token is then passed to a simulated mailer function that would, in production, send a password reset link to the user\'s email. The link would contain the token as a query parameter for the reset-password endpoint.'),

    h3('🔹 POST /api.php/auth/reset-password'),
    p('The final step in the password recovery flow accepts email, token, and new_password. It validates that the token matches the stored token for the given email, checks that the token has not expired (tokens have a 1-hour TTL), and then validates the new password against the password strength rules. If everything checks out, the password hash is updated in the database and the token is deleted to prevent reuse.'),

    // DOCTORS MODULE
    h2('3.2 👨‍⚕️ Doctors Module (/doctors)'),
    grayQuote([t('وحدة الأطباء — إدارة الكادر الطبي', { bold: true, italic: true })]),
    p('The Doctors module is the most heavily queried module in the system. It manages the medical staff directory with full CRUD operations. All read operations are publicly accessible and cached via Redis. All write operations require admin privileges.'),

    h3('🔹 GET /api.php/doctors — Public, Cached'),
    p('Returns all active doctors (those without a deleted_at timestamp). The endpoint supports dynamic filtering through URL query parameters. The allowed filter fields are: gender, spec_id (speciality ID), rank (e.g., specialist, consultant, intern), name (partial match), and is_available (availability boolean).'),
    p('The caching layer uses generateFilteredCacheKey() with the prefix "doctors" and the allowed filter fields. This produces cache keys like:'),
    code(`doctors:filter:gender=female&rank=specialist
doctors:filter:is_available=1&spec_id=3`),
    p('The ksort() sorting ensures that gender=female&rank=specialist and rank=specialist&gender=female produce the same cache key, preventing redundant cache entries.'),

    h3('🔹 POST /api.php/doctors — Admin Only'),
    p('Creating a doctor requires: name, email, phone, gender, spec_id, rank, and fees. The validation guard (validateDoctorData()) checks email format, ensures phone is non-empty, confirms gender is male or female, and verifies fees is a positive number. An additional check via getDoctorByEmail() prevents duplicate email entries. On success, the doctors:* cache namespace is flushed to ensure the new doctor appears immediately in public listings.'),

    h3('🔹 PATCH /api.php/doctors?id={id} — Admin Only'),
    p('Partial updates allow modifying any subset of the doctor\'s fields. The validation guard is called with $isUpdate=true, which makes all fields optional — only the fields present in the request body are validated. The cache is flushed for both the specific doctor (doctor:id:{id}) and the general listing (doctors:filter:*).'),

    h3('🔹 DELETE /api.php/doctors?id={id} — Admin Only'),
    p('Doctors are soft-deleted by setting the deleted_at column to the current timestamp. They are never removed from the database. All read queries include a WHERE deleted_at IS NULL condition to filter out deleted records. This approach preserves referential integrity for historical appointments and audit trails.'),

    // APPOINTMENTS MODULE
    h2('3.3 📅 Appointments Module (/appointments)'),
    grayQuote([t('وحدة المواعيد — المحرك الأساسي للمعاملات', { bold: true, italic: true })]),
    p('The Appointments module is the transactional heart of the system. It handles the creation and management of bookings linking patients to doctors at specific times. This module has the strictest security requirements because appointments involve protected health information and scheduling conflicts.'),

    h3('🔹 POST /api.php/appointments — User Only'),
    p('Creating an appointment requires doc_id (the doctor\'s ID), date_time (in YYYY-MM-DD HH:MM:SS format), and status (must be "pending"). The critical security feature is that user_id is extracted exclusively from the JWT token, not from the request body:'),
    code(`// Security: user_id from JWT, never from request body
$token = VerifyToken();
$data = getJsonInput(['doc_id', 'date_time', 'status']);
$data['user_id'] = $token->user_id;  // JWT injected

// Any 'user_id' sent in the JSON body is simply ignored
createAppointment($conn, $data);`),
    calloutOrange([
      t('🚨 Critical Security: ', { color: 'orange', bold: true }),
      t('The request body is parsed BEFORE injecting the JWT user_id. If a malicious user sends {"user_id": 1} in the POST body, it is overwritten by the verified JWT value. This prevents patient A from booking an appointment for patient B.'),
    ]),

    h3('🔹 GET /api.php/appointments — Scoped Access'),
    p('This endpoint demonstrates row-level security through role-based query modification. If the authenticated user has role "admin", the query returns all appointments. If the role is "user", the query automatically appends WHERE user_id = :user_id to restrict results to only that user\'s bookings.'),
    code(`// Row-level security
$token = VerifyToken();
if ($token->role === 'admin') {
    $appointments = getAllAppointments($conn);
} else {
    $appointments = getAppointmentsByUser($conn, $token->user_id);
}`),

    // PATIENTS MODULE
    h2('3.4 👥 Patients Module (/patients)'),
    grayQuote([t('وحدة المرضى — إدارة حسابات المستخدمين', { bold: true, italic: true })]),
    p('The Patients module provides administrative management of user accounts. All operations require admin privileges. A key security feature is that all queries hardcode WHERE role=\'user\' to prevent admin accounts from being exposed through this module.'),
    calloutRed([
      t('⚠️ Security Guard: ', { color: 'red', bold: true }),
      t('Every PatientRepo query includes AND role = \'user\'. An admin using the Patients module cannot accidentally fetch, update, or delete other admin accounts. Admin account management is intentionally excluded from this module.'),
    ]),

    // SPECIALITIES MODULE
    h2('3.5 🏥 Specialities Module (/specialities)'),
    grayQuote([t('وحدة التخصصات — تصنيف أقسام المستشفى', { bold: true, italic: true })]),
    p('The Specialities module manages hospital departments such as Cardiology, Neurology, Orthopedics, and Pediatrics. It supports a unique feature: the include_doctors parameter triggers a JOIN query that returns the count of active doctors for each speciality:'),
    code(`// With ?include_doctors=1
SELECT s.*, COUNT(d.id) as doctor_count
FROM specialities s
LEFT JOIN doctors d ON s.id = d.spec_id AND d.deleted_at IS NULL
WHERE s.id = :id
GROUP BY s.id`),
    p('This JOIN pattern demonstrates how the API can optimize client-side performance by aggregating related data server-side. Without this feature, the frontend would need to make two separate API calls — one for the speciality and one to count doctors — doubling the latency.'),

    // SUBSERVICES MODULE
    h2('3.6 📋 SubServices Module (/subservices)'),
    grayQuote([t('وحدة الخدمات الفرعية — الإجراءات الطبية التفصيلية', { bold: true, italic: true })]),
    p('The SubServices module manages granular medical procedures offered at the clinic. Examples include: MRI Scan (Brain), X-Ray (Chest), Complete Blood Count, Urinalysis, and COVID-19 PCR Test. Each procedure has a name, fee, and optional description.'),
    p('This module supports advanced range-based filtering that is unique among the six modules:'),
    bullet([t('name: ', { color: 'purple', bold: true }), t('LIKE %search_term% search on procedure name', { bold: false })]),
    bullet([t('min_fees: ', { color: 'blue', bold: true }), t('Greater-than-or-equal filter on the fee column', { bold: false })]),
    bullet([t('max_fees: ', { color: 'green', bold: true }), t('Less-than-or-equal filter on the fee column', { bold: false })]),
    p('This enables queries like "find all procedures between $50 and $200 that mention MRI" in a single API call. The filtering logic in SubServiceRepo uses direct SQL comparisons rather than the generic applyFilters() helper, because the range filtering pattern (>= / <=) differs from the equality matching used by other modules.'),
    calloutBlue([
      t('💡 Implementation Note: ', { color: 'blue', bold: true }),
      t('The SubServices module is the only module that uses hard delete (DELETE FROM) instead of soft delete (SET deleted_at = NOW()). This is because sub-services are reference data akin to a product catalog — deleting a procedure that is no longer offered is preferable to accumulating obsolete records.'),
    ]),

    divider(),

    // =================== SECTION 4: PERMISSIONS ===================
    h1('🔐 4. Global Permissions & Auth Matrix'),
    grayQuote([t('مصفوفة الصلاحيات — من يمكنه الوصول إلى ماذا', { bold: true, italic: true })]),

    h2('4.1 The Three Auth Levels'),
    p('The API defines three distinct authorization levels, each with progressively broader access:'),

    h3('🟢 Level 1: Public (No Authentication)'),
    p('Public endpoints do not call VerifyToken() at all. They are designed for discovery and browsing — the initial touchpoints for any user interacting with the platform. A guest can browse specialities, search for doctors by speciality or name, view doctor profiles, and check sub-service pricing. These endpoints are heavily cached because they receive the highest traffic volume.'),
    calloutBlue([
      t('💡 Performance: ', { color: 'blue', bold: true }),
      t('Because public endpoints skip token verification entirely, they save ~5-10ms per request on JWT decoding. Combined with Redis caching, public GET requests typically respond in under 2ms.'),
    ]),

    h3('🟡 Level 2: User (Authenticated Patient)'),
    p('User-level endpoints require a valid JWT token. The endpoint calls VerifyToken() which reads the Authorization: Bearer header, decodes the token, verifies the HMAC signature, checks the expiration timestamp, and returns the token payload. If any of these steps fails, the request is terminated with a 401 UNAUTHORIZED response.'),
    p('Once authenticated, users can: create appointments (with their user_id injected from the token), view their own appointment history, and update their profile information. They cannot access other users\' data, create admin accounts, or modify doctors/specialities.'),

    h3('🔴 Level 3: Admin (Superuser)'),
    p('Admin-level endpoints call checkAdminPrivileges(), which internally calls VerifyToken() and then verifies that the decoded token has role === "admin". If the token is valid but the role is not admin, the response is 403 FORBIDDEN. Admins have full CRUD access across all modules: they can create, update, and delete doctors, specialities, sub-services, and patient accounts. They can also view all appointments in the system and change appointment statuses.'),

    h2('4.2 JWT Token Structure'),
    p('The decoded JWT payload contains the following claims:'),
    code(`{
    "user_id": 42,
    "role": "user",
    "iat": 1718745600,
    "exp": 1718832000
}`, 'json'),
    bullet([t('user_id: ', { color: 'blue', bold: true }), t('The primary key of the user in the database. Used to scope queries and inject into new records.', { bold: false })]),
    bullet([t('role: ', { color: 'green', bold: true }), t('Either "user" or "admin". Determines access level for protected endpoints.', { bold: false })]),
    bullet([t('iat: ', { color: 'purple', bold: true }), t('Issued-at timestamp (Unix epoch). Records when the token was created.', { bold: false })]),
    bullet([t('exp: ', { color: 'orange', bold: true }), t('Expiration timestamp (Unix epoch). Tokens expire 24 hours after issuance.', { bold: false })]),

    h2('4.3 Auth Enforcement Matrix'),
    p('The following table shows exactly which endpoints require which auth level:'),
    ...metaTable([
      ['Module', 'GET (List)', 'GET (ById)', 'POST', 'PATCH/PUT', 'DELETE'],
      ['/auth', '—', '—', 'Public', '—', '—'],
      ['/doctors', 'Public', 'Public', 'Admin', 'Admin', 'Admin'],
      ['/appointments', 'Mixed', 'Admin', 'User', 'Admin', '—'],
      ['/patients', 'Admin', 'Admin', '—', 'Admin', 'Admin'],
      ['/specialities', 'Public', 'Public', 'Admin', 'Admin', 'Admin'],
      ['/subservices', 'Public', 'Public', 'Admin', 'Admin', 'Admin']
    ]),

    divider(),

    // =================== SECTION 5: USER FLOWS ===================
    h1('🛤️ 5. In-Depth User Flows & Transaction Patterns'),
    grayQuote([t('سيناريوهات الاستخدام — تتبع رحلة المستخدم خطوة بخطوة', { bold: true, italic: true })]),

    h2('5.1 Flow A: Complete Patient Booking Journey'),
    p('This is the most common user journey — a new patient discovers the platform, browses doctors, authenticates, and books an appointment. The following trace shows every API call and system interaction:'),

    h3('Step 1: Browse Specialities'),
    p('The patient visits the clinic\'s website or mobile app. The frontend loads the list of medical departments:'),
    code(`GET /api.php/specialities
→ Cache miss (first request)
→ SELECT * FROM specialities WHERE deleted_at IS NULL
→ Cache set: specialities:all (TTL: 300s)
→ 200 OK [{id: 1, name: "Cardiology"}, {id: 2, name: "Neurology"}, ...]`),

    h3('Step 2: Filter Doctors'),
    p('The patient selects "Cardiology". The frontend requests doctors filtered by that speciality:'),
    code(`GET /api.php/doctors?spec_id=1
→ Cache key: doctors:filter:spec_id=1
→ Cache miss → SELECT * FROM doctors WHERE spec_id = 1 AND deleted_at IS NULL
→ Cache set → 200 OK [{id: 5, name: "Dr. Smith", rank: "specialist", ...}]`),

    h3('Step 3: View Doctor Profile'),
    p('The patient clicks on Dr. Smith to see full details:'),
    code(`GET /api.php/doctors?id=5
→ Cache key: doctor:id:5
→ Cache hit → 200 OK (served from Redis in ~1ms)`),

    h3('Step 4: User Registration'),
    p('The patient decides to book. Since they are not logged in, they register:'),
    code(`POST /api.php/auth/register
Body: {name: "John Doe", email: "john@example.com", password: "Secure@123",
       age: 30, gender: "male", phone: "+201234567890", role: "user"}
→ Validation: email ✓, password ✓, age ✓, gender ✓, role ✓
→ Duplicate check: email ✗ (no duplicate), phone ✗ (no duplicate)
→ Password hash (bcrypt)
→ INSERT INTO users
→ Generate JWT token
→ 201 CREATED {token: "eyJ..."}`),

    h3('Step 5: Book Appointment'),
    p('Now authenticated, the patient books an appointment with Dr. Smith:'),
    code(`POST /api.php/appointments
Auth: Bearer eyJ...
Body: {doc_id: 5, date_time: "2026-06-20 10:00:00", status: "pending"}
→ VerifyToken() → user_id: 42, role: "user"
→ Validation: doc_id numeric ✓, date_time regex ✓, status=pending ✓
→ user_id injected from JWT (42), NOT from body
→ INSERT INTO appointments (user_id=42, doc_id=5, ...)
→ 201 CREATED {id: 101, doc_id: 5, date_time: "2026-06-20 10:00:00", status: "pending"}`),

    h3('Step 6: View My Appointments'),
    p('The patient checks their upcoming appointments:'),
    code(`GET /api.php/appointments
Auth: Bearer eyJ...
→ VerifyToken() → role: "user"
→ Row-level filter: WHERE user_id = 42
→ 200 OK [{id: 101, doc_id: 5, date_time: "2026-06-20 10:00:00", status: "pending"}]`),

    h2('5.2 Flow B: Admin Workflow — Price Update'),
    p('The clinic administrator needs to update the price of an MRI scan:'),

    h3('Step 1: Admin Login'),
    code(`POST /api.php/auth/login
Body: {email: "admin@clinic.com", password: "Admin@123"}
→ password_verify ✓
→ GenerateToken → role: "admin"
→ 200 OK {token: "eyJ..."}`),

    h3('Step 2: Update SubService Price'),
    code(`PATCH /api.php/subservices?id=7
Auth: Bearer eyJ... (admin token)
Body: {fees: 600}
→ checkAdminPrivileges() → role === "admin" ✓
→ getRequiredId() → id = 7 ✓
→ validateSubServiceData() → fees = 600, numeric, positive ✓
→ UPDATE sub_services SET fees = 600 WHERE id = 7
→ Cache flush: subservices:* pattern
→ 200 OK "SubService updated successfully"`),

    h3('Step 3: Verify Public Visibility'),
    p('A public user immediately sees the updated price because the cache was flushed:'),
    code(`GET /api.php/subservices?id=7
→ Cache miss (just flushed)
→ SELECT * FROM sub_services WHERE id = 7 → fees = 600
→ Cache set: subservice:id:7
→ 200 OK {id: 7, name: "MRI Brain", fees: 600}`),

    h2('5.3 Flow C: Password Recovery'),
    p('A patient forgets their password and initiates recovery:'),

    h3('Step 1: Request Reset'),
    code(`POST /api.php/auth/forgot-password
Body: {email: "john@example.com"}
→ Email validation ✓
→ bin2hex(random_bytes(32)) → token = "a1b2c3...64chars..."
→ Store token in reset_tokens table
→ sendResetEmail("john@example.com", token) → simulated
→ 200 OK "If this email is registered, a reset token has been sent."`),

    h3('Step 2: Reset Password'),
    p('The patient clicks the link in their email and submits the new password:'),
    code(`POST /api.php/auth/reset-password
Body: {email: "john@example.com", token: "a1b2c3...", new_password: "NewSecure@456"}
→ Token exists? ✓ → Token matches? ✓
→ validatePasswordStrength("NewSecure@456") ✓
→ password_hash("NewSecure@456") → new bcrypt hash
→ UPDATE users SET password = new_hash WHERE email = "john@example.com"
→ DELETE reset token
→ 200 OK "Password reset successfully."`),

    divider(),

    // =================== SECTION 6: MASTER ROUTER ===================
    h1('💻 6. Code Walkthrough — The Master Router (api.php)'),
    grayQuote([t('شرح كود الموجّه الرئيسي — كيف تصل الطلبات إلى وجهاتها', { bold: true, italic: true })]),

    h2('6.1 Why a Single Entry Point?'),
    p('Traditional PHP applications use separate PHP files for each endpoint — create_doctor.php, list_appointments.php, delete_patient.php. This approach scatters routing logic across dozens of files, making it difficult to audit, secure, and maintain. Doctorna rejects this in favor of a single entry point pattern inspired by modern frameworks like Laravel and Symfony.'),
    p('All HTTP requests are directed to routes/api.php through server configuration (Apache .htaccess or Nginx configuration). The file acts as a front controller: it parses the URL, determines the module and action, and dispatches to the appropriate controller function. This provides several benefits:'),
    bullet([t('Centralized logging: ', { color: 'blue', bold: true }), t('Every request passes through a single file, making it trivial to add request/response logging or metrics collection.', { bold: false })]),
    bullet([t('Consistent error handling: ', { color: 'green', bold: true }), t('Unrecognized routes are caught by the default case in the switch statement, returning a clean 404 JSON response instead of a PHP file-not-found error.', { bold: false })]),
    bullet([t('Simplified security: ', { color: 'orange', bold: true }), t('Authentication and CORS headers can be applied at the entry point level before any controller logic executes.', { bold: false })]),
    bullet([t('Deployment simplicity: ', { color: 'purple', bold: true }), t('A single .htaccess rule sends all traffic to api.php, eliminating complex rewrite configurations.', { bold: false })]),

    h2('6.2 URL Parsing Engine — Complete Analysis'),
    p('The URL parsing logic handles the diversity of PHP server configurations. Some servers populate $_SERVER[\'PATH_INFO\'] automatically (Apache with AcceptPathInfo), while others (Nginx, some XAMPP configurations) do not. The fallback logic calculates the path manually:'),
    code(`// Step 1: Extract the HTTP method
$method = $_SERVER["REQUEST_METHOD"];
// → "GET", "POST", "PUT", "PATCH", or "DELETE"

// Step 2: Extract the path after /api.php
$path = $_SERVER['PATH_INFO']
    ?? str_replace(                          // Fallback for Nginx/XAMPP
        $_SERVER['SCRIPT_NAME'], '',         // Remove "/api.php" from the URI
        parse_url(                            // Parse the full URI
            $_SERVER['REQUEST_URI'],
            PHP_URL_PATH                      // Get only the path, not query string
        )
    );

// Step 3: Clean and split
$path = trim($path, '/');       // Remove leading/trailing slashes
$segments = explode('/', $path); // ["auth", "login"] or ["doctors"] or empty

// Step 4: Extract module and action
$module = strtolower($segments[0] ?? '');    // "auth", "doctors", etc.
$action = strtolower($segments[1] ?? '');    // "login", "5", or empty`),

    calloutBlue([
      t('💡 The RESTful ID Trick: ', { color: 'blue', bold: true }),
      t('This is an elegant solution to a common routing problem. When a URL like /api.php/doctors/5 is requested, the parser sets $action = "5". The numeric check then assigns $_GET[\'id\'] = 5, which the controller\'s existing getRequiredId() function can use without modification. This means both /api.php/doctors?id=5 and /api.php/doctors/5 work identically.'),
    ]),
    code(`// Step 5: The RESTful ID Trick
if (is_numeric($action)) {
    $_GET['id'] = $action;
    $action = ''; // Clear action since it's actually an ID
}`),

    h2('6.3 The Master Switch — Complete Dispatch Logic'),
    p('The switch statement is the heart of the router. Each case corresponds to a module, with aliases for singular/plural variations:'),
    code(`switch ($module) {
    // --- Authentication (POST only) ---
    case 'auth':
        if ($method !== 'POST') methodNotAllowed();
        switch ($action) {
            case 'login':           handleLogin($conn); break;
            case 'register':        handleRegister($conn); break;
            case 'forgot-password': handleForgotPassword($conn); break;
            case 'reset-password':  handleResetPassword($conn); break;
            default: response(HttpStatus('NOT_FOUND'),
                "Auth Endpoint Not Found");
        }
        break;

    // --- Doctors (plural + singular alias) ---
    case 'doctors':
    case 'doctor':
        switch ($method) {
            case 'GET':
                isset($_GET['id'])
                    ? handleGetDoctorById($conn)
                    : handleGetAllDoctors($conn);
                break;
            case 'POST':    handleCreateDoctor($conn); break;
            case 'PUT':
            case 'PATCH':   handleUpdateDoctor($conn); break;
            case 'DELETE':  handleDeleteDoctor($conn); break;
            default:        methodNotAllowed();
        }
        break;

    // --- Appointments ---
    case 'appointments':
    case 'appointment':
        switch ($method) {
            case 'GET':     isset($_GET['id'])
                ? handleGetAppointmentById($conn)
                : handleGetAllAppointments($conn); break;
            case 'POST':    handleCreateAppointment($conn); break;
            case 'PUT':
            case 'PATCH':   handleUpdateAppointment($conn); break;
            default:        methodNotAllowed();
        }
        break;
}`),

    p('The second half of the switch handles the remaining three modules:'),

    code(`switch ($module) {
    // --- Patients ---
    case 'patients':
    case 'patient':
        switch ($method) {
            case 'GET':     isset($_GET['id'])
                ? handleGetPatientById($conn)
                : handleGetAllPatients($conn); break;
            case 'PUT':
            case 'PATCH':   handleUpdatePatient($conn); break;
            case 'DELETE':  handleDeletePatient($conn); break;
            default:        methodNotAllowed();
        }
        break;

    // --- Specialities ---
    case 'specialities':
    case 'speciality':
        switch ($method) {
            case 'GET':     isset($_GET['id'])
                ? handleGetSpecialityById($conn)
                : handleGetAllSpecialities($conn); break;
            case 'POST':    handleCreateSpeciality($conn); break;
            case 'PUT':
            case 'PATCH':   handleUpdateSpeciality($conn); break;
            case 'DELETE':  handleDeleteSpeciality($conn); break;
            default:        methodNotAllowed();
        }
        break;

    // --- SubServices (3 URL aliases) ---
    case 'subservices':
    case 'subservice':
    case 'sub-services':
        switch ($method) {
            case 'GET':     isset($_GET['id'])
                ? handleGetSubServiceById($conn)
                : handleGetAllSubServices($conn); break;
            case 'POST':    handleCreateSubService($conn); break;
            case 'PUT':
            case 'PATCH':   handleUpdateSubService($conn); break;
            case 'DELETE':  handleDeleteSubService($conn); break;
            default:        methodNotAllowed();
        }
        break;

    // --- 404 Fallback ---
    default:
        response(HttpStatus('NOT_FOUND'),
            "API Module Not Found");
        break;
}`),

    h2('6.4 The methodNotAllowed() Helper'),
    p('When a request uses an HTTP method that is not supported by a module, the methodNotAllowed() function is called. This provides three layers of protection:'),
    code(`function methodNotAllowed() {
    response(HttpStatus('METHOD_NOT_ALLOWED'),
        "Method Not Allowed.");
}
// Output: {"status_code": 405, "message": "Method Not Allowed.", "data": null}`),
    bullet([t('Layer 1 — Module-level guard: ', { color: 'blue', bold: true }), t('The outer switch only routes known modules. Unknown modules like /api.php/hackers hit the default case with 404.', { bold: false })]),
    bullet([t('Layer 2 — Method-level guard: ', { color: 'green', bold: true }), t('Each module\'s inner switch only handles allowed methods. A DELETE on /auth hits the default case returning 405.', { bold: false })]),
    bullet([t('Layer 3 — Action-level guard: ', { color: 'orange', bold: true }), t('Auth module validates actions. POST /api.php/auth/delete-user hits the default case returning 404.', { bold: false })]),

    divider(),

    // =================== SECTION 7: ERROR HANDLING ===================
    h1('❌ 7. Standardized Error Handling Patterns'),
    grayQuote([t('معالجة الأخطاء — كل خطأ له رمز ورسالة موحدة', { bold: true, italic: true })]),

    h2('7.1 HTTP Status Code Catalog'),
    p('The API uses a consistent set of HTTP status codes mapped through the HttpStatus() helper:'),
    ...metaTable([
      ['Constant', 'Code', 'Usage'],
      ['OK', '200', 'Successful GET and POST operations'],
      ['CREATED', '201', 'Successful resource creation (register, new doctor)'],
      ['BAD_REQUEST', '400', 'Validation failures (invalid email, weak password, missing fields)'],
      ['UNAUTHORIZED', '401', 'Missing/invalid/expired JWT token'],
      ['FORBIDDEN', '403', 'Valid token but insufficient role (non-admin trying admin action)'],
      ['NOT_FOUND', '404', 'Resource not found (unknown module, non-existent user)'],
      ['METHOD_NOT_ALLOWED', '405', 'Wrong HTTP method for endpoint'],
      ['GONE', '410', 'Expired password reset token'],
      ['CONFLICT', '409', 'Duplicate email or phone during registration'],
      ['INTERNAL_SERVER_ERROR', '500', 'Unexpected server-side failure']
    ]),

    h2('7.2 Error Response Format'),
    p('All error responses follow the exact same JSON signature as successful responses, making frontend error handling uniform:'),
    code(`// Validation Error (400):
{
    "status_code": 400,
    "message": "Invalid email format. Please enter a valid one.",
    "data": null
}

// Auth Error (401):
{
    "status_code": 401,
    "message": "Wrong Password !",
    "data": null
}

// Permission Error (403):
{
    "status_code": 403,
    "message": "You do not have admin privileges.",
    "data": null
}`),

    h2('7.3 Error Propagation Pattern'),
    p('Validation errors are thrown from guard functions using the response() helper, which immediately terminates execution with exit(). This means validation errors never bubble up through try/catch blocks — they are intentionally fatal to prevent the controller from processing invalid data:'),
    code(`function validateDoctorData($data, $isUpdate = false) {
    if (!$isUpdate && empty($data['email'])) {
        response(HttpStatus('BAD_REQUEST'),
            "Email is required.");
        // exit() is called inside response() — code stops here
    }
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        response(HttpStatus('BAD_REQUEST'),
            "Invalid email format.");
    }
    // If we reach here, validation passed
}`),
    calloutOrange([
      t('🚨 Design Decision: ', { color: 'orange', bold: true }),
      t('Using response() + exit() for validation is intentional. It prevents the "zombie code" problem where validation fails but execution continues in unexpected ways. The trade-off is that validators must be called before any database writes — which is enforced by convention at the top of every handler function.'),
    ]),

    divider(),

    // =================== SECTION 8: CACHING ===================
    h1('⚡ 8. High-Performance Caching Architecture'),
    grayQuote([t('التخزين المؤقت — كل طلب GET مخزّن في Redis', { bold: true, italic: true })]),

    h2('8.1 Cache Key Design'),
    p('Cache keys follow a consistent namespace pattern: {module}:{scope}:{identifier}. This hierarchical structure enables efficient wildcard deletion when data changes:'),
    ...metaTable([
      ['Pattern', 'Example', 'Cleared On'],
      ['{module}:all', 'doctors:all, specialities:all', 'Any POST/PUT/DELETE'],
      ['{module}:id:{id}', 'doctor:id:5, speciality:id:3', 'PATCH/DELETE on that ID'],
      ['{module}:filter:{params}', 'doctors:filter:spec_id=1&gender=female', 'Any POST/PUT/DELETE'],
      ['{module}:filter:{name}', 'subservices:filter:min_fees=50&name=mri', 'Any POST/PUT/DELETE']
    ]),

    h2('8.2 Cache Flow for GET Requests'),
    p('Every GET request follows this exact flow, implemented in each Controller\'s list and detail handlers:'),
    code(`function handleGetAllDoctors($conn) {
    // 1. Build the cache key from URL parameters
    $cacheKey = generateFilteredCacheKey('doctors',
        ['gender', 'spec_id', 'rank', 'name', 'is_available']);

    // 2. Check Redis — return immediately if cached
    serveFromCacheIfAvailable($cacheKey, "Doctors fetched successfully");

    // 3. Cache miss — execute database query
    $filters = applyFilters(
        "SELECT * FROM doctors WHERE deleted_at IS NULL",
        ['gender', 'spec_id', 'rank', 'name', 'is_available']
    );
    $doctors = getAllDoctors($conn, $filters);

    // 4. Store in Redis for 300 seconds
    setCache($cacheKey, $doctors, 300);

    // 5. Return response
    response(HttpStatus('OK'), "Doctors fetched successfully", $doctors);
}`),

    h2('8.3 Cache Invalidation Strategy'),
    p('The golden rule of caching is: "There are only two hard things in computer science: cache invalidation and naming things." Doctorna uses a simple but effective approach — namespace-based wildcard deletion:'),
    code(`function clearDoctorCache($id = null) {
    global $redis;
    // Delete all doctor-related cache keys
    $keys = $redis->keys('doctors:*');
    if (!empty($keys)) {
        $redis->del($keys);
    }
    // Also delete the specific doctor's cache
    if ($id) {
        $redis->del("doctor:id:{$id}");
    }
}`),
    calloutBlue([
      t('💡 Performance Note: ', { color: 'blue', bold: true }),
      t('Redis KEYS command is used here for simplicity. In production with very large datasets (millions of keys), SCAN should be used instead to avoid blocking Redis. For Doctorna\'s expected scale (< 10,000 keys), KEYS is acceptable.'),
    ]),

    h2('8.4 Cache Key Generation — Deterministic Ordering'),
    p('The generateFilteredCacheKey() function solves a subtle but important problem: URL parameter ordering. The URLs ?gender=female&rank=specialist and ?rank=specialist&gender=female represent the same query but would generate different cache keys without sorting:'),
    code(`function generateFilteredCacheKey($prefix, $allowedFilters) {
    $filterParts = [];

    // Only consider allowed filter parameters
    foreach ($allowedFilters as $filter) {
        if (isset($_GET[$filter]) && $_GET[$filter] !== '') {
            $filterParts[$filter] = $_GET[$filter];
        }
    }

    // Sort alphabetically for deterministic keys
    ksort($filterParts);

    // Build the key
    $queryString = http_build_query($filterParts);
    return $queryString
        ? "{$prefix}:filter:{$queryString}"
        : "{$prefix}:all";
}`),

    divider(),

    // =================== SECTION 9: SECURITY ===================
    h1('🛡️ 9. Security Model — Defense in Depth'),
    grayQuote([t('نموذج الأمان — حماية متعددة الطبقات', { bold: true, italic: true })]),

    h2('9.1 Layer 1: SQL Injection Prevention'),
    p('All database queries use PDO prepared statements with named parameters. User input is never concatenated into SQL strings:'),
    code(`// SECURE — Always use named parameters
$stmt = runQuery($conn,
    "SELECT * FROM users WHERE email = :email AND role = :role",
    ['email' => $email, 'role' => 'user']
);

// INSECURE — Never do this
// $stmt = $conn->query("SELECT * FROM users WHERE email = '$email'");`),

    calloutOrange([
      t('🚨 Absolute Rule: ', { color: 'orange', bold: true }),
      t('Raw query string concatenation with user input is strictly forbidden. The runQuery() helper enforces named parameter binding and is the ONLY approved method for database operations.'),
    ]),

    h2('9.2 Layer 2: JWT Token Security'),
    p('The JWT implementation provides three security guarantees:'),
    bullet([t('Integrity: ', { color: 'blue', bold: true }), t('The HMAC-SHA256 signature prevents token tampering. If an attacker modifies the payload (e.g., changing role from "user" to "admin"), the signature verification fails.', { bold: false })]),
    bullet([t('Expiration: ', { color: 'green', bold: true }), t('Tokens expire after 24 hours. Expired tokens are rejected with 401 UNAUTHORIZED, forcing re-authentication.', { bold: false })]),
    bullet([t('Statelessness: ', { color: 'purple', bold: true }), t('No session storage means no session hijacking. Each request independently proves its authenticity.', { bold: false })]),

    h2('9.3 Layer 3: Input Validation'),
    p('Every input field is validated before use:'),
    bullet([t('Email: ', { color: 'purple', bold: true }), t('filter_var($email, FILTER_VALIDATE_EMAIL) rejects malformed addresses', { bold: false })]),
    bullet([t('Numbers: ', { color: 'purple', bold: true }), t('is_numeric() + range checks prevent SQL injection and business logic errors', { bold: false })]),
    bullet([t('Enums: ', { color: 'purple', bold: true }), t('in_array() against whitelists ensures only valid statuses, genders, and roles', { bold: false })]),
    bullet([t('Strings: ', { color: 'purple', bold: true }), t('empty() checks prevent null/empty required fields', { bold: false })]),

    h2('9.4 Layer 4: Role-Based Access Control'),
    p('The checkAdminPrivileges() function is the gatekeeper for all admin operations. It is called at the top of every admin-only handler, before any business logic:'),
    code(`function handleCreateDoctor($conn) {
    // Gatekeeper — must be first
    checkAdminPrivileges();

    // Only reaches here if token role === "admin"
    $data = getJsonInput([...]);
    validateDoctorData($data);
    createDoctor($conn, $data);
    clearDoctorCache();
    response(HttpStatus('CREATED'), "Doctor created successfully");
}`),

    h2('9.5 Layer 5: Request-Body Independence'),
    p('The most subtle security feature is the separation of JWT identity from request body data. When creating appointments, the user_id is extracted from the token, not the body. This means even if an attacker crafts a request with a different user_id, the system uses the authenticated identity:'),
    code(`function handleCreateAppointment($conn) {
    $token = VerifyToken();
    $data = getJsonInput(['doc_id', 'date_time', 'status']);

    // CRITICAL: user_id comes from JWT, never from body
    $data['user_id'] = $token->user_id;

    // Any 'user_id' in the original $data is now overwritten
    createAppointment($conn, $data);
}`),

    divider(),

    // =================== SECTION 10: DATABASE SCHEMA ===================
    h1('🗄️ 10. Database Schema & Relationship Design'),
    grayQuote([t('تصميم قاعدة البيانات — الجداول والعلاقات', { bold: true, italic: true })]),

    h2('10.1 Entity Relationship Overview'),
    p('The database consists of 5 core tables with the following relationships:'),
    bullet([t('users — ', { color: 'blue', bold: true }), t('Central identity table. Stores patients (role=user) and administrators (role=admin). Has a one-to-many relationship with appointments.', { bold: false })]),
    bullet([t('doctors — ', { color: 'green', bold: true }), t('Medical staff directory. Has a many-to-one relationship with specialities (spec_id), and a one-to-many relationship with appointments.', { bold: false })]),
    bullet([t('specialities — ', { color: 'purple', bold: true }), t('Department categories. One speciality can have many doctors.', { bold: false })]),
    bullet([t('appointments — ', { color: 'orange', bold: true }), t('Booking records. Links users (as patients) to doctors at specific date/times with a status field.', { bold: false })]),
    bullet([t('sub_services — ', { color: 'red', bold: true }), t('Medical procedures catalog. Standalone table with no current foreign key relationships (future M:N with doctors planned).', { bold: false })]),

    h2('10.2 Complete Table Definitions'),
    h3('users'),
    code(`CREATE TABLE users (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    age        INT NOT NULL,
    gender     ENUM('male', 'female') NOT NULL,
    phone      VARCHAR(50) NOT NULL UNIQUE,
    role       ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_deleted (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`),

    h3('doctors'),
    code(`CREATE TABLE doctors (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(255) NOT NULL,
    email        VARCHAR(255) NOT NULL UNIQUE,
    phone        VARCHAR(50) NOT NULL,
    gender       ENUM('male', 'female') NOT NULL,
    spec_id      INT NOT NULL,
    rank         VARCHAR(100) NOT NULL,
    fees         DECIMAL(10,2) NOT NULL,
    is_available TINYINT(1) DEFAULT 1,
    deleted_at   TIMESTAMP NULL DEFAULT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (spec_id) REFERENCES specialities(id),
    INDEX idx_spec (spec_id),
    INDEX idx_gender (gender),
    INDEX idx_rank (rank),
    INDEX idx_available (is_available),
    INDEX idx_deleted (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`),

    h3('specialities'),
    code(`CREATE TABLE specialities (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_deleted (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`),

    h3('appointments'),
    code(`CREATE TABLE appointments (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    doc_id     INT NOT NULL,
    date_time  DATETIME NOT NULL,
    status     ENUM('pending', 'confirmed', 'cancelled', 'completed')
               NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (doc_id) REFERENCES doctors(id),
    INDEX idx_user (user_id),
    INDEX idx_doctor (doc_id),
    INDEX idx_status (status),
    INDEX idx_datetime (date_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`),

    h3('sub_services'),
    code(`CREATE TABLE sub_services (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    fees        DECIMAL(10,2) NOT NULL,
    description TEXT DEFAULT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_fees (fees)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`),

    h2('10.3 Soft Delete Pattern'),
    p('Four of the five tables (users, doctors, specialities, appointments) use soft deletion. Instead of removing records permanently, they set a deleted_at timestamp. All read queries include WHERE deleted_at IS NULL to filter out deleted records. This pattern provides:'),
    bullet([t('Audit trail: ', { color: 'blue', bold: true }), t('Deleted records remain in the database for forensic analysis.', { bold: false })]),
    bullet([t('Referential integrity: ', { color: 'green', bold: true }), t('Foreign key constraints remain satisfied because the record still exists.', { bold: false })]),
    bullet([t('Undo capability: ', { color: 'purple', bold: true }), t('An admin can restore a deleted record by setting deleted_at = NULL.', { bold: false })]),
    p('The exception is sub_services, which uses hard DELETE. This is because sub-services are reference data — once a procedure is removed from the catalog, there is no business need to retain it.'),

    divider(),

    // =================== SECTION 11: TESTING ===================
    h1('🧪 11. Testing Strategy & API Verification'),
    grayQuote([t('استراتيجية الاختبار — ضمان جودة API', { bold: true, italic: true })]),

    h2('11.1 Testing Layers'),
    p('The API testing strategy covers three layers:'),

    h3('Layer 1: Unit Testing (Validation Guards)'),
    p('Each validation guard function can be tested in isolation with known inputs:'),
    code(`// Test validatePasswordStrength()
// Should pass:
validatePasswordStrength("Secure@123");  // 8+ chars, upper, lower, number, special

// Should fail (400 BAD_REQUEST):
validatePasswordStrength("weak");        // too short, no upper, no number, no special
validatePasswordStrength("ONLYUPPER@1"); // no lowercase
validatePasswordStrength("onlylower@1"); // no uppercase
validatePasswordStrength("NoSpecialChar1"); // no special character`),

    h3('Layer 2: Integration Testing (API Endpoints)'),
    p('Each endpoint should be tested with valid and invalid inputs to verify status codes and response shapes:'),
    code(`// POST /api.php/auth/register — Valid registration
→ 201 {status_code: 201, message: "...", data: {token: "..."}}

// POST /api.php/auth/register — Duplicate email
→ 409 {status_code: 409, message: "Email Already Exists !", data: null}

// POST /api.php/auth/register — Weak password
→ 400 {status_code: 400, message: "Password must be...", data: null}

// GET /api.php/doctors — Without auth
→ 200 (public endpoint, no token needed)

// POST /api.php/doctors — Without auth
→ 401 Unauthorized (token required)

// POST /api.php/doctors — With user token (not admin)
→ 403 Forbidden (admin only)`),

    h3('Layer 3: End-to-End Flow Testing'),
    p('Test complete user journeys:'),
    num([t('Register a new user')]),
    num([t('Use the returned JWT to book an appointment')]),
    num([t('Verify the appointment appears in the user\'s list')]),
    num([t('Login as admin and verify the appointment appears in the full schedule')]),
    num([t('Update the appointment status as admin')]),
    num([t('Verify the user can see the updated status')]),

    divider(),

    // =================== SECTION 12: DEPLOYMENT ===================
    h1('🚀 12. Deployment & Configuration Guide'),
    grayQuote([t('دليل النشر — تشغيل API في الإنتاج', { bold: true, italic: true })]),

    h2('12.1 Server Requirements'),
    bullet([t('PHP 8.0 or higher', { bold: false })]),
    bullet([t('MySQL 5.7+ or MariaDB 10.3+', { bold: false })]),
    bullet([t('Redis 6.0+ (for caching layer)', { bold: false })]),
    bullet([t('Apache mod_rewrite or Nginx config', { bold: false })]),
    bullet([t('PHP extensions: pdo_mysql, redis, mbstring, json', { bold: false })]),

    h2('12.2 Environment Configuration'),
    p('All environment-specific settings are in config/database.php:'),
    code(`define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'doctorna');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'your-secret-key-here');
define('REDIS_HOST', getenv('REDIS_HOST') ?: '127.0.0.1');
define('REDIS_PORT', getenv('REDIS_PORT') ?: 6379);`),

    calloutBlue([
      t('💡 Environment Variables: ', { color: 'blue', bold: true }),
      t('In production, all credentials should be set via environment variables, never hardcoded. The getenv() fallbacks provide sensible defaults for local development.'),
    ]),

    h2('12.3 Apache htaccess Configuration'),
    p('For Apache, the .htaccess file in the project root rewrites all requests to api.php:'),
    code(`RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ routes/api.php [QSA,L]`),

    h2('12.4 Nginx Configuration'),
    p('For Nginx, the equivalent configuration in the server block:'),
    code(`location / {
    try_files $uri $uri/ /routes/api.php?$query_string;
}

location ~ \.php$ {
    fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
    fastcgi_index api.php;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include fastcgi_params;
}`),

    h2('12.5 Production Checklist'),
    bullet([t('Set strong JWT_SECRET via environment variable (min 32 chars)', { color: 'orange', bold: true })]),
    bullet([t('Configure Redis password for secure connections', { bold: false })]),
    bullet([t('Enable HTTPS with valid SSL certificate', { bold: false })]),
    bullet([t('Set appropriate CORS headers in production', { bold: false })]),
    bullet([t('Configure rate limiting at the web server level', { bold: false })]),
    bullet([t('Set up database connection pooling for high traffic', { bold: false })]),
    bullet([t('Implement request logging to a centralized service', { bold: false })]),
    bullet([t('Set up monitoring alerts for 5xx errors and slow queries', { bold: false })]),

    // =================== CLOSING ===================
    divider(),
    calloutTarget([
      t('🎯 Architecture Summary: ', { color: 'blue', bold: true }),
      t('The Doctorna API is a modular, caching-first, security-hardened backend designed for medical booking. Its 24 endpoints across 6 modules serve approximately 150 lines of controller code, 100 lines of repository code, and 50 lines of validation logic — totaling ~1,500 lines of pure PHP, zero framework overhead, and complete testability.'),
    ]),
    calloutBook([
      t('📚 Continue Reading: ', { bold: true }),
      t('Proceed to Phase 2 for the complete Helper Ecosystem reference, or jump to Phases 3-6 for detailed module-specific documentation.'),
    ]),

  ]; // end blocks

  // Create the page
  const page = await req('POST', '/pages', JSON.stringify({
    parent: { page_id: PARENT },
    icon: { type: 'emoji', emoji: '🏗️' },
    properties: { title: { title: [{ text: { content: '🏗️ Phase 1 — Project Overview & Master Architecture' } }] } }
  }));
  console.log(`Created Phase 1: ${page.id}`);

  // Append blocks
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
