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
  // Archive existing Arabic Phase 1 if exists
  const existing = await req('GET', `/blocks/${PARENT}/children?page_size=50`);
  for (const b of existing.results) {
    if (b.type === 'child_page' && b.child_page.title.includes('مصري')) {
      await req('PATCH', `/pages/${b.id}`, JSON.stringify({ archived: true }));
      console.log(`Archived old: ${b.child_page.title}`);
    }
  }

  const blocks = [
    ...metaTable([
      ['الخاصية', 'القيمة'],
      ['المؤلف', 'فريق المعمارية'],
      ['الحالة', '🟢 موحد ونشط'],
      ['الإصدار', 'v2.0 — بعد توحيد القاعدة'],
      ['الوحدة', 'المعمارية الأساسية والنظام البيئي'],
      ['وسوم', 'Architecture, Routing, Permissions, Caching, Security'],
      ['عدد Endpoints', '24 (6 وحدات × 4 طرق)'],
      ['الكاشينج', 'Redis (كل طلبات GET)'],
      ['المصادقة', 'JWT (JSON Web Tokens) بدون حالة'],
      ['قاعدة البيانات', 'MySQL عبر PDO مع named parameters']
    ]),

    divider(),
    h1('📑 جدول المحتويات'),
    toggle([t('📑 اضغط عشان توسع — هيكل المستند الكامل')]),
    bullet([t('القسم ١: '), t('رؤية المشروع والأهداف الاستراتيجية', { color: 'blue', bold: true })]),
    bullet([t('القسم ٢: '), t('حزمة التقنيات وفلسفة المعمارية', { color: 'blue', bold: true })]),
    bullet([t('القسم ٣: '), t('النظام البيئي للست وحدات', { color: 'blue', bold: true })]),
    bullet([t('القسم ٤: '), t('مصفوفة الصلاحيات والمصادقة', { color: 'blue', bold: true })]),
    bullet([t('القسم ٥: '), t('سيناريوهات المستخدمين بالتفصيل', { color: 'blue', bold: true })]),
    bullet([t('القسم ٦: '), t('الراوتر الرئيسي (api.php)', { color: 'blue', bold: true })]),
    bullet([t('القسم ٧: '), t('معالجة الأخطاء الموحدة', { color: 'blue', bold: true })]),
    bullet([t('القسم ٨: '), t('التخزين المؤقت (Caching)', { color: 'blue', bold: true })]),
    bullet([t('القسم ٩: '), t('نموذج الأمان', { color: 'blue', bold: true })]),
    bullet([t('القسم ١٠: '), t('تصميم قاعدة البيانات', { color: 'blue', bold: true })]),
    bullet([t('القسم ١١: '), t('استراتيجية الاختبار', { color: 'blue', bold: true })]),
    bullet([t('القسم ١٢: '), t('دليل النشر', { color: 'blue', bold: true })]),

    divider(),
    h1('🎯 ١. رؤية المشروع والأهداف الاستراتيجية'),
    grayQuote([t('الرؤية العامة — تحويل عيادة تقليدية إلى منصة حجز ذكية', { bold: true, italic: true })]),

    h2('١.١ المشكلة اللي بنحلها'),
    p('قطاع الرعاية الصحية عانى سنين طويلة من أنظمة حجز متفرقة ومش مظبوطة. المرضى بيلفوا بين مكالمات التليفون وأجندات ورقية ومنصات تانية مش موثوقة عشان يحجزوا مواعيد مع الدكاترة. إداريين العيادات بيضيعوا ساعات بالمئات في إدخال بيانات يدوي وسجلات متكررة وتنسيق بين أنظمة مختلفة. وعلشان كده اتعملت Doctorna API: تكون backend موحد وبرمجي، أي frontend — ويب أو موبايل أو كشك — يقدر يتعامل معاها ويقدم تجربة حجز طبي سلسة.'),
    p('الأنظمة القديمة لإدارة العيادات كتير منها كانت monolithic، يعني منطق البيزنس متشابك مع طبقة قاعدة البيانات. ده بيسبب كوابيس صيانة: أي تغيير بسيط بيأثر بشكل غير متوقع في كل حتة، الاختبار بيبقى مستحيل، وتعيين مطورين جداد بياخد أسابيع بدل ساعات. Doctorna رافضة النهج ده تمامًا.'),
    calloutTarget([
      t('المهمة الأساسية: ', { color: 'blue', bold: true }),
      t('بناء منصة حجز طبي modular و API-first، كل مكون ليه مسؤولية واحدة، كل endpoint ممكن يتخزن في cache، والأمان متغرس في كل طبقة، والنظام كله يقدر أي مطور يفهمه ويعدل فيه في دقايق.'),
    ]),

    h2('١.٢ الأهداف الاستراتيجية'),
    p('المعمارية اتبنت على خمس مبادئ غير قابلة للتفاوض أثّرت على كل قرار من الراوتينج لحد الكاشينج:'),

    h3('الهدف أ: فصل صارم للمسؤوليات (Separation of Concerns)'),
    p('نمط MVC التقليدي اتعدل هنا لنسخة أنسب لتطوير API. بدل طبقة "Model" واحدة، قسمنا الوصول للبيانات لـ Repository classes مخصصة، والمنطق بتاع البيزنس لـ Controller functions. طبقة الراوتينج (api.php) مجرد شرطي مرور — بتقرأ الـ URL، تحدد أنهي Controller، وتبعت connection الداتابيز. Controllers مبتلمسش SQL مباشر. Repositories مبتنسقش HTTP responses.'),
    p('الفصل ده معناه إن لو الفريق قرر يهاجر من MySQL لـ PostgreSQL، بس الـ Repositories هي اللي هتتغير. لو عاوزين نغير صيغة الاستجابة من JSON لحاجة تانية، بس مساعد الـ response هو اللي هيتغير. الـ modularity مش مفروضة بالاتفاق لكن بغياب أي imports بين الطبقات — الـ Controller ببساطة ميقدرش يعمل query مباشر لأنه مش معاه PDO خالص.'),

    h3('الهدف ب: كاشينج عالي الأداء'),
    p('عرض الدكاترة والتخصصات والخدمات الفرعية ده محتوى كتير قراءته عالية. المرضى بيتصفحوا profiles أكتر بكتير من ما الإداريين يعدلوا عليها. كل ميلي ثانية تأخير في استجابة API بتترجم مباشرة لتجربة مستخدم وحشة، خصوصاً على شبكات الموبايل.'),
    p('الحل هو استخدام Redis بشكل aggressive على مستوى الـ endpoint. كل طلب GET بيفتش في Redis الأول على cached response. لو المفتاح موجود، الـ API بيرجع البيانات في حوالي ١ ميلي ثانية من غير ما يلمس MySQL. لو مش موجود، الاستعلام بينفذ عادي والنتيجة بتتخزن في Redis مع TTL.'),
    p('استراتيجية إبطال الكاش (cache invalidation) مهمة جداً. أي عملية POST/PUT/PATCH/DELETE — بغض النظر عن الموديول — بتعمل flush للكاش بتاع الموديول ده. ده بيضمن إن البيانات القديمة متظهرش أبداً للمستخدمين.'),

    h3('الهدف ج: أمان JWT بدون حالة (Stateless)'),
    p('الـ API بيرفض استخدام جلسات PHP ($_SESSION) وتخزين التوكنز في السيرفر. كل طلب authenticated بيحمل JWT في هيدر Authorization. التوكن موقع cryptographically وبيحتوي على user_id و role (user/admin). السيرفر بيتأكد من توقيع التوكن في كل endpoint محمي من غير ما يرجع لقاعدة البيانات.'),
    p('النهج الـ stateless ده بيسمح بالتوسع الأفقي: لو الـ traffic زاد، بنقدر نزود سيرفرات API إضافية فوراً. أي سيرفر يقدر يصادق على أي طلب طالما معاه المفتاح السري المشترك.'),

    h3('الهدف د: تحقق دفاعي من البيانات'),
    p('الـ API شغال بمبدأ "لا تثق أبداً في العميل". كل طلب داخل بيمر على تحقيق دقيق قبل أي منطق بيزنس. التحقيق ده بيتنفذ عن طريق دوال guard مركزية بتتنادى في بداية كل Controller method.'),
    p('الـ guards بتتأكد من صيغة الإيميل بـ filter_var()، بتفرض تعقيد كلمة السر بـ regex، بتتأكد إن الحقول الرقمية رقمية فعلاً، وإن حقول enum زي الجنس والدور فيها قيم مسموح بها بس. لو أي تحقيق فشل، الطلب بيتصد على طول بـ 400 مع رسالة خطأ واضحة.'),

    h3('الهدف هـ: تنسيق موحد للاستجابة'),
    p('كل endpoint — سواء رجع قائمة دكاترة أو أنشأ ميعاد أو رجع خطأ — بيتبع نفس شكل JSON:'),
    code(`{
    "status_code": 200,
    "message": "تمت العملية بنجاح",
    "data": { ... }
}`, 'json'),
    p('التماثل ده معناه إن معالجة الأخطاء في الـ frontend بتتوحد. مفيش مفاجآت، مفيش أشكال استجابة مش موثقة.'),

    divider(),

    h1('⚙️ ٢. حزمة التقنيات وفلسفة المعمارية'),
    grayQuote([t('كومة التكنولوجيا — الأدوات والمكتبات اللي بتشغل النظام', { bold: true, italic: true })]),

    h2('٢.١ السيرفر وبيئة التشغيل'),
    p('الـ API شغال على PHP 8.x صافي من غير أي framework. ده قرار معماري مقصود. frameworks زي Laravel أو Symfony بتقدم أدوات ممتازة لكن بتحمل overhead كبير في عدد الملفات ومنحنى التعلم. لمشروع بـ 24 endpoint بس، الـ framework كان هيزود تعقيد أكتر من ما يحل.'),
    p('بيئة PHP شغالة على Apache/Nginx على XAMPP أو أي حزمة LAMP. نقطة الدخول ملف واحد — api.php — بيستقبل كل traffic HTTP عن طريق URL rewriting.'),
    p('ميزات PHP 8.x المستخدمة: named arguments للوضوح، match expressions لأنظف من switch، typed properties، و nullsafe operator للوصول الآمن.'),

    h2('٢.٢ طبقة قاعدة البيانات — MySQL مع PDO'),
    p('كل التعاملات مع قاعدة البيانات بتمر من خلال PDO مع named parameters. ده حرج لمنع SQL injection: القيم مبتتحرفش جوا SQL strings. بدل كده بتتربط بوسائط بأسماء زي :email أو :id، و PDO هو اللي بيتولى الـ escaping.'),
    p('الاتصال بيتعمل مرة واحدة في config/database.php وبيتبعت كـ reference ($conn) لكل دالة. ده بيمنع overhead وبيحافظ على dependency injection.'),

    h2('٢.٣ طبقة التخزين المؤقت — Redis'),
    p('Redis هو العمود الفقري للكاشينج. بيشتغل كخدمة منفصلة على localhost:6379 وبندخل عليه بـ PhpRedis. مساعد cache.php بيغلف كل تعاملات Redis:'),
    bullet([t('serveFromCacheIfAvailable($key, $msg) — ', { color: 'blue', bold: true }), t('بتشوف لو المفتاح موجود في Redis. لو لقيته بترجع الرد على طول. لو مش موجود، بتكمل لاستعلام قاعدة البيانات.', { bold: false })]),
    bullet([t('generateFilteredCacheKey($prefix, $allowed) — ', { color: 'green', bold: true }), t('بتبني مفاتيح كاش محددة من query parameters. بتستخدم ksort() لترتيب البرامترات ومنع تكرار الكاش.', { bold: false })]),
    bullet([t('clearModuleCache($pattern) — ', { color: 'orange', bold: true }), t('بتمسح كل المفاتيح اللي بتطابق wildcard. بتتنادى في كل عملية كتابة عشان التحديث.', { bold: false })]),
    p('TTL افتراضي = ٣٠٠ ثانية (٥ دقايق). ده بيوازن بين الأداء وحداثة البيانات.'),

    h2('٢.٤ طبقة المصادقة — JWT'),
    p('تطبيق JWT (helper/JWT.php) بيتولى توليد وتحقق التوكن. التوكنز بتستخدم HMAC-SHA256 بمفتاح سري من الإعدادات. كل توكن ليه ٣ أجزاء:'),
    bullet([t('Header: ', { color: 'purple', bold: true }), t('نوع الخوارزمية (HS256) ونوع التوكن (JWT)', { bold: false })]),
    bullet([t('Payload: ', { color: 'purple', bold: true }), t('user_id، role، iat، exp', { bold: false })]),
    bullet([t('Signature: ', { color: 'purple', bold: true }), t('HMAC-SHA256 للـ header + payload موقعين بالمفتاح السري', { bold: false })]),
    p('انتهاء التوكن = ٢٤ ساعة. بعد كده العميل يعيد المصادقة. VerifyToken() بتتأكد من exp وترجع 401 لو منتهي.'),

    h2('٢.٥ ليه مفيش Framework؟'),
    p('البناء من غير framework كان قرار واعي. PHP frameworks الحديثة زي Laravel بتقدم أدوات رائعة لكن للمشروع ده تحديداً هتسبب:'),
    bullet([t('~٣٠ ميجا ملفات vendor', { bold: false })]),
    bullet([t('منحنى تعلم صعب للمساهمين الجداد', { bold: false })]),
    bullet([t('مسارات تحديث مرتبطة بالإطار ممكن تكسر الكود المخصص', { bold: false })]),
    bullet([t('ميزات مش مستخدمة بتزود مساحة الصيانة', { bold: false })]),
    p('بدل كده، Doctorna بتنفذ "framework خفيف" — الأنماط اللي محتاجينها بالظبط في PHP نظيف. النتيجة: ~١,٥٠٠ سطر كود عبر ١٢ ملف. مفيش سحر ولا auto-wiring خفي.'),

    divider(),

    h1('🧩 ٣. النظام البيئي للست وحدات'),
    grayQuote([t('النظام البيئي — ست وحدات مترابطة تغطي كل وظائف المنصة', { bold: true, italic: true })]),
    p('الـ API متقسم لست وحدات، كل وحدة مسؤولة عن مجال مختلف. كل موديول بيتبع نفس الهيكل: Controller (business logic + validation)، Repository (database queries)، و guard functions (validation).'),

    h2('٣.١ 🔐 موديول المصادقة (/auth)'),
    grayQuote([t('بوابة النظام — تسجيل ودخول المستخدمين', { bold: true, italic: true })]),

    h3('POST /api.php/auth/register'),
    p('بيستقبل ٧ حقول: name، email، password، age، gender، phone، role. سلسلة التحقق واسعة:'),
    bullet([t('فحص الحقل الفاضي: ', { color: 'red', bold: true }), t('كل الحقول مطلوبة. أي حقل ناقص = 400.', { bold: false })]),
    bullet([t('التحقق من الإيميل: ', { color: 'blue', bold: true }), t('filter_var() بـ FILTER_VALIDATE_EMAIL.', { bold: false })]),
    bullet([t('قوة كلمة السر: ', { color: 'orange', bold: true }), t('٨ أحرف + حرف كبير + صغير + رقم + رمز خاص.', { bold: false })]),
    bullet([t('السن: ', { color: 'purple', bold: true }), t('رقمي بين ١ و ١٢٠.', { bold: false })]),
    bullet([t('الجنس: ', { color: 'purple', bold: true }), t('male/female بس.', { bold: false })]),
    bullet([t('الدور: ', { color: 'red', bold: true }), t('"user" بس. accounts admin ليها عملية منفصلة.', { bold: false })]),
    bullet([t('كشف التكرار: ', { color: 'orange', bold: true }), t('الإيميل والتليفون. التكرار = 409.', { bold: false })]),
    p('بعد التحقق، كلمة السر بتتجزأ بـ password_hash() (bcrypt)، السجل بيتضاف، و JWT بيتولد فوراً. الـ frontend بيقدر يتخطى خطوة login.'),

    h3('POST /api.php/auth/login'),
    p('بيستقبل email و password. بيجيب السجل بـ getUserByEmail(). لو مش موجود = 404. لو hash مش متطابق (password_verify) = 401. لو نجح، JWT بيتولد ويرجع.'),

    h3('POST /api.php/auth/forgot-password'),
    p('بيستقبل email، بيتأكد من صحته، وبرجع نفس الرسالة سواء الإيميل موجود أو لأ (منع enumeration attacks). لو موجود، token بـ 64 hex byte بيتخزن وبيتبعت في إيميل.'),

    h3('POST /api.php/auth/reset-password'),
    p('بيستقبل email + token + new_password. بيتأكد من التطابق والصلاحية (ساعة TTL). لو تمام، كلمة السر بتتحدث والتوكن بيتحذف.'),

    h2('٣.٢ 👨‍⚕️ موديول الدكاترة (/doctors)'),
    grayQuote([t('إدارة الكادر الطبي — CRUD كامل', { bold: true, italic: true })]),

    h3('GET /api.php/doctors — عام، متخزن في Redis'),
    p('بيرجع الدكاترة النشطين (deleted_at IS NULL). بيدعم تصفية بـ query params: gender، spec_id، rank، name، is_available. الكاش بيستخدم generateFilteredCacheKey() مع prefix "doctors".'),

    h3('POST /api.php/doctors — للأدمن بس'),
    p('بيتطلب name، email، phone، gender، spec_id، rank، fees. التحقق: email format، phone non-empty، gender male/female، fees numeric موجب. بعد النجاح، doctors:* cache namespace بتتفضى.'),

    h3('PATCH /api.php/doctors?id={id} — للأدمن بس'),
    p('تحديث جزئي. validation guard بتتصل مع $isUpdate=true (كل الحقول اختيارية). الكاش بيتفضى للدكتور المحدد وللقائمة العامة.'),

    h3('DELETE /api.php/doctors?id={id} — للأدمن بس'),
    p('Soft delete: deleted_at = now. الاستعلامات فيها WHERE deleted_at IS NULL. بيحافظ على التكامل المرجعي للمواعيد التاريخية.'),

    h2('٣.٣ 📅 موديول المواعيد (/appointments)'),
    grayQuote([t('المحرك الأساسي للمعاملات — حجز وإدارة المواعيد', { bold: true, italic: true })]),

    h3('POST /api.php/appointments — للمستخدمين بس'),
    p('بيتطلب doc_id، date_time (YYYY-MM-DD HH:MM:SS)، status = "pending". ميزة الأمان الحاسمة: user_id من JWT، مش من جسم الطلب:'),
    code(`$token = VerifyToken();
$data = getJsonInput(['doc_id', 'date_time', 'status']);
$data['user_id'] = $token->user_id;  // JWT injection

// أي user_id في JSON body بيتكتب فوقه
createAppointment($conn, $data);`),
    calloutOrange([
      t('أمان بالغ الأهمية: ', { color: 'orange', bold: true }),
      t('لو مستخدم خبيث بعت {"user_id": 1}، البتتكتب فوقه بقيمة JWT. بيمنع مريض من حجز ميعاد لمريض تاني.'),
    ]),

    h3('GET /api.php/appointments — وصول محدد النطاق'),
    p('لو role = admin، الاستعلام بيرجع كل المواعيد. لو role = user، بيزود WHERE user_id = token->user_id تلقائياً.'),

    h2('٣.٤ 👥 موديول المرضى (/patients)'),
    grayQuote([t('إدارة حسابات المستخدمين', { bold: true, italic: true })]),
    p('كل العمليات محتاجة admin. كل استعلامات PatientRepo فيها AND role = \'user\' عشان منع الوصول لحسابات admin.'),

    h2('٣.٥ 🏥 موديول التخصصات (/specialities)'),
    grayQuote([t('تصنيف أقسام المستشفى', { bold: true, italic: true })]),
    p('بيدعم include_doctors parameter بيشغل JOIN لعد الدكاترة النشطين لكل تخصص.'),

    h2('٣.٦ 📋 موديول الخدمات الفرعية (/subservices)'),
    grayQuote([t('الإجراءات الطبية التفصيلية', { bold: true, italic: true })]),
    p('بيدعم تصفية متقدمة: name (LIKE %search%)، min_fees (>=)، max_fees (<=). الموديول الوحيد اللي بيستخدم hard delete (DELETE FROM) بدل soft delete.'),

    divider(),

    h1('🔐 ٤. مصفوفة الصلاحيات والمصادقة'),
    grayQuote([t('من يقدر يوصل لإيه؟', { bold: true, italic: true })]),

    h2('٤.١ مستويات الصلاحية الثلاثة'),
    h3('🟢 Level 1: عام (بدون مصادقة)'),
    p('مبتستدعيش VerifyToken(). للتصفح والاكتشاف. متخزنة في Redis لأنها أعلى حجم traffic.'),
    h3('🟡 Level 2: مستخدم (مصادق عليه)'),
    p('محتاج JWT صحيح. VerifyToken() بتقرأ Bearer header، تفك التوكن، تتأكد من التوقيع والانتهاء.'),
    h3('🔴 Level 3: أدمن (مستخدم فائق)'),
    p('checkAdminPrivileges() بتنادي VerifyToken() + تتأكد role === "admin". لو لأ = 403.'),

    h2('٤.٢ هيكل JWT Token'),
    code(`{
    "user_id": 42,
    "role": "user",
    "iat": 1718745600,
    "exp": 1718832000
}`, 'json'),

    h2('٤.٣ مصفوفة الصلاحيات'),
    ...metaTable([
      ['الموديول', 'GET (قائمة)', 'GET (بـID)', 'POST', 'PATCH/PUT', 'DELETE'],
      ['/auth', '—', '—', 'عام', '—', '—'],
      ['/doctors', 'عام', 'عام', 'أدمن', 'أدمن', 'أدمن'],
      ['/appointments', 'مختلط', 'أدمن', 'مستخدم', 'أدمن', '—'],
      ['/patients', 'أدمن', 'أدمن', '—', 'أدمن', 'أدمن'],
      ['/specialities', 'عام', 'عام', 'أدمن', 'أدمن', 'أدمن'],
      ['/subservices', 'عام', 'عام', 'أدمن', 'أدمن', 'أدمن']
    ]),

    divider(),

    h1('🛤️ ٥. سيناريوهات المستخدمين بالتفصيل'),
    grayQuote([t('رحلة المستخدم خطوة بخطوة', { bold: true, italic: true })]),

    h2('٥.١ رحلة حجز كاملة'),
    h3('الخطوة ١: تصفح التخصصات'),
    code(`GET /api.php/specialities
→ Cache miss
→ SELECT * FROM specialities WHERE deleted_at IS NULL
→ Cache set: specialities:all
→ 200 OK [{id: 1, name: "Cardiology"}, ...]`),
    h3('الخطوة ٢: تصفية الدكاترة'),
    code(`GET /api.php/doctors?spec_id=1
→ Cache key: doctors:filter:spec_id=1
→ Cache miss
→ SELECT * FROM doctors WHERE spec_id = 1 AND deleted_at IS NULL
→ 200 OK [{id: 5, name: "Dr. Smith", ...}]`),
    h3('الخطوة ٣: عرض بروفايل الدكتور'),
    code(`GET /api.php/doctors?id=5
→ Cache key: doctor:id:5
→ Cache hit → 200 OK (~1ms)`),
    h3('الخطوة ٤: تسجيل المستخدم'),
    code(`POST /api.php/auth/register
Body: {name: "John", email: "john@example.com", password: "Secure@123",
       age: 30, gender: "male", phone: "+201234567890", role: "user"}
→ Validation: ✓ → Duplicate check: ✓ → password_hash(bcrypt)
→ INSERT INTO users → Generate JWT
→ 201 CREATED {token: "eyJ..."}`),
    h3('الخطوة ٥: حجز ميعاد'),
    code(`POST /api.php/appointments
Auth: Bearer eyJ...
Body: {doc_id: 5, date_time: "2026-06-20 10:00:00", status: "pending"}
→ VerifyToken() → user_id: 42 (from JWT, not body)
→ INSERT INTO appointments
→ 201 CREATED {id: 101, ...}`),
    h3('الخطوة ٦: عرض المواعيد'),
    code(`GET /api.php/appointments
Auth: Bearer eyJ...
→ VerifyToken() → role: "user"
→ Row-level filter: WHERE user_id = 42
→ 200 OK [{id: 101, ...}]`),

    divider(),

    h1('💻 ٦. جولة في الكود — الراوتر (api.php)'),
    grayQuote([t('إزاي الطلبات توصل لوجهاتها', { bold: true, italic: true })]),

    h2('٦.١ ليه نقطة دخول واحدة؟'),
    p('بدل ملف منفصل لكل endpoint (create_doctor.php, list_appointments.php)، كل حاجة بتمر على routes/api.php. ده بيدي:'),
    bullet([t('تسجيل مركزي: ', { color: 'blue', bold: true }), t('كل طلب يعدي على ملف واحد.', { bold: false })]),
    bullet([t('معالجة أخطاء متسقة: ', { color: 'green', bold: true }), t('الـ default في switch بيرجع 404 JSON.', { bold: false })]),
    bullet([t('أمان مبسط: ', { color: 'orange', bold: true }), t('CORS والمصادقة على مستوى نقطة الدخول.', { bold: false })]),

    h2('٦.٢ تحليل الـ URL'),
    code(`$method = $_SERVER["REQUEST_METHOD"];
$path = $_SERVER['PATH_INFO']
    ?? str_replace($_SERVER['SCRIPT_NAME'], '',
        parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$path = trim($path, '/');
$segments = explode('/', $path);
$module = strtolower($segments[0] ?? '');
$action = strtolower($segments[1] ?? '');`),

    calloutBlue([
      t('خدعة RESTful ID: ', { color: 'blue', bold: true }),
      t('/api.php/doctors/5 بتحط $action = "5". التحقق الرقمي بيحط $_GET[\'id\'] = 5. فـ /doctors?id=5 و /doctors/5 شغالين الاتنين.'),
    ]),

    h2('٦.٣ المحول الرئيسي (Master Switch)'),
    code(`switch ($module) {
    case 'auth':
        if ($method !== 'POST') methodNotAllowed();
        switch ($action) {
            case 'login': handleLogin($conn); break;
            case 'register': handleRegister($conn); break;
            case 'forgot-password': handleForgotPassword($conn); break;
            case 'reset-password': handleResetPassword($conn); break;
            default: response(HttpStatus('NOT_FOUND'),
                "Auth Endpoint Not Found");
        }
        break;

    case 'doctors':
    case 'doctor':
        switch ($method) {
            case 'GET': isset($_GET['id'])
                ? handleGetDoctorById($conn)
                : handleGetAllDoctors($conn); break;
            case 'POST': handleCreateDoctor($conn); break;
            case 'PUT':
            case 'PATCH': handleUpdateDoctor($conn); break;
            case 'DELETE': handleDeleteDoctor($conn); break;
            default: methodNotAllowed();
        }
        break;
}`),
    p('الـ switch بيكمل لـ appointments، patients، specialities، sub-services، و default 404.'),

    divider(),

    h1('❌ ٧. معالجة الأخطاء الموحدة'),
    grayQuote([t('كل خطأ ليه رمز ورسالة', { bold: true, italic: true })]),

    ...metaTable([
      ['الثابت', 'الكود', 'الاستخدام'],
      ['OK', '200', 'عمليات GET/POST الناجحة'],
      ['CREATED', '201', 'إنشاء مورد جديد'],
      ['BAD_REQUEST', '400', 'فشل التحقق من البيانات'],
      ['UNAUTHORIZED', '401', 'توكن ناقص أو غلط أو منتهي'],
      ['FORBIDDEN', '403', 'دور مش كافي (مش أدمن)'],
      ['NOT_FOUND', '404', 'المورد مش موجود'],
      ['METHOD_NOT_ALLOWED', '405', 'HTTP method غلط'],
      ['CONFLICT', '409', 'تكرار (إيميل/تليفون)'],
      ['UNPROCESSABLE_ENTITY', '422', 'حقل مطلوب ناقص في JSON'],
      ['INTERNAL_SERVER_ERROR', '500', 'خطأ غير متوقع في السيرفر']
    ]),

    p('كل ردود الخطأ بتتبع نفس تنسيق JSON:'),
    code(`{
    "status_code": 400,
    "message": "صيغة البريد الإلكتروني غير صالحة.",
    "data": null
}`, 'json'),

    divider(),

    h1('⚡ ٨. التخزين المؤقت (Caching)'),
    grayQuote([t('كل طلب GET مخزن في Redis', { bold: true, italic: true })]),

    h2('٨.١ تصميم مفاتيح الكاش'),
    ...metaTable([
      ['النمط', 'مثال', 'يتفضى عند'],
      ['{module}:all', 'doctors:all', 'أي POST/PUT/DELETE'],
      ['{module}:id:{id}', 'doctor:id:5', 'PATCH/DELETE على المعرف ده'],
      ['{module}:filter:{params}', 'doctors:filter:spec_id=1', 'أي POST/PUT/DELETE'],
      ['{module}:filter:{name}', 'subservices:filter:min_fees=50', 'أي POST/PUT/DELETE']
    ]),

    h2('٨.٢ تدفق الكاش'),
    code(`function handleGetAllDoctors($conn) {
    $cacheKey = generateFilteredCacheKey('doctors',
        ['gender', 'spec_id', 'rank', 'name', 'is_available']);
    serveFromCacheIfAvailable($cacheKey, "تم الجلب بنجاح");
    // Cache miss => query DB
    $doctors = getAllDoctors($conn);
    saveToCache($cacheKey, $doctors, 300);
    response(HttpStatus('OK'), "تم الجلب بنجاح", $doctors);
}`),

    h2('٨.٣ generateFilteredCacheKey'),
    code(`function generateFilteredCacheKey($prefix, $allowedFilters) {
    $filterParams = [];
    foreach ($allowedFilters as $filter) {
        if (isset($_GET[$filter]) && $_GET[$filter] !== '') {
            $filterParams[$filter] = $_GET[$filter];
        }
    }
    ksort($filterParams);
    $qs = http_build_query($filterParams);
    return $qs ? "{$prefix}:filter:{$qs}" : "{$prefix}:all";
}`),

    divider(),

    h1('🛡️ ٩. نموذج الأمان'),
    grayQuote([t('دفاع متعدد الطبقات', { bold: true, italic: true })]),

    h2('٩.١ الطبقة ١: منع SQL Injection'),
    p('كل استعلامات قاعدة البيانات بتستخدم PDO prepared statements مع named parameters. مفيش تحريف لمدخلات المستخدم في SQL strings.'),
    code(`// آمن
$stmt = runQuery($conn,
    "SELECT * FROM users WHERE email = :email",
    ['email' => $email]
);`),

    h2('٩.٢ الطبقة ٢: أمان JWT'),
    p('HMAC-SHA256 بيمنع التلاعب بالتوكن. exp بتمنع إعادة استخدام التوكن المنتهي. Stateless يعني مفيش session hijacking.'),

    h2('٩.٣ الطبقة ٣: التحقق من المدخلات'),
    bullet([t('الإيميل: ', { color: 'blue', bold: true }), t('filter_var() بـ FILTER_VALIDATE_EMAIL', { bold: false })]),
    bullet([t('الأرقام: ', { color: 'green', bold: true }), t('is_numeric() + فحوصات النطاق', { bold: false })]),
    bullet([t('الـ enums: ', { color: 'purple', bold: true }), t('in_array() ضد قوائم بيضاء', { bold: false })]),

    h2('٩.٤ الطبقة ٤: التحكم في الوصول (RBAC)'),
    p('checkAdminPrivileges() في بداية كل handler للأدمن. لو token role !== "admin"، بيرجع 403.'),

    h2('٩.٥ الطبقة ٥: استقلالية جسم الطلب'),
    p('user_id بيتم استخلاصه من JWT مش من جسم الطلب. حتى لو المهاجم صنع طلب بـ user_id مختلف، النظام بيستخدم الهوية المصادق عليها.'),

    divider(),

    h1('🗄️ ١٠. تصميم قاعدة البيانات'),
    grayQuote([t('الجداول والعلاقات', { bold: true, italic: true })]),

    h2('١٠.١ العلاقات بين الكيانات'),
    p('users → واحد-لكثير ← appointments. doctors → كثير-لواحد ← specialities. doctors → واحد-لكثير ← appointments. sub_services: جدول قائم بذاته.'),

    h2('١٠.٢ users'),
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`),

    h2('١٠.٣ doctors'),
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
    FOREIGN KEY (spec_id) REFERENCES specialities(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`),

    h2('١٠.٤ specialities'),
    code(`CREATE TABLE specialities (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`),

    h2('١٠.٥ appointments'),
    code(`CREATE TABLE appointments (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    doc_id     INT NOT NULL,
    date_time  DATETIME NOT NULL,
    status     ENUM('pending','confirmed','cancelled','completed')
               NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (doc_id) REFERENCES doctors(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`),

    h2('١٠.٦ sub_services'),
    code(`CREATE TABLE sub_services (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    fees        DECIMAL(10,2) NOT NULL,
    description TEXT DEFAULT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`),

    h2('١٠.٧ نمط Soft Delete'),
    p('أربع جداول من الخمسة (users, doctors, specialities, appointments) بيستخدموا soft delete بدل DELETE. الاستعلامات فيها WHERE deleted_at IS NULL. ده بيحافظ على التكامل المرجعي ويسهل استعادة البيانات. sub_services بس اللي بتستخدم hard delete لأنها بيانات مرجعية.'),

    divider(),

    h1('🧪 ١١. استراتيجية الاختبار'),
    grayQuote([t('ضمان جودة API', { bold: true, italic: true })]),

    h2('١١.١ اختبار الوحدة (Validation Guards)'),
    code(`// validatePasswordStrength — المفروض تنجح
validatePasswordStrength("Secure@123");

// المفروض تفشل (400):
validatePasswordStrength("weak");        // قصير
validatePasswordStrength("ONLYUPPER@1"); // مفيش lowercase
validatePasswordStrength("onlylower@1"); // مفيش uppercase
validatePasswordStrength("NoSpecialChar1"); // مفيش رمز خاص`),

    h2('١١.٢ اختبار التكامل (API Endpoints)'),
    code(`// POST /api.php/auth/register — صحيح → 201
// POST /api.php/auth/register — إيميل متكرر → 409
// POST /api.php/auth/register — كلمة سر ضعيفة → 400
// GET /api.php/doctors — بدون مصادقة → 200 (عام)
// POST /api.php/doctors — بدون مصادقة → 401
// POST /api.php/doctors — بتوكن user → 403`),

    h2('١١.٣ اختبار المسار الكامل'),
    num([t('سجل مستخدم جديد')]),
    num([t('استخدم JWT عشان تحجز ميعاد')]),
    num([t('تأكد من ظهور الميعاد في قائمة المستخدم')]),
    num([t('سجل كأدمن وتأكد من ظهور الميعاد')]),
    num([t('حدث حالة الميعاد كأدمن')]),
    num([t('تأكد إن المستخدم يشوف التحديث')]),

    divider(),

    h1('🚀 ١٢. دليل النشر'),
    grayQuote([t('تشغيل API في الإنتاج', { bold: true, italic: true })]),

    h2('١٢.١ متطلبات السيرفر'),
    bullet([t('PHP 8.0+', { bold: false })]),
    bullet([t('MySQL 5.7+ / MariaDB 10.3+', { bold: false })]),
    bullet([t('Redis 6.0+', { bold: false })]),
    bullet([t('Apache mod_rewrite أو Nginx', { bold: false })]),
    bullet([t('Extensions: pdo_mysql, redis, mbstring, json', { bold: false })]),

    h2('١٢.٢ إعدادات Apache (.htaccess)'),
    code(`RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ routes/api.php [QSA,L]`),

    h2('١٢.٣ إعدادات Nginx'),
    code(`location / {
    try_files $uri $uri/ /routes/api.php?$query_string;
}
location ~ \.php$ {
    fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
    fastcgi_index api.php;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include fastcgi_params;
}`),

    h2('١٢.٤ قائمة مهام الإنتاج'),
    bullet([t('حط JWT_SECRET قوي (٣٢+ حرف)', { bold: false })]),
    bullet([t('ظبط كلمة مرور Redis', { bold: false })]),
    bullet([t('فعّل HTTPS بشهادة SSL', { bold: false })]),
    bullet([t('ظبط CORS headers', { bold: false })]),
    bullet([t('ضبط rate limiting على مستوى خادم الويب', { bold: false })]),
    bullet([t(' pool اتصالات قاعدة البيانات', { bold: false })]),
    bullet([t('رفع مراقبة لأخطاء 5xx', { bold: false })]),

    calloutTarget([
      t('ملخص: ', { color: 'blue', bold: true }),
      t('Doctorna API منصة خلفية modular، الكاشينج أولوية، متشددة أمنياً، معمولة لحجوزات طبية. ٢٤ endpoint عبر ٦ وحدات، حوالي ١,٥٠٠ سطر PHP صافي، بدون framework، وقابلة كاملة للاختبار.'),
    ]),
    calloutBook([
      t('إقرأ المزيد: ', { bold: true }),
      t('كمل على Phase 2 لنظام المساعدين، أو Phase 3 لوثائق المصادقة.'),
    ]),
  ];

  const page = await req('POST', '/pages', JSON.stringify({
    parent: { page_id: PARENT },
    icon: { type: 'emoji', emoji: '🇪🇬' },
    properties: { title: { title: [{ text: { content: '🇪🇬 Phase 1 — بالعامية المصرية' } }] } }
  }));
  console.log(`Created Arabic Phase 1: ${page.id}`);

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
