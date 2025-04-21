// controller/memberController.js
const BaseController = require("./BaseController");
const memberService = require("../services/memberService");
const ApiError = require("../utils/ApiError");

/**
 * Controlador para la gestión de miembros que extiende de BaseController.
 */
class memberController extends BaseController {
  /**
   * Crea una instancia del controlador con la configuración del servicio y nombres de entidad.
   */
  constructor() {
    super({
      service: memberService,
      entityName: "Member",
      entityPlural: "members",
    });
  }
}

module.exports = new memberController();
