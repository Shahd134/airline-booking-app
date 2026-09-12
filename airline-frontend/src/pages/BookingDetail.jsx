import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, CreditCard, XCircle } from 'lucide-react';
import { getBookingById, cancelBooking, payForBooking } from '../api/bookings';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import RoutePath from '../components/RoutePath';
import { formatDateTime, formatMoney, bookingStatusStyle, paymentStatusStyle } from '../lib/format';
import { getErrorMessage } from '../lib/axios';

export default function BookingDetail() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [showPayForm, setShowPayForm] = useState(false);
  const [reason, setReason] = useState('');
  const [cardNumber, setCardNumber] = useState('');

  const load = () => {
    setLoading(true);
    getBookingById(id)
      .then((res) => setBooking(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleCancel = async (e) => {
    e.preventDefault();
    setBusy(true);
    setActionError('');
    try {
      await cancelBooking(id, reason);
      setActionMessage('Your booking has been cancelled.');
      setShowCancelForm(false);
      load();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setBusy(true);
    setActionError('');
    try {
      await payForBooking(id, cardNumber);
      setActionMessage('Payment successful.');
      setShowPayForm(false);
      load();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Spinner size={28} />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <Alert type="error">{error || 'Booking not found.'}</Alert>
      </div>
    );
  }

  const canCancel = !['cancelled', 'completed'].includes(booking.status);
  const canPay = booking.paymentStatus === 'unpaid' && booking.status !== 'cancelled';

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link to="/my-bookings" className="mb-6 inline-flex items-center gap-1.5 text-sm text-mist hover:text-ink">
        <ChevronLeft size={15} /> Back to my bookings
      </Link>

      {actionMessage && (
        <div className="mb-5">
          <Alert type="success">{actionMessage}</Alert>
        </div>
      )}
      {actionError && (
        <div className="mb-5">
          <Alert type="error">{actionError}</Alert>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-midnight px-6 py-5">
          <p className="text-sm text-white/70">Ref. <span className="font-semibold text-white">{booking.bookingReference}</span></p>
          <div className="flex gap-2">
            <span className={`badge ${bookingStatusStyle[booking.status]}`}>{booking.status}</span>
            <span className={`badge ${paymentStatusStyle[booking.paymentStatus]}`}>{booking.paymentStatus}</span>
          </div>
        </div>

        <div className="space-y-6 p-6 sm:p-8">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-mist">Flight</p>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <RoutePath originCode={booking.flight?.origin?.code} destinationCode={booking.flight?.destination?.code} />
              <p className="text-sm text-mist">{formatDateTime(booking.flight?.departureTime)}</p>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-mist">Passengers</p>
            <div className="space-y-2">
              {booking.passengers?.map((p, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-paper px-4 py-2.5 text-sm">
                  <span className="text-ink/80">{p.fullName}</span>
                  <span className="text-mist">Seat {booking.seats?.[i]?.seatNumber}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-ink/10 pt-4">
            <span className="text-sm font-semibold text-ink">Total paid</span>
            <span className="font-display text-xl font-semibold text-ink">{formatMoney(booking.totalPrice)}</span>
          </div>

          {(canCancel || canPay) && (
            <div className="flex flex-wrap gap-3 border-t border-ink/10 pt-5">
              {canPay && (
                <button onClick={() => setShowPayForm((v) => !v)} className="btn-primary">
                  <CreditCard size={15} /> Pay now
                </button>
              )}
              {canCancel && (
                <button onClick={() => setShowCancelForm((v) => !v)} className="btn-outline text-bad">
                  <XCircle size={15} /> Cancel booking
                </button>
              )}
            </div>
          )}

          {showPayForm && (
            <form onSubmit={handlePay} className="space-y-3 rounded-xl bg-paper p-4">
              <label className="block">
                <span className="label">Card number</span>
                <input
                  required
                  className="input"
                  placeholder="4111 1111 1111 1111"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
              </label>
              <button type="submit" disabled={busy} className="btn-primary w-full">
                {busy ? <Spinner size={16} /> : `Pay ${formatMoney(booking.totalPrice)}`}
              </button>
            </form>
          )}

          {showCancelForm && (
            <form onSubmit={handleCancel} className="space-y-3 rounded-xl bg-paper p-4">
              <label className="block">
                <span className="label">Reason (optional)</span>
                <input
                  className="input"
                  placeholder="Change of plans"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </label>
              <button type="submit" disabled={busy} className="btn-outline w-full text-bad">
                {busy ? <Spinner size={16} /> : 'Confirm cancellation'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
