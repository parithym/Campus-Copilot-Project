const Student = require('../models/Student');

exports.getProfile = async (req, res) => {
  const profile = await Student.findOne({ user: req.user._id }).populate('user', 'name email college');
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  res.json(profile);
};

exports.updateProfile = async (req, res) => {
  const { department, graduationYear, cgpa, skills, targetRole, linkedIn, github, bio } = req.body;
  const profile = await Student.findOneAndUpdate(
    { user: req.user._id },
    { department, graduationYear, cgpa, skills, targetRole, linkedIn, github, bio },
    { new: true, upsert: true }
  ).populate('user', 'name email college');
  res.json(profile);
};

exports.uploadResume = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const resumeUrl = `/uploads/resumes/${req.file.filename}`;
  const profile = await Student.findOneAndUpdate(
    { user: req.user._id },
    { resumeUrl, resumeOriginalName: req.file.originalname },
    { new: true }
  );
  res.json({ resumeUrl, message: 'Resume uploaded successfully' });
};
