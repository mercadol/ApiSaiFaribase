const courseController = require('../controllers/courseController');
const courseService = require('../services/courseService');
const { mockRequest, mockResponse } = require('jest-mock-req-res');
const idGenerator = require('../utilities/idGenerator');

// Mock del servicio y generador de IDs
jest.mock('../services/courseService');
jest.mock('../utilities/idGenerator');

describe('CourseController', () => {
  let req;
  let res;

  beforeEach(() => {
    // Reiniciar los mocks antes de cada prueba
    jest.clearAllMocks();
    req = mockRequest();
    res = mockResponse();
  });

  describe('validateCreateData', () => {
    it('debería retornar error si no se proporciona nombre', () => {
      const result = courseController.validateCreateData({});
      expect(result).toBe('El nombre es obligatorio');
    });

    it('debería retornar error si el nombre es muy corto', () => {
      const result = courseController.validateCreateData({ Nombre: 'ab' });
      expect(result).toBe('El nombre debe tener entre 3 y 50 caracteres');
    });

    it('debería retornar error si el nombre es muy largo', () => {
      const nombreLargo = 'a'.repeat(51);
      const result = courseController.validateCreateData({ Nombre: nombreLargo });
      expect(result).toBe('El nombre debe tener entre 3 y 50 caracteres');
    });

    it('debería retornar error si la descripción es muy larga', () => {
      const descripcionLarga = 'a'.repeat(501);
      const result = courseController.validateCreateData({
        Nombre: 'Curso válido',
        Descripcion: descripcionLarga
      });
      expect(result).toBe('La descripción no puede superar los 500 caracteres');
    });

    it('debería retornar null para datos válidos', () => {
      const result = courseController.validateCreateData({
        Nombre: 'Curso válido',
        Descripcion: 'Descripción válida'
      });
      expect(result).toBeNull();
    });
  });

  describe('prepareCreateData', () => {
    it('debería preparar los datos correctamente', () => {
      const data = {
        Nombre: 'Curso de prueba',
        Descripcion: 'Descripción de prueba'
      };
      const generatedId = 'test-id-123';

      const result = courseController.prepareCreateData(data, generatedId);

      expect(result).toEqual({
        generatedId,
        data
      });
    });
  });

  describe('addMember', () => {
    it('debería agregar un miembro exitosamente', async () => {
      const mockData = { role: 'student' };
      req.body = {
        memberId: 'member-123',
        courseId: 'course-123',
        data: mockData
      };

      courseService.addMemberToCourse.mockResolvedValue({ success: true });

      await courseController.addMember(req, res);

      expect(courseService.addMemberToCourse).toHaveBeenCalledWith(
        'member-123',
        'course-123',
        mockData
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Member added successfully',
        result: { success: true }
      });
    });

    it('debería manejar errores al agregar un miembro', async () => {
      const error = new Error('Error test');
      courseService.addMemberToCourse.mockRejectedValue(error);

      req.body = {
        memberId: 'member-123',
        courseId: 'course-123'
      };

      await courseController.addMember(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('removeMember', () => {
    it('debería eliminar un miembro exitosamente', async () => {
      req.params = {
        memberId: 'member-123',
        courseId: 'course-123'
      };

      courseService.removeMemberFromCourse.mockResolvedValue();

      await courseController.removeMember(req, res);

      expect(courseService.removeMemberFromCourse).toHaveBeenCalledWith(
        'member-123',
        'course-123'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Member removed successfully'
      });
    });

    it('debería manejar errores al eliminar un miembro', async () => {
      const error = new Error('Error test');
      courseService.removeMemberFromCourse.mockRejectedValue(error);

      req.params = {
        memberId: 'member-123',
        courseId: 'course-123'
      };

      await courseController.removeMember(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('getCourseMembers', () => {
    it('debería obtener los miembros del curso exitosamente', async () => {
      const mockMembers = [
        { id: 'member-1', name: 'Member 1' },
        { id: 'member-2', name: 'Member 2' }
      ];

      req.params = { courseId: 'course-123' };
      courseService.getCourseMembers.mockResolvedValue(mockMembers);

      await courseController.getCourseMembers(req, res);

      expect(courseService.getCourseMembers).toHaveBeenCalledWith('course-123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockMembers);
    });

    it('debería manejar errores al obtener los miembros', async () => {
      const error = new Error('Error test');
      courseService.getCourseMembers.mockRejectedValue(error);

      req.params = { courseId: 'course-123' };

      await courseController.getCourseMembers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('getMemberCourses', () => {
    it('debería obtener los cursos del miembro exitosamente', async () => {
      const mockCourses = [
        { id: 'course-1', name: 'Course 1' },
        { id: 'course-2', name: 'Course 2' }
      ];

      req.params = { memberId: 'member-123' };
      courseService.getMemberCourses.mockResolvedValue(mockCourses);

      await courseController.getMemberCourses(req, res);

      expect(courseService.getMemberCourses).toHaveBeenCalledWith('member-123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCourses);
    });

    it('debería manejar errores al obtener los cursos', async () => {
      const error = new Error('Error test');
      courseService.getMemberCourses.mockRejectedValue(error);

      req.params = { memberId: 'member-123' };

      await courseController.getMemberCourses(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });
});
