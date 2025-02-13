'use strict';

const ApiError = require("../utils/ApiError");

class RelationController {
  constructor(service, entityName) {
    this.service = service;
    this.entityName = entityName;

    this.addMember = this.addMember.bind(this);
    this.removeMember = this.removeMember.bind(this);
    this.getEntityMembers = this.getEntityMembers.bind(this);
    this.getMemberEntities = this.getMemberEntities.bind(this);
  }

  async addMember(req, res, next) {
    try {
      const { entityId } = req.params;
      const { memberId } = req.body;
      const data = req.body.data || {};

      const result = await this.service.addMember(memberId, entityId, data);
      res.status(201).json({ message: `Member added to ${this.entityName} successfully`, result });
    } catch (error) {
      next(new ApiError(500, error.message)); // Usar next() para pasar al middleware
    }
  }

  async removeMember(req, res, next) {
    try {
      const { memberId, entityId } = req.params;
      await this.service.removeMember(memberId, entityId);
      res.status(200).json({ message: `Member removed from ${this.entityName} successfully` });
    } catch (error) {
      next(new ApiError(500, error.message)); // Usar next() para pasar al middleware
    }
  }

  async getEntityMembers(req, res, next) {
    try {
      const { entityId } = req.params;
      const members = await this.service.getEntityMembers(entityId);
      res.status(200).json(members);
    } catch (error) {
      next(new ApiError(500, error.message)); // Usar next() para pasar al middleware
    }
  }

  async getMemberEntities(req, res, next) {
    try {
      const { memberId } = req.params;
      const entities = await this.service.getMemberEntities(memberId);
      res.status(200).json(entities);
    } catch (error) {
      next(new ApiError(500, error.message)); // Usar next() para pasar al middleware
    }
  }
}

module.exports = RelationController;
