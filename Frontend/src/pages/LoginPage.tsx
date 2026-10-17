import React, { useState } from 'react';
import { isAxiosError } from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = isSigningUp ? '/users/register' : '/users/login';
      const payload = isSigningUp
        ? { full_name: fullName.trim(), email: email.trim(), password, role }
        : { email: email.trim(), password };
      const res = await apiClient.post(endpoint, payload);
      login(res.data.token, res.data.user);
      navigate('/', { replace: true });
    } catch (requestError: unknown) {
      const responseMessage = isAxiosError<{ message?: string; error?: string }>(requestError)
        ? requestError.response?.data?.message || requestError.response?.data?.error
        : undefined;
      setError(responseMessage || (isSigningUp ? 'Unable to create your account.' : 'Invalid email or password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-2xl max-w-md w-full space-y-5 border border-slate-700 shadow-2xl">
        <div>
          <h2 className="text-2xl font-bold text-white">{isSigningUp ? 'Create Account' : 'System Access'}</h2>
          <p className="text-xs text-slate-400">ProTech Warranty & Asset Tracker</p>
        </div>
        {isSigningUp && (
          <>
            <Input
              label="Full name"
              autoComplete="name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
            <Select label="Role" value={role} onChange={(event) => setRole(event.target.value)} required>
              <option value="">Choose a role...</option>
              <option value="technician">Technician</option>
              <option value="sales">Sales</option>
              <option value="admin">Admin</option>
              <option value="branch_manager">Branch Manager</option>
            </Select>
          </>
        )}
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input
          label="Password"
          type="password"
          autoComplete={isSigningUp ? 'new-password' : 'current-password'}
          minLength={isSigningUp ? 8 : undefined}
          hint={isSigningUp ? 'Use at least 8 characters.' : undefined}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
        <Button type="submit" isLoading={loading} className="w-full">
          {isSigningUp ? 'Sign Up' : 'Sign In'}
        </Button>
        <p className="text-center text-sm text-slate-300">
          {isSigningUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => {
              setIsSigningUp((current) => !current);
              setError('');
            }}
            className="font-semibold text-blue-400 hover:text-blue-300"
          >
            {isSigningUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;