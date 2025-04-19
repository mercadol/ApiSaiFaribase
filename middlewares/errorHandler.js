// middlewares/errorHandler.js
const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger"); // Logger para registrar errores

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
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const isOperational = err instanceof ApiError; // Errores conocidos vs inesperados

  // Loguear el error usando Pino
  logger.error(
    {
      err: {
        // Loguear el error como objeto para detalles
        message: err.message,
        stack: err.stack,
        name: err.name,
      },
      statusCode,
      isOperational,
      path: req.path,
      method: req.method,
      ip: req.ip, // Loguear IP del cliente
    },
    `Error capturado en errorHandler: ${err.message}` // Mensaje principal del log
  );

  // Evitar filtrar detalles del stack en producción para errores no esperados
  const responseMessage = isOperational
    ? err.message
    : "Ocurrió un error inesperado en el servidor.";

  res.status(statusCode).json({
    error: responseMessage,
    // Solo incluir stack en desarrollo para cualquier error
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
