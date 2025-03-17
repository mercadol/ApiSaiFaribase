// controllers/courseController.js
'use strict';

const BaseController = require('./BaseController');
const RelationController = require('./RelationController');
const courseService = require('../services/courseService');

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

    // Inicializar RelationController para delegar métodos de relaciones en Course
    this.relationController = new RelationController(courseService, 'Course');
  }

  /**
   * Valida los datos de creación de un curso.
   * @param {Object} data - Datos del curso a validar.
   * @returns {string|null} Mensaje de error si la validación falla, de lo
   * contrario null.
   */
  validateCreateData(data) {
    if (!data.Nombre) return 'El Nombre es obligatorio';
    if (data.Nombre.length < 3 || data.Nombre.length > 50) {
      return 'El Nombre debe tener entre 3 y 50 caracteres';
    }
    if (data.Descripcion && data.Descripcion.length > 500) {
      return 'La descripción no puede superar los 500 caracteres';
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
      } else if (typeof data[key] === 'string') {
        // Recortar espacios en blanco al inicio y final de cadenas
        data[key] = data[key].trim();
      }
    }
    return data;
  }
}

const courseController = new CourseController();

// Delegar métodos de relaciones usando la instancia de RelationController
courseController.addMember = courseController.relationController.addMember;
courseController.removeMember = courseController.relationController.removeMember;
courseController.getCourseMembers = courseController.relationController.getEntityMembers;
courseController.getMemberCourses = courseController.relationController.getMemberEntities;

module.exports = courseController;
