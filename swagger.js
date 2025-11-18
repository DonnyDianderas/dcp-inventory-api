const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'DCP Inventory API',
    description: 'API for DCP products and inventory movements',
  },
  host: 'localhost:8080',
  schemes: ['http'],
};

const outputFile = './swagger.json';
const endpointsFiles = ['./routes/index.js'];

// Generate swagger.json
swaggerAutogen(outputFile, endpointsFiles, doc).then(async () => {
  // After it gets generated
  require('./server.js');
});


