'use strict';

const eventService = require('../services/eventService'); // Importar el servicio
const idGenerator = require('../utilities/idGenerator');
const validator = require('validator');

var eventController = {

  // Ruta para obtener eventos con paginación
  getEventos: async (req, res) => {
    try {

      const pageSize = 10; // Tamaño de la página (puedes hacerlo dinámico si lo necesitas)
      let startAfterDoc = null;

      // Si el cliente envía un "startAfter" (que es el ID del último evento de la página anterior)
      if (req.query.startAfter) {

        const startAfterId = req.query.startAfter;
        const startAfterSnapshot = await db.collection('Event').doc(startAfterId).get();
        if (!startAfterSnapshot.exists) {
          console.log("No se encontró el documento de inicio:", startAfterId);
        }
        startAfterDoc = startAfterSnapshot.exists ? startAfterSnapshot : null;
      }

      // Obtener la página de eventos correspondiente
      const { events, lastDoc } = await eventService.getEventos(startAfterDoc, pageSize);
      console.log("Eventos obtenidos desde el servicio:", events);  // Verifica los eventos obtenidos

      // Si hay un "lastDoc", significa que hay más eventos, por lo que el cliente puede solicitar la siguiente página.
      const nextStartAfter = lastDoc ? lastDoc.id : null;

      // Enviar los eventos y la información sobre la siguiente página
      res.json({
        events,
        nextStartAfter
      });
    } catch (error) {
      console.error('Error al obtener eventos:', error);
      res.status(500).send(error.message); // Mostrar el mensaje de error
    }
  },

  // Ruta para crear un nuevo evento
  createEvento: async (req, res) => {
    try {
      const { Nombre, Fecha, Descripcion } = req.body;
      const eventId = idGenerator.generateTimestampedId();

      // **Validaciones**
      // Validar Nombre
      if (!Nombre) {
        return res.status(400).json({ error: 'El nombre es obligatorio' });
      }
      if (!validator.isLength(Nombre, { min: 3, max: 50 })) {
        return res.status(400).json({ error: 'El nombre debe tener entre 3 y 50 caracteres' });
      }
  
      // Validar Descripcion (opcional)
      if (Descripcion && !validator.isLength(Descripcion, { max: 500 })) {
        return res.status(400).json({ error: 'La descripción no puede superar los 500 caracteres' });
      }
  
      // Crear el nuevo evento
      const newEvent = await eventService.createEvento({ eventId, Nombre, Fecha, Descripcion });

      res.status(201).json(newEvent);
    } catch (error) {
      console.error('Error al crear el evento:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Ruta para obtener un evento por su ID
  getEventoById: async (req, res) => {
    try {
      const { id } = req.params;
      const evento = await eventService.getEventoById(id);
      res.status(200).json(evento);
    } catch (error) {
      console.error('Error al obtener el evento:', error.message);
      res.status(500).json({ error: error.message });
    }
  },

  // Ruta para actualizar un evento
  updateEvento: async (req, res) => {
    try {
      const { id } = req.params;
      const updatedData = req.body;
      const updatedEvento = await eventService.updateEvento(id, updatedData);
      res.status(200).json(updatedEvento);
    } catch (error) {
      console.error('Error al actualizar el evento:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Ruta para eliminar un evento
  deleteEvento: async (req, res) => {
    try {
      const { id } = req.params;
      await eventService.deleteEvento(id);
      res.status(200).json({ message: 'Evento eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar el evento:', error);
      res.status(500).json({ error: error.message });
    }
  }
};
module.exports = eventController;
