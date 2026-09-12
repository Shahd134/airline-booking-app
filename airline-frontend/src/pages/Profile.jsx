import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';
import { getErrorMessage } from '../lib/axios';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = { name: form.name, phone: form.phone };
      if (form.password) payload.password = form.password;
      await updateProfile(payload);
      setSuccess('Your profile has been updated.');
      setForm((f) => ({ ...f, password: '' }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Your profile</h1>
      <p className="mt-1 text-sm text-mist">Update your personal details.</p>

      <div className="mt-6 space-y-5">
        {success && <Alert type="success">{success}</Alert>}
        {error && <Alert type="error">{error}</Alert>}

        <form onSubmit={handleSubmit} className="card space-y-4 p-6">
          <label className="block">
            <span className="label">Email</span>
            <input className="input opacity-60" value={user?.email || ''} disabled />
          </label>
          <label className="block">
            <span className="label">Full name</span>
            <input
              required
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="label">Phone</span>
            <input
              className="input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="label">New password</span>
            <input
              type="password"
              className="input"
              placeholder="Leave blank to keep current password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
            {loading ? <Spinner size={16} /> : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
