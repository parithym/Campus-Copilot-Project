const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Student = require('../models/Student');
const Application = require('../models/Application');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

router.get('/seed', async (req, res) => {
  try {
    await User.deleteMany();
    await Student.deleteMany();
    await Application.deleteMany();
    await User.create({ name: 'Admin User', email: 'admin@copilot.com', password: 'Admin@123', role: 'admin', college: 'Demo College' });
    await User.create({ name: 'TPO Officer', email: 'tpo@copilot.com', password: 'Tpo@123', role: 'tpo', college: 'Demo College' });
    res.json({ message: 'Database seeded successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
