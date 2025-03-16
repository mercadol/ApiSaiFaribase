
// tests/services/courseService.test.js
const courseService = require('../../services/courseService');
const CourseModel = require('../../models/CourseModel');

jest.mock('../../models/CourseModel');

describe('courseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('debería devolver todos los cursos', async () => {
      const mockCourses = [{ id: 1, Nombre: 'Curso 1' }, { id: 2, Nombre: 'Curso 2' }];
      CourseModel.findAll.mockResolvedValue(mockCourses);

      const result = await courseService.getAll();
      expect(result).toEqual(mockCourses);
      expect(CourseModel.findAll).toHaveBeenCalledWith(null, 10);
    });
  });

  describe('getById', () => {
    it('debería devolver un curso por ID', async () => {
      const mockCourse = { id: 1, Nombre: 'Curso 1' };
      CourseModel.findById.mockResolvedValue(mockCourse);

      const result = await courseService.getById(1);
      expect(result).toEqual(mockCourse);
      expect(CourseModel.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('debería crear un nuevo curso y devolver su ID', async () => {
      const courseData = { Nombre: 'Curso 1', Descripcion: 'Descripción del curso' };
      const mockCourse = { id: 1, ...courseData, save: jest.fn().mockResolvedValue() };
      CourseModel.mockImplementation(() => mockCourse);

      const result = await courseService.create(courseData);
      expect(result).toBe(mockCourse.id);
      expect(mockCourse.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('debería actualizar un curso existente', async () => {
      const mockCourse = { id: 1, Nombre: 'Curso 1', descripcion: 'Descripción', save: jest.fn().mockResolvedValue() };
      CourseModel.findById.mockResolvedValue(mockCourse);

      const updatedData = { Nombre: 'Curso Actualizado', Descripcion: 'Nueva Descripción' };
      const result = await courseService.update(1, updatedData);

      expect(result.Nombre).toBe(updatedData.Nombre);
      expect(result.descripcion).toBe(updatedData.Descripcion);
      expect(mockCourse.save).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('debería eliminar un curso existente', async () => {
      const mockCourse = { id: 1, delete: jest.fn().mockResolvedValue() };
      CourseModel.findById.mockResolvedValue(mockCourse);

      const result = await courseService.delete(1);
      expect(result).toBe(true);
      expect(mockCourse.delete).toHaveBeenCalled();
    });
  });

  describe('addMember', () => {
    it('debería agregar un miembro a un curso', async () => {
      const mockCourse = { id: 1, addMember: jest.fn().mockResolvedValue() };
      CourseModel.findById.mockResolvedValue(mockCourse);

      const result = await courseService.addMember('memberId', 1);
      expect(result).toEqual({ courseId: 1, memberId: 'memberId' });
      expect(mockCourse.addMember).toHaveBeenCalledWith('memberId');
    });
  });

  describe('removeMember', () => {
    it('debería eliminar un miembro de un curso', async () => {
      const mockCourse = { id: 1, removeMember: jest.fn().mockResolvedValue() };
      CourseModel.findById.mockResolvedValue(mockCourse);

      const result = await courseService.removeMember('memberId', 1);
      expect(result).toBe(true);
      expect(mockCourse.removeMember).toHaveBeenCalledWith('memberId');
    });
  });

  describe('getCourseMembers', () => {
    it('debería devolver los miembros de un curso', async () => {
      const mockMembers = [{ id: 'member1' }, { id: 'member2' }];
      CourseModel.getCourseMembers = jest.fn().mockResolvedValue(mockMembers);

      const result = await courseService.getCourseMembers(1);
      expect(result).toEqual(mockMembers);
      expect(CourseModel.getCourseMembers).toHaveBeenCalledWith(1);
    });
  });

  describe('getMemberCourses', () => {
    it('debería devolver los cursos a los que pertenece un miembro', async () => {
      const mockCourses = [{ id: 1, Nombre: 'Curso 1' }, { id: 2, Nombre: 'Curso 2' }];
      CourseModel.getMemberCourses = jest.fn().mockResolvedValue(mockCourses);

      const result = await courseService.getMemberCourses('memberId');
      expect(result).toEqual(mockCourses);
      expect(CourseModel.getMemberCourses).toHaveBeenCalledWith('memberId');
    });
  });
});
