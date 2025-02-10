const eventController = require('../controllers/eventController');
const eventService = require('../services/eventService');
const { mockRequest, mockResponse } = require('jest-mock-req-res');

// Mock del servicio y generador de IDs
jest.mock('../services/eventService');
jest.mock('../utilities/idGenerator');

describe('EventController', () => {
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
      const result = eventController.validateCreateData({});
      expect(result).toBe('El nombre del Evento es obligatorio');
    });

    it('debería retornar error si el nombre es muy corto', () => {
      const result = eventController.validateCreateData({ Nombre: 'ab' });
      expect(result).toBe('El nombre debe tener entre 3 y 50 caracteres');
    });

    it('debería retornar error si el nombre es muy largo', () => {
      const nombreLargo = 'a'.repeat(51);
      const result = eventController.validateCreateData({ Nombre: nombreLargo });
      expect(result).toBe('El nombre debe tener entre 3 y 50 caracteres');
    });

    it('debería retornar error si la descripción es muy larga', () => {
      const descripcionLarga = 'a'.repeat(501);
      const result = eventController.validateCreateData({
        Nombre: 'Evento válido',
        Descripcion: descripcionLarga
      });
      expect(result).toBe('La descripción no puede superar los 500 caracteres');
    });

    it('debería retornar null para datos válidos', () => {
      const result = eventController.validateCreateData({
        Nombre: 'Evento válido',
        Descripcion: 'Descripción válida'
      });
      expect(result).toBeNull();
    });
  });

  describe('prepareCreateData', () => {
    it('debería preparar los datos correctamente', () => {
      const data = {
        Nombre: 'Evento de prueba',
        Descripcion: 'Descripción de prueba'
      };
      const generatedId = 'test-id-123';

      const result = eventController.prepareCreateData(data, generatedId);

      expect(result).toEqual({
        generatedId,
        data
      });
    });
  });

  describe('addMember', () => {
    it('debería agregar un miembro exitosamente', async () => {
      req.body = {
        memberId: 'member-123',
        eventId: 'event-123'
      };

      eventService.addMemberToEvent.mockResolvedValue({ success: true });

      await eventController.addMember(req, res);

      expect(eventService.addMemberToEvent).toHaveBeenCalledWith(
        'member-123',
        'event-123', {}
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Member added successfully',
        result: { success: true }
      });
    });

    it('debería manejar errores al agregar un miembro', async () => {
      const error = new Error('Error test');
      eventService.addMemberToEvent.mockRejectedValue(error);

      req.body = {
        memberId: 'member-123',
        eventId: 'event-123'
      };

      await eventController.addMember(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('removeMember', () => {
    it('debería eliminar un miembro exitosamente', async () => {
      req.params = {
        memberId: 'member-123',
        eventId: 'event-123'
      };

      eventService.removeMemberFromEvent.mockResolvedValue();

      await eventController.removeMember(req, res);

      expect(eventService.removeMemberFromEvent).toHaveBeenCalledWith(
        'member-123',
        'event-123'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Member removed successfully'
      });
    });

    it('debería manejar errores al eliminar un miembro', async () => {
      const error = new Error('Error test');
      eventService.removeMemberFromEvent.mockRejectedValue(error);

      req.params = {
        memberId: 'member-123',
        eventId: 'event-123'
      };

      await eventController.removeMember(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('getEventMembers', () => {
    it('debería obtener los miembros del evento exitosamente', async () => {
      const mockMembers = [
        { id: 'member-1', name: 'Member 1' },
        { id: 'member-2', name: 'Member 2' }
      ];

      req.params = { eventId: 'event-123' };
      eventService.getEventMembers.mockResolvedValue(mockMembers);

      await eventController.getEventMembers(req, res);

      expect(eventService.getEventMembers).toHaveBeenCalledWith('event-123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockMembers);
    });

    it('debería manejar errores al obtener los miembros', async () => {
      const error = new Error('Error test');
      eventService.getEventMembers.mockRejectedValue(error);

      req.params = { eventId: 'event-123' };

      await eventController.getEventMembers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('getMemberEvents', () => {
    it('debería obtener los eventos del miembro exitosamente', async () => {
      const mockEvents = [
        { id: 'event-1', name: 'Event 1' },
        { id: 'event-2', name: 'Event 2' }
      ];

      req.params = { memberId: 'member-123' };
      eventService.getMemberEvents.mockResolvedValue(mockEvents);

      await eventController.getMemberEvents(req, res);

      expect(eventService.getMemberEvents).toHaveBeenCalledWith('member-123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockEvents);
    });

    it('debería manejar errores al obtener los eventos', async () => {
      const error = new Error('Error test');
      eventService.getMemberEvents.mockRejectedValue(error);

      req.params = { memberId: 'member-123' };

      await eventController.getMemberEvents(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });
});
