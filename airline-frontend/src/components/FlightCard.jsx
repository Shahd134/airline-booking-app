import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users } from 'lucide-react';
import RoutePath from './RoutePath';
import { formatDuration, formatMoney, formatTime, formatDate } from '../lib/format';

export default function FlightCard({ flight, search = '' }) {
  return (
    <Link
      to={`/flights/${flight._id}${search}`}
      className="card group grid gap-5 p-5 transition-shadow hover:shadow-lg sm:grid-cols-[1fr_auto] sm:items-center sm:p-6"
    >
      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-mist">
            {flight.airline} · {flight.flightNumber}
          </span>
          <span className="badge bg-paper text-mist">{formatDate(flight.departureTime)}</span>
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <div>
            <p className="font-display text-lg font-semibold text-ink">{formatTime(flight.departureTime)}</p>
            <p className="text-xs text-mist">{flight.origin?.city || flight.origin?.code}</p>
          </div>

          <div className="flex flex-col items-center gap-1 text-mist">
            <span className="flex items-center gap-1 text-xs">
              <Clock size={12} /> {formatDuration(flight.duration)}
            </span>
            <RoutePath originCode={flight.origin?.code} destinationCode={flight.destination?.code} compact />
            <span className="text-xs">Direct</span>
          </div>

          <div>
            <p className="font-display text-lg font-semibold text-ink">{formatTime(flight.arrivalTime)}</p>
            <p className="text-xs text-mist">{flight.destination?.city || flight.destination?.code}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-6 border-t border-ink/5 pt-4 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0 sm:text-right">
        <div>
          <p className="font-display text-2xl font-semibold text-ink">{formatMoney(flight.price?.economy)}</p>
          <p className="flex items-center gap-1 text-xs text-mist sm:justify-end">
            <Users size={12} /> {flight.availableSeats} seats left
          </p>
        </div>
        <span className="btn-primary !py-2 !px-4 text-xs group-hover:bg-amber-dark">View flight</span>
      </div>
    </Link>
  );
}
