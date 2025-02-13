// eventController.js
'use strict';

const BaseController = require('./BaseController');
const RelationController = require('./RelationController');
const eventService = require('../services/eventService');

class EventController extends BaseController {
  constructor() {
    super({
      service: eventService,
      entityName: 'Event',
      entityPlural: 'events'
    });

    this.relationController = new RelationController(eventService, 'Event');
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

    return null;
  }

  prepareCreateData(data) {
    for (let key in data) {
      if (data[key] === null || data[key] === undefined) {
        data[key] = "";
      } else if (typeof data[key] === 'string') {
        data[key] = data[key].trim();
      }
    }
    return data;
  }
}

const eventController = new EventController();

// Delegar métodos de relaciones
eventController.addMember = eventController.relationController.addMember;
eventController.removeMember = eventController.relationController.removeMember;
eventController.getEventMembers = eventController.relationController.getEntityMembers;
eventController.getMemberEvents = eventController.relationController.getMemberEntities;

module.exports = eventController;

