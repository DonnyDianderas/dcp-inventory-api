const db = require('../models');
const Product = db.products;

// CREATE
exports.create = async(req, res) => {
  /*
    #swagger.tags = ['Products']
    #swagger.security = [{"SessionAuth": []}]
    #swagger.description = 'Create a new product (product_id must be string code, e.g. "004-020391")'
    #swagger.parameters['obj'] = { in: 'body', description: 'Product info', schema: { product_id: '001-0xxxx', name: 'PHOSPHATE..', presentation: 'xx kg', description: 'Describe the product here' } }
  */
  try {
    // if (!req.body.product_id || !req.body.name) {
    //   return res.status(400).json({ message: 'Content can not be empty!' });
    // }

    const product = new Product({
      product_id: req.body.product_id,
      name: req.body.name,
      presentation: req.body.presentation,
      description: req.body.description,
    });

    const data = await product.save();
    res.status(201).json(data);

  } catch (err) {
    res.status(500).json({
      message: err.message || 'Some error occurred while creating the Product.',
    });
  }
};

// GET ALL
exports.findAll = async (req, res) => {
  /*
    #swagger.tags = ['Products']
  */
  try {
    const data = await Product.find({}, { _id: 0 });
    res.status(200).json(data);

  } catch (err) {
    res.status(500).json({
      message: err.message || 'Some error occurred while retrieving Products.',
    });
  }
};

// GET ONE (by product_id string)
exports.findOne = async (req, res) => {
  /*
    #swagger.tags = ['Products']
  */
  try {
    const product_id = req.params.product_id;
    const data = await Product.findOne({ product_id: product_id });

    if (!data) {
      return res.status(404).json({
        message: 'Product not found with product_id ' + product_id
      });
    }

    res.status(200).json(data);

  } catch (err) {
    res.status(500).json({
      message: 'Error retrieving Product with product_id=' + req.params.product_id
    });
  }
};

// UPDATE (by product_id)
exports.update = async(req, res) => {
  /*
    #swagger.tags = ['Products']
    #swagger.security = [{"SessionAuth": []}]
    #swagger.description = 'Update a product by product_id'

    #swagger.parameters['product_id'] = {
      in: 'path',
      description: 'Product ID',
      required: true,
      type: 'string',
      example: '001-0001'
    }

    #swagger.parameters['Product'] = { 
      in: 'body',
      description: 'Fields to update',
      required: true,
      schema: { 
        name: 'Phosphate XXXX',
        presentation: 'XX kg',
        description: 'Short product description'
      } 
    }
  */
try {
    // if (!req.body || Object.keys(req.body).length === 0) {
    //   return res.status(400).json({ message: 'Data to update can not be empty!' });
    // }

    const product_id = req.params.product_id;

    const data = await Product.findOneAndUpdate(
      { product_id: product_id },
      req.body,
      { new: true }
    );

    if (!data) {
      return res.status(404).json({
        message: `Cannot update Product with product_id=${product_id}. Not found.`
      });
    }

    res.status(200).json({
      message: 'Product was updated successfully.',
      data: data
    });

  } catch (err) {
    res.status(500).json({
      message: 'Error updating Product with product_id=' + req.params.product_id
    });
  }
};

// DELETE (by product_id)
// exports.delete = async (req, res) => {
//   /*
//     #swagger.tags = ['Products']
//   */
//    try {
//     const product_id = req.params.product_id;

//     const data = await Product.deleteOne({ product_id: product_id });

//     if (!data) {
//       return res.status(404).json({
//         message: `Cannot delete Product with product_id=${product_id}. Not found.`
//       });
//     }

//     res.status(200).json({ message: 'Product was deleted successfully!' });

//   } catch (err) {
//     res.status(500).json({
//       message: 'Could not delete Product with product_id=' + req.params.product_id
//     });
//   }
// };

// DELETE (by product_id)
exports.delete = async (req, res) => {
  /*
    #swagger.tags = ['Products']
  */
  try {
    const product_id = req.params.product_id;

    const result = await Product.deleteOne({ product_id: product_id });
    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: `Cannot delete Product with product_id=${product_id}. Not found.`
      });
    }

    res.status(200).json({
      message: 'Product was deleted successfully!'
    });

  } catch (err) {
    res.status(500).json({
      message: 'Error deleting Product with product_id=' + req.params.product_id
    });
  }
};

// DELETE ALL
exports.deleteAll = async (req, res) => {
  /*
    #swagger.tags = ['Products']
  */
  try {
    const data = await Product.deleteMany({});
    res.status(200).json({
      message: `${data.deletedCount} Products were deleted successfully!`
    });

  } catch (err) {
    res.status(500).json({
      message: err.message || 'Some error occurred while removing all Products.'
    });
  }
};

