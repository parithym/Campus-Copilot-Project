const Application = require('../models/Application');
const Student = require('../models/Student');

exports.getAll = async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) return res.status(404).json({ message: 'Student profile not found' });
  const apps = await Application.find({ student: student._id }).sort({ createdAt: -1 });
  res.json(apps);
};

exports.create = async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) return res.status(404).json({ message: 'Student profile not found' });
  const { companyName, role, ctc, location, deadline, notes, jobDescriptionText } = req.body;
  if (!companyName || !role) return res.status(400).json({ message: 'Company and role required' });
  const app = await Application.create({
    student: student._id, companyName, role, ctc, location, deadline, notes, jobDescriptionText
  });
  res.status(201).json(app);
};

exports.updateStage = async (req, res) => {
  const { stage } = req.body;
  const student = await Student.findOne({ user: req.user._id });
  const app = await Application.findOne({ _id: req.params.id, student: student._id });
  if (!app) return res.status(404).json({ message: 'Application not found' });
  app.stage = stage;
  await app.save();
  res.json(app);
};

exports.update = async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  const app = await Application.findOneAndUpdate(
    { _id: req.params.id, student: student._id },
    req.body,
    { new: true }
  );
  if (!app) return res.status(404).json({ message: 'Application not found' });
  res.json(app);
};

exports.remove = async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  const app = await Application.findOneAndDelete({ _id: req.params.id, student: student._id });
  if (!app) return res.status(404).json({ message: 'Application not found' });
  res.json({ message: 'Deleted' });
};

exports.saveAiResult = async (req, res) => {
  const { matchScore, missingKeywords, suggestions } = req.body;
  const student = await Student.findOne({ user: req.user._id });
  const app = await Application.findOneAndUpdate(
    { _id: req.params.id, student: student._id },
    { aiMatchScore: matchScore, aiMissingKeywords: missingKeywords, aiSuggestions: suggestions },
    { new: true }
  );
  if (!app) return res.status(404).json({ message: 'Application not found' });
  res.json(app);
};
