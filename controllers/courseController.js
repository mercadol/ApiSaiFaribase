// controllers/courseController.js

const BaseController = require("./BaseController");
const courseService = require("../services/courseService");

/**
 * Controlador para gestionar la entidad Course.
 * Extiende de BaseController para operaciones CRUD y utiliza RelationController
 * para manejar las relaciones entre Course y otras entidades/membresías.
 */
class CourseController extends BaseController {
  /**
   * Crea una instancia del CourseController.
   */
  constructor() {
    super({
      service: courseService,
      entityName: 'Course',
      entityPlural: 'courses'
    });

    // Enlazar métodos de relaciones
    this.addMember = this.addMember.bind(this);
    this.removeMember = this.removeMember.bind(this);
    this.getCourseMembers = this.getCourseMembers.bind(this);
    this.getMemberCourses = this.getMemberCourses.bind(this);
  }

  /**
   * Valida los datos de creación de un curso.
   * @param {Object} data - Datos del curso a validar.
   * @returns {string|null} Mensaje de error si la validación falla, de lo
   * contrario null.
   */
  validateCreateData(data) {
    if (!data.Nombre) return "El Nombre es obligatorio";
    if (data.Nombre.length < 3 || data.Nombre.length > 50) {
      return "El Nombre debe tener entre 3 y 50 caracteres";
    }
    if (data.Descripcion && data.Descripcion.length > 500) {
      return "La descripción no puede superar los 500 caracteres";
    }
    return null;
  }

  /**
   * Prepara los datos de creación del curso.
   * Convierte valores null o undefined en cadenas vacías y aplica trim() a
   * valores de tipo cadena.
   *
   * @param {Object} data - Datos a preparar.
   * @returns {Object} Datos transformados.
   */
  prepareCreateData(data) {
    for (let key in data) {
      if (data[key] === null || data[key] === undefined) {
        // Convertir valores nulos o indefinidos a cadena vacía
        data[key] = "";
      } else if (typeof data[key] === "string") {
        // Recortar espacios en blanco al inicio y final de cadenas
        data[key] = data[key].trim();
      }
    }
    return data;
  }

  async addMember(req, res, next) {
    try {
      const { courseId } = req.params;
      const { memberId } = req.body;
      const result = await this.service.addMember(memberId, courseId);
      res
        .status(201)
        .json({ message: "Member added to Course successfully", result });
    } catch (error) {
      next(new ApiError(500, error.message));
    }
  }

  async removeMember(req, res, next) {
    try {
      const { memberId, courseId } = req.params;
      await this.service.removeMember(memberId, courseId);
      res
        .status(200)
        .json({ message: "Member removed from Course successfully" });
    } catch (error) {
      next(new ApiError(500, error.message));
    }
  }

  async getCourseMembers(req, res, next) {
    try {
      const { courseId } = req.params;
      const members = await this.service.getCourseMembers(courseId);
      res.status(200).json(members);
    } catch (error) {
      next(new ApiError(500, error.message));
    }
  }

  async getMemberCourses(req, res, next) {
    try {
      const { memberId } = req.params;
      const courses = await this.service.getMemberCourses(memberId);
      res.status(200).json(courses);
    } catch (error) {
      next(new ApiError(500, error.message));
    }
  }
}

const courseController = new CourseController();
module.exports = courseController;
