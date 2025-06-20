import React, { useEffect, useState } from 'react';
import axios from 'axios';

const baseUrl = process.env.REACT_APP_API_URL; // Only use the deployed backend

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [errorUsers, setErrorUsers] = useState('');
  const [errorSubs, setErrorSubs] = useState('');

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

  return (
    <div style={{ maxWidth: 900, margin: '20px auto', fontFamily: 'Arial' }}>
      <h2>Admin Dashboard</h2>

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
