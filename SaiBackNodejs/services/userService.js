// services/userService.js
"use strict";

const { auth } = require('../firebase');
const UserModel = require('../models/UserModel');

const userService = {
  // Crear un nuevo usuario con correo electrónico y contraseña
  createUserWithEmailAndPassword: async (email, password) => {
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Guarda información adicional del usuario en Firestore
      const userModel = new UserModel({ uid: user.uid, email: user.email });
      await userModel.save();

      return user;
    } catch (error) {
      throw error; // Lanza el error para que sea manejado por el middleware
    }
  },

  // Iniciar sesión con correo electrónico y contraseña
  signInWithEmailAndPassword: async (email, password) => {
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  },


  // Iniciar sesión de forma anónima
  signInAnonymously: async () => {
    try {
      const userCredential = await auth.signInAnonymously();
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  },

  // Cerrar sesión
  signOut: async () => {
    try {
      await auth.signOut();
    } catch (error) {
      throw error;
    }
  },

  // Obtener información del usuario actual (protegido por middleware de autenticación)
  getCurrentUser: async (req) => {
    try {
      const token = req.headers?.authorization?.split('Bearer ')[1]; // Validación mejorada
      if (!token) {
        throw new Error('Token no proporcionado');
      }

      // Utiliza el modelo para obtener el usuario actual
      return await UserModel.getCurrentUser(token);
    } catch (error) {
      throw error;
    }
  },

  // Obtener información adicional del usuario por UID
  getUserByUid: async (uid) => {
    return await UserModel.findByUid(uid);
  },
};

module.exports = userService;
