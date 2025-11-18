const express = require('express');
const router = express.Router();
const controller = require('../controllers/productController');

router.post('/', controller.create);
router.get('/', controller.findAll);
router.get('/:product_id', controller.findOne);
router.put('/:product_id', controller.update);
router.delete('/:product_id', controller.delete);
router.delete('/', controller.deleteAll);

module.exports = router;

