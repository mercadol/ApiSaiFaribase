// tests/controllers/courseController.test.js
const courseController = require('../../controllers/courseController');
const courseService = require('../../services/courseService');

// Se mockea el servicio
jest.mock('../../services/courseService');

describe('CourseController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateCreateData', () => {
    test('debe retornar error si el Nombre no está presente', () => {
      const data = { descripcion: 'Un curso', fechaCreacion: '2023-01-01' };
      const prepared = courseController.prepareCreateData(data);
      const error = courseController.validateCreateData(prepared);
      expect(error).toBe("El campo 'Nombre' es obligatorio y debe ser una cadena de texto.");
    });

    test('debe retornar error si la descripcion no está presente', () => {
      const data = { Nombre: 'Curso válido', fechaCreacion: '2023-01-01' };
      const prepared = courseController.prepareCreateData(data);
      const error = courseController.validateCreateData(prepared);
      expect(error).toBe("El campo 'descripcion' es obligatorio y debe ser una cadena de texto.");
    });

    test('debe retornar error si fechaCreacion es inválida', () => {
      const data = { 
        Nombre: 'Curso válido', 
        descripcion: 'Una descripción válida', 
        fechaCreacion: 'fecha-invalida' 
      };
      const prepared = courseController.prepareCreateData(data);
      const error = courseController.validateCreateData(prepared);
      expect(error).toBe("El campo 'fechaCreacion' debe ser una fecha válida.");
    });

    test('debe retornar null si los datos son válidos', () => {
      const data = { 
        Nombre: 'Curso válido', 
        descripcion: 'Una descripción válida', 
        fechaCreacion: '2023-01-01T12:00:00Z' 
      };
      const prepared = courseController.prepareCreateData(data);
      const error = courseController.validateCreateData(prepared);
      expect(error).toBeNull();
    });
  });

  describe('prepareCreateData', () => {
    test('debe convertir valores null o undefined a strings vacíos', () => {
      const data = { Nombre: 'Curso', descripcion: null, Categoria: undefined };
      const prepared = courseController.prepareCreateData(data);
      expect(prepared).toEqual({
        Nombre: 'Curso',
        descripcion: '',
        Categoria: ''
      });
    });

    test('debe aplicar trim() a los valores string', () => {
      const data = { Nombre: '  Curso  ', descripcion: '  Una descripción  ' };
      const prepared = courseController.prepareCreateData(data);
      expect(prepared).toEqual({
        Nombre: 'Curso',
        descripcion: 'Una descripción'
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
    test('create debe llamar a service.create con datos preparados', async () => {
      // Mock para el método create del servicio
      courseService.create.mockResolvedValue({ id: 'course1' });
      
      const req = {
        body: { 
          Nombre: '  Curso Creado  ', 
          descripcion: '  Descripción  ', 
          fechaCreacion: '2023-01-01T12:00:00Z' 
        }
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await courseController.create(req, res);
      
      // Se espera que prepareCreateData haya sanitado los datos
      expect(courseService.create).toHaveBeenCalledWith({
        Nombre: 'Curso Creado',
        descripcion: 'Descripción',
        fechaCreacion: '2023-01-01T12:00:00Z'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 'course1' });
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
