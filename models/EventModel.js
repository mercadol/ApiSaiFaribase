// models/EventModel.js
const { db } = require("../firebase");
const ApiError = require('../utils/ApiError');

/**
 * Modelo que representa un evento.
 */
class EventModel {
  /**
   * Crea una instancia de EventModel.
   *
   * @param {object} data - Datos del evento
   */
  constructor(data) {
    this.id = data.id || null;
    this.Nombre = data.Nombre || "";
    this.descripcion = data.descripcion || "";
    this.fecha = data.fecha || new Date();
  }

  /**
   * Método para guardar el evento en Firestore
   * @returns {Promise<string>} 
   * @throws {ApiError} En caso de error al guardar el evento.
   */
  async save() {
    try {
      const eventData = {
        Nombre: this.Nombre,
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
   * Método para eliminar el evento de Firestore.
   *
   * @returns {Promise<boolean>}
   * @throws {ApiError} Si el ID no está especificado o si ocurre un error en la eliminación.
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
   * @param {string} id - ID del documento.
   *
   * @returns {Promise<boolean>}
   * @throws {ApiError} Si el ID no está especificado o si ocurre un error en la eliminación.
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
   * Obtiene todos los eventos con paginación.
   *
   * @param {string|null} startAfterId - ID para paginación.
   * @param {number} pageSize - Número de documentos a retornar.
   * @returns {Promise<EventModel[]>} Array de instancias de EventModel.
   * @throws {ApiError} Si ocurre un error en la consulta.
   */
  static async findAll(startAfterId = null, pageSize = 10) {
    try {
      let query = db.collection("Event").orderBy("Nombre").limit(pageSize);
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

  /**
   * Realiza una búsqueda de eventos por Nombre con paginación.
   *
   * @param {string} searchString - Cadena de búsqueda.
   * @param {string|null} startAfterId - ID para paginación.
   * @param {number} pageSize - Número de documentos a retornar.
   * @returns {Promise<Object>} Objeto con los resultados y el último documento.
   * @throws {ApiError} Si ocurre un error en la búsqueda.
   */
  static async search(searchString, startAfterId = null, pageSize = 10) {
    try {
      let query = db
        .collection("Event")
        .where("Nombre", ">=", searchString)
        .where("Nombre", "<=", searchString + "\uf8ff")
        .orderBy("Nombre")
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

  /**
   * Agrega un miembro al evento.
   *
   * @param {string} memberId - ID del miembro a agregar.
   * @returns {Promise<void>}
   * @throws {ApiError} Si no se especifica el ID del evento o del miembro, o si ocurre un error.
   */
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
        throw new ApiError(500, "Error al agregar miembro al evento. Inténtelo más tarde.");
      }
    }

  /**
   * Elimina un miembro del evento.
   *
   * @param {string} memberId - ID del miembro a eliminar.
   * @returns {Promise<void>}
   * @throws {ApiError} Si no se especifica el ID del evento o del miembro, o si ocurre un error.
   */
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
        throw new ApiError(500, "Error al eliminar miembro del evento. Inténtelo más tarde.");
      }
    }
  
  /**
   * Obtiene todos los IDs de miembros que pertenecen a un evento.
   *
   * @param {string} eventId - ID del evento.
   * @returns {Promise<string[]>} Array de IDs de miembros.
   * @throws {ApiError} Si no se especifica el ID del evento o si ocurre un error en la consulta.
   */
    static async getEventMembers(eventId) {
      if (!eventId) {
        throw new ApiError(400, "ID del evento no especificado.");
      }
      try {
        const snapshot = await db.collection("EventMember").where("eventId", "==", eventId).get();
        const members = snapshot.docs.map(doc => doc.data().memberId);
        return members; // Devuelve una lista de IDs de miembros
      } catch (error) {
        throw new ApiError(500, "Error al obtener miembros del evento. Inténtelo más tarde.");
      }
    }

  /**
   * Obtiene todos los eventos a los que pertenece un miembro.
   *
   * @param {string} memberId - ID del miembro.
   * @returns {Promise<EventModel[]>} Array de instancias de EventModel.
   * @throws {ApiError} Si no se especifica el ID del miembro o si ocurre un error en la consulta.
   */
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
