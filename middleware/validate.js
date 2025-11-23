const mongoose = require('mongoose');

// Validation for MongoDB _id (used in Movements)
const validateMongoId = (req, res, next) => {
    const id = req.params.id;
    if (id && !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({ message: `${id} is not a valid MongoDB ID.` }); // 400 Bad Request
    }
    next();
};

// Validation for Movement Creation (POST Movements)
const validateCreateMovement = (req, res, next) => {
    const { product_id, type, quantity } = req.body;
    
    if (!product_id || !type || typeof quantity === 'undefined') {
        return res.status(400).send({ message: 'product_id, type and quantity are required.' });
    }
    
    if (!['IN', 'OUT'].includes(type)) {
        return res.status(400).send({ message: `Invalid movement type: ${type}. Must be 'IN' or 'OUT'.` });
    }
    
    if (typeof quantity !== 'number' || quantity <= 0) {
        return res.status(400).send({ message: 'Quantity must be a positive number.' });
    }
    
    next();
};

// Validation for Product Creation/Update (POST/PUT Products)
const validateProductFields = (req, res, next) => {
    // Check required fields for POST (Creation)
    if (req.method === 'POST') {
        if (!req.body.product_id || !req.body.name) {
            return res.status(400).send({ message: 'product_id and name are required to create a product.' });
        }
    }
    
    // Check if body is empty for PUT (Update) (Data Validation)
    if (req.method === 'PUT' && Object.keys(req.body).length === 0) {
        return res.status(400).send({ message: 'Data to update cannot be empty!' });
    }

    next();
};

module.exports = { 
    validateMongoId, 
    validateCreateMovement,
    validateProductFields 
};