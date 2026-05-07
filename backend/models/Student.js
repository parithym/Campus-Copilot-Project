const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  department: { type: String, default: '' },
  graduationYear: { type: Number, default: new Date().getFullYear() + 1 },
  cgpa: { type: Number, default: 0 },
  skills: [{ type: String }],
  targetRole: { type: String, default: '' },
  resumeUrl: { type: String, default: '' },
  resumeOriginalName: { type: String, default: '' },
  linkedIn: { type: String, default: '' },
  github: { type: String, default: '' },
  bio: { type: String, default: '' },
  isPlaced: { type: Boolean, default: false },
  placedCompany: { type: String, default: '' },
  ctcOffered: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
