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
  }

  /**
   * Valida los datos recibidos para actualizar un miembro.
   *
   * @param {Object} data - Datos a validar.
   * @returns {string|null} Mensaje de error si la validación falla; de lo contrario, null.
   */
  validateUpdateData(data) {
    if (data.Nombre && (data.Nombre.length < 3 || data.Nombre.length > 50)) {
      return "El campo Nombre debe tener entre 3 y 50 caracteres";
    }
    // Se pueden agregar más validaciones según se requiera.
    return null;
  }

  /**
   * Valida los datos recibidos para la creación de un miembro.
   *
   * @param {Object} data - Datos a validar.
   * @returns {string|null} Mensaje de error si la validación falla; de lo contrario, null.
   */
  validateCreateData(data) {
    const validMemberTypes = ["Miembro", "Visitante", "Bautizado"];
    const validEstadosCiviles = ["Soltero", "Casado", "Divorciado", "Viudo"];

    if (!data.Nombre) return "El campo Nombre es obligatorio";
    if (data.Nombre.length < 3 || data.Nombre.length > 50) {
      return "El campo Nombre debe tener entre 3 y 50 caracteres";
    }

    if (!validMemberTypes.includes(data.TipoMiembro)) {
      return `TipoMiembro debe ser: ${validMemberTypes.join(", ")}`;
    }

    if (data.EstadoCivil && !validEstadosCiviles.includes(data.EstadoCivil)) {
      return `EstadoCivil debe ser: ${validEstadosCiviles.join(", ")}`;
    }

    if (data.Email && !this.validator.isEmail(data.Email)) {
      return 'Formato de email inválido';
    }

    return null;
  }

  /**
   * Prepara los datos para la creación de un miembro.
   * Realiza un trim a las cadenas y convierte valores nulos o undefined en cadenas vacías.
   *
   * @param {Object} data - Datos a preparar.
   * @returns {Object} Datos preparados.
   */
  prepareCreateData(data) {
    for (let key in data) {
      if (data[key] === null || data[key] === undefined) {
        data[key] = "";
      } else if (typeof data[key] === "string") {
        data[key] = data[key].trim();
      }
    }
    return data;
  }
}

module.exports = new memberController();
