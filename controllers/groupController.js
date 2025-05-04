// controllers/groupController.js
const BaseController = require("./BaseController");
const groupService = require("../services/groupService");
const ApiError = require("../utils/ApiError");

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
      entityName: "Group",
      entityPlural: "groups",
    });

    this.addMember = this.addMember.bind(this);
    this.removeMember = this.removeMember.bind(this);
    this.getGroupMembers = this.getGroupMembers.bind(this);
    this.getMemberGroups = this.getMemberGroups.bind(this);
  }

  async addMember(req, res, next) {
    const { groupId } = req.params;
    const { memberId, role } = req.body;
    const result = await this.service.addMember(memberId, groupId, role);
    res
      .status(201)
      .json({ message: "Miembro agregado al grupo correctamente", result });
  }

  async removeMember(req, res, next) {
    const { memberId, groupId } = req.params;
    await this.service.removeMember(memberId, groupId);
    res.status(204);
  }

  async getGroupMembers(req, res, next) {
    const { groupId } = req.params;
    const members = await this.service.getGroupMembers(groupId);
    res.status(200).json(members);
  }

  async getMemberGroups(req, res, next) {
    const { memberId } = req.params;
    const groups = await this.service.getMemberGroups(memberId);
    res.status(200).json(groups);
  }
}

const groupController = new GroupController();
module.exports = groupController;
