'use strict';

const courseService = require('../services/courseService'); // Importar el servicio
const validator = require('validator');

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

  // Ruta para crear un nuevo curso
  createCurso: async (req, res) => {
    try {
      const { Nombre, Maestro, Descripcion, FechaInicio, FechaFin } = req.body;

      // Validaciones (puedes agregar más según tus necesidades)
      if (!Nombre) {
        return res.status(400).json({ error: 'El nombre del curso es obligatorio' });
      }

      // Crear el nuevo curso
      const newCourse = await courseService.createCurso({ Nombre, Maestro, Descripcion, FechaInicio, FechaFin });

      res.status(201).json(newCourse);
    } catch (error) {
      console.error('Error al crear el curso:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Ruta para obtener un curso por su ID
  getCursoById: async (req, res) => {
    try {
      const { id } = req.params;
      const curso = await courseService.getCursoById(id);
      res.status(200).json(curso);
    } catch (error) {
      console.error('Error al obtener el curso:', error.message);
      res.status(500).json({ error: error.message });
    }
  },

  // Ruta para actualizar un curso
  updateCurso: async (req, res) => {
    try {
      const { id } = req.params;
      const updatedData = req.body;
      const updatedCurso = await courseService.updateCurso(id, updatedData);
      res.status(200).json(updatedCurso);
    } catch (error) {
      console.error('Error al actualizar el curso:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Ruta para eliminar un curso
  deleteCurso: async (req, res) => {
    try {
      const { id } = req.params;
      await courseService.deleteCurso(id);
      res.status(200).json({ message: 'Curso eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar el curso:', error);
      res.status(500).json({ error: error.message });
    }
  }
};
module.exports = courseController;
