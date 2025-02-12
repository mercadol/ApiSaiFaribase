// middlewares/errorHandler.js
'use strict';
const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Si el error es una instancia de ApiError, usamos su código y mensaje
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({ 
    error: message, 
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }) 
  });
};

module.exports = errorHandler;
