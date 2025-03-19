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
   * Solo valida la data y retorna un mensaje de error en caso de fallo.
   */
  validateCreateData(data) {
    if (!data.Nombre || typeof data.Nombre !== 'string' || data.Nombre === "") {
      return "El campo 'Nombre' es obligatorio y debe ser una cadena de texto.";
    }
    if (!data.descripcion || typeof data.descripcion !== 'string' || data.descripcion === "") {
      return "El campo 'descripcion' es obligatorio y debe ser una cadena de texto.";
    }
    if (data.fechaCreacion && isNaN(Date.parse(data.fechaCreacion))) {
      return "El campo 'fechaCreacion' debe ser una fecha válida.";
    }
    return null;
  }

  /**
   * Valida los datos de actualización de un curso.
   * Solo valida la data y retorna un mensaje de error en caso de fallo.
   */
  validateUpdateData(data) {
    if (data.Nombre !== undefined) {
      if (typeof data.Nombre !== 'string' || data.Nombre === "") {
        return "El campo 'Nombre' debe ser una cadena de texto no vacía.";
      }
    }
    if (data.descripcion !== undefined) {
      if (typeof data.descripcion !== 'string' || data.descripcion === "") {
        return "El campo 'descripcion' debe ser una cadena de texto no vacía.";
      }
    }
    if (data.fechaCreacion !== undefined) {
      if (data.fechaCreacion && isNaN(Date.parse(data.fechaCreacion))) {
        return "El campo 'fechaCreacion' debe ser una fecha válida.";
      }
    }
    if (Object.keys(data).length === 0) {
      return "No se proporcionaron datos válidos para actualizar.";
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
