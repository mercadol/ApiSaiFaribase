const { auth } = require('../firebase');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No se proporcionó token' });
    }

    const decodedToken = await auth.verifyIdToken(token);
    req.user = await auth.getUser(decodedToken.uid); // Agrega la información del usuario a la solicitud
    next(); // Continúa con la siguiente ruta
  } catch (error) {
    return res.status(401).json({ message: 'Token no válido' });
  }
};

module.exports = authenticate;
