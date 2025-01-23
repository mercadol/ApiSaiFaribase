'use strict';

const db = require('../firebase').db; // Importar la conexión a Firestore

const courseService = {
  // Función para obtener todos los cursos
  getCursos: async (startAfterDoc = null, pageSize = 10) => {
    try {
      let query = db.collection('Course').orderBy('Nombre').limit(pageSize); // Ordenar por nombre y limitar el tamaño de la página
      
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
      console.error('Error al obtener cursos:', error);
      throw new Error('Ocurrió un error al intentar obtener la lista de cursos. Por favor, inténtalo más tarde.');
    }
  },
  // Puedes agregar más funciones para otras operaciones con 'Course' aquí
};

module.exports = courseService;
