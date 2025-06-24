import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TEST_DURATION_SECONDS = 30 * 60; // 30 minutes
const LOCAL_STORAGE_KEY = 'testAnswers';

export default function App() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_SECONDS);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [submissionSummary, setSubmissionSummary] = useState(null);

  const API_BASE = process.env.REACT_APP_API_URL;

  // 🔐 Load user + questions
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      alert('Please log in first.');
      window.location.href = '/login';
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (!parsedUser.email) {
      alert('Invalid user. Please log in again.');
      window.location.href = '/login';
      return;
    }
    setUser(parsedUser);

    // Load saved answers (auto-save)
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) setAnswers(JSON.parse(saved));

    axios.get(`${API_BASE}/api/questions`, {
      headers: {
        'x-user-email': parsedUser.email
      }
    })
      .then(res => {
        setQuestions(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load questions.');
        setLoading(false);
      });
  }, [API_BASE]);

  // ⏱ Timer + Auto-submit on timeout
  useEffect(() => {
    if (timeLeft <= 0 && !submitted) {
      handleSubmit(true); // silent submit
      return;
    }
    if (submitted) return;

    const timerId = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, submitted]);

  // 💾 Auto-save on answer change
  useEffect(() => {
    if (!submitted) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(answers));
    }
  }, [answers, submitted]);

  function handleSelect(option) {
    setAnswers({ ...answers, [questions[currentIndex].id]: option });
  }

  function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
    }
  }

  function handlePrev() {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
    }
  }

  function handleSkip() {
    const qid = questions[currentIndex].id;
    if (!(qid in answers)) {
      setAnswers({ ...answers, [qid]: null });
    }
    handleNext();
  }

  async function handleSubmit(silent = false) {
  if (submitted || submitting) return;

  if (!silent && !window.confirm('Are you sure you want to submit your test?')) return;

  setSubmitting(true);
  setSubmitted(true);

  // ✅ Ensure all questions are included (answered or skipped)
  const completeAnswers = {};
  questions.forEach(q => {
    completeAnswers[q.id] = answers[q.id] ?? null;
  });

  try {
    await axios.post(`${API_BASE}/api/submit`, {
      user: user.email,
      answers: completeAnswers
    });
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setSubmissionSummary(completeAnswers); // display full summary
  } catch (err) {
    if (!silent) {
      alert('Failed to submit answers.');
      setSubmitted(false);
      setSubmitting(false);
    }
  }
}


  function handleLogout() {
    localStorage.removeItem('user');
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    window.location.href = '/login';
  }

  // UI States
  if (loading) return <p>Loading questions...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (questions.length === 0) return <p>No questions available.</p>;

  // ✅ Show submission summary after test
  if (submitted && submissionSummary) {
    return (
      <div style={{ maxWidth: 700, margin: '30px auto', fontFamily: 'Arial' }}>
        <h2>Thank you, {user.name}! Your test has been submitted.</h2>
        <h3>Your Answers Summary:</h3>
        <ul>
          {questions.map(q => (
            <li key={q.id} style={{ marginBottom: 10 }}>
              <strong>Q:</strong> {q.question}<br />
              <strong>Your Answer:</strong> {submissionSummary[q.id] ?? 'Skipped'}
            </li>
          ))}
        </ul>
        <button onClick={handleLogout} style={{ marginTop: 20 }}>Logout</button>
      </div>
    );
  }

  const q = questions[currentIndex];
  const selected = answers[q.id];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div style={{ maxWidth: 700, margin: '30px auto', fontFamily: 'Arial' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
      }}>
        <div>
          <strong>User:</strong> {user.name} ({user.email})
        </div>
        <button onClick={handleLogout} style={{ padding: '5px 12px' }}>
          Logout
        </button>
      </div>

      <div style={{ marginBottom: 20, fontWeight: 'bold' }}>
        Time Left: {minutes}:{seconds.toString().padStart(2, '0')}
      </div>

      <h3>Question {currentIndex + 1} of {questions.length}</h3>
      <p>{q.question}</p>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {q.options.map(opt => (
          <li key={opt} style={{ margin: '8px 0' }}>
            <label style={{ cursor: 'pointer' }}>
              <input
                type="radio"
                name={`question-${q.id}`}
                value={opt}
                checked={selected === opt}
                onChange={() => handleSelect(opt)}
                style={{ marginRight: 8 }}
              />
              {opt}
            </label>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 20 }}>
        <button onClick={handlePrev} disabled={currentIndex === 0} style={{ marginRight: 10 }}>
          Previous
        </button>

        {currentIndex < questions.length - 1 ? (
          <>
            <button onClick={handleNext} style={{ marginRight: 10 }}>
              Next
            </button>
            <button onClick={handleSkip}>Skip</button>
          </>
        ) : (
          <button onClick={() => handleSubmit(false)} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        )}
      </div>
    </div>
  );
}
