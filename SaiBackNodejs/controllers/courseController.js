// courseController.js
'use strict';

const BaseController = require('./BaseController');
const courseService = require('../services/courseService');
const idGenerator = require('../utilities/idGenerator');

class courseController extends BaseController {
  constructor() {
    super({
      service: courseService,
      entityName: 'Course',
      entityPlural: 'courses',
      idGenerator: idGenerator.generateTimestampedId
    });
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

  prepareCreateData(data, generatedId) {
    return {
      courseId: generatedId,
      Nombre: data.Nombre,
      Descripcion: data.Descripcion,
    };
  }

  async addMember(req, res) {
    try {
      const { memberId, courseId } = req.body;
      const data = req.body.data || {};
      const result = await courseService.addMemberToCourse(memberId, courseId, data);
      res.status(201).json({ message: 'Member added successfully', result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async removeMember(req, res) {
    try {
      const { memberId, courseId } = req.params;
      await courseService.removeMemberFromCourse(memberId, courseId);
      res.status(200).json({ message: 'Member removed successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getCourseMembers(req, res) {
    try {
      const { courseId } = req.params;
      const members = await courseService.getCourseMembers(courseId);
      res.status(200).json(members);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMemberCourses(req, res) {
    try {
      const { memberId } = req.params;
      const courses = await courseService.getMemberCourses(memberId);
      res.status(200).json(courses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new courseController();
