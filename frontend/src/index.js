import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import App from './pages/App';               // Test taker app
import Login from './pages/Login';           // User login page
import AdminLogin from './pages/AdminLogin'; // Admin login page
import AdminDashboard from './pages/AdminDashboard'; // Admin panel

/// Route protection for test takers
function ProtectedRoute({ children }) {
  const userJSON = localStorage.getItem('user');
  const user = userJSON ? JSON.parse(userJSON) : null;
  return user ? children : <Navigate to="/login" />;
}

// Route protection for admins
function AdminRoute({ children }) {
  const isAdmin = localStorage.getItem('isAdmin');
  return isAdmin ? children : <Navigate to="/admin" />;
}


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      {/* Public login pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<AdminLogin />} />

      {/* Protected routes */}
      <Route path="/" element={<ProtectedRoute><App /></ProtectedRoute>} />
      <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

      {/* Redirect all unknown paths to home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  </BrowserRouter>
);
