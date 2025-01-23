'use strict';

const courseService = require('../services/courseService'); // Importar el servicio

var courseController = {
  test: (req, res) => {
    return res.status(200).send({
      message: "Soy la accion test de mi controlador",
    });
  },

  // Ruta para obtener cursos con paginación
  getCursos: async (req, res) => {
    try {

      const pageSize = 10; // Tamaño de la página (puedes hacerlo dinámico si lo necesitas)
      let startAfterDoc = null;

      // Si el cliente envía un "startAfter" (que es el ID del último curso de la página anterior)
      if (req.query.startAfter) {

        const startAfterId = req.query.startAfter;
        const startAfterSnapshot = await db.collection('Course').doc(startAfterId).get();
        if (!startAfterSnapshot.exists) {
          console.log("No se encontró el documento de inicio:", startAfterId);
        }
        startAfterDoc = startAfterSnapshot.exists ? startAfterSnapshot : null;
      }

      // Obtener la página de cursos correspondiente
      const { courses, lastDoc } = await courseService.getCursos(startAfterDoc, pageSize);
      console.log("Cursos obtenidos desde el servicio:", courses);  // Verifica los cursos obtenidos

      // Si hay un "lastDoc", significa que hay más cursos, por lo que el cliente puede solicitar la siguiente página.
      const nextStartAfter = lastDoc ? lastDoc.id : null;

      // Enviar los cursos y la información sobre la siguiente página
      res.json({
        courses,
        nextStartAfter
      });
    } catch (error) {
      console.error('Error al obtener cursos:', error);
      res.status(500).send(error.message); // Mostrar el mensaje de error
    }
  },
};
module.exports = courseController;
