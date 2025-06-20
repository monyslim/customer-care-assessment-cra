import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TEST_DURATION_SECONDS = 30 * 60; // 30 minutes

export default function App() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_SECONDS);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5000/api/questions')
      .then(res => {
        setQuestions(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load questions.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (timeLeft <= 0 && !submitted) {
      handleSubmit();
      return;
    }
    if (submitted) return;

    const timerId = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, submitted]);

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

  async function handleSubmit() {
    if (submitted || submitting) return;

    if (!window.confirm('Are you sure you want to submit your test?')) return;

    setSubmitting(true);
    setSubmitted(true);

    const userEmail = localStorage.getItem('user') || 'anonymous';

    try {
      await axios.post('http://localhost:5000/api/submit', {
        user: userEmail,
        answers
      });
      alert('Test submitted! Thank you.');
    } catch (err) {
      alert('Failed to submit answers.');
      setSubmitted(false);
      setSubmitting(false);
    }
  }

  if (loading) return <p>Loading questions...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  if (questions.length === 0) return <p>No questions available.</p>;

  if (submitted) return <h2>Test submitted! Thank you.</h2>;

  const q = questions[currentIndex];
  const selected = answers[q.id];

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div style={{ maxWidth: 700, margin: '30px auto', fontFamily: 'Arial' }}>
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
          <button onClick={handleNext} disabled={!selected}>
            Next
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={!selected || submitting}>
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        )}
      </div>
    </div>
  );
}
