import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const API_BASE = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email) {
      setError('Name and Email are required');
      return;
    }

    try {
      // Send login info to backend to record login
      await axios.post(`${API_BASE}/api/login`, { name, email });

      // Save user info in localStorage for protected routes
      localStorage.setItem('user', JSON.stringify({ name, email }));

      // Redirect to test page
      navigate('/');
    } catch (err) {
      setError('Failed to login. Please try again.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', fontFamily: 'Arial' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>Name:</label><br />
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Email:</label><br />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ padding: '8px 16px' }}>Login</button>
      </form>
    </div>
  );
}
