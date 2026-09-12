import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <span className="mb-5 grid h-14 w-14 place-items-center rounded-full bg-sky-light text-sky">
        <Compass size={26} />
      </span>
      <h1 className="font-display text-2xl font-semibold text-ink">Off the map</h1>
      <p className="mt-2 text-sm text-mist">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="btn-primary mt-6">
        Back to home
      </Link>
    </div>
  );
}
