// services/courseService.js
const CourseModel = require("../models/CourseModel");

const courseService = {
  getAll: async (startAfterId = null, pageSize = 10) => {
    return CourseModel.findAll(startAfterId, pageSize);
  },

  getById: async (id) => {
    const course = await CourseModel.findById(id);
    return course;
  },

  create: async (courseData) => {
    const course = new CourseModel({
      Nombre: courseData.Nombre,
      Descripcion: courseData.Descripcion,
      Duracion: courseData.Duracion,
      FechaInicio: courseData.FechaInicio || new Date(),
      FechaCreacion: courseData.FechaCreacion || new Date(),
      Nivel: courseData.Nivel,
      Estado: courseData.Estado,
    });
    await course.save();
    return course.id;
  },

  update: async (id, updatedData) => {
    const course = await CourseModel.findById(id);

    if (updatedData.Nombre) course.Nombre = updatedData.Nombre;
    if (updatedData.Descripcion) course.Descripcion = updatedData.Descripcion;
    if (updatedData.Nivel) course.Nivel = updatedData.Nivel;
    if (updatedData.Estado) course.Estado = updatedData.Estado;

    await course.save();
    return course;
  },

  delete: async (id) => {
    const course = await CourseModel.findById(id);
    await course.delete();
    return true;
  },

  search: async (searchString, startAfterId = null, pageSize = 10) => {
    return CourseModel.search(searchString, startAfterId, pageSize);
  },

  addMember: async (memberId, courseId, role) => {
    const course = await CourseModel.findById(courseId);
    await course.addMember(memberId, role);
    return { courseId, memberId, role };
  },

  removeMember: async (memberId, courseId) => {
    const course = await CourseModel.findById(courseId);
    await course.removeMember(memberId);
    return true;
  },

  getCourseMembers: async (courseId) => {
    return CourseModel.getCourseMembers(courseId);
  },

  getMemberCourses: async (memberId) => {
    return CourseModel.getMemberCourses(memberId);
  },
};

module.exports = courseService;
