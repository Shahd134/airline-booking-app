# ✈️ Airline Booking API

REST API احترافي كامل لنظام حجز طيران، مبني بـ **Node.js + Express + MongoDB (Mongoose)**.
يدعم حجوزات آمنة عن طريق **DB Transactions**، منع الحجز المزدوج، مدفوعات وهمية (Mock Payment)، توثيق **Swagger**، واختبارات **Jest + Supertest**.

---

## 🚀 التشغيل السريع

```bash
npm install
cp .env.example .env      # عدّل MONGO_URI و JWT_SECRET حسب بيئتك
npm run seed               # (اختياري) تعبئة قاعدة البيانات ببيانات تجريبية
npm run dev                 # تشغيل السيرفر في وضع التطوير
```

السيرفر هيشتغل على: `http://localhost:5000`
توثيق Swagger التفاعلي: `http://localhost:5000/api-docs`

### حسابات تجريبية (بعد تشغيل `npm run seed`)
| الدور | البريد | كلمة المرور |
|---|---|---|
| Admin | admin@airline.com | admin123 |
| User | user@airline.com | user1234 |

> ⚠️ **مهم بخصوص الـ Transactions**: عمليات الحجز/الإلغاء بتستخدم MongoDB Sessions/Transactions، واللي محتاجة **Replica Set**.
> - **MongoDB Atlas** (السحابي) بيدعم ده تلقائيًا من الـ Free Tier.
> - لو شغال بـ MongoDB محلي standalone، شغّله كـ replica set بعضو واحد:
>   ```bash
>   mongod --replSet rs0 --dbpath /your/db/path
>   # بعدين في mongosh:
>   rs.initiate()
>   ```

---

## 🧪 تشغيل الاختبارات

```bash
npm test
```

الاختبارات بتستخدم `mongodb-memory-server` (Replica Set وهمي في الذاكرة) فمحتاجاش قاعدة بيانات حقيقية أو إنترنت. بتغطي:
- Auth (تسجيل/دخول/صلاحيات)
- Flights (إنشاء، فاليديشن الأعمال، بحث + باجينيشن)
- Bookings (حجز، **منع الحجز المزدوج تحت ضغط طلبات متزامنة**، قواعد الإلغاء، الدفع الوهمي)

---

## 🏗️ هيكل المشروع

```
airline-api/
├── controllers/     # منطق العمل لكل موديول
├── models/          # سكيمات Mongoose (+ فاليديشن على مستوى الموديل)
├── routes/          # المسارات + Swagger JSDoc annotations
├── middleware/       # auth, admin, validate, error handler
├── validators/       # قواعد express-validator لكل موديول
├── utils/            # AppError, catchAsync, ApiFeatures (pagination), constants
├── config/           # db.js, swagger.js
├── seed/              # سكريبت تعبئة قاعدة البيانات
├── tests/             # Jest + Supertest
├── server.js
```

---

## ✅ أبرز المزايا التقنية

### 🔴 موثوقية الحجز (الأهم في أي نظام حجز)
- **Booking Transactions**: كل عملية حجز/إلغاء بتتنفذ جوه `session.withTransaction()` — لو أي خطوة فشلت (مثلاً حفظ الرحلة نجح بس الحجز فشل)، كل حاجة بترجع لحالتها الأصلية تلقائيًا (Atomicity).
- **منع الحجز المزدوج (Race Condition)**: بدل ما نتأكد إن المقعد متاح ثم نحجزه في خطوتين منفصلتين (ثغرة كلاسيكية)، بنستخدم تحديث ذري واحد:
  ```js
  Seat.updateMany({ _id: {$in: seatIds}, isBooked: false }, { $set: {isBooked: true} })
  ```
  لو `modifiedCount` أقل من عدد المقاعد المطلوبة، معناه حد تاني سبقنا — الطلب بيترفض بـ `409 Conflict` بدل ما يحصل حجز مزدوج لنفس المقعد. تم اختبار السيناريو ده فعليًا بطلبين متزامنين في `tests/booking.test.js`.
- **Passengers Validation**: عدد المسافرين لازم يساوي عدد المقاعد، وبيانات كل مسافر (اسم، جواز سفر) مطلوبة وبصيغة صحيحة.
- **Flight/Business Validation**: مينفعش تحجز على رحلة أقلعت بالفعل أو ملغية/مكتملة، مينفعش تنشئ رحلة بموعد وصول قبل الإقلاع، مينفعش تقلل `totalSeats` لرقم أقل من المقاعد المحجوزة فعليًا.
- **قواعد إلغاء ذكية**:
  - ممنوع الإلغاء نهائيًا لو أقل من 3 ساعات على الإقلاع.
  - استرداد 100% لو الإلغاء قبل 24 ساعة من الإقلاع.
  - استرداد جزئي (50%) لو الإلغاء بين 3 و24 ساعة.
  - كل الثوابت دي في `utils/constants.js` وسهل تعديلها.

