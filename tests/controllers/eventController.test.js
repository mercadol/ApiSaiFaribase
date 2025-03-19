// tests/controllers/eventController.test.js
const eventController = require('../../controllers/EventController');
const eventService = require('../../services/eventService');

// Se mockea el servicio
jest.mock('../../services/eventService');

describe('EventController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateCreateData', () => {
    test('debe retornar error si el Nombre no está presente', () => {
      const data = { descripcion: 'Un evento', fecha: '2023-01-01' };
      // Simulamos la sanitización previa
      const prepared = eventController.prepareCreateData(data);
      const error = eventController.validateCreateData(prepared);
      expect(error).toBe("El campo 'Nombre' es obligatorio y debe ser una cadena de texto.");
    });

    test('debe retornar error si la descripcion no está presente', () => {
      const data = { Nombre: 'Evento', fecha: '2023-01-01' };
      const prepared = eventController.prepareCreateData(data);
      const error = eventController.validateCreateData(prepared);
      expect(error).toBe("El campo 'descripcion' es obligatorio y debe ser una cadena de texto.");
    });

    test('debe retornar error si la fecha es inválida', () => {
      const data = { Nombre: 'Evento', descripcion: 'Descripción', fecha: 'fecha-invalida' };
      const prepared = eventController.prepareCreateData(data);
      const error = eventController.validateCreateData(prepared);
      expect(error).toBe("El campo 'fecha' es obligatorio y debe ser una fecha válida.");
    });

    test('debe retornar null si los datos son válidos', () => {
      const data = { 
        Nombre: 'Evento válido', 
        descripcion: 'Una descripción válida', 
        fecha: '2023-01-01T12:00:00Z' 
      };
      const prepared = eventController.prepareCreateData(data);
      const error = eventController.validateCreateData(prepared);
      expect(error).toBeNull();
    });
  });

  describe('prepareCreateData', () => {
    test('debe convertir valores null o undefined a strings vacíos', () => {
      const data = { Nombre: 'Evento', descripcion: null, Categoria: undefined };
      const prepared = eventController.prepareCreateData(data);
      expect(prepared).toEqual({
        Nombre: 'Evento',
        descripcion: '',
        Categoria: ''
      });
    });

    test('debe aplicar trim() a los valores string', () => {
      const data = { Nombre: '  Evento  ', descripcion: '  Una descripción  ' };
      const prepared = eventController.prepareCreateData(data);
      expect(prepared).toEqual({
        Nombre: 'Evento',
        descripcion: 'Una descripción'
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

  describe('validateUpdateData', () => {
    test('debe retornar error si se envía un objeto vacío', () => {
      const data = {};
      const error = eventController.validateUpdateData(data);
      expect(error).toBe("No se proporcionaron datos válidos para actualizar.");
    });

    test('debe retornar error si Nombre es una cadena vacía', () => {
      const data = { Nombre: '' };
      const error = eventController.validateUpdateData(data);
      expect(error).toBe("El campo 'Nombre' debe ser una cadena de texto no vacía.");
    });

    test('debe retornar error si descripcion es una cadena vacía', () => {
      const data = { descripcion: '' };
      const error = eventController.validateUpdateData(data);
      expect(error).toBe("El campo 'descripcion' debe ser una cadena de texto no vacía.");
    });

    test('debe retornar error si la fecha es inválida', () => {
      const data = { fecha: 'invalid-date' };
      const error = eventController.validateUpdateData(data);
      expect(error).toBe("El campo 'fecha' debe ser una fecha válida.");
    });

    test('debe retornar null si los datos de actualización son válidos', () => {
      const data = { 
        Nombre: 'Evento Actualizado', 
        descripcion: 'Descripción actualizada', 
        fecha: '2023-02-02T12:00:00Z' 
      };
      const error = eventController.validateUpdateData(data);
      expect(error).toBeNull();
    });
  });

  describe('Métodos heredados y de relaciones', () => {
    test('create debe llamar a service.create con datos preparados', async () => {
      // Mock para el método create del servicio
      eventService.create.mockResolvedValue({ id: 'event1' });
      
      // Simulamos req y res
      const req = {
        body: { 
          Nombre: '  Evento Creado  ', 
          descripcion: '  Descripción  ', 
          fecha: '2023-01-01T12:00:00Z' 
        }
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await eventController.create(req, res);
      
      // Se espera que prepareCreateData haya sanitado los datos
      expect(eventService.create).toHaveBeenCalledWith({
        Nombre: 'Evento Creado',
        descripcion: 'Descripción',
        fecha: '2023-01-01T12:00:00Z'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 'event1' });
    });

    test('addMember debe llamar a service.addMember con los parámetros correctos', async () => {
      eventService.addMember.mockResolvedValue({ result: 'ok' });
      
      const req = { 
        params: { eventId: 'event1' }, 
        body: { memberId: 'member1' } 
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      
      await eventController.addMember(req, res, next);
      
      expect(eventService.addMember).toHaveBeenCalledWith('member1', 'event1');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: "Member added to Event successfully", result: { result: 'ok' } });
    });
    
    test('removeMember debe llamar a service.removeMember con los parámetros correctos', async () => {
      eventService.removeMember.mockResolvedValue();
      
      const req = { 
        params: { eventId: 'event1', memberId: 'member1' } 
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      
      await eventController.removeMember(req, res, next);
      
      expect(eventService.removeMember).toHaveBeenCalledWith('member1', 'event1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Member removed from Event successfully" });
    });
    
    test('getEventMembers debe llamar a service.getEventMembers con el parámetro correcto', async () => {
      eventService.getEventMembers.mockResolvedValue(['member1', 'member2']);
      
      const req = { params: { eventId: 'event1' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      
      await eventController.getEventMembers(req, res, next);
      
      expect(eventService.getEventMembers).toHaveBeenCalledWith('event1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(['member1', 'member2']);
    });
    
    test('getMemberEvents debe llamar a service.getMemberEvents con el parámetro correcto', async () => {
      eventService.getMemberEvents.mockResolvedValue(['event1', 'event2']);
      
      const req = { params: { memberId: 'member1' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      
      await eventController.getMemberEvents(req, res, next);
      
      expect(eventService.getMemberEvents).toHaveBeenCalledWith('member1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(['event1', 'event2']);
    });
  });
});
