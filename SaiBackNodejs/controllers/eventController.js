// eventController.js
'use strict';

const BaseController = require('./BaseController');
const eventService = require('../services/eventService'); 

class eventController extends BaseController {
  constructor() {
    super({
      service: eventService,
      entityName: 'Event',
      entityPlural: 'events'
    });
  }

  validateCreateData(data) {
    const { Nombre, Descripcion, Fecha } = data;
  
    if (!Nombre) return 'El nombre del Evento es obligatorio';
    if (!this.validator.isLength(Nombre, { min: 3, max: 50 })) {
      return 'El nombre debe tener entre 3 y 50 caracteres';
    }

    if (Descripcion && !this.validator.isLength(Descripcion, { max: 500 })) {
      return 'La descripción no puede superar los 500 caracteres';
    }
    //validacion de fhecha
    //return
    return null;
  }

  prepareCreateData(data) {

    for (let key in data) {
      if (data[key] === null || data[key] === undefined) {
      
        // Si es null o undefined, lo cambiamos por una cadena vacía
        data[key] = "";
      } else if (typeof data[key] === 'string') {
        // Si es una cadena, aplicamos trim()
        data[key] = data[key].trim();
      }
    }

    return data;
  }

  async addMember(req, res) {
    try {
      const {eventId} = req.params;

      const { memberId  } = req.body;
      const data = req.body.data || {};
      const result = await eventService.addMemberToEvent(memberId, eventId, data);
      res.status(201).json({ message: 'Member added successfully', result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async removeMember(req, res) {
    try {
      const { memberId, eventId } = req.params;
      await eventService.removeMemberFromEvent(memberId, eventId);
      res.status(200).json({ message: 'Member removed successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  async getEventMembers(req, res) {
    try {
      const { eventId } = req.params;
      const members = await eventService.getEventMembers(eventId);
      res.status(200).json(members);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  async getMemberEvents(req, res) {
    try {
      const { memberId } = req.params;
      const events = await eventService.getMemberEvents(memberId);
      res.status(200).json(events);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new eventController();
