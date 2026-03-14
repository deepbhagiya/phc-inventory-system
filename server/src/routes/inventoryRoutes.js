const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, inventoryController.getAllMedicines);
router.post('/', auth, inventoryController.addMedicine);
router.put('/:id/stock', auth, inventoryController.updateStock); // For adding/removing stock (IN/OUT)
router.delete('/:id', auth, inventoryController.deleteMedicine);
router.get('/alerts', auth, inventoryController.getLowStockAlerts);
router.get('/transactions', auth, inventoryController.getTransactions);
router.post('/dispense', auth, inventoryController.dispenseMedicines);

module.exports = router;
