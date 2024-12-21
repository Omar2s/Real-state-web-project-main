require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router(); 


// Register User
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, repassword, phoneNumber, role } = req.body;
    
    if (!name || !email || !password || !repassword || !phoneNumber || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (password !== repassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters, contain an uppercase letter, a lowercase letter, a number, and a special character',
      });
    }
    if (role !== 'user' && role !== 'admin') {
      return res.status(400).json({ message: 'Invalid role. Allowed roles: user, admin' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const user = new User({ name, email, password, phoneNumber,role });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.SECRET_KEY, { expiresIn: '1w' });

    res.status(200).json({ message: 'Login successful', token,role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/users', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can view all users' });
    }

    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'An error occurred while fetching users' });
  }
});

// Delete User
router.delete('/users/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete users' });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'An error occurred while deleting user' });
  }
});
module.exports = router;
