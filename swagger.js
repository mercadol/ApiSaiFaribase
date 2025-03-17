const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: process.env.API_TITLE || 'SaiAPI Documentation',
      version: process.env.API_VERSION || '1.25.1',
      description: 'Documentación de la API SAIbackend',
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3900/api',
      },
    ],
  },
  apis: ['./routes/*.js','./routerLoader.js',], // Ruta donde se encuentran las rutas documentadas
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('Swagger habilitado en: '+process.env.API_BASE_URL);
};

module.exports = setupSwagger;
