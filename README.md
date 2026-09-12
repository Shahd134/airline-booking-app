# ✈️ Airline Booking App

Full-stack airline booking application: Node/Express/MongoDB API + React/Tailwind frontend.

- 🔗 **Live demo**: _add your Vercel URL here after deploying_
- 📚 **API docs (Swagger)**: _add your Render URL + `/api-docs` here_

| Demo account | Email | Password |
|---|---|---|
| Admin | admin@airline.com | admin123 |
| User | user@airline.com | user1234 |
_(created by `npm run seed` — see [`airline-api/README.md`](airline-api/README.md))_

## Structure

```
airline-booking-app/
├── airline-api/        # Express + MongoDB REST API — see its README for full docs
├── airline-frontend/    # React + Tailwind client — see its README for full docs
└── DEPLOYMENT.md        # step-by-step guide to deploy both, free
```

## Run locally

```bash
# Terminal 1 — backend
cd airline-api
npm install
cp .env.example .env      # fill in MONGO_URI, JWT_SECRET
npm run seed               # optional: sample data + demo accounts
npm run dev

# Terminal 2 — frontend
cd airline-frontend
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:5000/api
npm run dev
```

Frontend: `http://localhost:5173` · Backend: `http://localhost:5000` · Swagger: `http://localhost:5000/api-docs`

## Deploying

See [`DEPLOYMENT.md`](DEPLOYMENT.md) for the full walkthrough (MongoDB Atlas → Render → Vercel, all free tier).

## Highlights

- Booking creation/cancellation wrapped in MongoDB transactions, with an atomic seat lock that prevents two users from double-booking the same seat under concurrent load (covered by a dedicated test)
- Centralized error handling, request validation, pagination, and Swagger docs on the API
- Jest + Supertest test suite running on an in-memory MongoDB replica set (no external DB needed to run tests)
- React frontend with a shared design system (Tailwind tokens), a booking flow that carries state across pages via context, and an admin dashboard with live stats

See each subfolder's own README for full endpoint lists, design notes, and architecture details.
