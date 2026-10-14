// import React, { useState } from 'react';
// import { apiClient } from '../api/client';
// import { useAuth } from '../context/AuthContext';
// import { Input } from '../components/common/Input';
// import { Button } from '../components/common/Button';

// export const LoginPage: React.FC = () => {
//   const { login } = useAuth();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const res = await apiClient.post('/users/login', { email, password });
//       login(res.data.token, res.data.user);
//     } catch (err: any) {
//       alert(err.response?.data?.message || 'Invalid credentials');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
//       <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-2xl max-w-md w-full space-y-5 border border-slate-700 shadow-2xl">
//         <div>
//           <h2 className="text-2xl font-bold text-white">System Access</h2>
//           <p className="text-xs text-slate-400">ProTech Warranty & Asset Tracker</p>
//         </div>
//         <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
//         <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
//         <Button type="submit" isLoading={loading} className="w-full">Sign In</Button>
//       </form>
//     </div>
//   );
// };