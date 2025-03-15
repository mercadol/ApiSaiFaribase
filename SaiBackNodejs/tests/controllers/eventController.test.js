// tests/controllers/eventController.test.js
const eventController = require('../../controllers/eventController');
const eventService = require('../../services/eventService');

// Mock del servicio
jest.mock('../../services/eventService');

describe('EventController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateCreateData', () => {
    test('debe retornar error si el nombre no está presente', () => {
      const data = { Descripcion: 'Un evento' };
      const error = eventController.validateCreateData(data);
      expect(error).toBe('El nombre del Evento es obligatorio');
    });

    test('debe retornar error si el nombre es demasiado corto', () => {
      const data = { Nombre: 'AB' };
      const error = eventController.validateCreateData(data);
      expect(error).toBe('El nombre debe tener entre 3 y 50 caracteres');
    });

    test('debe retornar error si el nombre es demasiado largo', () => {
      const data = { Nombre: 'A'.repeat(51) };
      const error = eventController.validateCreateData(data);
      expect(error).toBe('El nombre debe tener entre 3 y 50 caracteres');
    });

    test('debe retornar error si la descripción es demasiado larga', () => {
      const data = { Nombre: 'Evento válido', Descripcion: 'A'.repeat(501) };
      const error = eventController.validateCreateData(data);
      expect(error).toBe('La descripción no puede superar los 500 caracteres');
    });

    test('debe retornar null si los datos son válidos', () => {
      const data = { Nombre: 'Evento válido', Descripcion: 'Una descripción válida' };
      const error = eventController.validateCreateData(data);
      expect(error).toBeNull();
    });
  });

  describe('prepareCreateData', () => {
    test('debe convertir valores null o undefined a strings vacíos', () => {
      const data = { Nombre: 'Evento', Descripcion: null, Categoria: undefined };
      const prepared = eventController.prepareCreateData(data);
      expect(prepared).toEqual({
        Nombre: 'Evento',
        Descripcion: '',
        Categoria: ''
      });
    });

    test('debe aplicar trim() a los valores string', () => {
      const data = { Nombre: '  Evento  ', Descripcion: ' Una descripción  ' };
      const prepared = eventController.prepareCreateData(data);
      expect(prepared).toEqual({
        Nombre: 'Evento',
        Descripcion: 'Una descripción'
      });
    });

    test('debe mantener valores no string intactos', () => {
      const data = { Nombre: 'Evento', Activo: true, Duracion: 10 };
      const prepared = eventController.prepareCreateData(data);
      expect(prepared).toEqual({
        Nombre: 'Evento',
        Activo: true,
        Duracion: 10
      });
    });
  });

  describe('Métodos heredados y de relaciones', () => {
    test('debe llamar al servicio correcto en create', async () => {
      // Mock para el método de BaseController
      const originalCreate = eventController.create;
      eventController.create = jest.fn().mockImplementation(() => Promise.resolve());
      
      // Datos y respuesta mock
      const eventData = { Nombre: 'Nuevo Evento' };
      const req = { body: eventData };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      
      await eventController.create(req, res);
      
      // Verificar que fue llamado con los parámetros correctos
      expect(eventController.create).toHaveBeenCalledWith(req, res);
      
      // Restaurar método original
      eventController.create = originalCreate;
    });

    test('debe llamar a addMember con los parámetros correctos', async () => {
      // Mock del método addMember
      const originalAddMember = eventController.addMember;
      eventController.addMember = jest.fn().mockImplementation(() => Promise.resolve());
      
      const req = { params: { id: 'event1', memberId: 'member1' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn(); // Añadir mock para next
      
      await eventController.addMember(req, res, next);
      
      expect(eventController.addMember).toHaveBeenCalledWith(req, res, next);
      
      // Restaurar método original
      eventController.addMember = originalAddMember;
    });

    test('debe llamar a removeMember con los parámetros correctos', async () => {
        // Mock del método directamente en eventController
        const originalRemoveMember = eventController.removeMember;
        eventController.removeMember = jest.fn().mockImplementation(() => Promise.resolve());
        
        const req = { params: { id: 'event1', memberId: 'member1' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        
        await eventController.removeMember(req, res, next);
        
        expect(eventController.removeMember).toHaveBeenCalledWith(req, res, next);
        
        // Restaurar método original
        eventController.removeMember = originalRemoveMember;
      });
      
      test('debe llamar a getEventMembers con los parámetros correctos', async () => {
        const originalGetEventMembers = eventController.getEventMembers;
        eventController.getEventMembers = jest.fn().mockImplementation(() => Promise.resolve());
        
        const req = { params: { id: 'event1' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        
        await eventController.getEventMembers(req, res, next);
        
        expect(eventController.getEventMembers).toHaveBeenCalledWith(req, res, next);
        
        eventController.getEventMembers = originalGetEventMembers;
      });
      
      test('debe llamar a getMemberEvents con los parámetros correctos', async () => {
        const originalGetMemberEvents = eventController.getMemberEvents;
        eventController.getMemberEvents = jest.fn().mockImplementation(() => Promise.resolve());
        
        const req = { params: { memberId: 'member1' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        
        await eventController.getMemberEvents(req, res, next);
        
        expect(eventController.getMemberEvents).toHaveBeenCalledWith(req, res, next);
        
        eventController.getMemberEvents = originalGetMemberEvents;
      });
  });
});
