const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, supplierController.getAll);
router.post('/', auth, supplierController.create);
router.delete('/:id', auth, supplierController.delete);

module.exports = router;
