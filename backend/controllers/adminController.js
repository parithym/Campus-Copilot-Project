const User = require('../models/User');
const Student = require('../models/Student');

exports.getAllUsers = async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(users);
};

exports.createUser = async (req, res) => {
  const { name, email, password, role, college } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already exists' });
  const user = await User.create({ name, email, password, role, college });
  if (role === 'student') await Student.create({ user: user._id });
  res.status(201).json({ _id: user._id, name, email, role });
};

exports.toggleUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.isActive = !user.isActive;
  await user.save();
  res.json({ isActive: user.isActive });
};

exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
};
