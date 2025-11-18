const express = require('express');
const router = express.Router();
const controller = require('../controllers/inventoryController');

// routes
router.post('/', controller.create);
router.get('/', controller.findAll);
router.get('/:movement_id', controller.findOne);
router.put('/:movement_id', controller.update);
router.delete('/:movement_id', controller.delete);
router.delete('/', controller.deleteAll);

// endpoint to get stock by product code
router.get('/stock/:product_id', controller.stockByProduct);

module.exports = router;


