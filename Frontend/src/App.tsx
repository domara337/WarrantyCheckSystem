// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import FullRecordsSheet from './pages/FullRecordsSheet';
import UsersPage from './pages/UsersPage';
import { ProtectedRoute } from './context/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Entry Point */}
        <Route path="/login" element={<LoginPage />} />

        {/* Basic Search & Insertion Route (Technician, Sales, Managers, Admins) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
        </Route>

        {/* Full Records Sheet Route (Only Branch Managers & Admins) */}
        <Route element={<ProtectedRoute allowedRoles={['branch_manager', 'admin']} />}>
          <Route path="/records-sheet" element={<FullRecordsSheet />} /> 
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/users" element={<UsersPage />} />
        </Route>

        {/* Default redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}