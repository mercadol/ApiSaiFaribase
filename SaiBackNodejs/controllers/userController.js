"use strict";

const userService = require('../services/userService');
const validator = require('validator');

const userController = {
  // Crear un nuevo usuario
  createUser: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validaciones
      if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son requeridos' });
      }
      if (!validator.isEmail(email)) {
        return res.status(400).json({ message: 'Email no válido' });
      }
      if (password.length < 6) { // Ejemplo: contraseña de mínimo 6 caracteres
        return res.status(400).json({ message: 'Contraseña debe tener al menos 6 caracteres' });
      }

      const user = await userService.createUserWithEmailAndPassword(email, password);
      res.status(201).json(user); // 201 Created
    } catch (error) {
      res.status(500).json({ message: error.message }); // Manejo de errores
    }
  },

  // Iniciar sesión
  signIn: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validaciones (similares a createUser)
      if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son requeridos' });
      }
      if (!validator.isEmail(email)) {
        return res.status(400).json({ message: 'Email no válido' });
      }

      const user = await userService.signInWithEmailAndPassword(email, password);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Iniciar sesión de forma anónima
  signInAnonymously: async (req, res) => {
    try {
      const user = await userService.signInAnonymously();
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Cerrar sesión
  signOut: async (req, res) => {
    try {
      await userService.signOut();
      res.status(204).end(); // 204 No Content
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Obtener usuario actual (requiere middleware de autenticación)
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
