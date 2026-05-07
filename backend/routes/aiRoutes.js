const express = require('express');
const router = express.Router();
const { analyzeResume, analyzeSkillGap } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('student'));
router.post('/analyze-resume', analyzeResume);
router.post('/skill-gap', analyzeSkillGap);

module.exports = router;
