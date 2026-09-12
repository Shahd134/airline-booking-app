import React, { useEffect, useState } from 'react';
import { getAllUsers, updateUser } from '../../api/admin';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import Pagination from '../../components/Pagination';
import { getErrorMessage } from '../../lib/axios';

export default function UsersManager() {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    getAllUsers({ page, limit: 10 })
      .then((res) => {
        setUsers(res.data);
        setMeta({ page: res.page, pages: res.pages });
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);

  const toggleActive = async (user) => {
    setBusyId(user._id);
    try {
      await updateUser(user._id, { isActive: !user.isActive });
      load();
    } catch (err) {
      window.alert(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const toggleRole = async (user) => {
    setBusyId(user._id);
    try {
      await updateUser(user._id, { role: user.role === 'admin' ? 'user' : 'admin' });
      load();
    } catch (err) {
      window.alert(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="grid place-items-center py-24">
        <Spinner size={28} />
      </div>
    );
  }

  if (error) return <Alert type="error">{error}</Alert>;

  return (
    <div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-ink/5 text-xs uppercase tracking-wide text-mist">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-ink/5 last:border-0">
                <td className="px-4 py-3 font-medium text-ink">{u.name}</td>
                <td className="px-4 py-3 text-ink/70">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${u.role === 'admin' ? 'bg-amber-light text-amber-dark' : 'bg-ink/5 text-mist'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${u.isActive ? 'bg-good/10 text-good' : 'bg-bad/10 text-bad'}`}>
                    {u.isActive ? 'active' : 'suspended'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      disabled={busyId === u._id}
                      onClick={() => toggleRole(u)}
                      className="btn-ghost !px-2.5 !py-1.5 text-xs"
                    >
                      Make {u.role === 'admin' ? 'user' : 'admin'}
                    </button>
                    <button
                      disabled={busyId === u._id}
                      onClick={() => toggleActive(u)}
                      className={`btn-ghost !px-2.5 !py-1.5 text-xs ${u.isActive ? 'text-bad' : 'text-good'}`}
                    >
                      {u.isActive ? 'Suspend' : 'Reactivate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <Pagination page={meta.page} pages={meta.pages} onChange={setPage} />
      </div>
    </div>
  );
}
