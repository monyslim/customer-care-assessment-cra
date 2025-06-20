const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const USERS_FILE = path.join(__dirname, 'users.json');
const SUBMISSIONS_FILE = path.join(__dirname, 'submissions.json');
const QUESTIONS_FILE = path.join(__dirname, 'questions.json');

function readJSON(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath, 'utf8');
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Serve questions for frontend
app.get('/api/questions', (req, res) => {
  const questions = readJSON(QUESTIONS_FILE);
  res.json(questions);
});

// Record user login
app.post('/api/login', (req, res) => {
  const { name, email } = req.body;
  if (!email || !name) return res.status(400).json({ error: 'Name and Email required' });

  const users = readJSON(USERS_FILE);
  const existingUser = users.find(u => u.email === email);
  const now = new Date().toISOString();

  if (existingUser) {
    existingUser.lastLogin = now;
    existingUser.name = name; // update name if changed
  } else {
    users.push({ name, email, lastLogin: now });
  }

  writeJSON(USERS_FILE, users);
  res.json({ message: 'Login recorded' });
});


// Save test submissions
app.post('/api/submit', (req, res) => {
  const { user, answers } = req.body;
  if (!user || !answers) return res.status(400).json({ error: 'User and answers required' });

  const submissions = readJSON(SUBMISSIONS_FILE);
  submissions.push({
    user,
    answers,
    submittedAt: new Date().toISOString()
  });

  writeJSON(SUBMISSIONS_FILE, submissions);
  res.json({ message: 'Submission saved' });
});

// List all logged in users (admin)
app.get('/api/users', (req, res) => {
  const users = readJSON(USERS_FILE);
  res.json(users);
});

// List all submissions (admin)
app.get('/api/submissions', (req, res) => {
  const submissions = readJSON(SUBMISSIONS_FILE);
  res.json(submissions);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
