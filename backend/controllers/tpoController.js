const Student = require('../models/Student');
const Application = require('../models/Application');
const User = require('../models/User');

exports.getAllStudents = async (req, res) => {
  const students = await Student.find()
    .populate('user', 'name email college createdAt')
    .sort({ createdAt: -1 });
  res.json(students);
};

exports.getDashboardStats = async (req, res) => {
  const totalStudents = await User.countDocuments({ role: 'student' });
  const placedStudents = await Student.countDocuments({ isPlaced: true });
  const totalApplications = await Application.countDocuments();
  const offersReceived = await Application.countDocuments({ stage: 'Offer' });

  const stageBreakdown = await Application.aggregate([
    { $group: { _id: '$stage', count: { $sum: 1 } } }
  ]);

  const topCompanies = await Application.aggregate([
    { $match: { stage: 'Offer' } },
    { $group: { _id: '$companyName', offers: { $sum: 1 }, avgCTC: { $avg: '$ctc' } } },
    { $sort: { offers: -1 } },
    { $limit: 5 }
  ]);

  res.json({ totalStudents, placedStudents, totalApplications, offersReceived, stageBreakdown, topCompanies });
};

exports.getStudentDetail = async (req, res) => {
  const student = await Student.findById(req.params.id).populate('user', 'name email college');
  if (!student) return res.status(404).json({ message: 'Student not found' });
  const applications = await Application.find({ student: student._id }).sort({ createdAt: -1 });
  res.json({ student, applications });
};
