const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = async (req, res) => {
  const { name, email, password, college } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields required' });

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already registered' });

  const user = await User.create({ name, email, password, college, role: 'student' });
  // Create blank student profile
  await Student.create({ user: user._id });

  res.status(201).json({
    token: generateToken(user._id),
    user: { _id: user._id, name: user.name, email: user.email, role: user.role }
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ message: 'Invalid credentials' });
  if (!user.isActive)
    return res.status(403).json({ message: 'Account deactivated' });

  res.json({
    token: generateToken(user._id),
    user: { _id: user._id, name: user.name, email: user.email, role: user.role }
  });
};

exports.getMe = async (req, res) => {
  const user = req.user;
  res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
};
