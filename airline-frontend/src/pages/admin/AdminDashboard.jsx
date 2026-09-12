import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, PlaneTakeoff, Users, TicketCheck } from 'lucide-react';
import Overview from './Overview';
import FlightsManager from './FlightsManager';
import UsersManager from './UsersManager';
import BookingsManager from './BookingsManager';

const links = [
  { to: '/admin', end: true, label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/flights', label: 'Flights', icon: PlaneTakeoff },
  { to: '/admin/bookings', label: 'Bookings', icon: TicketCheck },
  { to: '/admin/users', label: 'Users', icon: Users },
];

export default function AdminDashboard() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Admin dashboard</h1>
      <p className="mt-1 text-sm text-mist">Manage flights, bookings and users.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[200px_1fr]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {links.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-midnight text-white' : 'text-ink/70 hover:bg-white'
                }`
              }
            >
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="min-w-0">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="flights" element={<FlightsManager />} />
            <Route path="bookings" element={<BookingsManager />} />
            <Route path="users" element={<UsersManager />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
