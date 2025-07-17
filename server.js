require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Models
const Student = require('./models/Student');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'sakthi_super_secret_token_key'; // Change this for production

// MongoDB Atlas connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));


// 🔐 Middleware to protect routes
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Expect: Bearer TOKEN
  if (!token) return res.status(401).json({ error: 'Token missing' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};


// ✅ REGISTER API
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: 'All fields required' });

  const existingUser = await User.findOne({ email });
  if (existingUser)
    return res.status(409).json({ error: 'User already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({ username, email, password: hashedPassword });

  res.status(201).json({ message: 'User registered', userId: newUser._id });
});


// ✅ LOGIN API
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: '2h'
  });

  res.json({ message: 'Login successful', token });
});


// ✅ MARK ATTENDANCE API (protected)
app.post('/api/mark-attendance', authMiddleware, async (req, res) => {
  try {
    const { detectedRollNumbers } = req.body;

    if (!Array.isArray(detectedRollNumbers)) {
      return res.status(400).json({ error: 'Invalid detectedRollNumbers' });
    }

    const students = await Student.find({});
    const masterRollNumbers = students.map(s => s.rollNo);

    const present = masterRollNumbers.filter(r => detectedRollNumbers.includes(r));
    const absent = masterRollNumbers.filter(r => !detectedRollNumbers.includes(r));

    res.json({ present, absent });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});


// ✅ START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
