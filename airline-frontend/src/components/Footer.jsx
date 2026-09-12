import React from 'react';
import { Plane } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-ink/5 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-midnight text-amber">
              <Plane size={14} strokeWidth={2.5} />
            </span>
            <span className="font-display text-sm font-semibold text-ink">Skyline</span>
          </div>
          <p className="text-sm text-mist">Search, compare and book flights in minutes.</p>
          <p className="text-xs text-mist">Built as a portfolio project — not a real booking service.</p>
        </div>
      </div>
    </footer>
  );
}
