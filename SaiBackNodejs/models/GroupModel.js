// models/GroupModel.js
"use strict";

const { db } = require("../firebase");
const ApiError = require('../utils/ApiError');

class GroupModel {
    /**
   * @param {object} data - Datos del grupo
   */
  constructor(data) {
    this.id = data.id || null;
    this.nombre = data.nombre || "";
    this.descripcion = data.descripcion || "";
    this.fechaCreacion = data.fechaCreacion || new Date();
    // Agrega otros campos según sea necesario
  }

  /**
   * Método para guardar el grupo en Firestore
   * @returns {Promise<string>} - ID del grupo creado
   */
  async save() {
    try {
      const groupData = {
        nombre: this.nombre,
        descripcion: this.descripcion,
        fechaCreacion: this.fechaCreacion,
      };

      if (this.id) {
        // Si ya existe un ID, actualiza el documento
        await db.collection("Group").doc(this.id).update(groupData);
      } else {
        // Si no existe, crea un nuevo documento
        const docRef = await db.collection("Group").add(groupData);
        this.id = docRef.id; // Asigna el ID generado
      }
    } catch (error) {
      throw new ApiError(500, `Error al guardar el grupo. Inténtelo más tarde: ${error.message}`);
    }
  }

  /**
   * Método para eliminar el grupo de Firestore
   * @param {string} id - ID del grupo
   * @returns {Promise<boolean>} - Confirmación de eliminación
   */
  async delete() {
    if (!this.id) {
      throw new ApiError(400, "ID del grupo no especificado.");
    }
    try {
      await db.collection("Group").doc(this.id).delete();
    } catch (error) {
      throw new ApiError(500, `Error al eliminar el grupo. Inténtelo más tarde: ${error.message}`);
    }
  }

  /**
   * Método estático para buscar grupo por ID
   * @param {string} id - ID del documento
   * @returns {Promise<object>} - Documento encontrado
   */
  static async findById(id) {
    try {
      const doc = await db.collection("Group").doc(id).get();
      if (!doc.exists) {
        throw new ApiError(404, "Grupo no encontrado.");
      }
      return new GroupModel({ id: doc.id, ...doc.data() });
    } catch (error) {
      // Reenviar errores ApiError sin modificarlos
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, `Error al buscar el grupo. Inténtelo más tarde: ${error.message}`);
    }
  }

  /**
   * Método estático para buscar todos los Grupos
   * @param {number} pageSize - Tamaño de la página (por defecto 10)
   * @param {string} startAfterId - ID del documento para paginación
   * @returns {Promise<Array>} - Lista de documentos
   */
  static async findAll(startAfterId = null, pageSize = 10) {
    try {
      let query = db.collection("Group").orderBy("nombre").limit(pageSize);
      if (startAfterId) {
        const startAfterDoc = await db.collection("Group").doc(startAfterId).get();
        if (startAfterDoc.exists) {
          query = query.startAfter(startAfterDoc);
        }
      }

      const snapshot = await query.get();
      const groups = snapshot.docs.map(doc => new GroupModel({ id: doc.id, ...doc.data() }));
      return groups;
    } catch (error) {
      throw new ApiError(500, `Error al buscar grupos. Inténtelo más tarde: ${error.message}`);
    }
  }

  // Método estático para buscar documento por nombre
  static async search(searchString, startAfterId = null, pageSize = 10) {
    try {
      let query = db
        .collection("Group")
        .where("nombre", ">=", searchString)
        .where("nombre", "<=", searchString + "\uf8ff")
        .orderBy("nombre")
        .limit(pageSize);

      if (startAfterId) {
        const startAfterDoc = await db
          .collection("Group")
          .doc(startAfterId)
          .get();
        if (startAfterDoc.exists) {
          query = query.startAfter(startAfterDoc);
        }
      }

      const snapshot = await query.get();
      return {
        results: snapshot.docs.map(
          (doc) => new GroupModel({ id: doc.id, ...doc.data() })
        ),
        lastDoc: snapshot.docs[snapshot.docs.length - 1],
      };
    } catch (error) {
      throw new ApiError(500, `Error al buscar grupos. Inténtelo más tarde: ${error.message}`);
    }
  }

  // Método para agregar un miembro al grupo
  async addMember(memberId) {
    if (!this.id) {
      throw new ApiError(400, "ID del grupo no especificado.");
    }
    if (!memberId) {
      throw new ApiError(400, "ID del miembro no especificado.");
    }
    try {
      const relationId = `${this.id}_${memberId}`;
      await db.collection("GroupMember").doc(relationId).set({
        groupId: this.id,
        memberId: memberId,
      });
    } catch (error) {
        console.error("Error agregando miembro al grupo:", error);
        throw new ApiError(500, "Error al agregar miembro al grupo. Inténtelo más tarde.");
      }
    }
  
    // Método para eliminar un miembro del grupo
    async removeMember(memberId) {
      if (!this.id) {
        throw new ApiError(400, "ID del grupo no especificado.");
      }
      if (!memberId) {
        throw new ApiError(400, "ID del miembro no especificado.");
      }
      try {
        const relationId = `${this.id}_${memberId}`;
        await db.collection("GroupMember").doc(relationId).delete();
      } catch (error) {
        console.error("Error eliminando miembro del grupo:", error);
        throw new ApiError(500, "Error al eliminar miembro del grupo. Inténtelo más tarde.");
      }
    }
  
    // Método para obtener todos los miembros de un grupo
    static async getGroupMembers(groupId) {
      if (!groupId) {
        throw new ApiError(400, "ID del grupo no especificado.");
      }
      try {
        const snapshot = await db.collection("GroupMember").where("groupId", "==", groupId).get();
        const members = snapshot.docs.map(doc => doc.data().memberId);
        return members; // Devuelve una lista de IDs de miembros
      } catch (error) {
        console.error("Error obteniendo miembros del grupo:", error);
        throw new ApiError(500, "Error al obtener miembros del grupo. Inténtelo más tarde.");
      }
    }

    // Método para obtener todos los grupos a los que pertenece un miembro
    static async getMemberGroups(memberId) {
      if (!memberId) {
        throw new ApiError(400, "ID del miembro no especificado.");
      }
      try {
        const snapshot = await db.collection("GroupMember").where("memberId", "==", memberId).get();
        const groupIds = snapshot.docs.map(doc => doc.data().groupId);
        
        // Obtener detalles de cada grupo
        const groups = [];
        for (const groupId of groupIds) {
          const group = await GroupModel.findById(groupId);
          groups.push(group);
        }
        
        return groups;
      } catch (error) {
        throw new ApiError(500, `Error al obtener grupos del miembro: ${error}, Inténtelo más tarde.`);
      }
    }
  }
  
  module.exports = GroupModel;  
