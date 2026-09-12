# ✈️ Skyline — Airline Booking Frontend

React + Tailwind frontend for the [Airline Booking API](../airline-api). Covers the full booking journey: search → flight details → seat selection → passenger details → mock payment, plus account management and an admin dashboard.

## Stack
- **React 18** + **React Router 6**
- **Tailwind CSS** (custom design tokens — see `tailwind.config.js`)
- **Axios** for API calls (auto-attaches JWT, redirects to `/login` on 401)
- **lucide-react** for icons
- **Vite** for dev/build

## Design system
- **Colors**: `midnight` (near-black navy, nav/hero), `paper` (page background), `amber` (primary CTA), `sky` (secondary/links), `good`/`bad` (status).
- **Type**: `Space Grotesk` for headings, `Inter` for body/UI.
- **Signature motif**: a dashed flight-path line with a plane icon (`RoutePath` component) connecting origin/destination codes — reused across flight cards, details, seat selection, and bookings.

## Getting started

```bash
npm install
cp .env.example .env       # point VITE_API_URL at your running backend
npm run dev
```

The backend (`../airline-api`) must be running — see its own README for setup (`npm run seed` gives you sample flights + a ready-made admin/user account).

App runs at `http://localhost:5173`.

## Pages

| Route | Page | Notes |
|---|---|---|
| `/` | Home | Hero + flight search widget |
| `/flights` | Flight results | Filters (airline/price), sort, pagination |
| `/flights/:id` | Flight details | Fare breakdown, "Select seats" CTA |
| `/flights/:id/seats` | Seat selection | Live seat map, protected route |
| `/booking` | Booking | Passenger details → review → mock payment → confirmation |
| `/login`, `/register` | Auth | |
| `/my-bookings` | My bookings | List + search by booking reference |
| `/my-bookings/:id` | Booking detail | Cancel / pay actions |
| `/profile` | Profile | Update name/phone/password |
| `/admin` | Admin dashboard | Overview stats, Flights CRUD + seat generation, Bookings, Users (protected, admin only) |

## How the booking flow is wired

`BookingContext` (in-memory + `sessionStorage`) carries the selected flight, seat count, chosen seats and passenger details between `FlightDetails → SeatSelection → Booking` without prop-drilling or re-fetching. It's cleared once payment succeeds.

`AuthContext` stores the JWT in `localStorage`, restores the session on load via `GET /auth/profile`, and exposes `login`, `register`, `logout`, `updateProfile`. Axios interceptors attach the token to every request and force a logout on `401`.

## Notes
- Booking/payment/cancellation error messages come straight from the API (in Arabic, matching the backend) — everything else in the UI is in English.
- No component library beyond Tailwind utilities — kept dependency-light on purpose.
- Not connected to a real payment processor; `/bookings/:id/pay` is a mock endpoint on the backend.
