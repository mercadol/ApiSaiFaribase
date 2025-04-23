// middlewares/authenticate.js
const { auth } = require("../firebase");
const ApiError = require("../utils/ApiError");

/**
 * Middleware de autenticación.
 * Verifica el token de autorización en el header y añade la información del usuario a la solicitud.
 *
 * @param {Object} req - Objeto de la solicitud.
 * @param {Object} res - Objeto de la respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 * @returns {Promise<void>}
 */
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) {
      return res.status(401).json({ message: "No se proporcionó token" });
    }

    const decodedToken = await auth.verifyIdToken(token);
    req.user = await auth.getUser(decodedToken.uid); // Se agrega la información del usuario a la solicitud
    next();
  } catch (error) {
    return next(new ApiError(401, "Token no válido"));
  }
};

module.exports = authenticate;
