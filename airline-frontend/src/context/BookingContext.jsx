import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext(null);

const STORAGE_KEY = 'skyline_booking_draft';

const loadDraft = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export function BookingProvider({ children }) {
  const [draft, setDraftState] = useState(loadDraft);

  const setDraft = (next) => {
    setDraftState(next);
    if (next) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  };

  // بداية رحلة حجز جديدة: نحدد الرحلة وعدد المسافرين
  const startBooking = (flight, passengerCount) => {
    setDraft({ flight, passengerCount, seats: [], passengers: [] });
  };

  const setSeats = (seats) => {
    setDraft({ ...draft, seats });
  };

  const setPassengers = (passengers) => {
    setDraft({ ...draft, passengers });
  };

  const clearBooking = () => setDraft(null);

  return (
    <BookingContext.Provider value={{ draft, startBooking, setSeats, setPassengers, clearBooking }}>
      {children}
    </BookingContext.Provider>
  );
}

export const useBooking = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used inside BookingProvider');
  return ctx;
};
