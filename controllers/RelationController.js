// controllers/RelationController.js
'use strict';

const ApiError = require("../utils/ApiError");

/**
 * Controlador para gestionar relaciones entre entidades y miembros.
 */
class RelationController {
  /**
   * Crea una instancia del controlador de relación.
   * @param {Object} service - Servicio que contiene la lógica de negocio.
   * @param {string} entityName - Nombre de la entidad (usado en mensajes).
   */
  constructor(service, entityName) {
    this.service = service;
    this.entityName = entityName;

    // Enlazar métodos para conservar el contexto 'this'
    this.addMember = this.addMember.bind(this);
    this.removeMember = this.removeMember.bind(this);
    this.getEntityMembers = this.getEntityMembers.bind(this);
    this.getMemberEntities = this.getMemberEntities.bind(this);
  }

  /**
   * Añade un miembro a la entidad.
   * @param {Object} req - Objeto de la solicitud Express.
   * @param {Object} res - Objeto de la respuesta Express.
   * @param {Function} next - Función para pasar al siguiente middleware de error.
   */
  async addMember(req, res, next) {
    try {
      const { entityId } = req.params;
      const { memberId, data = {} } = req.body;
      const result = await this.service.addMember(memberId, entityId, data);
      res.status(201).json({ message: `Member added to ${this.entityName} successfully`, result });
    } catch (error) {
      return next(new ApiError(500, error.message));
    }
  }

  /**
   * Elimina un miembro de la entidad.
   * @param {Object} req - Objeto de la solicitud Express.
   * @param {Object} res - Objeto de la respuesta Express.
   * @param {Function} next - Función para pasar al siguiente middleware de error.
   */
  async removeMember(req, res, next) {
    try {
      const { memberId, entityId } = req.params;
      await this.service.removeMember(memberId, entityId);
      res.status(200).json({ message: `Member removed from ${this.entityName} successfully` });
    } catch (error) {
      return next(new ApiError(500, error.message));
    }
  }

  /**
   * Recupera los miembros de una entidad.
   * @param {Object} req - Objeto de la solicitud Express.
   * @param {Object} res - Objeto de la respuesta Express.
   * @param {Function} next - Función para pasar al siguiente middleware de error.
   */
  async getEntityMembers(req, res, next) {
    try {
      const { entityId } = req.params;
      const members = await this.service.getEntityMembers(entityId);
      res.status(200).json(members);
    } catch (error) {
      return next(new ApiError(500, error.message));
    }
  }

  /**
   * Recupera las entidades a las que pertenece un miembro.
   * @param {Object} req - Objeto de la solicitud Express.
   * @param {Object} res - Objeto de la respuesta Express.
   * @param {Function} next - Función para pasar al siguiente middleware de error.
   */
  async getMemberEntities(req, res, next) {
    try {
      const { memberId } = req.params;
      const entities = await this.service.getMemberEntities(memberId);
      res.status(200).json(entities);
    } catch (error) {
      return next(new ApiError(500, error.message));
    }
  }
}

module.exports = RelationController;
