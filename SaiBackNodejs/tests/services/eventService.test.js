// tests/services/eventService.test.js
const eventService = require('../../services/eventService');
const EventModel = require('../../models/EventModel');

jest.mock('../../models/EventModel');

describe('eventService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('debería devolver todos los eventos', async () => {
      const mockEvents = [{ id: 1, Nombre: 'Evento 1' }, { id: 2, Nombre: 'Evento 2' }];
      EventModel.findAll.mockResolvedValue(mockEvents);

      const result = await eventService.getAll();
      expect(result).toEqual(mockEvents);
      expect(EventModel.findAll).toHaveBeenCalledWith(null, 10);
    });
  });

  describe('getById', () => {
    it('debería devolver un evento por ID', async () => {
      const mockEvent = { id: 1, Nombre: 'Evento 1' };
      EventModel.findById.mockResolvedValue(mockEvent);

      const result = await eventService.getById(1);
      expect(result).toEqual(mockEvent);
      expect(EventModel.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('debería crear un nuevo evento y devolver su ID', async () => {
      const eventData = { Nombre: 'Evento 1', Descripcion: 'Descripción del evento' };
      const mockEvent = { id: 1, ...eventData, save: jest.fn().mockResolvedValue() };
      EventModel.mockImplementation(() => mockEvent);

      const result = await eventService.create(eventData);
      expect(result).toBe(mockEvent.id);
      expect(mockEvent.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('debería actualizar un evento existente', async () => {
      const mockEvent = { id: 1, Nombre: 'Evento 1', descripcion: 'Descripción', save: jest.fn().mockResolvedValue() };
      EventModel.findById.mockResolvedValue(mockEvent);

      const updatedData = { Nombre: 'Evento Actualizado', Descripcion: 'Nueva Descripción' };
      const result = await eventService.update(1, updatedData);

      expect(result.Nombre).toBe(updatedData.Nombre);
      expect(result.descripcion).toBe(updatedData.Descripcion);
      expect(mockEvent.save).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('debería eliminar un evento existente', async () => {
      const mockEvent = { id: 1, delete: jest.fn().mockResolvedValue() };
      EventModel.findById.mockResolvedValue(mockEvent);

      const result = await eventService.delete(1);
      expect(result).toBe(true);
      expect(mockEvent.delete).toHaveBeenCalled();
    });
  });

  describe('addMember', () => {
    it('debería agregar un miembro a un evento', async () => {
      const mockEvent = { id: 1, addMember: jest.fn().mockResolvedValue() };
      EventModel.findById.mockResolvedValue(mockEvent);

      const result = await eventService.addMember('memberId', 1);
      expect(result).toEqual({ eventId: 1, memberId: 'memberId' });
      expect(mockEvent.addMember).toHaveBeenCalledWith('memberId');
    });
  });

  describe('removeMember', () => {
    it('debería eliminar un miembro de un evento', async () => {
      const mockEvent = { id: 1, removeMember: jest.fn().mockResolvedValue() };
      EventModel.findById.mockResolvedValue(mockEvent);

      const result = await eventService.removeMember('memberId', 1);
      expect(result).toBe(true);
      expect(mockEvent.removeMember).toHaveBeenCalledWith('memberId');
    });
  });

  describe('getEventMembers', () => {
    it('debería devolver los miembros de un evento', async () => {
      const mockMembers = [{ id: 'member1' }, { id: 'member2' }];
      EventModel.getEventMembers = jest.fn().mockResolvedValue(mockMembers);

      const result = await eventService.getEventMembers(1);
      expect(result).toEqual(mockMembers);
      expect(EventModel.getEventMembers).toHaveBeenCalledWith(1);
    });
  });

  describe('getMemberEvents', () => {
    it('debería devolver los eventos a los que pertenece un miembro', async () => {
      const mockEvents = [{ id: 1, Nombre: 'Evento 1' }, { id: 2, Nombre: 'Evento 2' }];
      EventModel.getMemberEvents = jest.fn().mockResolvedValue(mockEvents);

      const result = await eventService.getMemberEvents('memberId');
      expect(result).toEqual(mockEvents);
      expect(EventModel.getMemberEvents).toHaveBeenCalledWith('memberId');
    });
  });
});


