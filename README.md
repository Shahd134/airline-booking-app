✈️ Airline Booking App

A full-stack airline booking application built with Node.js, Express, MongoDB, React, and Tailwind CSS.

Users can search for flights, select seats, create and manage bookings, while administrators can manage flights and monitor bookings through a dedicated dashboard.

🔗 Links

* Live Demo: https://airline-booking-app-six.vercel.app
* API: https://airline-booking-app-clbo.onrender.com
* Swagger API Docs: https://airline-booking-app-clbo.onrender.com/api-docs

🔐 Demo Accounts

Role	Email	Password
Admin	admin@airline.com	admin123
User	user@airline.com	user1234

Demo accounts can also be created using npm run seed.

🛠️ Tech Stack

Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Jest
* Supertest
* Swagger / OpenAPI

Frontend

* React
* Tailwind CSS
* React Router
* Context API

✨ Features

User

* Search and browse available flights
* Select a flight
* Select seats
* Create bookings
* View and manage bookings
* Cancel bookings
* Authentication and authorization

Admin

* Admin authentication
* Manage flights
* View bookings
* Monitor booking statistics through the dashboard

Backend

* RESTful API
* JWT-based authentication
* Role-based authorization
* Request validation
* Centralized error handling
* Pagination
* Swagger API documentation
* MongoDB transactions
* Atomic seat locking to prevent double-booking
* Automated API tests with Jest and Supertest

🔒 Booking & Seat Management

Booking creation and cancellation use MongoDB transactions.

Seat selection uses an atomic locking mechanism to prevent two users from booking the same seat concurrently.

The concurrency behavior is covered by automated tests.

🧪 Testing

The backend includes a Jest + Supertest test suite using an in-memory MongoDB replica set, so the tests can run without requiring an external database.

To run the tests:

cd airline-api
npm install
npm test

📁 Project Structure

airline-booking-app/
├── airline-api/           # Express + MongoDB REST API
├── airline-frontend/      # React + Tailwind frontend
└── DEPLOYMENT.md          # Deployment instructions

Each subfolder contains its own README with additional documentation, endpoint details, and implementation notes.

🚀 Run Locally

1. Clone the repository

git clone <your-github-repository-url>
cd airline-booking-app

2. Run the Backend

cd airline-api
npm install
cp .env.example .env

Configure your .env file with:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

Then optionally create the demo accounts and sample data:

npm run seed

Start the backend:

npm run dev

Backend:

http://localhost:5000

Swagger:

http://localhost:5000/api-docs

3. Run the Frontend

Open another terminal:

cd airline-frontend
npm install
cp .env.example .env

Set the API URL:

VITE_API_URL=http://localhost:5000/api

Start the frontend:

npm run dev

Frontend:

http://localhost:5173

🌐 Deployment

The application can be deployed using:

* MongoDB Atlas — Database
* Render — Backend API
* Vercel — React Frontend

The deployed application is available through the links above.

📚 API Documentation

The complete REST API is documented using Swagger/OpenAPI.

Swagger: https://airline-booking-app-clbo.onrender.com/api-docs