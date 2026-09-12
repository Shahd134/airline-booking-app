/**
 * سكريبت لتعبئة قاعدة البيانات ببيانات تجريبية
 * تشغيل: npm run seed        -> يمسح ويعبي البيانات
 * تشغيل: npm run seed:destroy -> يمسح كل البيانات بس
 */
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const User = require('../models/User');
const Airport = require('../models/Airport');
const Flight = require('../models/Flight');
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');

const connectDB = require('../config/db');

const airportsData = [
  { code: 'CAI', name: 'Cairo International Airport', city: 'Cairo', country: 'Egypt' },
  { code: 'HRG', name: 'Hurghada International Airport', city: 'Hurghada', country: 'Egypt' },
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'UAE' },
  { code: 'JED', name: 'King Abdulaziz International Airport', city: 'Jeddah', country: 'Saudi Arabia' },
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey' },
  { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'UK' },
];

const addDays = (days, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d;
};

const generateSeatsForFlight = async (flight, businessRows = 2) => {
  const seatsToCreate = [];
  const rows = Math.ceil(flight.totalSeats / 6);
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  for (let row = 1; row <= rows; row++) {
    for (const letter of letters) {
      if (seatsToCreate.length >= flight.totalSeats) break;
      seatsToCreate.push({
        flight: flight._id,
        seatNumber: `${row}${letter}`,
        class: row <= businessRows ? 'business' : 'economy',
      });
    }
  }

  await Seat.insertMany(seatsToCreate);
};

const seed = async () => {
  await connectDB();

  console.log('🗑  بمسح البيانات القديمة...');
  await Promise.all([
    User.deleteMany(),
    Airport.deleteMany(),
    Flight.deleteMany(),
    Seat.deleteMany(),
    Booking.deleteMany(),
  ]);

  console.log('👤 بعمل مستخدمين...');
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@airline.com',
    password: 'admin123',
    role: 'admin',
    phone: '+201000000000',
  });

  const testUser = await User.create({
    name: 'Test User',
    email: 'user@airline.com',
    password: 'user1234',
    role: 'user',
    phone: '+201111111111',
  });

  console.log('✈️  بعمل مطارات...');
  const airports = await Airport.insertMany(airportsData);
  const byCode = Object.fromEntries(airports.map((a) => [a.code, a]));

  console.log('🛫 بعمل رحلات...');
  const flightsData = [
    {
      flightNumber: 'MS101',
      airline: 'EgyptAir',
      origin: byCode.CAI._id,
      destination: byCode.DXB._id,
      departureTime: addDays(3, 8),
      arrivalTime: addDays(3, 12),
      price: { economy: 4500, business: 9000 },
      totalSeats: 60,
    },
    {
      flightNumber: 'MS205',
      airline: 'EgyptAir',
      origin: byCode.CAI._id,
      destination: byCode.HRG._id,
      departureTime: addDays(1, 6),
      arrivalTime: addDays(1, 7),
      price: { economy: 1200, business: 2500 },
      totalSeats: 60,
    },
    {
      flightNumber: 'TK720',
      airline: 'Turkish Airlines',
      origin: byCode.CAI._id,
      destination: byCode.IST._id,
      departureTime: addDays(5, 14),
      arrivalTime: addDays(5, 17),
      price: { economy: 3800, business: 7500 },
      totalSeats: 60,
    },
    {
      flightNumber: 'SV302',
      airline: 'Saudia',
      origin: byCode.CAI._id,
      destination: byCode.JED._id,
      departureTime: addDays(2, 9),
      arrivalTime: addDays(2, 11),
      price: { economy: 2800, business: 6000 },
      totalSeats: 60,
    },
    {
      flightNumber: 'BA155',
      airline: 'British Airways',
      origin: byCode.CAI._id,
      destination: byCode.LHR._id,
      departureTime: addDays(7, 23),
      arrivalTime: addDays(8, 5),
      price: { economy: 9500, business: 22000 },
      totalSeats: 60,
    },
  ];

  for (const data of flightsData) {
    const flight = await Flight.create({ ...data, availableSeats: data.totalSeats });
    await generateSeatsForFlight(flight);
  }

  console.log('✅ تمت التعبئة بنجاح!');
  console.log('----------------------------------------');
  console.log('حساب الأدمن  -> admin@airline.com / admin123');
  console.log('حساب المستخدم -> user@airline.com / user1234');
  console.log('----------------------------------------');

  await mongoose.connection.close();
  process.exit(0);
};

const destroy = async () => {
  await connectDB();
  await Promise.all([
    User.deleteMany(),
    Airport.deleteMany(),
    Flight.deleteMany(),
    Seat.deleteMany(),
    Booking.deleteMany(),
  ]);
  console.log('🗑  تم مسح كل البيانات');
  await mongoose.connection.close();
  process.exit(0);
};

if (process.argv.includes('--destroy')) {
  destroy();
} else {
  seed();
}
