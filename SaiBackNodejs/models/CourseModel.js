// models/CourseModel.js
"use strict";

const { db } = require("../firebase");
const ApiError = require('../utils/ApiError');

class CourseModel {
  constructor(data) {
    this.id = data.id || null;
    this.nombre = data.nombre || "";
    this.descripcion = data.descripcion || "";
    this.fechaCreacion = data.fechaCreacion || new Date();
  }

  // Método para guardar el curso en Firestore
  async save() {
    try {
      const courseData = {
        nombre: this.nombre,
        descripcion: this.descripcion,
        fechaCreacion: this.fechaCreacion,
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
      console.error("Error guardando el curso:", error);
      throw new ApiError(500, "Error al guardar el curso. Inténtelo más tarde.");
    }
  }

  // Método para eliminar el curso de Firestore
  async delete() {
    if (!this.id) {
      throw new ApiError(400, "ID del curso no especificado.");
    }
    try {
      await db.collection("Course").doc(this.id).delete();
    } catch (error) {
      console.error("Error eliminando el curso:", error);
      throw new ApiError(500, "Error al eliminar el curso. Inténtelo más tarde.");
    }
  }

  // Método estático para buscar cursos por ID
  static async findById(id) {
    try {
      const doc = await db.collection("Course").doc(id).get();
      if (!doc.exists) {
        throw new ApiError(404, "Curso no encontrado.");
      }
      return new CourseModel({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error("Error buscando el curso:", error);
      throw new ApiError(500, "Error al buscar el curso. Inténtelo más tarde.");
    }
  }

  // Método estático para buscar todos los cursos
  static async findAll(startAfterId = null, pageSize = 10) {
    try {
      let query = db.collection("Course").orderBy("nombre").limit(pageSize);
      if (startAfterId) {
        const startAfterDoc = await db.collection("Course").doc(startAfterId).get();
        if (startAfterDoc.exists) {
          query = query.startAfter(startAfterDoc);
        }
      }

      const snapshot = await query.get();
      const courses = snapshot.docs.map(doc => new CourseModel({ id: doc.id, ...doc.data() }));
      return courses;
    } catch (error) {
      console.error("Error buscando todos los cursos:", error);
      throw new ApiError(500, "Error al buscar cursos. Inténtelo más tarde.");
    }
  }

  // Método para agregar un miembro al curso
  async addMember(memberId) {
    if (!this.id) {
      throw new ApiError(400, "ID del curso no especificado.");
    }
    if (!memberId) {
      throw new ApiError(400, "ID del miembro no especificado.");
    }
    try {
      const relationId = `${this.id}_${memberId}`;
      await db.collection("CourseMember").doc(relationId).set({
        courseId: this.id,
        memberId: memberId,
      });
    } catch (error) {
        console.error("Error agregando miembro al curso:", error);
        throw new ApiError(500, "Error al agregar miembro al curso. Inténtelo más tarde.");
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
        console.error("Error eliminando miembro del curso:", error);
        throw new ApiError(500, "Error al eliminar miembro del curso. Inténtelo más tarde.");
      }
    }
  
    // Método para obtener todos los miembros de un curso
    static async getCourseMembers(courseId) {
      if (!courseId) {
        throw new ApiError(400, "ID del curso no especificado.");
      }
      try {
        const snapshot = await db.collection("CourseMember").where("courseId", "==", courseId).get();
        const members = snapshot.docs.map(doc => doc.data().memberId);
        return members; // Devuelve una lista de IDs de miembros
      } catch (error) {
        console.error("Error obteniendo miembros del curso:", error);
        throw new ApiError(500, "Error al obtener miembros del curso. Inténtelo más tarde.");
      }
    }
  }
  
  module.exports = CourseModel;
