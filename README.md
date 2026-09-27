# One To One Car & Bike Rental — Indore

Scooty, Bike aur Car ek-se-ek (one-to-one) rent par dene ke business ke liye MERN stack website.
- **M**ongoDB — data store
- **E**xpress — backend API
- **R**eact (Vite) — frontend
- **N**ode.js — server

## Features
- Vehicle listing (Scooty / Bike / Car), location aur type se filter
- **Multiple vehicle images** — Cloudinary par cloud upload, gallery view with thumbnails
- Vehicle detail page + hourly/daily rate ke hisaab se booking form
- **Razorpay payment integration** — booking tabhi confirm hoti hai jab payment successful ho
- **Email confirmation** — booking confirm hote hi customer ko QR code ke saath email jaata hai
- **WhatsApp confirmation** — free click-to-chat link (koi cost nahi) + optional Twilio auto-send
- **QR-based booking verification** — pickup ke waqt QR scan karke staff booking verify/check-in kar sakta hai
- **Customer support / ticket system** — customer ticket raise kare, admin reply kare, status track ho
- User register/login (JWT based)
- "My Bookings" page (user apni bookings, payment status, QR dekh sakta hai)
- Admin Dashboard: vehicles add/edit/delete, saari bookings dekhna, booking status update, coupons, analytics, support tickets, QR verification

## Folder Structure
```
scooty-rental-mern/
├── backend/        (Express + MongoDB API)
│   ├── config/       (db.js, cloudinary.js)
│   ├── controllers/
│   ├── middleware/   (auth, upload)
│   ├── models/
│   ├── routes/
│   ├── utils/        (QR, email, WhatsApp helpers)
│   ├── seed/        (sample data daalne ki script)
│   └── server.js
└── frontend/       (React + Vite)
    └── src/
        ├── api/
        ├── components/
        ├── context/
        └── pages/
```

## Setup Kaise Karein

### 1. MongoDB
Do options hain:
- **Local MongoDB** install karo (mongodb.com se), ya
- **MongoDB Atlas** (free cloud) — https://www.mongodb.com/cloud/atlas par free account banao aur connection string lo.

> ⚠️ **Security note:** Is project ke saath jo `.env` upload hui thi usme ek live MongoDB Atlas connection string (password sahit) thi. Wo password turant **Atlas dashboard se rotate/change** kar do — kabhi bhi real DB credentials `.env` file me rakh kar zip/git me share mat karo. Production me hamesha naya `.env` banao aur `.gitignore` me rakho (already `.gitignore` me hai, bas dhyan rakhna).

### 2. Backend Chalao
```bash
cd backend
npm install
```
`.env` file already project me hai — usme apna `MONGO_URI` aur `JWT_SECRET` daalo (upar wala security note dekh lo). Naye features on karne ke liye niche di gayi keys bhi fill karo:

| Key | Kis liye | Kaise milega |
|---|---|---|
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Multiple vehicle images cloud upload | Free account: https://cloudinary.com → Dashboard |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Payment integration | Free test keys: https://dashboard.razorpay.com → Settings → API Keys |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` | Booking confirmation email | Gmail App Password: https://myaccount.google.com/apppasswords |
| `FRONTEND_URL` | QR code me sahi verify-link banane ke liye | e.g. `http://localhost:5173` (local) ya live domain |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM` | **Optional** — server se automatic WhatsApp bhejne ke liye | https://www.twilio.com/whatsapp (paid, Meta approval chahiye). Agar khali rakho to bhi WhatsApp kaam karega (free `wa.me` click-to-chat link customer/admin ko milta hai) |

Koi bhi key khali chhodoge to us feature ka sirf woh part disable hoga (baaki app crash nahi karega) — error message me pata chal jayega ki kya missing hai.

Phir:
```bash
npm run dev
```
Backend `http://localhost:5000` par chalega.

**Sample data (admin + kuch vehicles) daalne ke liye** (optional, recommended):
```bash
node seed/seed.js
```
Isse ek admin bhi ban jayega:
- Email: `admin@onetoone.com`
- Password: `admin123`

### 3. Frontend Chalao
Naye terminal me:
```bash
cd frontend
npm install
npm run dev
```
Frontend `http://localhost:5173` par khulega, aur API calls automatically backend (port 5000) par proxy ho jayengi.

### 4. Use Karo
- Website kholo → vehicles dikhenge (agar seed data daala hai)
- Naya account banao ya `admin@onetoone.com` / `admin123` se admin login karo
- **Admin panel (`/admin`)** se:
  - Vehicles tab: naya vehicle add karo, "Vehicle Images" me multiple photos select karo — seedhe Cloudinary par upload ho jayengi
  - Bookings tab: booking status change karo, payment status aur check-in dikhega
  - Support Tickets tab: customer tickets dekho aur reply karo
  - Verify Booking (QR) tab: QR scan ke baad mila hua code paste karke check-in mark karo
