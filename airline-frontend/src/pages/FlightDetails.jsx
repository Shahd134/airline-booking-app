import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Plane, Clock, Users, CalendarDays, ArrowRight, ChevronLeft } from 'lucide-react';
import { getFlight } from '../api/flights';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import RoutePath from '../components/RoutePath';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import { formatDateTime, formatDuration, formatMoney, flightStatusStyle } from '../lib/format';

export default function FlightDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const passengers = Math.max(1, Number(searchParams.get('passengers') || 1));
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { startBooking } = useBooking();

  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getFlight(id)
      .then((res) => setFlight(res.data))
      .catch(() => setError('This flight could not be found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleContinue = () => {
    startBooking(flight, passengers);
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/flights/${id}/seats` } } });
      return;
    }
    navigate(`/flights/${id}/seats`);
  };

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Spinner size={28} />
      </div>
    );
  }

  if (error || !flight) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <Alert type="error">{error || 'Flight not found.'}</Alert>
      </div>
    );
  }

  const notEnoughSeats = flight.availableSeats < passengers;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link to="/flights" className="mb-6 inline-flex items-center gap-1.5 text-sm text-mist hover:text-ink">
        <ChevronLeft size={15} /> Back to results
      </Link>

      <div className="card overflow-hidden">
        <div className="bg-midnight px-6 py-6 sm:px-8">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-medium text-amber">
              <Plane size={15} /> {flight.airline} · {flight.flightNumber}
            </p>
            <span className={`badge ${flightStatusStyle[flight.status]}`}>{flight.status}</span>
          </div>
          <div className="mt-5 flex items-end justify-between gap-6">
            <div>
              <p className="font-display text-3xl font-semibold text-white">
                {new Date(flight.departureTime).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p className="mt-1 text-sm text-white/60">
                {flight.origin?.city} ({flight.origin?.code})
              </p>
            </div>
            <div className="flex flex-1 flex-col items-center gap-1 pb-1 text-white/50">
              <span className="flex items-center gap-1 text-xs">
                <Clock size={12} /> {formatDuration(flight.duration)}
              </span>
              <RoutePath
                originCode={flight.origin?.code}
                destinationCode={flight.destination?.code}
                bgClassName="bg-midnight"
              />
            </div>
            <div className="text-right">
              <p className="font-display text-3xl font-semibold text-white">
                {new Date(flight.arrivalTime).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p className="mt-1 text-sm text-white/60">
                {flight.destination?.city} ({flight.destination?.code})
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 p-6 sm:grid-cols-2 sm:p-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-ink/80">
              <CalendarDays size={16} className="text-mist" />
              {formatDateTime(flight.departureTime)}
            </div>
            <div className="flex items-center gap-3 text-sm text-ink/80">
              <Users size={16} className="text-mist" />
              {flight.availableSeats} of {flight.totalSeats} seats available
            </div>

            <div className="rounded-xl bg-paper p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-mist">Fare by class</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink/70">Economy</span>
                  <span className="font-medium text-ink">{formatMoney(flight.price?.economy)}</span>
                </div>
                {flight.price?.business > 0 && (
                  <div className="flex justify-between">
                    <span className="text-ink/70">Business</span>
                    <span className="font-medium text-ink">{formatMoney(flight.price.business)}</span>
                  </div>
                )}
                {flight.price?.firstClass > 0 && (
                  <div className="flex justify-between">
                    <span className="text-ink/70">First class</span>
                    <span className="font-medium text-ink">{formatMoney(flight.price.firstClass)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-ink/10 p-5">
            <div>
              <p className="text-sm text-mist">From</p>
              <p className="font-display text-3xl font-semibold text-ink">
                {formatMoney(flight.price?.economy)}
              </p>
              <p className="mt-1 text-xs text-mist">per passenger, economy class</p>
            </div>

            {notEnoughSeats ? (
              <Alert type="error">Not enough seats left for {passengers} passengers.</Alert>
            ) : flight.status !== 'scheduled' ? (
              <Alert type="info">This flight is {flight.status} and can't be booked.</Alert>
            ) : (
              <button onClick={handleContinue} className="btn-primary mt-5 w-full !py-3">
                Select seats <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
