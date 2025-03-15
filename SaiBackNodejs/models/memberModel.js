// models/MemberModel.js
"use strict";

const { db } = require("../firebase");
const ApiError = require("../utils/ApiError");

class MemberModel {
  constructor(data) {
    this.id = data.id || null;
    this.Nombre = data.Nombre || data.name || "";
    this.Email = data.Email || "";
    this.EstadoCivil = data.EstadoCivil || "";
    this.TipoMiembro = data.TipoMiembro || "Visitante";
    this.Oficio = data.Oficio || "";
    this.FechaRegistro = data.FechaRegistro || new Date();
  }

  // Método para guardar el miembro en Firestore
  async save() {
    try {
      const memberData = {
        Nombre: this.Nombre,
        Email: this.Email,
        EstadoCivil: this.EstadoCivil,
        TipoMiembro: this.TipoMiembro,
        FechaRegistro: this.FechaRegistro,
        Oficio: this.Oficio,
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
      throw new ApiError(500, `Error al guardar el miembro. Inténtelo más tarde: ${error.message}`);
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
      throw new ApiError(500, `Error al eliminar el miembro. Inténtelo más tarde: ${error.message}`);
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
      if (error.message=="Miembro no encontrado.") throw error;
      throw new ApiError(500, `Error al buscar el miembro. Inténtelo más tarde: ${error.message}`);
    }
  }

  // Método estático para buscar todos los miembros
  static async findAll(startAfterId = null, pageSize = 10) {
    try {
      let query = db.collection("Member").orderBy("Nombre").limit(pageSize);
      if (startAfterId) {
        const startAfterDoc = await db
          .collection("Member")
          .doc(startAfterId)
          .get();
        if (startAfterDoc.exists) {
          query = query.startAfter(startAfterDoc);
        }
      }

      const snapshot = await query.get();
      const members = snapshot.docs.map((doc) => new MemberModel({ id: doc.id, ...doc.data() }));
      return members;
    } catch (error) {
      throw new ApiError(500, `Error al buscar miembros. Inténtelo más tarde: ${error.message}`);
    }
  }

  // Método estático para buscar miembros por nombre
  static async search(searchString, startAfterId = null, pageSize = 10) {
    try {
      let query = db
        .collection("Member")
        .where("Nombre", ">=", searchString)
        .where("Nombre", "<=", searchString + "\uf8ff")
        .orderBy("Nombre")
        .limit(pageSize);

      if (startAfterId) {
        const startAfterDoc = await db
          .collection("Member")
          .doc(startAfterId)
          .get();
        if (startAfterDoc.exists) {
          query = query.startAfter(startAfterDoc);
        }
      }

      const snapshot = await query.get();
      return {
        results: snapshot.docs.map(
          (doc) => new MemberModel({ id: doc.id, ...doc.data() })
        ),
        lastDoc: snapshot.docs[snapshot.docs.length - 1],
      };
    } catch (error) {
      throw new ApiError(500, `Error al buscar miembros. Inténtelo más tarde: ${error.message}`);
    }
  }
}

module.exports = MemberModel;
