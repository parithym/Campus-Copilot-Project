require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const Application = require('../models/Application');
const connectDB = require('../config/db');

const seed = async () => {
  await connectDB();
  await User.deleteMany();
  await Student.deleteMany();
  await Application.deleteMany();

  const admin = await User.create({ name: 'Admin User', email: 'admin@copilot.com', password: 'Admin@123', role: 'admin', college: 'Demo College' });
  const tpo = await User.create({ name: 'TPO Officer', email: 'tpo@copilot.com', password: 'Tpo@123', role: 'tpo', college: 'Demo College' });
  const s1 = await User.create({ name: 'Rahul Sharma', email: 'student@copilot.com', password: 'Student@123', role: 'student', college: 'Demo College' });
  const s2 = await User.create({ name: 'Priya Patel', email: 'priya@copilot.com', password: 'Student@123', role: 'student', college: 'Demo College' });

  const sp1 = await Student.create({ user: s1._id, department: 'Computer Science', graduationYear: 2025, cgpa: 8.5, skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'], targetRole: 'Software Development Engineer', linkedIn: 'https://linkedin.com', github: 'https://github.com', bio: 'Passionate about full-stack development' });
  const sp2 = await Student.create({ user: s2._id, department: 'Information Technology', graduationYear: 2025, cgpa: 9.1, skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow'], targetRole: 'Data Analyst', linkedIn: 'https://linkedin.com', github: 'https://github.com', bio: 'ML enthusiast' });

  await Application.insertMany([
    { student: sp1._id, companyName: 'Google', role: 'SDE-1', ctc: 2200000, location: 'Bangalore', stage: 'Interview', deadline: new Date('2025-06-15'), notes: 'DSA round cleared' },
    { student: sp1._id, companyName: 'Microsoft', role: 'Software Engineer', ctc: 1800000, location: 'Hyderabad', stage: 'Shortlisted', deadline: new Date('2025-06-20') },
    { student: sp1._id, companyName: 'Infosys', role: 'Systems Engineer', ctc: 650000, location: 'Pune', stage: 'Offer', ctc: 650000 },
    { student: sp1._id, companyName: 'Amazon', role: 'SDE', ctc: 2000000, location: 'Bangalore', stage: 'Applied', deadline: new Date('2025-07-01') },
    { student: sp2._id, companyName: 'Flipkart', role: 'Data Analyst', ctc: 1200000, location: 'Bangalore', stage: 'Offer' },
    { student: sp2._id, companyName: 'Swiggy', role: 'ML Engineer', ctc: 1500000, location: 'Bangalore', stage: 'Interview' },
  ]);

  console.log('✅ Database seeded successfully');
  console.log('Admin:   admin@copilot.com / Admin@123');
  console.log('TPO:     tpo@copilot.com / Tpo@123');
  console.log('Student: student@copilot.com / Student@123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
