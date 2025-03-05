// models/EventModel.js
"use strict";

const { db } = require("../firebase");
const ApiError = require('../utils/ApiError');

class EventModel {
  constructor(data) {
    this.id = data.id || null;
    this.nombre = data.nombre || "";
    this.descripcion = data.descripcion || "";
    this.fecha = data.fecha || new Date();
  }

  // Método para guardar el evento en Firestore
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
      console.error("Error guardando el evento:", error);
      throw new ApiError(500, "Error al guardar el evento. Inténtelo más tarde.");
    }
  }

  // Método para eliminar el evento de Firestore
  async delete() {
    if (!this.id) {
      throw new ApiError(400, "ID del evento no especificado.");
    }
    try {
      await db.collection("Event").doc(this.id).delete();
    } catch (error) {
      console.error("Error eliminando el evento:", error);
      throw new ApiError(500, "Error al eliminar el evento. Inténtelo más tarde.");
    }
  }

  // Método estático para buscar eventos por ID
  static async findById(id) {
    try {
      const doc = await db.collection("Event").doc(id).get();
      if (!doc.exists) {
        throw new ApiError(404, "Evento no encontrado.");
      }
      return new EventModel({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error("Error buscando el evento:", error);
      throw new ApiError(500, "Error al buscar el evento. Inténtelo más tarde.");
    }
  }

  // Método estático para buscar todos los eventos
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
      console.error("Error buscando todos los eventos:", error);
      throw new ApiError(500, "Error al buscar eventos. Inténtelo más tarde.");
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
  }
  
  module.exports = EventModel;  
