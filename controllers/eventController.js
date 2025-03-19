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
   * Solo valida la data y retorna un mensaje de error en caso de fallo.
   */
  validateCreateData(data) {
    if (!data.Nombre || typeof data.Nombre !== 'string' || data.Nombre === "") {
      return "El campo 'Nombre' es obligatorio y debe ser una cadena de texto.";
    }
    if (!data.descripcion || typeof data.descripcion !== 'string' || data.descripcion === "") {
      return "El campo 'descripcion' es obligatorio y debe ser una cadena de texto.";
    }
    if (!data.fecha || isNaN(Date.parse(data.fecha))) {
      return "El campo 'fecha' es obligatorio y debe ser una fecha válida.";
    }
    return null;
  }

  /**
   * Valida los datos de actualización de un evento.
   * Solo valida la data y retorna un mensaje de error en caso de fallo.
   */
  validateUpdateData(data) {
    if (data.Nombre !== undefined) {
      if (typeof data.Nombre !== 'string' || data.Nombre === "") {
        return "El campo 'Nombre' debe ser una cadena de texto no vacía.";
      }
    }
    if (data.descripcion !== undefined) {
      if (typeof data.descripcion !== 'string' || data.descripcion === "") {
        return "El campo 'descripcion' debe ser una cadena de texto no vacía.";
      }
    }
    if (data.fecha !== undefined) {
      if (data.fecha && isNaN(Date.parse(data.fecha))) {
        return "El campo 'fecha' debe ser una fecha válida.";
      }
    }
    if (Object.keys(data).length === 0) {
      return "No se proporcionaron datos válidos para actualizar.";
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
