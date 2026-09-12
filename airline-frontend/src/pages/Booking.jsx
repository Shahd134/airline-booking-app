import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ArrowRight, CreditCard, CheckCircle2, User } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { createBooking, payForBooking } from '../api/bookings';
import RoutePath from '../components/RoutePath';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';
import { formatMoney, formatDateTime } from '../lib/format';
import { getErrorMessage } from '../lib/axios';

const emptyPassenger = () => ({ fullName: '', passportNumber: '', dateOfBirth: '' });

export default function Booking() {
  const { draft, setPassengers, clearBooking } = useBooking();
  const navigate = useNavigate();

  const [step, setStep] = useState('details'); // details -> review -> payment -> done
  const [passengers, setLocalPassengers] = useState(
    draft?.passengers?.length ? draft.passengers : Array.from({ length: draft?.seats?.length || 0 }, emptyPassenger)
  );
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [booking, setBooking] = useState(null);
  const [cardNumber, setCardNumber] = useState('');
  const [paymentResult, setPaymentResult] = useState(null);

  useEffect(() => {
    if (!draft || !draft.seats?.length) {
      navigate('/flights', { replace: true });
    }
  }, [draft, navigate]);

  if (!draft || !draft.seats?.length) return null;

  const { flight, seats } = draft;
  const total = seats.reduce((sum, s) => sum + (flight.price?.[s.class] ?? flight.price?.economy ?? 0), 0);

  const updatePassenger = (i, field, value) => {
    setLocalPassengers((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)));
  };

  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    setPassengers(passengers);
    setStep('review');
  };

  const handleConfirmBooking = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await createBooking({
        flightId: flight._id,
        seatIds: seats.map((s) => s._id),
        passengers,
      });
      setBooking(res.data);
      setStep('payment');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await payForBooking(booking._id, cardNumber);
      setPaymentResult(res.data);
      setStep('done');
      clearBooking();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const steps = ['details', 'review', 'payment', 'done'];
  const stepIndex = steps.indexOf(step);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {step !== 'done' && (
        <Link to={`/flights/${flight._id}/seats`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-mist hover:text-ink">
          <ChevronLeft size={15} /> Back to seats
        </Link>
      )}

      {/* Step indicator */}
      {step !== 'done' && (
        <div className="mb-8 flex items-center gap-2">
          {['Passenger details', 'Review', 'Payment'].map((label, i) => (
            <React.Fragment key={label}>
              <div className="flex items-center gap-2">
                <span
                  className={`grid h-6 w-6 place-items-center rounded-full text-xs font-semibold ${
                    i <= stepIndex ? 'bg-amber text-midnight' : 'bg-ink/10 text-mist'
                  }`}
                >
                  {i + 1}
                </span>
                <span className={`text-sm ${i <= stepIndex ? 'text-ink' : 'text-mist'}`}>{label}</span>
              </div>
              {i < 2 && <span className="h-px w-6 bg-ink/10" />}
            </React.Fragment>
          ))}
        </div>
      )}

      {error && (
        <div className="mb-5">
          <Alert type="error">{error}</Alert>
        </div>
      )}

      {/* STEP 1: passenger details */}
      {step === 'details' && (
        <form onSubmit={handleDetailsSubmit} className="space-y-5">
          <h1 className="font-display text-2xl font-semibold text-ink">Who's flying?</h1>
          {seats.map((seat, i) => (
            <div key={seat._id} className="card space-y-4 p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                <User size={15} className="text-sky" /> Passenger {i + 1} · Seat {seat.seatNumber} ({seat.class})
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="label">Full name</span>
                  <input
                    required
                    className="input"
                    value={passengers[i]?.fullName || ''}
                    onChange={(e) => updatePassenger(i, 'fullName', e.target.value)}
                    placeholder="As shown on passport"
                  />
                </label>
                <label className="block">
                  <span className="label">Passport number</span>
                  <input
                    required
                    className="input"
                    value={passengers[i]?.passportNumber || ''}
                    onChange={(e) => updatePassenger(i, 'passportNumber', e.target.value)}
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="label">Date of birth (optional)</span>
                  <input
                    type="date"
                    className="input"
                    value={passengers[i]?.dateOfBirth || ''}
                    onChange={(e) => updatePassenger(i, 'dateOfBirth', e.target.value)}
                  />
                </label>
              </div>
            </div>
          ))}
          <button type="submit" className="btn-primary w-full !py-3">
            Continue to review <ArrowRight size={15} />
          </button>
        </form>
      )}

      {/* STEP 2: review */}
      {step === 'review' && (
        <div className="space-y-5">
          <h1 className="font-display text-2xl font-semibold text-ink">Review your trip</h1>

          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-mist">
                {flight.airline} · {flight.flightNumber}
              </p>
              <p className="text-sm text-mist">{formatDateTime(flight.departureTime)}</p>
            </div>
            <RoutePath originCode={flight.origin?.code} destinationCode={flight.destination?.code} />
          </div>

          <div className="card space-y-3 p-5">
            <p className="text-sm font-semibold text-ink">Passengers & seats</p>
            {seats.map((seat, i) => (
              <div key={seat._id} className="flex items-center justify-between border-b border-ink/5 pb-3 text-sm last:border-0 last:pb-0">
                <span className="text-ink/80">{passengers[i]?.fullName}</span>
                <span className="text-mist">
                  Seat {seat.seatNumber} · {formatMoney(flight.price?.[seat.class] ?? flight.price?.economy)}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-ink/10 pt-3 text-sm font-semibold">
              <span>Total</span>
              <span className="font-display text-lg text-ink">{formatMoney(total)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('details')} className="btn-outline flex-1">
              Edit details
            </button>
            <button onClick={handleConfirmBooking} disabled={submitting} className="btn-primary flex-1">
              {submitting ? <Spinner size={16} /> : <>Confirm booking <ArrowRight size={15} /></>}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: payment */}
      {step === 'payment' && booking && (
        <form onSubmit={handlePay} className="space-y-5">
          <h1 className="font-display text-2xl font-semibold text-ink">Pay for your booking</h1>
          <Alert type="info">
            Booking reference <strong>{booking.bookingReference}</strong> was created — it will be released if
            payment isn't completed. This is a simulated payment: any card number works, except one ending in{' '}
            <strong>0000</strong> (used to test a failed payment).
          </Alert>

          <div className="card space-y-4 p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <CreditCard size={15} className="text-sky" /> Card details
            </p>
            <label className="block">
              <span className="label">Card number</span>
              <input
                required
                className="input"
                inputMode="numeric"
                placeholder="4111 1111 1111 1111"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
              />
            </label>
            <div className="flex items-center justify-between border-t border-ink/10 pt-4 text-sm font-semibold">
              <span>Amount due</span>
              <span className="font-display text-lg text-ink">{formatMoney(booking.totalPrice)}</span>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full !py-3">
            {submitting ? <Spinner size={16} /> : <>Pay {formatMoney(booking.totalPrice)}</>}
          </button>
        </form>
      )}

      {/* STEP 4: done */}
      {step === 'done' && paymentResult && (
        <div className="card flex flex-col items-center p-10 text-center">
          <span className="mb-5 grid h-14 w-14 place-items-center rounded-full bg-good/10 text-good">
            <CheckCircle2 size={28} />
          </span>
          <h1 className="font-display text-2xl font-semibold text-ink">You're booked!</h1>
          <p className="mt-2 max-w-sm text-sm text-mist">
            A confirmation has been created for booking reference{' '}
            <strong className="text-ink">{paymentResult.booking.bookingReference}</strong>.
          </p>
          <div className="mt-6 flex gap-3">
            <Link to="/my-bookings" className="btn-primary">
              View my bookings <ArrowRight size={15} />
            </Link>
            <Link to="/" className="btn-outline">
              Back home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
