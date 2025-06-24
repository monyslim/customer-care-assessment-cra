import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const baseUrl = process.env.REACT_APP_API_URL; // Deployed backend URL

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [errorUsers, setErrorUsers] = useState('');
  const [errorSubs, setErrorSubs] = useState('');
  const navigate = useNavigate();

  // ✅ Protect route: redirect if not admin
  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (isAdmin !== 'true') {
      alert('Access denied. Admins only.');
      navigate('/admin-login');
    }
  }, [navigate]);

  // ✅ Fetch users and submissions
  useEffect(() => {
    axios.get(`${baseUrl}/api/users`)
      .then(res => {
        setUsers(res.data);
        setErrorUsers('');
      })
      .catch(() => setErrorUsers('Failed to load users.'))
      .finally(() => setLoadingUsers(false));

    axios.get(`${baseUrl}/api/submissions`)
      .then(res => {
        setSubmissions(res.data);
        setErrorSubs('');
      })
      .catch(() => setErrorSubs('Failed to load submissions.'))
      .finally(() => setLoadingSubs(false));
  }, []);

  // ✅ Logout function
  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/admin-login');
  };

  return (
    <div style={{ maxWidth: 900, margin: '20px auto', fontFamily: 'Arial' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
      }}>
        <h2>Admin Dashboard</h2>
        <button onClick={handleLogout} style={{ padding: '6px 12px' }}>
          Logout
        </button>
      </div>

      <section style={{ marginBottom: 40 }}>
        <h3>Logged In Users</h3>
        {loadingUsers ? (
          <p>Loading users...</p>
        ) : errorUsers ? (
          <p style={{ color: 'red' }}>{errorUsers}</p>
        ) : users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Last Login</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.email}>
                  <td>{u.name || '-'}</td>
                  <td>{u.email}</td>
                  <td>{new Date(u.lastLogin).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h3>Test Submissions</h3>
        {loadingSubs ? (
          <p>Loading submissions...</p>
        ) : errorSubs ? (
          <p style={{ color: 'red' }}>{errorSubs}</p>
        ) : submissions.length === 0 ? (
          <p>No submissions found.</p>
        ) : (
          <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>User Email</th>
                <th>Submission Time</th>
                <th>Answers Summary</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub, i) => (
                <tr key={i}>
                  <td>{sub.user}</td>
                  <td>{new Date(sub.submittedAt).toLocaleString()}</td>
                  <td>
                    {Object.entries(sub.answers).map(([qId, ans]) => (
                      <div key={qId}>
                        Q{qId}: {ans}
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
