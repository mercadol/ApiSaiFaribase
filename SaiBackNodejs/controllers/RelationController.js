'use strict';

class RelationController {
  constructor(service, entityName) {
    this.service = service;
    this.entityName = entityName;

    this.addMember = this.addMember.bind(this);
    this.removeMember = this.removeMember.bind(this);
    this.getEntityMembers = this.getEntityMembers.bind(this);
    this.getMemberEntities = this.getMemberEntities.bind(this);
  }

  async addMember(req, res) {
    try {
      const { entityId } = req.params;
      const { memberId } = req.body;
      const data = req.body.data || {};

      const result = await this.service.addMember(memberId, entityId, data);
      res.status(201).json({ message: `Member added to ${this.entityName} successfully`, result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async removeMember(req, res) {
    try {
      const { memberId, entityId } = req.params;
      await this.service.removeMember(memberId, entityId);
      res.status(200).json({ message: `Member removed from ${this.entityName} successfully` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getEntityMembers(req, res) {
    try {
      const { entityId } = req.params;
      const members = await this.service.getEntityMembers(entityId);
      res.status(200).json(members);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMemberEntities(req, res) {
    try {
      const { memberId } = req.params;
      const entities = await this.service.getMemberEntities(memberId);
      res.status(200).json(entities);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = RelationController;
