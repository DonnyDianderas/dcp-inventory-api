const express = require('express');
const router = express.Router();
const controller = require('../controllers/inventoryController');

// routes
router.post('/', controller.create);
router.get('/', controller.findAll);
router.get('/:id', controller.findOne);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
router.delete('/', controller.deleteAll);

// endpoint to get stock by product code
router.get('/stock/:product_id', controller.stockByProduct);

module.exports = router;


