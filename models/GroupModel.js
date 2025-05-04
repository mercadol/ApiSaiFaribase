// models/GroupModel.js
const { db } = require("../firebase");
const ApiError = require("../utils/ApiError");
const MemberModel = require("./MemberModel");

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
    this.Descripcion = data.Descripcion || "";
    this.FechaCreacion = data.FechaCreacion || new Date();
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
      Descripcion: this.Descripcion,
      FechaCreacion: this.FechaCreacion,
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
        const startAfterDoc = await db
          .collection("Group")
          .doc(startAfterId)
          .get();
        if (startAfterDoc.exists) {
          query = query.startAfter(startAfterDoc);
        }
      }
      const snapshot = await query.get();
      return snapshot.docs.map(
        (doc) => new GroupModel({ id: doc.id, ...doc.data() })
      );
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
   * @param {string} role - Rol del miembro en el grupo.
   * @returns {Promise<void>}
   * @throws {ApiError} Si no se especifica el ID del grupo o del miembro, o si ocurre un error.
   */
  async addMember(memberId, role) {
    if (!this.id) {
      throw new ApiError(400, "ID del grupo no especificado.");
    }
    if (!memberId) {
      throw new ApiError(400, "ID del miembro no especificado.");
    }
    if (!role) {
      throw new ApiError(400, "Rol del miembro no especificado.");
    }
    try {
      const relationId = `${this.id}_${memberId}`;
      await db.collection("GroupMember").doc(relationId).set({
        groupId: this.id,
        memberId: memberId,
        role: role,
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
   * Obtiene todos los miembros que pertenecen a un grupo con datos enriquecidos.
   *
   * @param {string} groupId - ID del grupo.
   * @returns {Promise<Array<{id: string, Nombre: string, TipoMiembro: string, role: string}>>} Array de datos de miembros.
   * @throws {ApiError} Si no se especifica el ID del grupo o si ocurre un error en la consulta.
   */
  static async getGroupMembers(groupId) {
    if (!groupId) {
      throw new ApiError(400, "ID del grupo no especificado.");
    }
    try {
      const snapshot = await db
        .collection("GroupMember")
        .where("groupId", "==", groupId)
        .get();

      if (snapshot.empty) return []; // Si no hay miembros, retornar un array vacío

      const memberDataPromises = snapshot.docs.map(async (doc) => {
        const memberId = doc.data().memberId;
        const role = doc.data().role; // Obtener el rol del documento

        // Buscar el miembro en la colección de miembros
        const member = await MemberModel.findById(memberId).catch((err) => {
          console.warn(
            `Miembro con ID ${memberId} referenciado pero no encontrado.`,
            err
          );
          return null;
        });

        // Si el miembro fue encontrado, retornar sus datos junto con el TipoMiembro y el rol
        if (member) {
          return {
            id: member.id,
            Nombre: member.Nombre,
            TipoMiembro: member.TipoMiembro, // Usar el TipoMiembro del objeto member
            role: role, // Incluir el rol de la relación
          };
        }
        return null; // Si no se encuentra el miembro, retornar null
      });

      const membersData = await Promise.all(memberDataPromises);

      // Filtrar miembros no encontrados y retornar la lista
      return membersData.filter((member) => member !== null);
    } catch (error) {
      throw new ApiError(
        500,
        `Error al obtener miembros del grupo. Inténtelo más tarde: ${error.message}`
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
      const snapshot = await db
        .collection("GroupMember")
        .where("memberId", "==", memberId)
        .get();
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
