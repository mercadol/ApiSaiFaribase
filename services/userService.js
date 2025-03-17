// services/userService.js
"use strict";

const { auth } = require('../firebase');
const UserModel = require('../models/UserModel');

/**
 * Servicio para la gestión de usuarios
 */
const userService = {
  /**
   * Crea un nuevo usuario con correo electrónico y contraseña.
   * Además, guarda información adicional del usuario en Firestore.
   *
   * @param {string} email - Correo electrónico del usuario.
   * @param {string} password - Contraseña del usuario.
   * @returns {Promise<Object>} Objeto del usuario creado.
   * @throws {Error} Propaga errores de creación.
   */
  createUserWithEmailAndPassword: async (email, password) => {
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Guarda información adicional del usuario en Firestore
      const userModel = new UserModel({ uid: user.uid, email: user.email });
      await userModel.save();

      return user;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Inicia sesión con correo electrónico y contraseña.
   *
   * @param {string} email - Correo electrónico del usuario.
   * @param {string} password - Contraseña del usuario.
   * @returns {Promise<Object>} Objeto del usuario autenticado.
   * @throws {Error} Propaga errores de autenticación.
   */
  signInWithEmailAndPassword: async (email, password) => {
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Inicia sesión de forma anónima.
   *
   * @returns {Promise<Object>} Objeto del usuario autenticado de forma anónima.
   * @throws {Error} Propaga errores de autenticación.
   */
  signInAnonymously: async () => {
    try {
      const userCredential = await auth.signInAnonymously();
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cierra la sesión actual.
   *
   * @returns {Promise<void>}
   * @throws {Error} Propaga errores durante el cierre de sesión.
   */
  signOut: async () => {
    try {
      await auth.signOut();
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtiene la información del usuario actual a partir del token
   * en el header de la solicitud.
   *
   * @param {Object} req - Objeto de la solicitud que contiene el token.
   * @returns {Promise<Object>} Información del usuario actual.
   * @throws {Error} Si el token no está proporcionado o se produce algún error.
   */
  getCurrentUser: async (req) => {
    try {
      const token = req.headers?.authorization?.split('Bearer ')[1];
      if (!token) {
        throw new Error('Token no proporcionado');
      }
      return await UserModel.getCurrentUser(token);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtiene información adicional de un usuario mediante su UID.
   *
   * @param {string} uid - Identificador único del usuario.
   * @returns {Promise<Object>} Información del usuario.
   */
  getUserByUid: async (uid) => {
    return await UserModel.findByUid(uid);
  },
};

module.exports = userService;
