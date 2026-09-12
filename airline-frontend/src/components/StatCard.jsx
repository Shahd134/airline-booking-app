import React from 'react';

export default function StatCard({ icon: Icon, label, value, accent = 'text-sky bg-sky-light' }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${accent}`}>
        <Icon size={20} />
      </span>
      <div>
        <p className="text-xs font-medium text-mist">{label}</p>
        <p className="font-display text-xl font-semibold text-ink">{value}</p>
      </div>
    </div>
  );
}
