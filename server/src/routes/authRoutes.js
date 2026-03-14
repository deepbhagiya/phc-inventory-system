const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

router.post('/register', authController.register); // Ideally protected or only admin can register
router.post('/login', authController.login);
router.get('/me', auth, authController.getMe);

module.exports = router;
