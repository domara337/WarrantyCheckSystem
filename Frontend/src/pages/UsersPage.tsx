import React, { useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { MainLayout } from '../components/layout/MainLayout';
import { getBranches } from '../api/masterData';
import { deleteUser, getUsers, updateUser } from '../api/users';
import { queryKeys } from '../api/queryKeys';
import type { User } from '../types';
import { normalizeRole } from '../types';
import { useAuth } from '../context/AuthContext';

interface UserDraft {
  full_name: string;
  email: string;
  role: string;
  branch_id: string;
}

const ROLES = [
  { value: 'technician', label: 'Technician' },
  { value: 'sales', label: 'Sales' },
  { value: 'branch_manager', label: 'Branch Manager' },
  { value: 'admin', label: 'Admin' },
];

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError<{ message?: string; error?: string }>(error)) {
    return error.response?.data?.message || error.response?.data?.error || fallback;
  }
  return fallback;
};

const displayRole = (role: string): string =>
  ROLES.find((option) => option.value === normalizeRole(role))?.label ?? role;

const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const {
    data: users = [],
    isPending: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useQuery({ queryKey: queryKeys.users, queryFn: getUsers });
  const {
    data: branches = [],
    isPending: branchesLoading,
    error: branchesError,
    refetch: refetchBranches,
  } = useQuery({ queryKey: queryKeys.branches, queryFn: getBranches });
  const loading = usersLoading || branchesLoading;
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [draft, setDraft] = useState<UserDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyUserId, setBusyUserId] = useState<string | number | null>(null);

  const refreshUsers = async () => {
    setError('');
    const results = await Promise.all([refetchUsers(), refetchBranches()]);
    const failedQuery = results.find((result) => result.error);
    if (failedQuery?.error) {
      console.error('Failed to refresh user management data:', failedQuery.error);
      setError(getErrorMessage(failedQuery.error, 'Unable to refresh users. Please try again.'));
    }
  };

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) =>
      [user.full_name, user.email, displayRole(user.role), user.branch_name ?? '']
        .some((value) => value.toLowerCase().includes(query)),
    );
  }, [users, searchTerm]);

  const beginEditing = (user: User) => {
    setEditingUser(user);
    setDraft({
      full_name: user.full_name,
      email: user.email,
      role: normalizeRole(user.role),
      branch_id: user.branch_id == null ? '' : String(user.branch_id),
    });
    setError('');
    setNotice('');
  };

  const saveUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingUser || !draft) return;

    setSaving(true);
    setError('');
    setNotice('');
    try {
      const updated = await updateUser(editingUser.id, {
        full_name: draft.full_name.trim(),
        email: draft.email.trim(),
        role: draft.role,
        branch_id: draft.branch_id ? Number(draft.branch_id) : null,
      });
      queryClient.setQueryData<User[]>(queryKeys.users, (current = []) =>
        current.map((user) => user.id === updated.id ? updated : user),
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.users });
      setEditingUser(null);
      setDraft(null);
      setNotice(`${updated.full_name}'s account was updated.`);
    } catch (saveError: unknown) {
      console.error('Failed to update user account:', saveError);
      setError(getErrorMessage(saveError, 'Unable to update this user. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  const removeUser = async (user: User) => {
    if (!window.confirm(`Delete ${user.full_name}'s account? This cannot be undone.`)) return;
    setBusyUserId(user.id);
    setError('');
    setNotice('');
    try {
      await deleteUser(user.id);
      queryClient.setQueryData<User[]>(queryKeys.users, (current = []) =>
        current.filter((item) => item.id !== user.id),
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.users });
      setNotice(`${user.full_name}'s account was deleted.`);
    } catch (deleteError: unknown) {
      console.error('Failed to delete user account:', deleteError);
      setError(getErrorMessage(deleteError, 'Unable to delete this user. Please try again.'));
    } finally {
      setBusyUserId(null);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">Administration</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">User management</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              View staff accounts and manage each person’s role and branch access.
            </p>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">{users.length} {users.length === 1 ? 'user' : 'users'}</div>
        </div>

        {(error || usersError || branchesError) && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">{error || getErrorMessage(usersError || branchesError, 'Unable to load users. Please try again.')}</div>}
        {notice && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">{notice}</div>}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">All users</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Only administrators can access this list.</p>
            </div>
            <div className="flex gap-2">
              <Input
                aria-label="Search users"
                placeholder="Search name, email, role, branch..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="sm:w-72"
              />
              <Button type="button" variant="outline" onClick={() => void refreshUsers()} disabled={loading}>Refresh</Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:bg-slate-800/60 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Branch</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-500">Loading users...</td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-500">{users.length ? 'No users match your search.' : 'No user accounts found.'}</td></tr>
                ) : filteredUsers.map((user) => (
                  <tr key={user.id} className="text-slate-700 dark:text-slate-300">
                    <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">{user.full_name}</td>
                    <td className="px-5 py-4">{user.email}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">{displayRole(user.role)}</span>
                    </td>
                    <td className="px-5 py-4">{user.branch_name || 'Unassigned'}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" className="px-3 py-1.5" onClick={() => beginEditing(user)}>Edit</Button>
                        <Button type="button" variant="danger" className="px-3 py-1.5" isLoading={busyUserId === user.id} disabled={busyUserId !== null || user.id === currentUser?.id} onClick={() => void removeUser(user)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {editingUser && draft && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-user-title"
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          >
            <h2 id="edit-user-title" className="text-lg font-bold text-slate-900 dark:text-white">Edit user</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Update this account’s details and access.</p>
            <form onSubmit={(event) => void saveUser(event)} className="mt-5 space-y-4">
              <Input label="Full name" value={draft.full_name} onChange={(event) => setDraft({ ...draft, full_name: event.target.value })} required />
              <Input label="Email" type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} required />
              <Select label="Role" value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value })} required disabled={editingUser.id === currentUser?.id}>
                {ROLES.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
              </Select>
              {editingUser.id === currentUser?.id && <p className="-mt-2 text-xs text-slate-500">You cannot change your own administrator role.</p>}
              <Select label="Branch" value={draft.branch_id} onChange={(event) => setDraft({ ...draft, branch_id: event.target.value })}>
                <option value="">Unassigned</option>
                {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
              </Select>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => { setEditingUser(null); setDraft(null); }} disabled={saving}>Cancel</Button>
                <Button type="submit" isLoading={saving}>Save changes</Button>
              </div>
            </form>
          </section>
        </div>
      )}
    </MainLayout>
  );
};

export default UsersPage;
