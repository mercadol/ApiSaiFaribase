// models/UserModel.js
const { db, auth } = require('../firebase');
const ApiError = require('../utils/ApiError');

class UserModel {
  constructor(data) {
    this.uid = data.uid || null;
    this.email = data.email || "";
    // Agrega otros campos según sea necesario
  }

  // Método para guardar información adicional del usuario en Firestore
  async save() {
    if (!this.uid) {
      throw new ApiError(400, "UID del usuario no especificado.");
    }
    try {
      await db.collection('users').doc(this.uid).set({
        email: this.email,
        // Agrega otros campos según sea necesario
      });
    } catch (error) {
      throw new ApiError(500, "Error al guardar el usuario. Inténtelo más tarde.");
    }
  }

  // Método estático para buscar un usuario por UID
  static async findByUid(uid) {
    try {
      const doc = await db.collection('users').doc(uid).get();
      if (!doc.exists) {
        throw new ApiError(404, "Usuario no encontrado.");
      }
      return new UserModel({ uid: doc.id, ...doc.data() });
    } catch (error) {
      // Reenviar errores ApiError sin modificarlos
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "Error al buscar el usuario. Inténtelo más tarde.");
    }
  }  

  // Método estático para obtener el usuario actual
  static async getCurrentUser(token) {
    try {
      const decodedToken = await auth.verifyIdToken(token);
      const user = await auth.getUser(decodedToken.uid);
      return new UserModel({ uid: user.uid, email: user.email });
    } catch (error) {
      throw new ApiError(500, "Error al obtener el usuario actual. Inténtelo más tarde.");
    }
  }
}

module.exports = UserModel;
