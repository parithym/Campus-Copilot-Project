const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  companyName: { type: String, required: true, trim: true },
  role: { type: String, required: true },
  ctc: { type: Number, default: 0 },
  location: { type: String, default: '' },
  deadline: { type: Date },
  stage: {
    type: String,
    enum: ['Applied', 'Shortlisted', 'Interview', 'Offer', 'Rejected'],
    default: 'Applied'
  },
  notes: { type: String, default: '' },
  jobDescriptionText: { type: String, default: '' },
  aiMatchScore: { type: Number, default: null },
  aiMissingKeywords: [{ type: String }],
  aiSuggestions: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
