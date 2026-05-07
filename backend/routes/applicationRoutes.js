const express = require('express');
const router = express.Router();
const { getAll, create, updateStage, update, remove, saveAiResult } = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('student'));
router.get('/', getAll);
router.post('/', create);
router.put('/:id', update);
router.patch('/:id/stage', updateStage);
router.patch('/:id/ai-result', saveAiResult);
router.delete('/:id', remove);

module.exports = router;
