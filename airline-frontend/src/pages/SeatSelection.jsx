import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import { getSeatsByFlight } from '../api/seats';
import { useBooking } from '../context/BookingContext';
import SeatMap from '../components/SeatMap';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import RoutePath from '../components/RoutePath';
import { formatMoney } from '../lib/format';

export default function SeatSelection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { draft, setSeats } = useBooking();

  const [seats, setSeatsList] = useState([]);
  const [selected, setSelected] = useState(draft?.seats?.map((s) => s._id) || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!draft || draft.flight._id !== id) {
      navigate(`/flights/${id}`, { replace: true });
      return;
    }
    getSeatsByFlight(id)
      .then((res) => setSeatsList(res.data))
      .catch(() => setError('Could not load the seat map.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!draft) return null;

  const passengerCount = draft.passengerCount;
  const selectedSeats = seats.filter((s) => selected.includes(s._id));
  const total = selectedSeats.reduce((sum, s) => sum + (draft.flight.price?.[s.class] ?? draft.flight.price?.economy ?? 0), 0);

  const toggleSeat = (seat) => {
    setSelected((prev) =>
      prev.includes(seat._id) ? prev.filter((id_) => id_ !== seat._id) : [...prev, seat._id]
    );
  };

  const handleContinue = () => {
    setSeats(selectedSeats);
    navigate('/booking');
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link to={`/flights/${id}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-mist hover:text-ink">
        <ChevronLeft size={15} /> Back to flight
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Choose your seats</h1>
          <p className="mt-1 text-sm text-mist">
            Select exactly {passengerCount} seat{passengerCount > 1 ? 's' : ''} for this trip.
          </p>
        </div>
        <RoutePath
          originCode={draft.flight.origin?.code}
          destinationCode={draft.flight.destination?.code}
          compact
          bgClassName="bg-paper"
        />
      </div>

      {loading && (
        <div className="grid place-items-center py-24">
          <Spinner size={28} />
        </div>
      )}

      {!loading && error && <Alert type="error">{error}</Alert>}

      {!loading && !error && (
        <>
          <SeatMap seats={seats} selectedIds={selected} onToggle={toggleSeat} maxSeats={passengerCount} />

          <div className="card sticky bottom-4 mt-6 flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p className="text-sm text-mist">
                {selected.length} of {passengerCount} seat{passengerCount > 1 ? 's' : ''} selected
              </p>
              <p className="font-display text-lg font-semibold text-ink">{formatMoney(total)}</p>
            </div>
            <button
              onClick={handleContinue}
              disabled={selected.length !== passengerCount}
              className="btn-primary !py-3"
            >
              Continue to passenger details <ArrowRight size={15} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
