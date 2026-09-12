import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { TicketCheck, ArrowRight, Search } from 'lucide-react';
import { getMyBookings, getBookingByReference } from '../api/bookings';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import RoutePath from '../components/RoutePath';
import { formatDateTime, formatMoney, bookingStatusStyle, paymentStatusStyle } from '../lib/format';
import { getErrorMessage } from '../lib/axios';

export default function MyBookings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refQuery, setRefQuery] = useState('');
  const [refError, setRefError] = useState('');
  const [refLoading, setRefLoading] = useState(false);

  const page = Number(searchParams.get('page') || 1);

  useEffect(() => {
    setLoading(true);
    getMyBookings({ page })
      .then((res) => {
        setBookings(res.data);
        setMeta({ page: res.page, pages: res.pages, total: res.total });
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [page]);

  const handleReferenceSearch = async (e) => {
    e.preventDefault();
    if (!refQuery.trim()) return;
    setRefLoading(true);
    setRefError('');
    try {
      const res = await getBookingByReference(refQuery.trim());
      window.location.href = `/my-bookings/${res.data._id}`;
    } catch (err) {
      setRefError(getErrorMessage(err));
    } finally {
      setRefLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">My bookings</h1>
          <p className="mt-1 text-sm text-mist">{meta.total} booking{meta.total === 1 ? '' : 's'} on your account</p>
        </div>
        <form onSubmit={handleReferenceSearch} className="flex gap-2">
          <input
            className="input !w-48"
            placeholder="Find by reference"
            value={refQuery}
            onChange={(e) => setRefQuery(e.target.value)}
          />
          <button type="submit" className="btn-outline !px-3" disabled={refLoading}>
            {refLoading ? <Spinner size={15} /> : <Search size={15} />}
          </button>
        </form>
      </div>

      {refError && (
        <div className="mb-5">
          <Alert type="error">{refError}</Alert>
        </div>
      )}

      {loading && (
        <div className="grid place-items-center py-24">
          <Spinner size={28} />
        </div>
      )}

      {!loading && error && <Alert type="error">{error}</Alert>}

      {!loading && !error && bookings.length === 0 && (
        <EmptyState
          icon={TicketCheck}
          title="No bookings yet"
          description="Once you book a flight, it'll show up here."
          action={
            <Link to="/flights" className="btn-primary">
              Search flights <ArrowRight size={15} />
            </Link>
          }
        />
      )}

      <div className="space-y-4">
        {!loading &&
          !error &&
          bookings.map((b) => (
            <Link key={b._id} to={`/my-bookings/${b._id}`} className="card block p-5 transition-shadow hover:shadow-lg sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-medium text-mist">Ref. {b.bookingReference}</p>
                <div className="flex gap-2">
                  <span className={`badge ${bookingStatusStyle[b.status]}`}>{b.status}</span>
                  <span className={`badge ${paymentStatusStyle[b.paymentStatus]}`}>{b.paymentStatus}</span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                <RoutePath originCode={b.flight?.origin?.code} destinationCode={b.flight?.destination?.code} compact />
                <div className="text-right">
                  <p className="text-xs text-mist">{formatDateTime(b.flight?.departureTime)}</p>
                  <p className="font-display text-lg font-semibold text-ink">{formatMoney(b.totalPrice)}</p>
                </div>
              </div>
            </Link>
          ))}
      </div>

      {!loading && !error && bookings.length > 0 && (
        <div className="mt-6">
          <Pagination page={meta.page} pages={meta.pages} onChange={(p) => setSearchParams({ page: p })} />
        </div>
      )}
    </div>
  );
}
