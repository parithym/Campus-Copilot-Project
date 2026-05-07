const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const Student = require('../models/Student');

const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

exports.analyzeResume = async (req, res) => {
  const { jobDescription } = req.body;
  if (!jobDescription) return res.status(400).json({ message: 'Job description required' });

  const student = await Student.findOne({ user: req.user._id });
  if (!student || !student.resumeUrl)
    return res.status(400).json({ message: 'Please upload your resume first' });

  const resumePath = student.resumeUrl.replace('/uploads', 'uploads');
  if (!fs.existsSync(resumePath))
    return res.status(400).json({ message: 'Resume file not found. Please re-upload.' });

  const form = new FormData();
  form.append('resume', fs.createReadStream(resumePath), student.resumeOriginalName);
  form.append('job_description', jobDescription);

  const response = await fetch(`${AI_URL}/analyze`, { method: 'POST', body: form });
  if (!response.ok) {
    const err = await response.json();
    return res.status(500).json({ message: err.detail || 'AI service error' });
  }
  const result = await response.json();
  res.json(result);
};

exports.analyzeSkillGap = async (req, res) => {
  const { skills, targetRole } = req.body;
  if (!skills || !targetRole) return res.status(400).json({ message: 'Skills and target role required' });

  const response = await fetch(`${AI_URL}/skill-gap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ skills, target_role: targetRole })
  });
  if (!response.ok) return res.status(500).json({ message: 'AI service error' });
  const result = await response.json();
  res.json(result);
};
