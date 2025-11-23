const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'DCP Inventory API',
    description: 'API for DCP products and inventory movements',
  },
  host: 'localhost:8080',
  schemes: ['http'],
  securityDefinitions: {
    SessionAuth: {
      type: 'apiKey',
      in: 'cookie',
      name: 'connect.sid', 
      description: "Authentication is managed via an HTTP Session after successful login (/auth/login or /login).",
    },
  },
  definitions: {
      User: {
        username: "dcpUser",
        email: "dcp@example.com",
        password: "SecurePassword123",
        firstName: "Donny",
        lastName: "Dianderas",
    },
      Credentials: {
        username: "dcpUser",
        password: "SecurePassword123",
    },
      Movement: {
        product_id: "001-0001",
        type: "IN",
        quantity: 100,
        notes: "Optional notes"
    },
      Product: {
        product_id: '001-0xxxx', 
        name: 'PHOSPHATE..', 
        presentation: 'xx kg',
        description: 'Describe the product here' 
    }
  }
};

const outputFile = './swagger.json';
const endpointsFiles = ['./routes/index.js'];

// Generate swagger.json
swaggerAutogen(outputFile, endpointsFiles, doc).then(async () => {
  // After it gets generated
  require('./server.js');
});