- Customer flow: vehicle choose karo → date/time bharo → "Book Now" → **Pay Now** button se Razorpay checkout khulega (test mode me test card use karo: `4111 1111 1111 1111`, koi bhi future date/CVV) → payment success hote hi QR code dikhega, WhatsApp par bhi bhej sakte ho, aur email par bhi confirmation chala jayega
- **Support** page se customer help ticket raise kar sakta hai

## QR Verification Kaise Kaam Karta Hai
1. Payment success hote hi ek unique QR generate hota hai jo ek link encode karta hai: `FRONTEND_URL/verify/<token>`
2. Ye QR email me attach hota hai aur My Bookings page par bhi dikhta hai
3. Pickup ke waqt staff apne phone ke normal camera se QR scan kare → browser me booking details khulengi
4. Admin account se login karke "Mark as Verified / Check-in" button dabao — ya Admin Dashboard ke "Verify Booking" tab me token manually paste karke bhi verify kar sakte ho

## Deploying to Vercel

This project deploys to Vercel as **two separate projects** — one for the backend (Express API, as serverless functions) and one for the frontend (the React/Vite app). This is the most reliable setup on Vercel's free tier.

### Step 0 — Push the code to GitHub
Vercel deploys straight from a Git repository. Create a new GitHub repo and push this project to it (the whole `scooty-rental-mern` folder, `backend/` and `frontend/` as subfolders).

### Step 1 — Deploy the backend
1. Go to https://vercel.com → **Add New → Project** → import your GitHub repo.
2. When asked for the **Root Directory**, choose `backend`.
3. Framework preset: leave as **Other** (this project already has a `backend/vercel.json` telling Vercel to run `server.js` as a serverless function — you don't need to change build/output settings).
4. Under **Environment Variables**, add every key from `backend/.env.example` (Mongo URI, JWT secret, Cloudinary, Razorpay, SMTP, etc.) — the same ones you use locally, with production values.
5. Click **Deploy**. Once done, copy the deployment URL, e.g. `https://your-backend.vercel.app`.

### Step 2 — Deploy the frontend
1. Back on Vercel → **Add New → Project** → same GitHub repo again.
2. Root Directory: choose `frontend`.
3. Framework preset: Vercel auto-detects **Vite** (Build command `npm run build`, Output directory `dist`) — leave as-is (a `frontend/vercel.json` is included for React Router's client-side routes).
4. Under **Environment Variables**, add:
   - `VITE_API_URL` = `https://your-backend.vercel.app/api` (the backend URL from Step 1, with `/api` at the end)
5. Click **Deploy**. Copy this frontend URL too, e.g. `https://your-frontend.vercel.app`.

### Step 3 — Connect the two
Go back to the **backend** project on Vercel → Settings → Environment Variables → set:
- `FRONTEND_URL` = `https://your-frontend.vercel.app` (no trailing slash)

This is used for two things: allowing CORS requests from your frontend, and building the correct QR check-in link in bookings/emails. Redeploy the backend after adding it (Vercel → Deployments → ⋯ → Redeploy).

### Step 4 — Seed sample data (optional)
Vercel serverless functions can't run one-off scripts directly. Instead, run the seed script locally against your **production** database:
```bash
cd backend
# temporarily point MONGO_URI in your local .env to the same Atlas cluster you used in Vercel
node seed/seed.js
```

### A few things to keep in mind on Vercel
- **Cold starts**: the first request after inactivity can take 1-2 seconds longer while the serverless function spins up — this is normal.
- **Function timeout**: the free (Hobby) plan gives each request ~10 seconds. Image uploads to Cloudinary and emails normally finish well within that.
- **Razorpay**: switch from test keys to live keys only after your Razorpay account KYC is approved.
- If you'd rather run the backend somewhere with a traditional always-on Node process (simpler for things like Nodemailer/Twilio), Render.com or Railway.app also work well — the code needs no changes either way, since `server.js` still calls `app.listen()` when run directly.

## Troubleshooting
- If `npm install` errors out, make sure Node.js 18+ (ideally 20+) is installed.
- If MongoDB won't connect, double-check `MONGO_URI` in your `.env`.
- If login/register doesn't work, confirm the backend is actually running (open `http://localhost:5000` — you should see "API is running").
- If image upload fails, check your 3 Cloudinary keys.
- If payment won't start, check your Razorpay keys and confirm the `checkout.js` script is loading in `index.html` (needs internet access).
- If email isn't sending, use a Gmail App Password — your normal Gmail password won't work (enable 2-Step Verification, then generate an App Password).
- On Vercel specifically: if the frontend loads but API calls fail, double check `VITE_API_URL` (frontend project) and `FRONTEND_URL` (backend project) are both set correctly and that you redeployed after adding them.
