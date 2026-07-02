const swaggerJSDoc = require('swagger-jsdoc');

const PORT = process.env.PORT || 5000;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Student Management System API Documentation',
      version: '1.0.0',
      description: 'Consolidated REST API endpoints documentation for Student profiles, Attendance ledgers, Results grades, and User authorization.',
      contact: {
        name: 'Academy Support Portal',
        email: 'academics@eduportal.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  // Paths to files containing doc annotations
  apis: [
    './routes/*.js',
    './server.js'
  ]
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
