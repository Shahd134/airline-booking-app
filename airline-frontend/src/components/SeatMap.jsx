import React, { useMemo } from 'react';
import { Armchair } from 'lucide-react';

// بيجمع المقاعد في صفوف حسب الرقم اللي في أول الـ seatNumber (مثلاً "12A" -> صف 12)
const groupByRow = (seats) => {
  const rows = {};
  seats.forEach((seat) => {
    const rowNum = parseInt(seat.seatNumber, 10);
    if (!rows[rowNum]) rows[rowNum] = [];
    rows[rowNum].push(seat);
  });
  return Object.entries(rows)
    .map(([row, list]) => ({ row: Number(row), seats: list.sort((a, b) => a.seatNumber.localeCompare(b.seatNumber)) }))
    .sort((a, b) => a.row - b.row);
};

export default function SeatMap({ seats, selectedIds, onToggle, maxSeats }) {
  const rows = useMemo(() => groupByRow(seats), [seats]);
  const lastBusinessRow = Math.max(0, ...seats.filter((s) => s.class === 'business').map((s) => parseInt(s.seatNumber, 10)));

  return (
    <div className="card p-5 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center gap-5 text-xs text-mist">
        <span className="flex items-center gap-1.5">
          <Armchair size={14} className="text-ink/30" /> Available
        </span>
        <span className="flex items-center gap-1.5">
          <Armchair size={14} className="text-amber" /> Selected
        </span>
        <span className="flex items-center gap-1.5">
          <Armchair size={14} className="text-ink/10" /> Booked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-sky-light" /> Business
        </span>
      </div>

      <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
        {rows.map(({ row, seats: rowSeats }) => (
          <React.Fragment key={row}>
            <div className="flex w-full items-center gap-2">
              <span className="w-5 shrink-0 text-right text-[11px] text-mist">{row}</span>
              <div className="flex flex-1 justify-center gap-2">
                {rowSeats.map((seat, i) => {
                  const isSelected = selectedIds.includes(seat._id);
                  const isDisabled = seat.isBooked || (!isSelected && selectedIds.length >= maxSeats);
                  const isAisle = i === Math.floor(rowSeats.length / 2) - 1;
                  return (
                    <React.Fragment key={seat._id}>
                      <button
                        type="button"
                        disabled={isDisabled}
                        onClick={() => onToggle(seat)}
                        title={`${seat.seatNumber} · ${seat.class}${seat.isBooked ? ' · booked' : ''}`}
                        className={[
                          'grid h-8 w-8 place-items-center rounded-md border text-[10px] font-semibold transition-colors',
                          seat.isBooked
                            ? 'cursor-not-allowed border-ink/5 bg-ink/5 text-ink/20'
                            : isSelected
                              ? 'border-amber bg-amber text-midnight'
                              : seat.class === 'business'
                                ? 'border-sky/30 bg-sky-light text-sky hover:border-sky'
                                : 'border-ink/15 bg-white text-ink/60 hover:border-sky hover:text-sky',
                          isDisabled && !seat.isBooked ? 'opacity-40 cursor-not-allowed' : '',
                        ].join(' ')}
                      >
                        {seat.seatNumber.replace(String(row), '')}
                      </button>
                      {isAisle && <span className="w-3" />}
                    </React.Fragment>
                  );
                })}
              </div>
              <span className="w-5" />
            </div>
            {row === lastBusinessRow && lastBusinessRow > 0 && (
              <div className="my-1 h-px w-full max-w-xs bg-ink/10" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
