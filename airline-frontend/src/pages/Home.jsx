import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, MapPin, Calendar, Users, ArrowRight, ShieldCheck, Clock3, Tag } from 'lucide-react';
import { getAirports } from '../api/airports';

const todayISO = () => new Date().toISOString().split('T')[0];

export default function Home() {
  const navigate = useNavigate();
  const [airports, setAirports] = useState([]);
  const [form, setForm] = useState({ origin: '', destination: '', date: '', passengers: 1 });

  useEffect(() => {
    getAirports()
      .then((res) => setAirports(res.data))
      .catch(() => {});
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (form.origin) params.set('origin', form.origin);
    if (form.destination) params.set('destination', form.destination);
    if (form.date) params.set('date', form.date);
    params.set('passengers', form.passengers);
    navigate(`/flights?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-midnight">
        <svg
          className="pointer-events-none absolute -right-24 -top-10 h-[420px] w-[420px] text-white/[0.06]"
          viewBox="0 0 400 400"
          fill="none"
        >
          <circle cx="200" cy="200" r="199" stroke="currentColor" />
          <circle cx="200" cy="200" r="140" stroke="currentColor" />
        </svg>

        <div className="relative mx-auto max-w-6xl px-4 pb-28 pt-16 sm:px-6 sm:pt-24">
          <div className="max-w-xl">
            <p className="mb-4 flex items-center gap-2 text-sm font-medium text-amber">
              <Plane size={15} /> Flights, without the fuss
            </p>
            <h1 className="font-display text-4xl font-semibold leading-[1.1] text-white sm:text-5xl">
              Find your next flight in minutes, not tabs.
            </h1>
            <p className="mt-5 max-w-md text-base text-white/70">
              Compare routes, pick your seat and book — one clean flow, no hidden fees, no
              twenty browser tabs.
            </p>
          </div>
        </div>
      </section>

      {/* Search card, straddling hero and body */}
      <section className="relative mx-auto -mt-16 max-w-5xl px-4 sm:px-6">
        <form onSubmit={handleSubmit} className="card grid gap-4 p-5 sm:grid-cols-5 sm:gap-3 sm:p-6">
          <label className="sm:col-span-1">
            <span className="label flex items-center gap-1.5">
              <MapPin size={13} /> From
            </span>
            <select
              className="input"
              value={form.origin}
              onChange={(e) => setForm({ ...form, origin: e.target.value })}
            >
              <option value="">Any city</option>
              {airports.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.city} ({a.code})
                </option>
              ))}
            </select>
          </label>

          <label className="sm:col-span-1">
            <span className="label flex items-center gap-1.5">
              <MapPin size={13} /> To
            </span>
            <select
              className="input"
              value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })}
            >
              <option value="">Any city</option>
              {airports.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.city} ({a.code})
                </option>
              ))}
            </select>
          </label>

          <label className="sm:col-span-1">
            <span className="label flex items-center gap-1.5">
              <Calendar size={13} /> Departure
            </span>
            <input
              type="date"
              min={todayISO()}
              className="input"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </label>

          <label className="sm:col-span-1">
            <span className="label flex items-center gap-1.5">
              <Users size={13} /> Passengers
            </span>
            <input
              type="number"
              min={1}
              max={9}
              className="input"
              value={form.passengers}
              onChange={(e) => setForm({ ...form, passengers: e.target.value })}
            />
          </label>

          <div className="flex items-end sm:col-span-1">
            <button type="submit" className="btn-primary w-full !py-3">
              Search flights <ArrowRight size={15} />
            </button>
          </div>
        </form>
      </section>

      {/* Trust strip */}
      <section className="mx-auto max-w-5xl px-4 pb-4 pt-14 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { icon: Tag, title: 'Transparent pricing', text: 'The fare you see is the fare you pay — no surprise fees at checkout.' },
            { icon: ShieldCheck, title: 'Flexible cancellation', text: 'Free cancellation up to 24 hours before departure.' },
            { icon: Clock3, title: 'Real-time seats', text: 'Seat maps update live, so you never lose a seat to someone else.' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-3">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sky-light text-sky">
                <Icon size={17} />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-ink">{title}</h3>
                <p className="mt-1 text-sm text-mist">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
