// controllers/eventController.js

const BaseController = require('./BaseController');
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

    // Enlazar métodos de relaciones
    this.addMember = this.addMember.bind(this);
    this.removeMember = this.removeMember.bind(this);
    this.getEventMembers = this.getEventMembers.bind(this);
    this.getMemberEvents = this.getMemberEvents.bind(this);
  }

  /**
   * Valida los datos de creación de un evento.
   * @param {Object} data - Datos del evento a validar.
   * @returns {string|null} Mensaje de error si la validación falla, de lo
   * contrario null.
   */
  validateCreateData(data) {
    const { Nombre, Descripcion } = data;
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

  async addMember(req, res, next) {
    try {
      const { eventId } = req.params;
      const { memberId } = req.body;
      const result = await this.service.addMember(memberId, eventId);
      res
        .status(201)
        .json({ message: "Member added to Event successfully", result });
    } catch (error) {
      next(new ApiError(500, error.message));
    }
  }

  async removeMember(req, res, next) {
    try {
      const { memberId, eventId } = req.params;
      await this.service.removeMember(memberId, eventId);
      res
        .status(200)
        .json({ message: "Member removed from Event successfully" });
    } catch (error) {
      next(new ApiError(500, error.message));
    }
  }

  async getEventMembers(req, res, next) {
    try {
      const { eventId } = req.params;
      const members = await this.service.getEventMembers(eventId);
      res.status(200).json(members);
    } catch (error) {
      next(new ApiError(500, error.message));
    }
  }

  async getMemberEvents(req, res, next) {
    try {
      const { memberId } = req.params;
      const events = await this.service.getMemberEvents(memberId);
      res.status(200).json(events);
    } catch (error) {
      next(new ApiError(500, error.message));
    }
  }
}

const eventController = new EventController();
module.exports = eventController;
