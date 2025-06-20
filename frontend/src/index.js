import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import App from './pages/App';               // Test taker app
import Login from './pages/Login';           // User login page
import AdminLogin from './pages/AdminLogin'; // Admin login page
import AdminDashboard from './pages/AdminDashboard'; // Admin panel

// Route protection for test takers
function ProtectedRoute({ children }) {
  const [isAuth, setIsAuth] = React.useState(null);

  React.useEffect(() => {
    const userJSON = localStorage.getItem('user');
    setIsAuth(!!userJSON);
  }, []);

  if (isAuth === null) return null; // or a loading spinner

  return isAuth ? children : <Navigate to="/login" />;
}

// Route protection for admins
function AdminRoute({ children }) {
  const [isAdmin, setIsAdmin] = React.useState(null);

  React.useEffect(() => {
    const isAdminVal = localStorage.getItem('isAdmin');
    setIsAdmin(!!isAdminVal);
  }, []);

  if (isAdmin === null) return null; // or a loading spinner

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
