// utils/ApiError.js
/**
 * Clase ApiError para manejar errores de la API.
 * Extiende de Error, incluyendo un código de estado HTTP.
 */
class ApiError extends Error {
  /**
   * Constructor del error con código de estado y mensaje.
   * @param {number} statusCode - Código HTTP para el error.
   * @param {string} message - Descripción del error.
   */
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ApiError;
  