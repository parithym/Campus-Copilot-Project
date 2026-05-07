const express = require('express');
const router = express.Router();
const { getAllUsers, createUser, toggleUser, deleteUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('admin'));
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.patch('/users/:id/toggle', toggleUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
