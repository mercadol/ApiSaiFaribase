// models/GroupModel.js
const { db } = require("../firebase");
const ApiError = require("../utils/ApiError");

/**
 * Modelo que representa un grupo.
 */
class GroupModel {
  /**
   * Crea una instancia de GroupModel.
   *
   * @param {object} data - Datos del grupo.
   */
  constructor(data) {
    this.id = data.id || null;
    this.Nombre = data.Nombre || "";
    this.descripcion = data.descripcion || "";
    this.fechaCreacion = data.fechaCreacion || new Date();
  }

  /**
   * Guarda el grupo en Firestore.
   *
   * @returns {Promise<void>}
   * @throws {ApiError} En caso de error al guardar el grupo.
   */
  async save() {
    const groupData = {
      Nombre: this.Nombre,
      descripcion: this.descripcion,
      fechaCreacion: this.fechaCreacion,
    };

    try {
      if (this.id) {
        // Actualiza el documento existente
        await db.collection("Group").doc(this.id).update(groupData);
      } else {
        // Crea un nuevo documento
        const docRef = await db.collection("Group").add(groupData);
        this.id = docRef.id;
      }
    } catch (error) {
      throw new ApiError(
        500,
        `Error al guardar el grupo. Inténtelo más tarde: ${error.message}`
      );
    }
  }

  /**
   * Elimina el grupo de Firestore.
   *
   * @returns {Promise<boolean>}
   * @throws {ApiError} Si el ID no está especificado o si ocurre un error en la eliminación.
   */
  async delete() {
    if (!this.id) {
      throw new ApiError(400, "ID del grupo no especificado.");
    }
    try {
      await db.collection("Group").doc(this.id).delete();
      return true;
    } catch (error) {
      throw new ApiError(
        500,
        `Error al eliminar el grupo. Inténtelo más tarde: ${error.message}`
      );
    }
  }

  /**
   * Busca un grupo por su ID.
   *
   * @param {string} id - ID del grupo.
   *
   * @returns {Promise<boolean>}
   * @throws {ApiError} Si el ID no está especificado o si ocurre un error en la eliminación.
   */
  static async findById(id) {
    try {
      const doc = await db.collection("Group").doc(id).get();
      if (!doc.exists) {
        throw new ApiError(404, "Grupo no encontrado.");
      }
      return new GroupModel({ id: doc.id, ...doc.data() });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        500,
        `Error al buscar el grupo. Inténtelo más tarde: ${error.message}`
      );
    }
  }

  /**
   * Obtiene todos los grupos con paginación.
   *
   * @param {string|null} startAfterId - ID para paginación.
   * @param {number} pageSize - Número de documentos a retornar.
   * @returns {Promise<GroupModel[]>} Array de instancias de GroupModel.
   * @throws {ApiError} Si ocurre un error en la consulta.
   */
  static async findAll(startAfterId = null, pageSize = 10) {
    try {
      let query = db.collection("Group").orderBy("Nombre").limit(pageSize);
      if (startAfterId) {
        const startAfterDoc = await db.collection("Group").doc(startAfterId).get();
        if (startAfterDoc.exists) {
          query = query.startAfter(startAfterDoc);
        }
      }
      const snapshot = await query.get();
      return snapshot.docs.map((doc) => new GroupModel({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new ApiError(
        500,
        `Error al buscar grupos. Inténtelo más tarde: ${error.message}`
      );
    }
  }

  /**
   * Realiza una búsqueda de grupos por Nombre con paginación.
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
        .collection("Group")
        .where("Nombre", ">=", searchString)
        .where("Nombre", "<=", searchString + "\uf8ff")
        .orderBy("Nombre")
        .limit(pageSize);

      if (startAfterId) {
        const startAfterDoc = await db.collection("Group").doc(startAfterId).get();
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
      throw new ApiError(
        500,
        `Error al buscar grupos. Inténtelo más tarde: ${error.message}`
      );
    }
  }

  /**
   * Agrega un miembro al grupo.
   *
   * @param {string} memberId - ID del miembro a agregar.
   * @returns {Promise<void>}
   * @throws {ApiError} Si no se especifica el ID del grupo o del miembro, o si ocurre un error.
   */
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
      throw new ApiError(
        500,
        "Error al agregar miembro al grupo. Inténtelo más tarde."
      );
    }
  }

  /**
   * Elimina un miembro del grupo.
   *
   * @param {string} memberId - ID del miembro a eliminar.
   * @returns {Promise<void>}
   * @throws {ApiError} Si no se especifica el ID del grupo o del miembro, o si ocurre un error.
   */
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
      throw new ApiError(
        500,
        "Error al eliminar miembro del grupo. Inténtelo más tarde."
      );
    }
  }

  /**
   * Obtiene todos los IDs de miembros que pertenecen a un grupo.
   *
   * @param {string} groupId - ID del grupo.
   * @returns {Promise<string[]>} Array de IDs de miembros.
   * @throws {ApiError} Si no se especifica el ID del grupo o si ocurre un error en la consulta.
   */
  static async getGroupMembers(groupId) {
    if (!groupId) {
      throw new ApiError(400, "ID del grupo no especificado.");
    }
    try {
      const snapshot = await db.collection("GroupMember").where("groupId", "==", groupId).get();
      return snapshot.docs.map((doc) => doc.data().memberId);
    } catch (error) {
      throw new ApiError(
        500,
        "Error al obtener miembros del grupo. Inténtelo más tarde."
      );
    }
  }

  /**
   * Obtiene todos los grupos a los que pertenece un miembro.
   *
   * @param {string} memberId - ID del miembro.
   * @returns {Promise<GroupModel[]>} Array de instancias de GroupModel.
   * @throws {ApiError} Si no se especifica el ID del miembro o si ocurre un error en la consulta.
   */
  static async getMemberGroups(memberId) {
    if (!memberId) {
      throw new ApiError(400, "ID del miembro no especificado.");
    }
    try {
      const snapshot = await db.collection("GroupMember").where("memberId", "==", memberId).get();
      const groupIds = snapshot.docs.map((doc) => doc.data().groupId);

      // Obtener detalles de cada grupo
      const groups = [];
      for (const groupId of groupIds) {
        const group = await GroupModel.findById(groupId);
        groups.push(group);
      }
      return groups;
    } catch (error) {
      throw new ApiError(
        500,
        `Error al obtener grupos del miembro. Inténtelo más tarde: ${error.message}`
      );
    }
  }
}

module.exports = GroupModel;
