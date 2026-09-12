import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Plane, Menu, X, User, LogOut, LayoutDashboard, TicketCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-white/70 hover:text-white'}`;

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // بنقفل الـ dropdown لما حد يدوس بره منه، بدل الاعتماد على onBlur
  // (onBlur+setTimeout فيه سباق (race condition) بيمنع كليك "Sign out" إنه يتسجل أحيانًا)
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/');
  };

  return (
    <header className="bg-midnight sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber text-midnight">
              <Plane size={18} strokeWidth={2.5} />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">Skyline</span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <NavLink to="/flights" className={navLinkClass}>
              Search flights
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/my-bookings" className={navLinkClass}>
                My bookings
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin" className={navLinkClass}>
                Admin
              </NavLink>
            )}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/10"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-white/15 text-xs font-semibold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                  {user?.name?.split(' ')[0]}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl border border-ink/5 bg-white py-1.5 shadow-card">
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-ink hover:bg-paper"
                    >
                      <User size={15} /> Profile
                    </Link>
                    <Link
                      to="/my-bookings"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-ink hover:bg-paper"
                    >
                      <TicketCheck size={15} /> My bookings
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-ink hover:bg-paper"
                      >
                        <LayoutDashboard size={15} /> Admin dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 border-t border-ink/5 px-4 py-2 text-sm text-bad hover:bg-paper"
                    >
                      <LogOut size={15} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-white/80 hover:text-white">
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary">
                  Get started
                </Link>
              </>
            )}
          </div>

          <button className="text-white md:hidden" onClick={() => setOpen((v) => !v)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {open && (
          <div className="space-y-1 border-t border-white/10 py-3 md:hidden">
            <Link to="/flights" onClick={() => setOpen(false)} className="block px-1 py-2 text-white/90">
              Search flights
            </Link>
            {isAuthenticated && (
              <Link to="/my-bookings" onClick={() => setOpen(false)} className="block px-1 py-2 text-white/90">
                My bookings
              </Link>
            )}
            {isAuthenticated && (
              <Link to="/profile" onClick={() => setOpen(false)} className="block px-1 py-2 text-white/90">
                Profile
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" onClick={() => setOpen(false)} className="block px-1 py-2 text-white/90">
                Admin dashboard
              </Link>
            )}
            {isAuthenticated ? (
              <button onClick={handleLogout} className="block w-full px-1 py-2 text-left text-bad">
                Sign out
              </button>
            ) : (
              <div className="flex gap-3 pt-2">
                <Link to="/login" onClick={() => setOpen(false)} className="btn-outline flex-1">
                  Sign in
                </Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn-primary flex-1">
                  Get started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
