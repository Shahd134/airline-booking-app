import React, { useEffect, useState } from 'react';
import { Users, PlaneTakeoff, TicketCheck, DollarSign } from 'lucide-react';
import { getDashboardStats } from '../../api/admin';
import StatCard from '../../components/StatCard';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import { formatMoney } from '../../lib/format';
import { getErrorMessage } from '../../lib/axios';

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid place-items-center py-24">
        <Spinner size={28} />
      </div>
    );
  }

  if (error) return <Alert type="error">{error}</Alert>;

  const maxRevenue = Math.max(1, ...stats.revenueByMonth.map((m) => m.revenue));
  const maxRoute = Math.max(1, ...stats.topRoutes.map((r) => r.count));
  const maxAirline = Math.max(1, ...stats.topAirlines.map((a) => a.totalBookings));

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total users" value={stats.totalUsers} accent="text-sky bg-sky-light" />
        <StatCard icon={PlaneTakeoff} label="Total flights" value={stats.totalFlights} accent="text-amber-dark bg-amber-light" />
        <StatCard icon={TicketCheck} label="Total bookings" value={stats.totalBookings} accent="text-good bg-good/10" />
        <StatCard icon={DollarSign} label="Revenue (paid)" value={formatMoney(stats.totalRevenue)} accent="text-ink bg-ink/5" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <p className="mb-5 text-sm font-semibold text-ink">Revenue by month</p>
          {stats.revenueByMonth.length === 0 ? (
            <p className="text-sm text-mist">No paid bookings yet.</p>
          ) : (
            <div className="flex items-end gap-2" style={{ height: 140 }}>
              {stats.revenueByMonth.map((m) => (
                <div key={m._id} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-md bg-amber"
                    style={{ height: `${Math.max(6, (m.revenue / maxRevenue) * 110)}px` }}
                    title={formatMoney(m.revenue)}
                  />
                  <span className="text-[10px] text-mist">{m._id.slice(5)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <p className="mb-5 text-sm font-semibold text-ink">Bookings by status</p>
          <div className="space-y-3">
            {stats.bookingsByStatus.map((s) => (
              <div key={s._id} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-xs capitalize text-mist">{s._id}</span>
                <div className="h-2 flex-1 rounded-full bg-paper">
                  <div
                    className="h-2 rounded-full bg-sky"
                    style={{ width: `${(s.count / stats.totalBookings) * 100}%` }}
                  />
                </div>
                <span className="w-6 text-right text-xs font-medium text-ink">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <p className="mb-5 text-sm font-semibold text-ink">Top routes</p>
          <div className="space-y-3">
            {stats.topRoutes.length === 0 && <p className="text-sm text-mist">No bookings yet.</p>}
            {stats.topRoutes.map((r, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-xs font-medium text-ink">
                  {r.origin} → {r.destination}
                </span>
                <div className="h-2 flex-1 rounded-full bg-paper">
                  <div className="h-2 rounded-full bg-amber" style={{ width: `${(r.count / maxRoute) * 100}%` }} />
                </div>
                <span className="w-6 text-right text-xs font-medium text-ink">{r.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <p className="mb-5 text-sm font-semibold text-ink">Top airlines</p>
          <div className="space-y-3">
            {stats.topAirlines.length === 0 && <p className="text-sm text-mist">No bookings yet.</p>}
            {stats.topAirlines.map((a) => (
              <div key={a._id} className="flex items-center gap-3">
                <span className="w-24 shrink-0 truncate text-xs font-medium text-ink">{a._id}</span>
                <div className="h-2 flex-1 rounded-full bg-paper">
                  <div
                    className="h-2 rounded-full bg-good"
                    style={{ width: `${(a.totalBookings / maxAirline) * 100}%` }}
                  />
                </div>
                <span className="w-6 text-right text-xs font-medium text-ink">{a.totalBookings}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
