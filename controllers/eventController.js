// eventController.js
'use strict';

const BaseController = require('./BaseController');
const RelationController = require('./RelationController');
const eventService = require('../services/eventService');

/**
 * Controlador para gestionar la entidad Event.
 * Extiende de BaseController para operaciones CRUD y utiliza RelationController
 * para manejar las relaciones entre Event y otras entidades/membresías.
 */
class EventController extends BaseController {
  /**
   * Crea una instancia del EventController.
   */
  constructor() {
    super({
      service: eventService,
      entityName: 'Event',
      entityPlural: 'events'
    });

    this.relationController = new RelationController(eventService, 'Event');
  }

  /**
   * Valida los datos de creación de un evento.
   * @param {Object} data - Datos del evento a validar.
   * @returns {string|null} Mensaje de error si la validación falla, de lo
   * contrario null.
   */
  validateCreateData(data) {
    const { Nombre, Descripcion, Fecha } = data;
    if (!Nombre) return 'El Nombre del Evento es obligatorio';
    if (!this.validator.isLength(Nombre, { min: 3, max: 50 })) {
      return 'El Nombre debe tener entre 3 y 50 caracteres';
    }

    if (Descripcion && !this.validator.isLength(Descripcion, { max: 500 })) {
      return 'La descripción no puede superar los 500 caracteres';
    }

    return null;
  }

  /**
   * Prepara los datos de creación del evento.
   * Convierte valores null o undefined en cadenas vacías y aplica trim() a
   * valores de tipo cadena.
   *
   * @param {Object} data - Datos a preparar.
   * @returns {Object} Datos transformados.
   */
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

// Delegar métodos de relaciones usando la instancia de RelationController
eventController.addMember = eventController.relationController.addMember;
eventController.removeMember = eventController.relationController.removeMember;
eventController.getEventMembers = eventController.relationController.getEntityMembers;
eventController.getMemberEvents = eventController.relationController.getMemberEntities;

module.exports = eventController;

