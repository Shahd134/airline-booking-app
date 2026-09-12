# 🚀 Deployment Guide

خطوات نشر المشروع كامل (Backend + Frontend + Database) مجانًا، بالترتيب. اتبعها بالظبط من فوق لتحت.

**الترتيب أهم حاجة**: قاعدة البيانات الأول، بعدين الباك إند (وهو محتاج رابط قاعدة البيانات)، بعدين الفرونت إند (وهو محتاج رابط الباك إند).

---

## 0) قبل ما تبدأ

- حساب GitHub (مجاني)
- حساب [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) (مجاني)
- حساب [Render](https://render.com) (مجاني) — للباك إند
- حساب [Vercel](https://vercel.com) (مجاني) — للفرونت إند

---

## 1) رفع الكود على GitHub

لو المشروعين لسه على جهازك بس (مش على GitHub)، من جوه فولدر `airline-booking-app` (اللي فيه `airline-api/` و`airline-frontend/` جنب بعض):

```bash
git init
git add .
git commit -m "Initial commit: airline booking API + frontend"
git branch -M main
git remote add origin https://github.com/<username>/airline-booking-app.git
git push -u origin main
```

هيبقى عندك ريبو واحد فيه المشروعين (monorepo) — ده اللي هنعتمد عليه في باقي الخطوات.

---

## 2) قاعدة البيانات — MongoDB Atlas

1. من الداشبورد، **Create a deployment** → اختار **M0 (Free)**.
2. اختار أقرب Region ليك، سمّي الـ Cluster زي ما تحب، **Create**.
3. **Database Access** (من القائمة الجانبية) → **Add New Database User**:
   - Username/Password (احفظهم، هتحتاجهم بعد شوية)
   - Role: `Atlas admin` أو `Read and write to any database`
4. **Network Access** → **Add IP Address** → اختار **Allow Access from Anywhere** (`0.0.0.0/0`).
   > ده مقبول لمشروع بورتفوليو تجريبي. في مشروع حقيقي كنت هتحدد IP السيرفر بس.
5. **Database** → **Connect** → **Drivers** → انسخ الـ connection string، هيكون شكله كده:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. عدّل الرابط: حط اسم قاعدة البيانات بعد `.net/` وقبل `?`، واستبدل `<username>`/`<password>` ببياناتك الحقيقية:
   ```
   mongodb+srv://myuser:mypass123@cluster0.xxxxx.mongodb.net/airline_api?retryWrites=true&w=majority
   ```

✅ Atlas بيشغّل الكلاستر كـ **Replica Set** تلقائيًا حتى في الـ Free Tier — يعني الـ booking transactions هتشتغل من غير أي تعديل في الكود.

---

## 3) الباك إند — Render

### الطريقة السريعة (Blueprint)
المشروع فيه ملف `airline-api/render.yaml` جاهز:
1. Render Dashboard → **New +** → **Blueprint**
2. اختار الريبو بتاعك، Render هيكتشف `render.yaml` تلقائيًا
3. لو سألك عن **Root Directory**، حطه `airline-api`

### الطريقة اليدوية (لو الـ Blueprint ما ظهرش)
1. **New +** → **Web Service** → اختار الريبو
2. **Root Directory**: `airline-api`
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. **Instance Type**: Free

### Environment Variables (تتضاف من تبويب Environment)
| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGO_URI` | الرابط اللي نسخته من Atlas |
| `JWT_SECRET` | أي نص عشوائي طويل (أو خليه يتولد تلقائي لو مستخدم الـ Blueprint) |
| `JWT_EXPIRES_IN` | `7d` |
| `FRONTEND_URL` | سيبها فاضية دلوقتي، هنرجعلها بعد ما ننشر الفرونت (خطوة 5) |

6. **Create Web Service** واستنى الـ build يخلص (2-3 دقايق).
7. هتاخد رابط زي: `https://airline-api-xxxx.onrender.com`
8. جرّبه: افتح `https://airline-api-xxxx.onrender.com/api-docs` — المفروض يفتحلك Swagger.

### تعبئة قاعدة البيانات (Seed)
من تبويب **Shell** في Render (بجانب الـ service):
```bash
npm run seed
```
ده هيدّيلك حسابات تجريبية (`admin@airline.com` / `admin123` و `user@airline.com` / `user1234`) ورحلات جاهزة.

> ⚠️ الخطة المجانية في Render بتنام بعد فترة خمول، وأول طلب بعد النوم بياخد ~30 ثانية يصحّيها. طبيعي، مش error.

---

## 4) الفرونت إند — Vercel

1. Vercel Dashboard → **Add New** → **Project** → اختار نفس الريبو
2. **Root Directory**: دوس Edit واختار `airline-frontend`
3. Framework Preset: Vercel هيتعرف على **Vite** تلقائيًا
4. **Environment Variables**:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://airline-api-xxxx.onrender.com/api` (رابط الباك إند من خطوة 3 + `/api`) |
5. **Deploy**

هتاخد رابط زي: `https://airline-booking-app.vercel.app`

> ملف `vercel.json` الموجود في `airline-frontend/` بيظبط الـ routing عشان لو حد عمل refresh على `/flights/123` مثلاً ميظهرش 404.

---

## 5) اربط الاتجاهين ببعض (مهم!)

دلوقتي رجّع على Render:
1. افتح `airline-api` service → **Environment**
2. عدّل `FRONTEND_URL` = رابط Vercel بتاعك (`https://airline-booking-app.vercel.app`)
3. **Save Changes** — Render هيعمل redeploy تلقائي

من غير الخطوة دي، الـ CORS هيرفض طلبات الفرونت إند في الإنتاج.

---

## 6) تحقق نهائي (Checklist)

- [ ] `https://your-backend.onrender.com/` بيرجع `{ success: true, message: "Airline API is running 🚀" }`
- [ ] `https://your-backend.onrender.com/api-docs` بيفتح Swagger
- [ ] `https://your-frontend.vercel.app` بيفتح الصفحة الرئيسية
- [ ] بحث عن رحلة من الصفحة الرئيسية بيرجع نتائج (لو مفيش، اتأكد إنك عملت `npm run seed`)
- [ ] تسجيل حساب جديد شغال
- [ ] حجز رحلة كامل (مقاعد → بيانات مسافرين → دفع وهمي) شغال من غير أخطاء CORS في الـ console
- [ ] تسجيل دخول بحساب `admin@airline.com` وفتح `/admin` بيوريك الإحصائيات

---

## مشاكل شائعة

| المشكلة | الحل |
|---|---|
| CORS error في الـ browser console | اتأكد `FRONTEND_URL` في Render مطابق تمامًا لرابط Vercel (من غير `/` في الآخر) |
| الحجز بيرمي خطأ transaction | اتأكد إنك مستخدم Atlas مش MongoDB standalone محلي — Atlas بس اللي بيدعم transactions تلقائي |
| الصفحة الرئيسية فاضية من الرحلات | شغّل `npm run seed` من Render Shell |
| أول طلب بعد فترة بطيء جدًا | طبيعي في الخطة المجانية (cold start)، لو حابب تمنعها استخدم خدمة زي [UptimeRobot](https://uptimerobot.com) تعمل ping كل 10 دقايق |
| 404 لما تعمل refresh على صفحة زي `/flights/123` | تأكد `vercel.json` موجود في `airline-frontend/` قبل الديبلوي |

---

## لمسات إضافية تفرق في البورتفوليو

- ضيف رابط الديمو ورابط Swagger في أول الـ README الرئيسي
- سجّل GIF قصير (10-15 ثانية) لفلو حجز كامل وضيفه في الـ README
- الريبو فيه `.github/workflows/ci.yml` جاهز بيشغّل التستات تلقائيًا على كل push — هيظهرلك badge أخضر في GitHub، ده بيدي انطباع فوري إن الكود متبنى صح
- لو عندك دومين شخصي، اربطه بـ Vercel (مجاني ومباشر من إعدادات المشروع)
