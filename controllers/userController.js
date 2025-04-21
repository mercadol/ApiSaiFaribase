// controllers/userController.js
const userService = require('../services/userService');
const { validationResult, check } = require('express-validator');

/**
 * Controlador para la gestión de usuarios.
 */
const userController = {
  /**
   * Middleware de validación para crear usuario.
   */
  validateCreateUser: [
    check('email').isEmail().withMessage('Email no válido'),
    check('password')
      .isLength({ min: 6 })
      .withMessage('Contraseña debe tener al menos 6 caracteres'),
  ],

  /**
   * Crea un nuevo usuario.
   * Realiza validaciones sobre el email y contraseña antes de crear el usuario.
   *
   * @param {Object} req - Objeto de solicitud de Express.
   * @param {Object} res - Objeto de respuesta de Express.
   * @returns {Promise<void>}
   */
  createUser: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    try {
      const { email, password } = req.body;

      const user = await userService.createUserWithEmailAndPassword(email, password);
      res.status(201).json(user); // 201 Created
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Middleware de validación para iniciar sesión.
   */
  validateSignIn: [
    check('email').isEmail().withMessage('Email no válido'),
    check('password').notEmpty().withMessage('Contraseña es requerida'),
  ],

  /**
   * Inicia sesión para un usuario existente utilizando email y contraseña.
   *
   * @param {Object} req - Objeto de solicitud de Express.
   * @param {Object} res - Objeto de respuesta de Express.
   * @returns {Promise<void>}
   */
  signIn: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    try {
      const { email, password } = req.body;

      const user = await userService.signInWithEmailAndPassword(email, password);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Inicia sesión de forma anónima.
   *
   * @param {Object} req - Objeto de solicitud de Express.
   * @param {Object} res - Objeto de respuesta de Express.
   * @returns {Promise<void>}
   */
  signInAnonymously: async (req, res) => {
    try {
      const user = await userService.signInAnonymously();
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Cierra la sesión del usuario actual.
   *
   * @param {Object} req - Objeto de solicitud de Express.
   * @param {Object} res - Objeto de respuesta de Express.
   * @returns {Promise<void>}
   */
  signOut: async (req, res) => {
    try {
      await userService.signOut();
      res.status(204).end(); // 204 No Content
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Obtiene la información del usuario actual.
   * Nota: Requiere que la petición haya pasado por un middleware de autenticación.
   *
   * @param {Object} req - Objeto de solicitud de Express.
   * @param {Object} res - Objeto de respuesta de Express.
   * @returns {Promise<void>}
   */
  getCurrentUser: async (req, res) => {
    try {
      const user = await userService.getCurrentUser(req);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = userController;
