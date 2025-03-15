// models/EventModel.js
"use strict";

const { db } = require("../firebase");
const ApiError = require('../utils/ApiError');

class EventModel {
  /**
   * @param {object} data - Datos del evento
   */
  constructor(data) {
    this.id = data.id || null;
    this.nombre = data.nombre || "";
    this.descripcion = data.descripcion || "";
    this.fecha = data.fecha || new Date();
  }

  /**
   * Método para guardar el evento en Firestore
   * @returns {Promise<string>} - ID del evento creado
   */
  async save() {
    try {
      const eventData = {
        nombre: this.nombre,
        descripcion: this.descripcion,
        fecha: this.fecha,
      };

      if (this.id) {
        // Si ya existe un ID, actualiza el documento
        await db.collection("Event").doc(this.id).update(eventData);
      } else {
        // Si no existe, crea un nuevo documento
        const docRef = await db.collection("Event").add(eventData);
        this.id = docRef.id; // Asigna el ID generado
      }
    } catch (error) {
      throw new ApiError(500, `Error al guardar el evento Inténtelo más tarde: ${error.message}`);
    }
  }

  /**
   * Método para eliminar el evento de Firestore
   * @param {string} id - ID del evento
   * @returns {Promise<boolean>} - Confirmación de eliminación
   */
  async delete() {
    if (!this.id) {
      throw new ApiError(400, "ID del evento no especificado.");
    }
    try {
      await db.collection("Event").doc(this.id).delete();
    } catch (error) {
      throw new ApiError(500, `Error al eliminar el evento Inténtelo más tarde: ${error.message}`);
    }
  }

  /**
   * Método estático para buscar evento por ID
   * @param {string} id - ID del documento
   * @returns {Promise<object>} - Documento encontrado
   */
  static async findById(id) {
    try {
      const doc = await db.collection("Event").doc(id).get();
      if (!doc.exists) {
        throw new ApiError(404, "Evento no encontrado.");
      }
      return new EventModel({ id: doc.id, ...doc.data() });
    } catch (error) {
      // Reenviar errores ApiError sin modificarlos
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, `Error al buscar el evento Inténtelo más tarde: ${error.message}`);
    }
  }

  /**
   * Método estático para buscar todos los eventos
   * @param {number} pageSize - Tamaño de la página (por defecto 10)
   * @param {string} startAfterId - ID del documento para paginación
   * @returns {Promise<Array>} - Lista de documentos
   */
  static async findAll(startAfterId = null, pageSize = 10) {
    try {
      let query = db.collection("Event").orderBy("nombre").limit(pageSize);
      if (startAfterId) {
        const startAfterDoc = await db.collection("Event").doc(startAfterId).get();
        if (startAfterDoc.exists) {
          query = query.startAfter(startAfterDoc);
        }
      }

      const snapshot = await query.get();
      const events = snapshot.docs.map(doc => new EventModel({ id: doc.id, ...doc.data() }));
      return events;
    } catch (error) {
      throw new ApiError(500, `Error al buscar eventos Inténtelo más tarde: ${error.message}`);
    }
  }

  // Método estático para buscar documento por nombre
  static async search(searchString, startAfterId = null, pageSize = 10) {
    try {
      let query = db
        .collection("Event")
        .where("nombre", ">=", searchString)
        .where("nombre", "<=", searchString + "\uf8ff")
        .orderBy("nombre")
        .limit(pageSize);

      if (startAfterId) {
        const startAfterDoc = await db
          .collection("Event")
          .doc(startAfterId)
          .get();
        if (startAfterDoc.exists) {
          query = query.startAfter(startAfterDoc);
        }
      }

      const snapshot = await query.get();
      return {
        results: snapshot.docs.map(
          (doc) => new EventModel({ id: doc.id, ...doc.data() })
        ),
        lastDoc: snapshot.docs[snapshot.docs.length - 1],
      };
    } catch (error) {
      throw new ApiError(500, `Error al buscar eventos Inténtelo más tarde: ${error.message}`);
    }
  }

  // Método para agregar un miembro al evento
  async addMember(memberId) {
    if (!this.id) {
      throw new ApiError(400, "ID del evento no especificado.");
    }
    if (!memberId) {
      throw new ApiError(400, "ID del miembro no especificado.");
    }
    try {
      const relationId = `${this.id}_${memberId}`;
      await db.collection("EventMember").doc(relationId).set({
        eventId: this.id,
        memberId: memberId,
      });
    } catch (error) {
        console.error("Error agregando miembro al evento:", error);
        throw new ApiError(500, "Error al agregar miembro al evento. Inténtelo más tarde.");
      }
    }
  
    // Método para eliminar un miembro del evento
    async removeMember(memberId) {
      if (!this.id) {
        throw new ApiError(400, "ID del evento no especificado.");
      }
      if (!memberId) {
        throw new ApiError(400, "ID del miembro no especificado.");
      }
      try {
        const relationId = `${this.id}_${memberId}`;
        await db.collection("EventMember").doc(relationId).delete();
      } catch (error) {
        console.error("Error eliminando miembro del evento:", error);
        throw new ApiError(500, "Error al eliminar miembro del evento. Inténtelo más tarde.");
      }
    }
  
    // Método para obtener todos los miembros de un evento
    static async getEventMembers(eventId) {
      if (!eventId) {
        throw new ApiError(400, "ID del evento no especificado.");
      }
      try {
        const snapshot = await db.collection("EventMember").where("eventId", "==", eventId).get();
        const members = snapshot.docs.map(doc => doc.data().memberId);
        return members; // Devuelve una lista de IDs de miembros
      } catch (error) {
        console.error("Error obteniendo miembros del evento:", error);
        throw new ApiError(500, "Error al obtener miembros del evento. Inténtelo más tarde.");
      }
    }

    static async getMemberEvents (memberId) {
      if (!memberId) {
        throw new ApiError(400, "ID del miembro no especificado.");
      }
      try {
        const snapshot = await db.collection("EventMember").where("memberId", "==", memberId).get();
        const eventIds = snapshot.docs.map(doc => doc.data().eventId);
        
        // Obtener detalles de cada evento
        const events = [];
        for (const eventId of eventIds) {
          const event = await EventModel.findById(eventId);
          events.push(event);
        }
        
        return events;
      } catch (error) {
        throw new ApiError(500, `Error al obtener eventos del miembro: ${error}, Inténtelo más tarde.`);
      }
    }
  }
  
  module.exports = EventModel;  
