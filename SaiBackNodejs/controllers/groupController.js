'use strict';

const groupService = require('../services/groupService');
const idGenerator = require('../utilities/idGenerator');
const validator = require('validator');

var groupController = {

  // Ruta para obtener grupos con paginación
  getGrupos: async (req, res) => {
    try {

      const pageSize = 10; // Tamaño de la página (puedes hacerlo dinámico si lo necesitas)
      let startAfterDoc = null;

      // Si el cliente envía un "startAfter" (que es el ID del último grupo de la página anterior)
      if (req.query.startAfter) {

        const startAfterId = req.query.startAfter;
        const startAfterSnapshot = await db.collection('Group').doc(startAfterId).get();
        startAfterDoc = startAfterSnapshot.exists ? startAfterSnapshot : null;
      }

      // Obtener la página de grupos correspondiente
      const { groups, lastDoc } = await groupService.getGrupos(startAfterDoc, pageSize);

      // Si hay un "lastDoc", significa que hay más grupos, por lo que el cliente puede solicitar la siguiente página.
      const nextStartAfter = lastDoc ? lastDoc.id : null;

      // Enviar los grupos y la información sobre la siguiente página
      res.json({
        groups,
        nextStartAfter
      });
    } catch (error) {
      console.error('Error al obtener grupos:', error);
      res.status(500).send(error.message); // Mostrar el mensaje de error
    }
  },
  
  // Ruta para crear un nuevo grupo
  createGrupo: async (req, res) => {
    try {
      const { Nombre, Descripcion, Nota } = req.body;
      const groupId = idGenerator.generateTimestampedId();

      // **Validaciones**
    // Validar Nombre
    if (!Nombre) {
      return res.status(400).json({ error: 'El nombre del grupo es obligatorio' });
    }
    if (!validator.isLength(Nombre, { min: 3, max: 50 })) {
      return res.status(400).json({ error: 'El nombre debe tener entre 3 y 50 caracteres' });
    }

    // Validar Descripcion (opcional)
    if (Descripcion && !validator.isLength(Descripcion, { max: 500 })) {
      return res.status(400).json({ error: 'La descripción no puede superar los 500 caracteres' });
    }

    // Validar Nota (opcional)
    if (Nota && !validator.isLength(Nota, { max: 1000 })) {
      return res.status(400).json({ error: 'La nota no puede superar los 1000 caracteres' });
    }

      // Crear el nuevo grupo
      const newGroup = await groupService.createGrupo({ groupId, Nombre, Descripcion, Nota });

      res.status(201).json(newGroup);
    } catch (error) {
      console.error('Error al crear el grupo:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Ruta para obtener un grupo por su ID
  getGrupoById: async (req, res) => {
    try {
      const { id } = req.params;
      const grupo = await groupService.getGrupoById(id);
      res.status(200).json(grupo);
    } catch (error) {
      console.error('Error al obtener el grupo:', error.message);
      res.status(500).json({ error: error.message });
    }
  },

  // Ruta para actualizar un grupo
  updateGrupo: async (req, res) => {
    try {
      const { id } = req.params;
      const updatedData = req.body;
      const updatedGrupo = await groupService.updateGrupo(id, updatedData);
      res.status(200).json(updatedGrupo);
    } catch (error) {
      console.error('Error al actualizar el grupo:', error.message);
      res.status(500).json({ error: error.message });
    }
  },

  // Ruta para eliminar un grupo
  deleteGrupo: async (req, res) => {
    try {
      const { id } = req.params;
      await groupService.deleteGrupo(id);
      res.status(200).json({ message: 'Grupo eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar el grupo:', error.message);
      res.status(500).json({ error: error.message });
    }
  }
};
module.exports = groupController;
