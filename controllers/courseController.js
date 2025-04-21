// controllers/courseController.js
const BaseController = require("./BaseController");
const courseService = require("../services/courseService");
const ApiError = require("../utils/ApiError");

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
      entityName: "Course",
      entityPlural: "courses",
    });

    this.addMember = this.addMember.bind(this);
    this.removeMember = this.removeMember.bind(this);
    this.getCourseMembers = this.getCourseMembers.bind(this);
    this.getMemberCourses = this.getMemberCourses.bind(this);
  }

  async addMember(req, res, next) {
    const { courseId } = req.params;
    const { memberId } = req.body;
    const result = await this.service.addMember(memberId, courseId);
    res
      .status(201)
      .json({ message: "Miembro agregado al curso correctamente", result });
  }

  async removeMember(req, res, next) {
    const { memberId, courseId } = req.params;
    await this.service.removeMember(memberId, courseId);
    res.status(204);
  }

  async getCourseMembers(req, res, next) {
    const { courseId } = req.params;
    const members = await this.service.getCourseMembers(courseId);
    res.status(200).json(members);
  }

  async getMemberCourses(req, res, next) {
    const { memberId } = req.params;
    const courses = await this.service.getMemberCourses(memberId);
    res.status(200).json(courses);
  }
}

const courseController = new CourseController();
module.exports = courseController;
