// controller/memberController.js
const BaseController = require("./BaseController");
const memberService = require("../services/memberService");

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

    // Enlazar métodos adicionales
    this.searchAvailable = this.searchAvailable.bind(this);
  }

  /**
   * Busca miembros disponibles para asignación a entidades, excluyendo los ya asignados.
   * @param {Object} req - Objeto de solicitud de Express.
   * @param {Object} res - Objeto de respuesta de Express.
   */
  async searchAvailable(req, res) {
    try {
      const { q, excludeFromEntity, entityId } = req.query;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const startAfterId = req.query.startAfter || null;

      // Validar parámetros
      if (!q || q.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "El parámetro de búsqueda 'q' es requerido",
        });
      }

      // Validar entidad si se especifica
      if (excludeFromEntity && !entityId) {
        return res.status(400).json({
          success: false,
          message:
            "Si se especifica 'excludeFromEntity', también debe proporcionarse 'entityId'",
        });
      }

      // Validar tipo de entidad si se especifica
      if (
        excludeFromEntity &&
        !["grupo", "curso", "evento"].includes(excludeFromEntity.toLowerCase())
      ) {
        return res.status(400).json({
          success: false,
          message:
            "El valor de 'excludeFromEntity' debe ser 'grupo', 'curso' o 'evento'",
        });
      }

      const availableMembers = await this.service.searchAvailable(
        q,
        excludeFromEntity,
        entityId,
        startAfterId,
        pageSize
      );

      res.status(200).json({
        success: true,
        data: availableMembers,
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Error al buscar miembros disponibles",
      });
    }
  }
}

module.exports = new memberController();
