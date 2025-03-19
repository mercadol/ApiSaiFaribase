// controllers/groupController.js

const BaseController = require('./BaseController');
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

    // Enlazar métodos de relaciones
    this.addMember = this.addMember.bind(this);
    this.removeMember = this.removeMember.bind(this);
    this.getGroupMembers = this.getGroupMembers.bind(this);
    this.getMemberGroups = this.getMemberGroups.bind(this);
  }

  /**
   * Valida los datos de creación de un grupo.
   * Solo valida la data y retorna un mensaje de error en caso de fallo.
   */
  validateCreateData(data) {
    if (!data.Nombre) {
      return "El Nombre del grupo es obligatorio";
    }
    if (!this.validator.isLength(data.Nombre, { min: 3, max: 50 })) {
      return "El Nombre debe tener entre 3 y 50 caracteres";
    }
    if (data.Descripcion && !this.validator.isLength(data.Descripcion, { max: 500 })) {
      return "La descripción no puede superar los 500 caracteres";
    }
    if (data.Nota && !this.validator.isLength(data.Nota, { max: 1000 })) {
      return "La nota no puede superar los 1000 caracteres";
    }
    return null;
  }

  /**
   * Valida los datos de actualización de un grupo.
   * Solo valida la data y retorna un mensaje de error en caso de fallo.
   */
  validateUpdateData(data) {
    if (data.Nombre !== undefined) {
      if (!this.validator.isLength(data.Nombre, { min: 3, max: 50 })) {
        return "El Nombre debe tener entre 3 y 50 caracteres";
      }
    }
    if (data.Descripcion !== undefined) {
      if (data.Descripcion && !this.validator.isLength(data.Descripcion, { max: 500 })) {
        return "La descripción no puede superar los 500 caracteres";
      }
    }
    if (data.Nota !== undefined) {
      if (data.Nota && !this.validator.isLength(data.Nota, { max: 1000 })) {
        return "La nota no puede superar los 1000 caracteres";
      }
    }
    if (Object.keys(data).length === 0) {
      return "No se proporcionaron datos válidos para actualizar.";
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

  async addMember(req, res, next) {
    try {
      const { groupId } = req.params;
      const { memberId } = req.body;
      const result = await this.service.addMember(memberId, groupId);
      res
        .status(201)
        .json({ message: "Member added to Group successfully", result });
    } catch (error) {
      next(new ApiError(500, error.message));
    }
  }

  async removeMember(req, res, next) {
    try {
      const { memberId, groupId } = req.params;
      await this.service.removeMember(memberId, groupId);
      res
        .status(200)
        .json({ message: "Member removed from Group successfully" });
    } catch (error) {
      next(new ApiError(500, error.message));
    }
  }

  async getGroupMembers(req, res, next) {
    try {
      const { groupId } = req.params;
      const members = await this.service.getGroupMembers(groupId);
      res.status(200).json(members);
    } catch (error) {
      next(new ApiError(500, error.message));
    }
  }

  async getMemberGroups(req, res, next) {
    try {
      const { memberId } = req.params;
      const groups = await this.service.getMemberGroups(memberId);
      res.status(200).json(groups);
    } catch (error) {
      next(new ApiError(500, error.message));
    }
  }
}

const groupController = new GroupController();
module.exports = groupController;
