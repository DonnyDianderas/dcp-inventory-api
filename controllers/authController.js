const db = require('../models');
const User = db.users;

// REGISTER new user (Create Account)
exports.register = async (req, res) => {
    /* #swagger.tags = ['Authentication']
    #swagger.description = 'Register a new user'
    #swagger.parameters['User'] = {
        in: 'body',
        description: 'User details (password will be hashed)',
        schema: { $ref: '#/definitions/User' }
    }
    */
    
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        // Return 400 if required fields are missing (Data Validation)
        return res.status(400).send({ message: 'Username, email, and password are required.' });
    }

    try {
        const user = new User({ username, email, password, firstName: req.body.firstName, lastName: req.body.lastName });
        const data = await user.save();
        
        // Success: 201 Created
        res.status(201).send({ message: 'User registered successfully!' });

    } catch (err) {
        // Handle duplicate key error (username/email already exists)
        if (err.code === 11000) {
            return res.status(400).send({ message: 'Username or email already in use.' });
        }
        // Handle other server errors (Error Handling - 500)
        res.status(500).send({ message: err.message || 'Server error during registration.' });
    }
};

// LOGIN user with local credentials
exports.login = async (req, res) => {
    /* #swagger.tags = ['Authentication']
    #swagger.description = 'Log in with username and password'
    #swagger.parameters['Credentials'] = {
        in: 'body',
        description: 'User login credentials',
        schema: { $ref: '#/definitions/Credentials' }
    }
    */

    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send({ message: 'Username and password are required.' });
    }

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).send({ message: 'Invalid credentials.' }); // 401 Unauthorized
        }

        const isMatch = await user.comparePassword(password);
        
        if (!isMatch) {
            return res.status(401).send({ message: 'Invalid credentials.' }); // 401 Unauthorized
        }
        
        // Successful login
        req.session.user = { id: user._id, username: user.username, role: user.role };
        user.lastLogin = new Date(); 
        await user.save(); 
        res.status(200).send({ message: 'Login successful!', user: req.session.user });

    } catch (err) {
        res.status(500).send({ message: err.message || 'Server error during login.' });
    }
};