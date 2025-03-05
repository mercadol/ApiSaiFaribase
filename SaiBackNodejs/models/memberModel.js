// models/MemberModel.js
"use strict";

const { db } = require("../firebase");
const ApiError = require('../utils/ApiError');

class MemberModel {
  constructor(data) {
    this.id = data.id || null;
    this.nombre = data.nombre || "";
    this.email = data.email || "";
    this.estadoCivil = data.estadoCivil || "";
    this.tipoMiembro = data.tipoMiembro || "Visitante";
    this.oficio = data.oficio || "";
    this.fechaRegistro = data.fechaRegistro || new Date();
  }

  // Método para guardar el miembro en Firestore
  async save() {
    try {
      const memberData = {
        nombre: this.nombre,
        email: this.email,
        estadoCivil: this.estadoCivil,
        tipoMiembro: this.tipoMiembro,
        fechaRegistro: this.fechaRegistro,
        oficio: this.oficio,
      };

      if (this.id) {
        // Si ya existe un ID, actualiza el documento
        await db.collection("Member").doc(this.id).update(memberData);
      } else {
        // Si no existe, crea un nuevo documento
        const docRef = await db.collection("Member").add(memberData);
        this.id = docRef.id; // Asigna el ID generado
      }
    } catch (error) {
      console.error("Error guardando el miembro:", error);
      throw new ApiError(500, "Error al guardar el miembro. Inténtelo más tarde.");
    }
  }

  // Método para eliminar el miembro de Firestore
  async delete() {
    if (!this.id) {
      throw new ApiError(400, "ID del miembro no especificado.");
    }
    try {
      await db.collection("Member").doc(this.id).delete();
    } catch (error) {
      console.error("Error eliminando el miembro:", error);
      throw new ApiError(500, "Error al eliminar el miembro. Inténtelo más tarde.");
    }
  }

  // Método estático para buscar miembros por ID
  static async findById(id) {
    try {
      const doc = await db.collection("Member").doc(id).get();
      if (!doc.exists) {
        throw new ApiError(404, "Miembro no encontrado.");
      }
      return new MemberModel({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error("Error buscando el miembro:", error);
      throw new ApiError(500, "Error al buscar el miembro. Inténtelo más tarde.");
    }
  }

  // Método estático para buscar todos los miembros
  static async findAll(startAfterId = null, pageSize = 10) {
    try {
      let query = db.collection("Member").orderBy("nombre").limit(pageSize);
      if (startAfterId) {
        const startAfterDoc = await db.collection("Member").doc(startAfterId).get();
        if (startAfterDoc.exists) {
          query = query.startAfter(startAfterDoc);
        }
      }

      const snapshot = await query.get();
      const members = snapshot.docs.map(doc => new MemberModel({ id: doc.id, ...doc.data() }));
      return members;
    } catch (error) {
      console.error("Error buscando todos los miembros:", error);
      throw new ApiError(500, "Error al buscar miembros. Inténtelo más tarde.");
    }
  }
}

module.exports = MemberModel;
