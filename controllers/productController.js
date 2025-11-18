const db = require('../models');
const Product = db.products;

// CREATE
exports.create = (req, res) => {
  /*
    #swagger.tags = ['Products']
    #swagger.description = 'Create a new product (product_id must be string code, e.g. "004-020391")'
    #swagger.parameters['obj'] = { in: 'body', description: 'Product info', schema: { product_id: '004-0xxxxx', name: 'PHOSBIC MICRO...', presentation: 'xx kg xxx', description: '...' } }
  */
  if (!req.body.product_id || !req.body.name) {
    res.status(400).send({ message: 'Content can not be empty!' });
    return;
  }

  const product = new Product({
    product_id: req.body.product_id,
    name: req.body.name,
    presentation: req.body.presentation,
    description: req.body.description,
  });

  // Save Product in the database
  product
    .save(product)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || 'Some error occurred while creating the Product.',
      });
    });
};

// GET ALL
exports.findAll = (req, res) => {
  /*
    #swagger.tags = ['Products']
  */
 
  Product.find({}, { _id: 0 })
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || 'Some error occurred while retrieving products.',
      });
    });
};

// GET ONE (by product_id string)
exports.findOne = (req, res) => {
  /*
    #swagger.tags = ['Products']
  */
  const product_id = req.params.product_id;

  Product.find({ product_id: product_id })
    .then((data) => {
      if (!data || data.length === 0)
        res.status(404).send({ message: 'Not found Product with product_id ' + product_id });
      else res.status(200).send(data[0]);
    })
    .catch((err) => {
      res.status(500).send({ message: 'Error retrieving Product with product_id=' + product_id });
    });
};

// UPDATE (by product_id)
exports.update = (req, res) => {
  /*
    #swagger.tags = ['Products']
    #swagger.description = 'Update a product by product_id'
    #swagger.parameters['obj'] = { 
      in: 'body', 
      description: 'Product info to update', 
      required: true, 
      schema: { 
        product_id: '004-0xxxxx', 
        name: 'PHOSBIC ', 
        presentation: 'xx kg ', 
        description: 'Describe the product here' 
      } 
    }
    #swagger.tags = ['Products']
  */

  if (!req.body) {
    return res.status(400).send({
      message: 'Data to update can not be empty!',
    });
  }

  const product_id = req.params.product_id;

  Product.findOneAndUpdate(
    { product_id: product_id },
    req.body,
    { new: true } 
  )
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: `Cannot update Product with product_id=${product_id}. Maybe Product was not found!`,
        });
      } else {
        res.send({ message: 'Product was updated successfully.', data: data });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: 'Error updating Product with product_id=' + product_id,
      });
    });
};

// DELETE (by product_id)
exports.delete = (req, res) => {
  /*
    #swagger.tags = ['Products']
  */
  const product_id = req.params.product_id;

  Product.findOneAndRemove({ product_id: product_id })
    .then((data) => {
      if (!data) {
        res.status(404).send({ message: `Cannot delete Product with product_id=${product_id}. Maybe Product was not found!` });
      } else {
        res.status(200).send({ message: 'Product was deleted successfully!' });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: 'Could not delete Product with product_id=' + product_id });
    });
};

// DELETE ALL
exports.deleteAll = (req, res) => {
  /*
    #swagger.tags = ['Products']
  */
  Product.deleteMany({})
    .then((data) => {
      res.send({ message: `${data.deletedCount} Products were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message || 'Some error occurred while removing all products.' });
    });
};

