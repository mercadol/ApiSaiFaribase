// courseController.js
'use strict';

const BaseController = require('./BaseController');
const RelationController = require('./RelationController');
const courseService = require('../services/courseService');

class CourseController extends BaseController {
  constructor() {
    super({
      service: courseService,
      entityName: 'Course',
      entityPlural: 'courses'
    });

    this.relationController = new RelationController(courseService, 'Course');
  }

  validateCreateData(data) {
    if (!data.Nombre) return 'El nombre es obligatorio';
    if (data.Nombre.length < 3 || data.Nombre.length > 50) {
      return 'El nombre debe tener entre 3 y 50 caracteres';
    }
    
    if (data.Descripcion && data.Descripcion.length > 500) {
      return 'La descripción no puede superar los 500 caracteres';
    }

    return null;
  }

  prepareCreateData(data) {

    for (let key in data) {
      if (data[key] === null || data[key] === undefined) {
      
        // Si es null o undefined, lo cambiamos por una cadena vacía
        data[key] = "";
      } else if (typeof data[key] === 'string') {
        // Si es una cadena, aplicamos trim()
        data[key] = data[key].trim();
      }
    }

    return  data;
  }
}
const courseController = new CourseController();

  // Delegar métodos de relaciones
  courseController.addMember = courseController.relationController.addMember;
  courseController.removeMember = courseController.relationController.removeMember;
  courseController.getCourseMembers = courseController.relationController.getEntityMembers;
  courseController.getMemberCourses = courseController.relationController.getMemberEntities;
  
  module.exports = courseController;
