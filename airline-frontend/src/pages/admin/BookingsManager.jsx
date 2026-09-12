import React, { useEffect, useState } from 'react';
import { getAllBookingsAdmin } from '../../api/admin';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import Pagination from '../../components/Pagination';
import RoutePath from '../../components/RoutePath';
import { formatDateTime, formatMoney, bookingStatusStyle, paymentStatusStyle } from '../../lib/format';
import { getErrorMessage } from '../../lib/axios';

export default function BookingsManager() {
  const [bookings, setBookings] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getAllBookingsAdmin({ page, limit: 10 })
      .then((res) => {
        setBookings(res.data);
        setMeta({ page: res.page, pages: res.pages });
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) {
    return (
      <div className="grid place-items-center py-24">
        <Spinner size={28} />
      </div>
    );
  }

  if (error) return <Alert type="error">{error}</Alert>;

  return (
    <div>
      <div className="space-y-3">
        {bookings.map((b) => (
          <div key={b._id} className="card p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-mist">Ref. {b.bookingReference}</p>
                <p className="text-sm text-ink/80">{b.user?.name} · {b.user?.email}</p>
              </div>
              <div className="flex gap-2">
                <span className={`badge ${bookingStatusStyle[b.status]}`}>{b.status}</span>
                <span className={`badge ${paymentStatusStyle[b.paymentStatus]}`}>{b.paymentStatus}</span>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <RoutePath originCode={b.flight?.origin?.code} destinationCode={b.flight?.destination?.code} compact />
              <div className="text-right text-sm">
                <p className="text-mist">{formatDateTime(b.flight?.departureTime)}</p>
                <p className="font-semibold text-ink">{formatMoney(b.totalPrice)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <Pagination page={meta.page} pages={meta.pages} onChange={setPage} />
      </div>
    </div>
  );
}
