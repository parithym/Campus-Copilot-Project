const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, uploadResume } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect, authorize('student'));
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/resume', upload.single('resume'), uploadResume);

module.exports = router;
