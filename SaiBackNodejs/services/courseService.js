"use strict";

const db = require("../firebase").db; // Importar la conexión a Firestore

const courseService = {
  // Función para obtener todos los cursos
  getCursos: async (startAfterDoc = null, pageSize = 10) => {
    try {
      let query = db.collection("Course").orderBy("Nombre").limit(pageSize); // Ordenar por nombre y limitar el tamaño de la página

      if (startAfterDoc) {
        query = query.startAfter(startAfterDoc); // Si se proporciona un documento de inicio, utilizarlo para la paginación
      }

      const coursesSnapshot = await query.get();

      const courses = [];
      coursesSnapshot.forEach((doc) => {
        courses.push({ id: doc.id, ...doc.data() });
      });

      // Obtener el último documento de la página actual
      const lastDoc = coursesSnapshot.docs[coursesSnapshot.docs.length - 1];

      return { courses, lastDoc }; // Devolver los cursos y el último documento para la paginación
    } catch (error) {
      console.error("Error al obtener cursos:", error);
      throw new Error(
        "Ocurrió un error al intentar obtener la lista de cursos. Por favor, inténtalo más tarde."
      );
    }
  },

  getCurso: async (id) => {
    try {
      const doc = await db.collection("Course").doc(id).get(); // Obtener documento por ID

      if (!doc.exists) {
        throw new Error(`No se encontró ningún curso con el ID: ${id}`);
      }

      return { id: doc.id, ...doc.data() }; // Retornar datos del curso
    } catch (error) {
      console.error("Error al obtener curso:", error.message);
      throw new Error(
        "Error al obtener el curso. Por favor, inténtalo más tarde."
      );
    }
  },

  //Funcion para crear un nuevo Curso

  createCourse: async (courseData) => {
    try {
      // Validar que courseData tenga un id
      if (!courseData.id) {
        throw new Error("El ID del curso es obligatorio.");
      }

      // Verificar si el curso ya existe
      const doc = await db.collection("Course").doc(courseData.id).get();

      if (doc.exists) {
        throw new Error(`Ya existe un curso con el ID: ${courseData.id}`); // 🔹 Usar courseData.id
      }

      // Guardar el curso en Firestore
      await db.collection("Course").doc(courseData.id).set(courseData);
      return courseData.id; // Retornar el ID del curso creado
    } catch (error) {
      console.error("Error al crear curso:", error);
      // Si el error es específico (curso ya existe), relanzarlo
      if (error.message.includes("Ya existe un curso")) {
        throw error;
      }

      // Si es un error de Firestore
      if (error.message.includes("Firestore")) {
        throw new Error(
          "Error al guardar el curso. Por favor, inténtalo más tarde."
        );
      }

      // Para otros errores, relanzar el error original
      throw error;
    }
  },

  // Función para eliminar un Curso por ID
  deleteCourseById: async (courseId) => {
    try {
      // Eliminar el documento del curso por su ID
      await db.collection("courses").doc(courseId).delete();

      return true; // Indica que la eliminación fue exitosa
    } catch (error) {
      console.error("Error al eliminar el curso:", error);
      throw new Error(
        "Error al guardar Eliminar. Por favor, inténtalo más tarde."
      );
    }
  },

  updateCourseById: async (courseId, updatedData) => {
    try {
      // Actualizar el documento en Firestore
      const courseRef = db.collection("courses").doc(courseId);
      await courseRef.update(updatedData);

      // Obtener el curso actualizado (opcional)
      const updatedCourse = await courseRef.get();
      return updatedCourse.data();
    } catch (error) {
      console.error("Error al actualizar el curso:", error);
      throw error;
    }
  },

  //metodo search
  searchCourses: async (searchString, startAfterDoc = null, pageSize = 10) => {
    try {
      const coursesRef = db.collection("Course");
      let query = coursesRef;

      // Construir la consulta en función del término de búsqueda
      query = query
        .where("Name", ">=", searchString)
        .where("Name", "<=", searchString + "\uf8ff"); // Búsqueda parcial insensible a mayúsculas y minúsculas

      // Paginación
      if (startAfterDoc) {
        query = query.startAfter(startAfterDoc);
      }
      query = query.limit(pageSize);

      const querySnapshot = await query.get();
      const courses = [];
      querySnapshot.forEach((doc) => {
        courses.push({ id: doc.id, ...doc.data() });
      });

      const lastDoc = coursesSnapshot.docs[coursesSnapshot.docs.length - 1];
      return { courses, lastDoc };
    } catch (error) {
      console.error("Error al buscar cursos:", error);
      throw new Error(
        "Ocurrió un error al intentar buscar cursos. Por favor, inténtalo más tarde."
      );
    }
  },
};

module.exports = courseService;
