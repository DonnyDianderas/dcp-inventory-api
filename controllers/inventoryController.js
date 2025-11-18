const db = require('../models');
const Movement = db.movements;
const Product = db.products;

// Helper: calculate stock (kg) for a given product_id (string)
async function calculateStock(product_id) {
  // sum IN - sum OUT
  const movements = await Movement.find({ product_id: product_id });
  let totalIn = 0;
  let totalOut = 0;
  movements.forEach((m) => {
    if (m.type === 'IN') totalIn += (m.quantity || 0);
    if (m.type === 'OUT') totalOut += (m.quantity || 0);
  });
  return totalIn - totalOut;
}

// CREATE MOVEMENT
exports.create = async (req, res) => {
  /*
    #swagger.tags = ['Movements']
    #swagger.description = 'Create inventory movement (IN or OUT). For OUT, stock is validated.'
  */
  if (!req.body.product_id || !req.body.type || typeof req.body.quantity === 'undefined') {
    res.status(400).send({ message: 'Content can not be empty! product_id, type and quantity are required.' });
    return;
  }

  try {
    // product exists?
    const product = await Product.findOne({ product_id: req.body.product_id });
    if (!product) {
      res.status(404).send({ message: 'Product not found!' });
      return;
    }

    // validate OUT stock
    if (req.body.type === 'OUT') {
      const stock = await calculateStock(req.body.product_id);
      if (req.body.quantity > stock) {
        res.status(400).send({ message: 'Not enough stock', availableKg: stock });
        return;
      }
    }

    const movement = new Movement({
      movement_id: req.body.movement_id,
      product_id: req.body.product_id,
      type: req.body.type,
      quantity: req.body.quantity,
      date: req.body.date ? new Date(req.body.date) : new Date(),
      notes: req.body.notes,
    });

    movement
      .save(movement)
      .then((data) => {
        res.status(201).send(data);
      })
      .catch((err) => {
        res.status(500).send({ message: err.message || 'Some error occurred while creating the Movement.' });
      });
  } catch (err) {
    res.status(500).send({ message: err.message || 'Server error' });
  }
};

// GET ALL MOVEMENTS
exports.findAll = (req, res) => {
  /*
    #swagger.tags = ['Movements']
  */
  Movement.find({}, { _id: 0 })
    .then((data) => res.status(200).send(data))
    .catch((err) =>
      res.status(500).send({ message: err.message || 'Some error occurred while retrieving movements.' })
    );
};

// GET ONE (by movement_id)
exports.findOne = (req, res) => {
  /*
    #swagger.tags = ['Movements']
  */
  const movement_id = Number(req.params.movement_id);

  Movement.find({ movement_id: movement_id })
    .then((data) => {
      if (!data || data.length === 0)
        res.status(404).send({ message: 'Not found Movement with id ' + movement_id });
      else res.status(200).send(data[0]);
    })
    .catch((err) => {
      res.status(500).send({ message: 'Error retrieving Movement with id=' + movement_id });
    });
};

// UPDATE movement (with stock validation if type/quantity/product changes)
exports.update = async (req, res) => {
   /*
    #swagger.tags = ['Movements']
    #swagger.description = 'Update a movement (stock is validated when needed).'
  */

  const movement_id = Number(req.params.movement_id);
  if (!req.body) {
    return res.status(400).send({ message: 'Data to update can not be empty!' });
  }

  try {
    const mov = await Movement.findOne({ movement_id: movement_id });
    if (!mov) {
      res.status(404).send({ message: `Cannot update Movement with id=${movement_id}. Maybe Movement was not found!` });
      return;
    }

    // if changing to OUT or changing quantity/product, validate stock (exclude this movement)
    const newProductId = req.body.product_id || mov.product_id;
    const newType = req.body.type || mov.type;
    const newQuantity = typeof req.body.quantity !== 'undefined' ? req.body.quantity : mov.quantity;

    // compute available excluding this movement
    const allMovs = await Movement.find({ product_id: newProductId, movement_id: { $ne: movement_id } });
    let totalIn = 0, totalOut = 0;
    allMovs.forEach(m => {
      if (m.type === 'IN') totalIn += (m.quantity || 0);
      if (m.type === 'OUT') totalOut += (m.quantity || 0);
    });
    const availableExcluding = totalIn - totalOut;

    if (newType === 'OUT' && newQuantity > availableExcluding) {
      res.status(400).send({ message: 'Not enough stock for this update', availableKg: availableExcluding });
      return;
    }

    // update fields
    mov.product_id = newProductId;
    mov.type = newType;
    mov.quantity = newQuantity;
    if (req.body.date) mov.date = new Date(req.body.date);
    if (typeof req.body.notes !== 'undefined') mov.notes = req.body.notes;

    mov
      .save()
      .then((data) => res.status(200).send({ message: 'Movement updated successfully.', data }))
      .catch((err) => res.status(500).send({ message: 'Error updating Movement with id=' + movement_id }));
  } catch (err) {
    res.status(500).send({ message: err.message || 'Server error' });
  }
};

// DELETE movement
exports.delete = (req, res) => {
   /*
    #swagger.tags = ['Movements']
  */
  const movement_id = Number(req.params.movement_id);

  Movement.findOneAndDelete({ movement_id: movement_id })
    .then((data) => {
      if (!data) {
        res.status(404).send({ message: `Cannot delete Movement with id=${movement_id}. Maybe Movement was not found!` });
      } else {
        res.status(200).send({ message: 'Movement was deleted successfully!' });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: 'Could not delete Movement with id=' + movement_id });
    });
};

// DELETE ALL
exports.deleteAll = (req, res) => {
   /*
    #swagger.tags = ['Movements']
  */
  Movement.deleteMany({})
    .then((data) => res.send({ message: `${data.deletedCount} Movements were deleted successfully!` }))
    .catch((err) => res.status(500).send({ message: err.message || 'Some error occurred while removing all movements.' }));
};

// STOCK BY PRODUCT (kg)
exports.stockByProduct = async (req, res) => {
   /*
    #swagger.tags = ['Inventory']
    #swagger.description = 'Get total stock in kg for a product'
  */
  const product_id = req.params.product_id;

  try {
    // get stock
    const stock = await calculateStock(product_id);

    // get product info (only name)
    const product = await Product.findOne(
      { product_id: product_id },
      { _id: 0, name: 1 }
    );

    if (!product) {
      return res.status(404).send({
        message: `Product with id ${product_id} not found.`,
      });
    }

    // response
    res.status(200).send({
      product_id,
      product_name: product.name,
      stockKg: stock,
    });

  } catch (err) {
    res.status(500).send({ message: 'Error calculating stock' });
  }
};



