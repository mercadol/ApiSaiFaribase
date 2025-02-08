// groupController.js
'use strict';

const BaseController = require('./BaseController');
const groupService = require('../services/groupService');
const idGenerator = require('../utilities/idGenerator');

class groupController extends BaseController {
  constructor() {
    super({
      service: groupService,
      entityName: 'Group',
      entityPlural: 'groups',
      idGenerator: idGenerator.generateTimestampedId
    });
  }

  validateCreateData(data) {
    const { Nombre, Descripcion, Nota } = data;
    
    if (!Nombre) return 'El nombre del grupo es obligatorio';
    if (!this.validator.isLength(Nombre, { min: 3, max: 50 })) {
      return 'El nombre debe tener entre 3 y 50 caracteres';
    }

    if (Descripcion && !this.validator.isLength(Descripcion, { max: 500 })) {
      return 'La descripción no puede superar los 500 caracteres';
    }
    if (Nota && !this.validator.isLength(Nota, { max: 1000 })) {
      return 'La nota no puede superar los 1000 caracteres';
    }
    
    return null;
  }

  prepareCreateData(data, generatedId) {
    return {
      groupId: generatedId,
      Nombre: data.Nombre,
      Descripcion: data.Descripcion,
      Nota: data.Nota
    };
  }

  async addMember(req, res) {
    try {
      const { memberId, groupId } = req.body;
      const data = req.body.data || {};
      const result = await groupService.addMemberToGroup(memberId, groupId, data);
      res.status(201).json({ message: 'Member added successfully', result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async removeMember(req, res) {
    try {
      const { memberId, groupId } = req.params;
      await groupService.removeMemberFromGroup(memberId, groupId);
      res.status(200).json({ message: 'Member removed successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  async getGroupMembers(req, res) {
    try {
      const { groupId } = req.params;
      const members = await groupService.getGroupMembers(groupId);
      res.status(200).json(members);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  async getMemberGroups(req, res) {
    try {
      const { memberId } = req.params;
      const groups = await groupService.getMemberGroups(memberId);
      res.status(200).json(groups);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new groupController();
