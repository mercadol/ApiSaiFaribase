// middlewares/asyncHandler.js
/**
 * Middleware para manejar errores en funciones asíncronas.
 * Envuelve una función asíncrona y atrapa cualquier error, pasándolo al siguiente middleware.
 *
 * @param {Function} fn - Función asíncrona a envolver.
 * @returns {Function} Función middleware que maneja la ejecución y captura de errores.
 * @throws {TypeError} Si fn no es una función.
 */
const asyncHandler = (fn) => {
  if (typeof fn !== 'function') {
    throw new TypeError('asyncHandler requires a function');
  }

  return function (req, res, next) {
    return Promise.resolve(fn.call(this, req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;
