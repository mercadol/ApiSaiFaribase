// models/MemberModel.js
const { db } = require("../firebase");
const ApiError = require("../utils/ApiError");

/**
 * Modelo que representa un miembro.
 */
class MemberModel {
  /**
   * Crea una instancia de MemberModel.
   *
   * @param {object} data - Datos del miembro.
   */
  constructor(data) {
    this.id = data.id || null;
    this.Nombre = data.Nombre || data.name || "";
    this.Email = data.Email || "";
    this.EstadoCivil = data.EstadoCivil || "";
    this.TipoMiembro = data.TipoMiembro || "Visitante";
    this.Oficio = data.Oficio || "";
    this.FechaRegistro = data.FechaRegistro || new Date();
  }

  /**
   * Guarda el miembro en Firestore.
   *
   * @returns {Promise<void>}
   * @throws {ApiError} En caso de error al guardar el documento.
   */
  async save() {
    const memberData = {
      Nombre: this.Nombre,
      Email: this.Email,
      EstadoCivil: this.EstadoCivil,
      TipoMiembro: this.TipoMiembro,
      FechaRegistro: this.FechaRegistro,
      Oficio: this.Oficio,
    };

    try {
      if (this.id) {
        // Actualiza el documento existente
        await db.collection("Member").doc(this.id).update(memberData);
      } else {
        // Crea un nuevo documento
        const docRef = await db.collection("Member").add(memberData);
        this.id = docRef.id;
      }
    } catch (error) {
      throw new ApiError(
        500,
        `Error al guardar el miembro. Inténtelo más tarde: ${error.message}`
      );
    }
  }

  /**
   * Elimina el miembro de Firestore.
   *
   * @returns {Promise<void>}
   * @throws {ApiError} Si no se especifica el ID o si ocurre algún error en la eliminación.
   */
  async delete() {
    if (!this.id) {
      throw new ApiError(400, "ID del miembro no especificado.");
    }
    try {
      await db.collection("Member").doc(this.id).delete();
    } catch (error) {
      throw new ApiError(
        500,
        `Error al eliminar el miembro. Inténtelo más tarde: ${error.message}`
      );
    }
  }

  /**
   * Busca un miembro por su ID.
   *
   * @param {string} id - ID del miembro.
   * @returns {Promise<MemberModel>} Instancia de MemberModel con los datos del documento.
   * @throws {ApiError} Si el miembro no se encuentra o si ocurre un error.
   */
  static async findById(id) {
    try {
      const doc = await db.collection("Member").doc(id).get();
      if (!doc.exists) {
        throw new ApiError(404, "Miembro no encontrado.");
      }
      return new MemberModel({ id: doc.id, ...doc.data() });
    } catch (error) {
      if (error.message === "Miembro no encontrado.") throw error;
      throw new ApiError(
        500,
        `Error al buscar el miembro. Inténtelo más tarde: ${error.message}`
      );
    }
  }

  /**
   * Busca todos los miembros con paginación.
   *
   * @param {string|null} startAfterId - ID para paginación.
   * @param {number} pageSize - Número de documentos a retornar.
   * @returns {Promise<MemberModel[]>} Array de instancias de MemberModel.
   * @throws {ApiError} Si ocurre un error en la consulta.
   */
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
      return snapshot.docs.map(
        (doc) => new MemberModel({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      throw new ApiError(
        500,
        `Error al buscar miembros. Inténtelo más tarde: ${error.message}`
      );
    }
  }

  /**
   * Realiza una búsqueda de miembros por Nombre con paginación.
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
      throw new ApiError(
        500,
        `Error al buscar miembros. Inténtelo más tarde: ${error.message}`
      );
    }
  }

  /**
   * Busca miembros disponibles para asignación, excluyendo los ya asignados a una entidad específica.
   *
   * @param {string} searchString - Cadena de búsqueda para filtrar miembros.
   * @param {string} excludeFromEntity - Entidad de la cual excluir miembros ('grupo', 'curso', 'evento').
   * @param {string} entityId - ID de la entidad específica.
   * @param {string|null} startAfterId - ID para paginación.
   * @param {number} pageSize - Número de documentos a retornar.
   * @returns {Promise<Array>} Array de miembros disponibles.
   * @throws {ApiError} Si ocurre un error en la búsqueda.
   */
  static async searchAvailable(
    searchString,
    excludeFromEntity,
    entityId,
    startAfterId = null,
    pageSize = 10
  ) {
    try {
      // Obtener resultados de búsqueda básica
      const searchResults = await this.search(
        searchString,
        startAfterId,
        pageSize
      );
      const members = searchResults.results || [];

      // Si no hay parámetros de exclusión, retornar resultados directamente
      if (!excludeFromEntity || !entityId) {
        return members.map((member) => ({
          id: member.id,
          Nombre: member.Nombre,
          TipoMiembro: member.TipoMiembro,
          Email: member.Email,
        }));
      }

      // Obtener IDs de miembros ya asignados según la entidad
      let assignedMemberIds = [];
      switch (excludeFromEntity.toLowerCase()) {
        case "grupo":
          const GroupModel = require("./GroupModel");
          const groupMembers = await GroupModel.getGroupMembers(entityId);
          assignedMemberIds = groupMembers.map((member) => member.id);
          break;
        case "curso":
          const CourseModel = require("./CourseModel");
          try {
            const courseMembers = await CourseModel.getCourseMembers(entityId);
            assignedMemberIds = courseMembers.map((member) => member.id);
          } catch (error) {
            console.warn(
              "CourseModel.getCourseMembers no está implementado:",
              error.message
            );
          }
          break;
        case "evento":
          const EventModel = require("./EventModel");
          try {
            const eventMembers = await EventModel.getEventMembers(entityId);
            assignedMemberIds = eventMembers.map((member) => member.id);
          } catch (error) {
            console.warn(
              "EventModel.getEventMembers no está implementado:",
              error.message
            );
          }
          break;
        default:
          break;
      }

      // Filtrar los miembros ya asignados
      const availableMembers = members.filter(
        (member) => !assignedMemberIds.includes(member.id)
      );

      // Retornar solo los campos necesarios
      return availableMembers.map((member) => ({
        id: member.id,
        Nombre: member.Nombre,
        TipoMiembro: member.TipoMiembro,
        Email: member.Email,
      }));
    } catch (error) {
      throw new ApiError(
        500,
        `Error al buscar miembros disponibles. Inténtelo más tarde: ${error.message}`
      );
    }
  }
}

module.exports = MemberModel;
