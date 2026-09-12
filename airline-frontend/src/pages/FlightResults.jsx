import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, PlaneTakeoff } from 'lucide-react';
import { searchFlights } from '../api/flights';
import { getAirports } from '../api/airports';
import FlightCard from '../components/FlightCard';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import { getErrorMessage } from '../lib/axios';

export default function FlightResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [flights, setFlights] = useState([]);
  const [airports, setAirports] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const passengers = Number(searchParams.get('passengers') || 1);

  useEffect(() => {
    getAirports().then((res) => setAirports(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    const params = Object.fromEntries(searchParams.entries());
    searchFlights(params)
      .then((res) => {
        setFlights(res.data);
        setMeta({ page: res.page, pages: res.pages, total: res.total });
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [searchParams]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  const originName = airports.find((a) => a._id === searchParams.get('origin'));
  const destName = airports.find((a) => a._id === searchParams.get('destination'));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
          {originName || destName
            ? `${originName?.city || 'Anywhere'} → ${destName?.city || 'Anywhere'}`
            : 'All flights'}
        </h1>
        <p className="mt-1 text-sm text-mist">
          {loading ? 'Searching…' : `${meta.total} flight${meta.total === 1 ? '' : 's'} found · ${passengers} passenger${passengers > 1 ? 's' : ''}`}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Filters */}
        <aside className="card h-fit space-y-5 p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <SlidersHorizontal size={15} /> Refine results
          </p>

          <label className="block">
            <span className="label">Airline</span>
            <input
              className="input"
              placeholder="e.g. EgyptAir"
              defaultValue={searchParams.get('airline') || ''}
              onBlur={(e) => updateParam('airline', e.target.value)}
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="label">Min price</span>
              <input
                type="number"
                className="input"
                defaultValue={searchParams.get('minPrice') || ''}
                onBlur={(e) => updateParam('minPrice', e.target.value)}
              />
            </label>
            <label className="block">
              <span className="label">Max price</span>
              <input
                type="number"
                className="input"
                defaultValue={searchParams.get('maxPrice') || ''}
                onBlur={(e) => updateParam('maxPrice', e.target.value)}
              />
            </label>
          </div>

          <label className="block">
            <span className="label">Sort by</span>
            <select
              className="input"
              value={searchParams.get('sort') || ''}
              onChange={(e) => updateParam('sort', e.target.value)}
            >
              <option value="">Departure (earliest)</option>
              <option value="price.economy">Price (lowest)</option>
              <option value="-price.economy">Price (highest)</option>
              <option value="-departureTime">Departure (latest)</option>
            </select>
          </label>
        </aside>

        {/* Results */}
        <div className="space-y-4">
          {loading && (
            <div className="grid place-items-center py-24">
              <Spinner size={28} />
            </div>
          )}

          {!loading && error && <Alert type="error">{error}</Alert>}

          {!loading && !error && flights.length === 0 && (
            <EmptyState
              icon={PlaneTakeoff}
              title="No flights match your search"
              description="Try widening your dates or clearing a filter."
            />
          )}

          {!loading &&
            !error &&
            flights.map((flight) => (
              <FlightCard key={flight._id} flight={flight} search={`?passengers=${passengers}`} />
            ))}

          {!loading && !error && flights.length > 0 && (
            <Pagination page={meta.page} pages={meta.pages} onChange={(p) => updateParam('page', p)} />
          )}
        </div>
      </div>
    </div>
  );
}
