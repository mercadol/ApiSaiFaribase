'use strict';

const BaseController = require('./BaseController');
const RelationController = require('./RelationController');
const groupService = require('../services/groupService');

class GroupController extends BaseController {
  constructor() {
    super({
      service: groupService,
      entityName: 'Group',
      entityPlural: 'groups'
    });

    this.relationController = new RelationController(groupService, 'Group');
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

const groupController = new GroupController();

// Delegar métodos de relaciones
groupController.addMember = groupController.relationController.addMember;
groupController.removeMember = groupController.relationController.removeMember;
groupController.getEntityMembers = groupController.relationController.getEntityMembers;
groupController.getMemberEntities = groupController.relationController.getMemberEntities;

module.exports = groupController;
