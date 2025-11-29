const routes = require('express').Router();
const products = require('./products');
const movements = require('./movements');
const auth = require('./auth');
const passport = require('passport');

routes.use('/auth', auth);
routes.use('/products', products);
routes.use('/movements', movements);
routes.use('/', require('./swagger'));
routes.get('/login', passport.authenticate('github', { scope: ['user:email'] }));

routes.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

routes.get('/', (req, res) => {
  res.status(200).send(`
    <h1 style="font-family: Arial; color: #333;">Welcome to the DCP Inventory API</h1>

    <p style="font-family: Arial; color: #555;">
      This API allows you to manage:
    </p>

    <ul style="font-family: Arial; color: #555; line-height: 1.6;">
       <li><strong>Products</strong> - Product catalog with commercial codes. 
          Go to <a href="/products">/products</a></li>
      <li><strong>Movements</strong> - Inventory IN/OUT records with automatic stock validation. 
          Go to <a href="/movements">/movements</a></li>
    </ul>

    <p style="font-family: Arial; color: #555;">
      Enter <a href="/api-docs">/api-docs</a> to view the complete documentation.
    </p>
  `);
});

module.exports = routes;


