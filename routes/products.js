const express = require('express');
const router = express.Router();
const controller = require('../controllers/productController');
const { isAuthenticated } = require('../middleware/authenticate');
const { validateProductFields } = require('../middleware/validate');

// router.post('/', controller.create);
// router.get('/', controller.findAll);
// router.get('/:product_id', controller.findOne);
// router.put('/:product_id', controller.update);
// router.delete('/:product_id', controller.delete);
// router.delete('/', controller.deleteAll);

// All routes are protected by isAuthenticated
router.post('/', isAuthenticated, validateProductFields, controller.create);
router.get('/', isAuthenticated, controller.findAll);
router.get('/:product_id', isAuthenticated, controller.findOne);
router.put('/:product_id', isAuthenticated, validateProductFields, controller.update);
router.delete('/:product_id', isAuthenticated, controller.delete);
router.delete('/', isAuthenticated, controller.deleteAll);

module.exports = router;