### 🟠 تجربة استخدام احترافية
- **Pagination** موحّد (`page`, `limit`, ويرجع `total`/`pages`) على الرحلات، حجوزاتي، وقوائم الأدمن.
- **Search محسّن**: فلترة بالمطار/التاريخ/السعر/شركة الطيران، بحث نصي حر (`search=`)، وترتيب مرن (`sort=price.economy,-departureTime`).
- **Mock Payment**: `POST /api/bookings/:id/pay` بتحاكي بوابة دفع (أي رقم بطاقة ينجح، وأي رقم ينتهي بـ `0000` بيفشل عمدًا لتجربة سيناريو الفشل).
- **البحث برقم الحجز المرجعي**: `GET /api/bookings/reference/:ref`.
- **إحصائيات أدمن متقدمة**: إجمالي الإيرادات، توزيع الحجوزات حسب الحالة، الإيرادات الشهرية (آخر 12 شهر)، أكثر 5 خطوط سير حجزًا، وأكثر شركات الطيران حجزًا — كلها Aggregation pipelines في `adminController.js`.

### 🟢 جودة كود على مستوى Portfolio
- **Swagger / OpenAPI**: توثيق تفاعلي كامل على `/api-docs`.
- **Jest + Supertest**: اختبارات حقيقية (مش mocks) بتشتغل على قاعدة بيانات في الذاكرة.
- **معالجة أخطاء مركزية**: `AppError` + `catchAsync` بيلغوا الحاجة لـ try/catch متكرر، ومعالج واحد بيترجم أخطاء Mongoose (`CastError`, `ValidationError`, `E11000 duplicate key`) لرسائل مفهومة.
- **Seed script** جاهز بمطارات، رحلات، مقاعد، وحسابات تجريبية.

---

## 📋 ملخص الـ Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | الوصف | صلاحية |
|---|---|---|---|
| POST | /register | تسجيل مستخدم جديد | عام |
| POST | /login | تسجيل الدخول | عام |
| GET | /profile | بيانات البروفايل | مسجل دخول |
| PUT | /profile | تحديث البروفايل | مسجل دخول |

### Airports (`/api/airports`)
| Method | Endpoint | صلاحية |
|---|---|---|
| GET | / | عام |
| POST | / | أدمن |

### Flights (`/api/flights`)
| Method | Endpoint | الوصف | صلاحية |
|---|---|---|---|
| GET | / | بحث + فلاتر + ترتيب + باجينيشن | عام |
| GET | /:id | تفاصيل رحلة | عام |
| POST | / | إنشاء رحلة (مع فاليديشن أعمال) | أدمن |
| PUT | /:id | تعديل رحلة | أدمن |
| DELETE | /:id | حذف رحلة (ممنوع لو فيها حجوزات نشطة) | أدمن |

### Seats (`/api/seats`)
| Method | Endpoint | صلاحية |
|---|---|---|
| GET | /flight/:flightId | عام |
| POST | /generate/:flightId | أدمن |
| PUT | /:id | أدمن |

### Bookings (`/api/bookings`) — كلها محتاجة تسجيل دخول
| Method | Endpoint | الوصف |
|---|---|---|
| POST | / | حجز جديد (Transaction آمن) |
| GET | /my | حجوزاتي (باجينيشن) |
| GET | /reference/:ref | بحث برقم الحجز المرجعي |
| GET | /:id | تفاصيل حجز |
| PUT | /:id/cancel | إلغاء (بقواعد استرداد) |
| POST | /:id/pay | دفع وهمي |

### Admin (`/api/admin`) — للأدمن بس
| Method | Endpoint | الوصف |
|---|---|---|
| GET | /dashboard | إحصائيات شاملة |
| GET | /users | كل المستخدمين (باجينيشن) |
| PUT | /users/:id | تفعيل/تعطيل/تغيير دور |
| GET | /bookings | كل الحجوزات (باجينيشن) |

كل التفاصيل والـ request/response schemas موجودة في **Swagger** على `/api-docs`.

## 🔐 المصادقة
```
Authorization: Bearer <token>
```

## 🔜 الخطوة الجاية
دمج فرونت إند (React / Next.js) بيتواصل مع الـ API دي.
