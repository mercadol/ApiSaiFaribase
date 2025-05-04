// models/CourseModel.js
const { db } = require("../firebase");
const ApiError = require("../utils/ApiError");
const MemberModel = require("./MemberModel");

class CourseModel {
  /**
   * @param {object} data - Datos del curso
   */
  constructor(data) {
    this.id = data.id || null;
    this.Nombre = data.Nombre || "";
    this.Descripcion = data.Descripcion || "";
    this.Duracion = data.Duracion || "";
    this.FechaInicio = data.FechaInicio || "";
    this.FechaCreacion = data.FechaCreacion || new Date();
    this.Nivel = data.Nivel || "";
    this.Estado = data.Estado || "";
  }

  /**
   * Método para guardar el curso en Firestore
   * @returns {Promise<string>} - ID del curso creado
   */
  async save() {
    try {
      const courseData = {
        Nombre: this.Nombre,
        Descripcion: this.Descripcion,
        Duracion: this.Duracion,
        FechaInicio: this.FechaInicio || null,
        FechaCreacion: this.FechaCreacion,
        Nivel: this.Nivel,
        Estado: this.Estado,
      };

      if (this.id) {
        // Si ya existe un ID, actualiza el documento
        await db.collection("Course").doc(this.id).update(courseData);
      } else {
        // Si no existe, crea un nuevo documento
        const docRef = await db.collection("Course").add(courseData);
        this.id = docRef.id; // Asigna el ID generado
      }
    } catch (error) {
      throw new ApiError(
        500,
        `Error al guardar el curso Inténtelo más tarde: ${error.message}`
      );
    }
  }

  /**
   * Método para eliminar el curso de Firestore
   * @param {string} id - ID del curso
   * @returns {Promise<boolean>} - Confirmación de eliminación
   */
  async delete() {
    if (!this.id) {
      throw new ApiError(400, "ID del curso no especificado.");
    }
    try {
      await db.collection("Course").doc(this.id).delete();
    } catch (error) {
      throw new ApiError(
        500,
        `Error al eliminar el curso Inténtelo más tarde: ${error.message}`
      );
    }
  }

  /**
   * Método estático para buscar cursos por ID
   * @param {string} id - ID del documento
   * @returns {Promise<object>} - Documento encontrado
   */
  static async findById(id) {
    try {
      const doc = await db.collection("Course").doc(id).get();
      if (!doc.exists) {
        throw new ApiError(404, "Curso no encontrado.");
      }
      return new CourseModel({ id: doc.id, ...doc.data() });
    } catch (error) {
      // Reenviar errores ApiError sin modificarlos
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        500,
        `Error al buscar el curso Inténtelo más tarde: ${error.message}`
      );
    }
  }

  /**
   * Método estático para buscar todos los cursos
   * @param {number} pageSize - Tamaño de la página (por defecto 10)
   * @param {string} startAfterId - ID del documento para paginación
   * @returns {Promise<Array>} - Lista de documentos
   */
  static async findAll(startAfterId = null, pageSize = 10) {
    try {
      let query = db.collection("Course").orderBy("Nombre").limit(pageSize);
      if (startAfterId) {
        const startAfterDoc = await db
          .collection("Course")
          .doc(startAfterId)
          .get();
        if (startAfterDoc.exists) {
          query = query.startAfter(startAfterDoc);
        }
      }
      const snapshot = await query.get();
      const courses = snapshot.docs.map(
        (doc) => new CourseModel({ id: doc.id, ...doc.data() })
      );
      return courses;
    } catch (error) {
      throw new ApiError(
        500,
        `Error al buscar cursos. Inténtelo más tarde: ${error.message}`
      );
    }
  }

  // Método estático para buscar documento por Nombre
  static async search(searchString, startAfterId = null, pageSize = 10) {
    try {
      let query = db
        .collection("Course")
        .where("Nombre", ">=", searchString)
        .where("Nombre", "<=", searchString + "\uf8ff")
        .orderBy("Nombre")
        .limit(pageSize);

      if (startAfterId) {
        const startAfterDoc = await db
          .collection("Course")
          .doc(startAfterId)
          .get();
        if (startAfterDoc.exists) {
          query = query.startAfter(startAfterDoc);
        }
      }

      const snapshot = await query.get();
      return {
        results: snapshot.docs.map(
          (doc) => new CourseModel({ id: doc.id, ...doc.data() })
        ),
        lastDoc: snapshot.docs[snapshot.docs.length - 1],
      };
    } catch (error) {
      throw new ApiError(
        500,
        `Error al buscar cursos Inténtelo más tarde: ${error.message}`
      );
    }
  }

  // Método para agregar un miembro al curso
  async addMember(memberId, role) {
    if (!this.id) {
      throw new ApiError(400, "ID del curso no especificado.");
    }
    if (!memberId) {
      throw new ApiError(400, "ID del miembro no especificado.");
    }
    if (!role) {
      // Validar que se haya proporcionado un rol
      throw new ApiError(400, "Rol del miembro no especificado.");
    }
    try {
      const relationId = `${this.id}_${memberId}`;
      await db.collection("CourseMember").doc(relationId).set({
        courseId: this.id,
        memberId: memberId,
        role: role, // Guardar el rol del miembro
      });
    } catch (error) {
      throw new ApiError(
        500,
        `Error al agregar miembro al curso. Inténtelo más tarde: ${error.message}`
      );
    }
  }

  // Método para eliminar un miembro del curso
  async removeMember(memberId) {
    if (!this.id) {
      throw new ApiError(400, "ID del curso no especificado.");
    }
    if (!memberId) {
      throw new ApiError(400, "ID del miembro no especificado.");
    }
    try {
      const relationId = `${this.id}_${memberId}`;
      await db.collection("CourseMember").doc(relationId).delete();
    } catch (error) {
      throw new ApiError(
        500,
        `Error al eliminar miembro del curso. Inténtelo más tarde: ${error.message}`
      );
    }
  }

  // Método para obtener todos los miembros de un curso
  static async getCourseMembers(courseId) {
    if (!courseId) {
      throw new ApiError(400, "ID del curso no especificado.");
    }
    try {
      const snapshot = await db
        .collection("CourseMember")
        .where("courseId", "==", courseId)
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

        if (member) {
          return {
          id: member.id,
          Nombre: member.Nombre,
          TipoMiembro: member.TipoMiembro,
            role: role,
          };
        }
        return null;
      });

      const membersData = await Promise.all(memberDataPromises);

      // Filtrar miembros no encontrados y retornar la lista
      return membersData.filter((member) => member !== null);
    } catch (error) {
      throw new ApiError(
        500,
        `Error al obtener miembros del curso. Inténtelo más tarde: ${error.message}`
      );
    }
  }

  static async getMemberCourses(memberId) {
    if (!memberId) {
      throw new ApiError(400, "ID del miembro no especificado.");
    }
    try {
      const snapshot = await db
        .collection("CourseMember")
        .where("memberId", "==", memberId)
        .get();
      const courseIds = snapshot.docs.map((doc) => doc.data().courseId);

      // Obtener detalles de cada curso
      const courses = [];
      for (const courseId of courseIds) {
        const course = await CourseModel.findById(courseId);
        courses.push(course);
      }

      return courses;
    } catch (error) {
      throw new ApiError(
        500,
        `Error al obtener cursos del miembro: ${error}, Inténtelo más tarde.`
      );
    }
  }
}

module.exports = CourseModel;
