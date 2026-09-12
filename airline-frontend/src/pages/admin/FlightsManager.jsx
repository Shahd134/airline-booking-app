import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Armchair } from 'lucide-react';
import { searchFlights, createFlight, updateFlight, deleteFlight } from '../../api/flights';
import { getAirports } from '../../api/airports';
import { generateSeats } from '../../api/seats';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import Pagination from '../../components/Pagination';
import { formatDateTime, formatMoney, flightStatusStyle } from '../../lib/format';
import { getErrorMessage } from '../../lib/axios';

const emptyForm = {
  flightNumber: '',
  airline: '',
  origin: '',
  destination: '',
  departureTime: '',
  arrivalTime: '',
  priceEconomy: '',
  priceBusiness: '',
  totalSeats: '',
};

export default function FlightsManager() {
  const [flights, setFlights] = useState([]);
  const [airports, setAirports] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [seatModalFlight, setSeatModalFlight] = useState(null);
  const [seatConfig, setSeatConfig] = useState({ rows: 20, businessRows: 3 });

  const load = () => {
    setLoading(true);
    searchFlights({ page, limit: 8, sort: '-departureTime' })
      .then((res) => {
        setFlights(res.data);
        setMeta({ page: res.page, pages: res.pages });
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);
  useEffect(() => {
    getAirports().then((res) => setAirports(res.data)).catch(() => {});
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (flight) => {
    setEditing(flight);
    setForm({
      flightNumber: flight.flightNumber,
      airline: flight.airline,
      origin: flight.origin?._id,
      destination: flight.destination?._id,
      departureTime: flight.departureTime.slice(0, 16),
      arrivalTime: flight.arrivalTime.slice(0, 16),
      priceEconomy: flight.price.economy,
      priceBusiness: flight.price.business || '',
      totalSeats: flight.totalSeats,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    const payload = {
      flightNumber: form.flightNumber,
      airline: form.airline,
      origin: form.origin,
      destination: form.destination,
      departureTime: new Date(form.departureTime).toISOString(),
      arrivalTime: new Date(form.arrivalTime).toISOString(),
      price: { economy: Number(form.priceEconomy), business: Number(form.priceBusiness) || 0 },
      totalSeats: Number(form.totalSeats),
    };
    try {
      if (editing) {
        await updateFlight(editing._id, payload);
      } else {
        await createFlight(payload);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (flight) => {
    if (!window.confirm(`Delete flight ${flight.flightNumber}? This can't be undone.`)) return;
    try {
      await deleteFlight(flight._id);
      load();
    } catch (err) {
      window.alert(getErrorMessage(err));
    }
  };

  const handleGenerateSeats = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await generateSeats(seatModalFlight._id, {
        rows: Number(seatConfig.rows),
        businessRows: Number(seatConfig.businessRows),
      });
      setSeatModalFlight(null);
      load();
    } catch (err) {
      window.alert(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-mist">{flights.length} flight{flights.length === 1 ? '' : 's'} on this page</p>
        <button onClick={openCreate} className="btn-primary !py-2 !px-4 text-sm">
          <Plus size={15} /> New flight
        </button>
      </div>

      {loading && (
        <div className="grid place-items-center py-24">
          <Spinner size={28} />
        </div>
      )}
      {!loading && error && <Alert type="error">{error}</Alert>}

      {!loading && !error && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-ink/5 text-xs uppercase tracking-wide text-mist">
              <tr>
                <th className="px-4 py-3 font-medium">Flight</th>
                <th className="px-4 py-3 font-medium">Route</th>
                <th className="px-4 py-3 font-medium">Departure</th>
                <th className="px-4 py-3 font-medium">Seats</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {flights.map((f) => (
                <tr key={f._id} className="border-b border-ink/5 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{f.flightNumber}</p>
                    <p className="text-xs text-mist">{f.airline}</p>
                  </td>
                  <td className="px-4 py-3 text-ink/80">
                    {f.origin?.code} → {f.destination?.code}
                  </td>
                  <td className="px-4 py-3 text-ink/80">{formatDateTime(f.departureTime)}</td>
                  <td className="px-4 py-3 text-ink/80">
                    {f.availableSeats}/{f.totalSeats}
                    <span className="ml-1 text-mist">· {formatMoney(f.price.economy)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${flightStatusStyle[f.status]}`}>{f.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setSeatModalFlight(f)}
                        title="Generate seats"
                        className="rounded-lg p-2 text-mist hover:bg-paper hover:text-sky"
                      >
                        <Armchair size={15} />
                      </button>
                      <button
                        onClick={() => openEdit(f)}
                        title="Edit"
                        className="rounded-lg p-2 text-mist hover:bg-paper hover:text-ink"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(f)}
                        title="Delete"
                        className="rounded-lg p-2 text-mist hover:bg-bad/10 hover:text-bad"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4">
        <Pagination page={meta.page} pages={meta.pages} onChange={setPage} />
      </div>

      {modalOpen && (
        <Modal title={editing ? 'Edit flight' : 'New flight'} onClose={() => setModalOpen(false)} wide>
          <form onSubmit={handleSave} className="space-y-4">
            {formError && <Alert type="error">{formError}</Alert>}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="label">Flight number</span>
                <input required className="input" value={form.flightNumber} onChange={(e) => setForm({ ...form, flightNumber: e.target.value })} />
              </label>
              <label className="block">
                <span className="label">Airline</span>
                <input required className="input" value={form.airline} onChange={(e) => setForm({ ...form, airline: e.target.value })} />
              </label>
              <label className="block">
                <span className="label">Origin</span>
                <select required className="input" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })}>
                  <option value="">Select airport</option>
                  {airports.map((a) => (
                    <option key={a._id} value={a._id}>{a.city} ({a.code})</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="label">Destination</span>
                <select required className="input" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })}>
                  <option value="">Select airport</option>
                  {airports.map((a) => (
                    <option key={a._id} value={a._id}>{a.city} ({a.code})</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="label">Departure</span>
                <input required type="datetime-local" className="input" value={form.departureTime} onChange={(e) => setForm({ ...form, departureTime: e.target.value })} />
              </label>
              <label className="block">
                <span className="label">Arrival</span>
                <input required type="datetime-local" className="input" value={form.arrivalTime} onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })} />
              </label>
              <label className="block">
                <span className="label">Economy price</span>
                <input required type="number" min="0" className="input" value={form.priceEconomy} onChange={(e) => setForm({ ...form, priceEconomy: e.target.value })} />
              </label>
              <label className="block">
                <span className="label">Business price (optional)</span>
                <input type="number" min="0" className="input" value={form.priceBusiness} onChange={(e) => setForm({ ...form, priceBusiness: e.target.value })} />
              </label>
              <label className="block sm:col-span-2">
                <span className="label">Total seats</span>
                <input required type="number" min="1" className="input" value={form.totalSeats} onChange={(e) => setForm({ ...form, totalSeats: e.target.value })} />
              </label>
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full !py-3">
              {saving ? <Spinner size={16} /> : editing ? 'Save changes' : 'Create flight'}
            </button>
          </form>
        </Modal>
      )}

      {seatModalFlight && (
        <Modal title={`Generate seats · ${seatModalFlight.flightNumber}`} onClose={() => setSeatModalFlight(null)}>
          <form onSubmit={handleGenerateSeats} className="space-y-4">
            <p className="text-sm text-mist">6 seats per row (A–F). This only works once per flight.</p>
            <label className="block">
              <span className="label">Number of rows</span>
              <input required type="number" min="1" className="input" value={seatConfig.rows} onChange={(e) => setSeatConfig({ ...seatConfig, rows: e.target.value })} />
            </label>
            <label className="block">
              <span className="label">Business-class rows (from the front)</span>
              <input required type="number" min="0" className="input" value={seatConfig.businessRows} onChange={(e) => setSeatConfig({ ...seatConfig, businessRows: e.target.value })} />
            </label>
            <button type="submit" disabled={saving} className="btn-primary w-full !py-3">
              {saving ? <Spinner size={16} /> : 'Generate seats'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
