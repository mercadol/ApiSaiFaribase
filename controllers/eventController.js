// controllers/eventController.js
const BaseController = require("./BaseController");
const eventService = require("../services/eventService");
const ApiError = require("../utils/ApiError");

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
      entityName: "Event",
      entityPlural: "events",
    });

    this.addMember = this.addMember.bind(this);
    this.removeMember = this.removeMember.bind(this);
    this.getEventMembers = this.getEventMembers.bind(this);
    this.getMemberEvents = this.getMemberEvents.bind(this);
  }

  async addMember(req, res, next) {
    const { eventId } = req.params;
    const { memberId } = req.body;
    const result = await this.service.addMember(memberId, eventId);
    res
      .status(201)
      .json({ message: "Member agregado al curso correctamente", result });
  }

  async removeMember(req, res, next) {
    const { memberId, eventId } = req.params;
    await this.service.removeMember(memberId, eventId);
    res.status(204);
  }

  async getEventMembers(req, res, next) {
    const { eventId } = req.params;
    const members = await this.service.getEventMembers(eventId);
    res.status(200).json(members);
  }

  async getMemberEvents(req, res, next) {
    const { memberId } = req.params;
    const events = await this.service.getMemberEvents(memberId);
    res.status(200).json(events);
  }
}

const eventController = new EventController();
module.exports = eventController;
