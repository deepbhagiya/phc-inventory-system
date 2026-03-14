const express = require('express');
const router = express.Router();
const reorderController = require('../controllers/reorderController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, reorderController.getAll);
router.put('/:id', auth, reorderController.updateStatus);

module.exports = router;
