'use strict';

const BaseController = require('./BaseController');
const RelationController = require('./RelationController');
const groupService = require('../services/groupService');

/**
 * Controlador para gestionar la entidad Group.
 * Extiende de BaseController para operaciones CRUD y utiliza RelationController
 * para manejar las relaciones entre Group y otras entidades/membresías.
 */
class GroupController extends BaseController {
  /**
   * Crea una instancia del GroupController.
   */
  constructor() {
    super({
      service: groupService,
      entityName: 'Group',
      entityPlural: 'groups'
    });

    this.relationController = new RelationController(groupService, 'Group');
  }

  /**
   * Valida los datos de creación de un grupo.
   * @param {Object} data - Datos del grupo a validar.
   * @returns {string|null} Mensaje de error si la validación falla, de lo
   * contrario null.
   */
  validateCreateData(data) {
    const { Nombre, Descripcion, Nota } = data;
    if (!Nombre) return 'El Nombre del grupo es obligatorio';
    if (!this.validator.isLength(Nombre, { min: 3, max: 50 })) {
      return 'El Nombre debe tener entre 3 y 50 caracteres';
    }

    if (Descripcion && !this.validator.isLength(Descripcion, { max: 500 })) {
      return 'La descripción no puede superar los 500 caracteres';
    }
    if (Nota && !this.validator.isLength(Nota, { max: 1000 })) {
      return 'La nota no puede superar los 1000 caracteres';
    }
    return null;
  }

  /**
   * Prepara los datos de creación del grupo.
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

const groupController = new GroupController();

// Delegar métodos de relaciones usando la instancia de RelationController
groupController.addMember = groupController.relationController.addMember;
groupController.removeMember = groupController.relationController.removeMember;
groupController.getEntityMembers = groupController.relationController.getEntityMembers;
groupController.getMemberEntities = groupController.relationController.getMemberEntities;

module.exports = groupController;
