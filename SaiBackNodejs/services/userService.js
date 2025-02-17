"use strict";

const { db, auth } = require('../firebase');

const userService = {
  // Crear un nuevo usuario con correo electrónico y contraseña
  createUserWithEmailAndPassword: async (email, password) => {
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Guarda información adicional del usuario en Firestore (opcional)
      await db.collection('users').doc(user.uid).set({
        email: user.email,
      });

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

  // Iniciar sesión con Google
  signInWithGoogle: async () => {
    try {
      const provider = new firebase.auth.GoogleAuthProvider(); // Asegúrate de tener firebase importado
      const userCredential = await auth.signInWithPopup(provider);
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
      const token = req.headers.authorization?.split('Bearer ')[1]; // Obtiene el token del encabezado
      if (!token) {
        throw new Error('Token no proporcionado');
      }

      const decodedToken = await auth.verifyIdToken(token);
      const user = await auth.getUser(decodedToken.uid);
      return user;
    } catch (error) {
      throw error;
    }
  },

};

module.exports = userService;
