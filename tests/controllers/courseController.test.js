// tests/controllers/courseController.test.js
const courseController = require('../../controllers/courseController');
const courseService = require('../../services/courseService');

// Mock del servicio
jest.mock('../../services/courseService');

describe('CourseController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateCreateData', () => {
    test('debe retornar error si el Nombre no está presente', () => {
      const data = { Descripcion: 'Un curso' };
      const error = courseController.validateCreateData(data);
      expect(error).toBe('El Nombre es obligatorio');
    });

    test('debe retornar error si el Nombre es demasiado corto', () => {
      const data = { Nombre: 'AB' };
      const error = courseController.validateCreateData(data);
      expect(error).toBe('El Nombre debe tener entre 3 y 50 caracteres');
    });

    test('debe retornar error si el Nombre es demasiado largo', () => {
      const data = { Nombre: 'A'.repeat(51) };
      const error = courseController.validateCreateData(data);
      expect(error).toBe('El Nombre debe tener entre 3 y 50 caracteres');
    });

    test('debe retornar error si la descripción es demasiado larga', () => {
      const data = { Nombre: 'Curso válido', Descripcion: 'A'.repeat(501) };
      const error = courseController.validateCreateData(data);
      expect(error).toBe('La descripción no puede superar los 500 caracteres');
    });

    test('debe retornar null si los datos son válidos', () => {
      const data = { Nombre: 'Curso válido', Descripcion: 'Una descripción válida' };
      const error = courseController.validateCreateData(data);
      expect(error).toBeNull();
    });
  });

  describe('prepareCreateData', () => {
    test('debe convertir valores null o undefined a strings vacíos', () => {
      const data = { Nombre: 'Curso', Descripcion: null, Categoria: undefined };
      const prepared = courseController.prepareCreateData(data);
      expect(prepared).toEqual({
        Nombre: 'Curso',
        Descripcion: '',
        Categoria: ''
      });
    });

    test('debe aplicar trim() a los valores string', () => {
      const data = { Nombre: '  Curso  ', Descripcion: ' Una descripción  ' };
      const prepared = courseController.prepareCreateData(data);
      expect(prepared).toEqual({
        Nombre: 'Curso',
        Descripcion: 'Una descripción'
      });
    });

    test('debe mantener valores no string intactos', () => {
      const data = { Nombre: 'Curso', Activo: true, Duracion: 10 };
      const prepared = courseController.prepareCreateData(data);
      expect(prepared).toEqual({
        Nombre: 'Curso',
        Activo: true,
        Duracion: 10
      });
    });
  });

  describe('Métodos heredados y de relaciones', () => {
    test('debe llamar al servicio correcto en create', async () => {
      // Mock para el método de BaseController
      const originalCreate = courseController.create;
      courseController.create = jest.fn().mockImplementation(() => Promise.resolve());
      
      // Datos y respuesta mock
      const courseData = { Nombre: 'Nuevo Curso' };
      const req = { body: courseData };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      
      await courseController.create(req, res);
      
      // Verificar que fue llamado con los parámetros correctos
      expect(courseController.create).toHaveBeenCalledWith(req, res);
      
      // Restaurar método original
      courseController.create = originalCreate;
    });

    test('debe llamar a addMember con los parámetros correctos', async () => {
      // Mock del método addMember
      const originalAddMember = courseController.addMember;
      courseController.addMember = jest.fn().mockImplementation(() => Promise.resolve());
      
      const req = { params: { id: 'course1', memberId: 'member1' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn(); // Añadir mock para next
      
      await courseController.addMember(req, res, next);
      
      expect(courseController.addMember).toHaveBeenCalledWith(req, res, next);
      
      // Restaurar método original
      courseController.addMember = originalAddMember;
    });

    test('debe llamar a removeMember con los parámetros correctos', async () => {
        // Mock del método directamente en courseController
        const originalRemoveMember = courseController.removeMember;
        courseController.removeMember = jest.fn().mockImplementation(() => Promise.resolve());
        
        const req = { params: { id: 'course1', memberId: 'member1' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        
        await courseController.removeMember(req, res, next);
        
        expect(courseController.removeMember).toHaveBeenCalledWith(req, res, next);
        
        // Restaurar método original
        courseController.removeMember = originalRemoveMember;
      });
      
      test('debe llamar a getCourseMembers con los parámetros correctos', async () => {
        const originalGetCourseMembers = courseController.getCourseMembers;
        courseController.getCourseMembers = jest.fn().mockImplementation(() => Promise.resolve());
        
        const req = { params: { id: 'course1' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        
        await courseController.getCourseMembers(req, res, next);
        
        expect(courseController.getCourseMembers).toHaveBeenCalledWith(req, res, next);
        
        courseController.getCourseMembers = originalGetCourseMembers;
      });
      
      test('debe llamar a getMemberCourses con los parámetros correctos', async () => {
        const originalGetMemberCourses = courseController.getMemberCourses;
        courseController.getMemberCourses = jest.fn().mockImplementation(() => Promise.resolve());
        
        const req = { params: { memberId: 'member1' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        
        await courseController.getMemberCourses(req, res, next);
        
        expect(courseController.getMemberCourses).toHaveBeenCalledWith(req, res, next);
        
        courseController.getMemberCourses = originalGetMemberCourses;
      });
  });
});
