import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';
import { getErrorMessage } from '../lib/axios';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form);
      navigate('/', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <span className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-xl bg-midnight text-amber">
          <Plane size={20} />
        </span>
        <h1 className="font-display text-2xl font-semibold text-ink">Create your account</h1>
        <p className="mt-1.5 text-sm text-mist">Book flights and track them in one place.</p>
      </div>

      {error && (
        <div className="mb-5">
          <Alert type="error">{error}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        <label className="block">
          <span className="label">Full name</span>
          <input
            required
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ahmed Ali"
          />
        </label>
        <label className="block">
          <span className="label">Email</span>
          <input
            required
            type="email"
            className="input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />
        </label>
        <label className="block">
          <span className="label">Phone (optional)</span>
          <input
            className="input"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+20 100 000 0000"
          />
        </label>
        <label className="block">
          <span className="label">Password</span>
          <input
            required
            type="password"
            minLength={6}
            className="input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="At least 6 characters"
          />
        </label>
        <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
          {loading ? <Spinner size={16} /> : <>Create account <ArrowRight size={15} /></>}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-mist">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-sky hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
