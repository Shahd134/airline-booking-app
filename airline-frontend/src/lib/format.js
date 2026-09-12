export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

export const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

export const formatDateTime = (iso) => `${formatDate(iso)} · ${formatTime(iso)}`;

export const formatMoney = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    amount || 0
  );

export const formatDuration = (minutes) => {
  if (!minutes && minutes !== 0) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
};

export const flightStatusStyle = {
  scheduled: 'bg-sky-light text-sky',
  delayed: 'bg-amber-light text-amber-dark',
  cancelled: 'bg-bad/10 text-bad',
  completed: 'bg-ink/5 text-mist',
};

export const bookingStatusStyle = {
  pending: 'bg-amber-light text-amber-dark',
  confirmed: 'bg-good/10 text-good',
  cancelled: 'bg-bad/10 text-bad',
  completed: 'bg-ink/5 text-mist',
};

export const paymentStatusStyle = {
  unpaid: 'bg-amber-light text-amber-dark',
  paid: 'bg-good/10 text-good',
  refunded: 'bg-sky-light text-sky',
  failed: 'bg-bad/10 text-bad',
};
