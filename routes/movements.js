const express = require('express');
const router = express.Router();
const controller = require('../controllers/inventoryController');
const { isAuthenticated } = require('../middleware/authenticate');
const { validateMongoId, validateCreateMovement } = require('../middleware/validate');

// router.post('/', controller.create);
// router.get('/', controller.findAll);
// router.get('/:id', controller.findOne);
// router.put('/:id', controller.update);
// router.delete('/:id', controller.delete);
// router.delete('/', controller.deleteAll);

// endpoint to get stock by product code
router.get('/stock/:product_id', isAuthenticated, controller.stockByProduct);

// routes
router.post('/', isAuthenticated, validateCreateMovement, controller.create); 
router.get('/', isAuthenticated, controller.findAll);
router.get('/:id', isAuthenticated, validateMongoId, controller.findOne); 
router.put('/:id', isAuthenticated, validateMongoId, controller.update);
router.delete('/:id', isAuthenticated, validateMongoId, controller.delete);
router.delete('/', isAuthenticated, controller.deleteAll);

module.exports = router;


