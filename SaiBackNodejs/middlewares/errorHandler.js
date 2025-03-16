// middlewares/errorHandler.js
'use strict';
const ApiError = require('../utils/ApiError');

/**
 * Middleware de manejo de errores.
 * Si el error es una instancia de ApiError, se usan sus propiedades; de lo contrario se
 * asume un error interno del servidor.
 *
 * @param {Error} err - Error a manejar.
 * @param {Object} req - Objeto de la solicitud.
 * @param {Object} res - Objeto de la respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const errorHandler = (err, req, res, next) => {
  // Para producción se podría integrar un logger en lugar de console.error.
  console.error('Error:', err);

  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

module.exports = errorHandler;
