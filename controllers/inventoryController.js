const db = require('../models');
const Movement = db.movements;
const Product = db.products;

// Helper: calculate stock (kg) for a given product_id (string)
async function calculateStock(product_id) {
  const movements = await Movement.find({ product_id });
  let totalIn = 0, totalOut = 0;
  movements.forEach(m => {
    if (m.type === 'IN') totalIn += (m.quantity || 0);
    if (m.type === 'OUT') totalOut += (m.quantity || 0);
  });
  return totalIn - totalOut;
}

// CREATE MOVEMENT
exports.create = async (req, res) => {
  /*
    #swagger.tags = ['Movements']
    #swagger.description = `
      Create an inventory movement.<br><br>
      • <b>IN</b>: Adds stock.<br>
      • <b>OUT</b>: Removes stock and validates available quantity.<br><br>
    `
    #swagger.parameters['Movement'] = {
      in: 'body',
      required: true,
      description: 'Movement details to register',
      schema: {
        product_id: "001-0001",
        type: "IN",
        quantity: 100,
        notes: "Optional notes"
      },
      example: {
        product_id: "001-0001",
        type: "IN",
        quantity: 50,
        notes: "Received new stock"
      }
    }
    #swagger.enums = {
      type: ["IN", "OUT"]
    }
  */

  if (!req.body.product_id || !req.body.type || typeof req.body.quantity === 'undefined') {
    return res.status(400).send({ message: 'product_id, type and quantity are required.' });
  }

  try {
    const product = await Product.findOne({ product_id: req.body.product_id });
    if (!product) return res.status(404).send({ message: 'Product not found!' });

    if (req.body.type === 'OUT') {
      const stock = await calculateStock(req.body.product_id);
      if (req.body.quantity > stock) return res.status(400).send({ message: 'Not enough stock', availableKg: stock });
    }

    const movement = new Movement({
      product_id: req.body.product_id,
      type: req.body.type,
      quantity: req.body.quantity,
      date: new Date(),
      notes: req.body.notes,
    });

    const data = await movement.save();
    res.status(201).send(data);

  } catch (err) {
    res.status(500).send({ message: err.message || 'Server error' });
  }
};

// GET ALL MOVEMENTS
exports.findAll = (req, res) => {
  /*
    #swagger.tags = ['Movements']
  */
  Movement.find({}, { __v: 0 })
    .then(data => res.status(200).send(data))
    .catch(err => res.status(500).send({ message: err.message || 'Error retrieving movements' }));
};

// GET ONE (by _id)
exports.findOne = (req, res) => {
  /*
    #swagger.tags = ['Movements']
    #swagger.parameters['id'] = {
      in: 'path',
      required: true,
      description: 'MongoDB _id of the movement',
      type: 'string'
    }
  */
  const id = req.params.id;

  Movement.findById(id, { __v: 0 })
    .then(data => {
      if (!data) return res.status(404).send({ message: `Movement with id=${id} not found` });
      res.status(200).send(data);
    })
    .catch(err => res.status(500).send({ message: 'Error retrieving Movement with id=' + id }));
};

// UPDATE movement (with stock validation if type/quantity/product changes)
exports.update = async (req, res) => {
  /*
    #swagger.tags = ['Movements']
    #swagger.description = 'Update a movement (stock validated if type/quantity/product changes)'

    #swagger.parameters['id'] = {
      in: 'path',
      description: 'MongoDB _id of the movement',
      required: true,
      type: 'string',
      example: '69219684a3c23c6f83c18dbl'
    }

    #swagger.parameters['Movement'] = { 
      in: 'body',
      description: 'Fields to update',
      required: true,
      schema: { 
        product_id: '001-0001',
        type: 'IN',
        quantity: 50,
        notes: 'Updated notes'
      } 
    }
  */

  const id = req.params.id;

  if (!req.body) return res.status(400).send({ message: 'Data to update cannot be empty!' });

  try {
    const mov = await Movement.findById(id);
    if (!mov) return res.status(404).send({ message: `Movement with id=${id} not found` });

    const newProductId = req.body.product_id || mov.product_id;
    const newType = req.body.type || mov.type;
    const newQuantity = typeof req.body.quantity !== 'undefined' ? req.body.quantity : mov.quantity;

    const allMovs = await Movement.find({ product_id: newProductId, _id: { $ne: id } });
    let totalIn = 0, totalOut = 0;
    allMovs.forEach(m => {
      if (m.type === 'IN') totalIn += (m.quantity || 0);
      if (m.type === 'OUT') totalOut += (m.quantity || 0);
    });
    const availableExcluding = totalIn - totalOut;

    if (newType === 'OUT' && newQuantity > availableExcluding) {
      return res.status(400).send({ message: 'Not enough stock for this update', availableKg: availableExcluding });
    }

    mov.product_id = newProductId;
    mov.type = newType;
    mov.quantity = newQuantity;
    if (req.body.date) mov.date = new Date(req.body.date);
    if (typeof req.body.notes !== 'undefined') mov.notes = req.body.notes;

    const data = await mov.save();
    res.status(200).send({ message: 'Movement updated successfully', data });

  } catch (err) {
    res.status(500).send({ message: err.message || 'Server error' });
  }
};

// DELETE movement
exports.delete = (req, res) => {
  /*
    #swagger.tags = ['Movements']
    #swagger.parameters['id'] = {
      in: 'path',
      required: true,
      type: 'string',
    }
  */
  const id = req.params.id;

  Movement.findByIdAndDelete(id)
    .then(data => {
      if (!data) return res.status(404).send({ message: `Movement with id=${id} not found` });
      res.status(200).send({ message: 'Movement deleted successfully!' });
    })
    .catch(err => res.status(500).send({ message: 'Could not delete Movement with id=' + id }));
};

// DELETE ALL
exports.deleteAll = (req, res) => {
  /*
    #swagger.tags = ['Movements']
  */
  Movement.deleteMany({})
    .then(data => res.send({ message: `${data.deletedCount} Movements were deleted successfully!` }))
    .catch(err => res.status(500).send({ message: err.message || 'Error deleting all movements' }));
};

// STOCK BY PRODUCT (kg)
exports.stockByProduct = async (req, res) => {
  /*
    #swagger.tags = ['Inventory']
    #swagger.description = 'Get total stock in kg for a product'
  */
  const product_id = req.params.product_id;

  try {
    const stock = await calculateStock(product_id);
    const product = await Product.findOne({ product_id }, { _id: 0, name: 1 });
    if (!product) return res.status(404).send({ message: `Product with id ${product_id} not found.` });

    res.status(200).send({
      product_id,
      product_name: product.name,
      stockKg: stock,
    });

  } catch (err) {
    res.status(500).send({ message: 'Error calculating stock' });
  }
};





