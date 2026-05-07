const express = require('express');
const router = express.Router();
const { getAllStudents, getDashboardStats, getStudentDetail } = require('../controllers/tpoController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('tpo', 'admin'));
router.get('/students', getAllStudents);
router.get('/stats', getDashboardStats);
router.get('/students/:id', getStudentDetail);

module.exports = router;
