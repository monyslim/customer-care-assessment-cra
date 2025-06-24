import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // ✅ Redirect if already logged in
  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (isAdmin === 'true') {
      navigate('/admin-dashboard');
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password === 'admin123') { // ✅ Change this to your actual admin password
      localStorage.setItem('isAdmin', 'true');
      navigate('/admin-dashboard');
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', fontFamily: 'Arial' }}>
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: 10, marginBottom: 10, fontSize: 16 }}
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ padding: '10px 20px', fontSize: 16 }}>
          Login
        </button>
      </form>
    </div>
  );
}
