// tests/models/EventModel.test.js
"use strict";

const { db } = require('../../firebase');
const EventModel = require('../../models/EventModel');
const ApiError = require('../../utils/ApiError');

// Mock de Firebase
jest.mock('../../firebase', () => ({
  db: {
    collection: jest.fn(),
  }
}));

describe('EventModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('debe crear objeto con propiedades por defecto', () => {
      const event = new EventModel({});
      expect(event.id).toBeNull();
      expect(event.Nombre).toBe('');
      expect(event.descripcion).toBe('');
      expect(event.fecha).toBeInstanceOf(Date);
    });

    test('debe crear objeto con propiedades especificadas', () => {
      const data = {
        id: 'test-id',
        Nombre: 'Test Event',
        descripcion: 'Test Description',
        fecha: new Date('2023-01-01')
      };
      const event = new EventModel(data);
      expect(event.id).toBe('test-id');
      expect(event.Nombre).toBe('Test Event');
      expect(event.descripcion).toBe('Test Description');
      expect(event.fecha).toEqual(new Date('2023-01-01'));
    });
  });

  describe('save', () => {
    test('debe crear nuevo documento si no hay id', async () => {
      const addMock = jest.fn().mockResolvedValue({ id: 'new-id' });
      db.collection.mockReturnValue({ add: addMock });
      
      const event = new EventModel({
        Nombre: 'Test Event',
        descripcion: 'Test Description'
      });
      
      await event.save();
      
      expect(db.collection).toHaveBeenCalledWith('Event');
      expect(addMock).toHaveBeenCalledWith({
        Nombre: 'Test Event',
        descripcion: 'Test Description',
        fecha: expect.any(Date)
      });
      expect(event.id).toBe('new-id');
    });

    test('debe actualizar documento existente si hay id', async () => {
      const updateMock = jest.fn().mockResolvedValue({});
      const docMock = jest.fn().mockReturnValue({ update: updateMock });
      db.collection.mockReturnValue({ doc: docMock });
      
      const event = new EventModel({
        id: 'existing-id',
        Nombre: 'Test Event',
        descripcion: 'Updated Description'
      });
      
      await event.save();
      
      expect(db.collection).toHaveBeenCalledWith('Event');
      expect(docMock).toHaveBeenCalledWith('existing-id');
      expect(updateMock).toHaveBeenCalledWith({
        Nombre: 'Test Event',
        descripcion: 'Updated Description',
        fecha: expect.any(Date)
      });
    });

    test('debe capturar y relanzar error de Firestore', async () => {
      db.collection.mockImplementation(() => {
        throw new Error('Firebase error');
      });
      
      const event = new EventModel({ Nombre: 'Test Event' });
      
      await expect(event.save()).rejects.toThrow(ApiError);
      await expect(event.save()).rejects.toMatchObject({
        statusCode: 500,
        message: "Error al guardar el evento Inténtelo más tarde: Firebase error"
      });
    });
  });

  describe('delete', () => {
    test('debe lanzar error si no hay id', async () => {
      const event = new EventModel({});
      
      await expect(event.delete()).rejects.toThrow(ApiError);
      await expect(event.delete()).rejects.toMatchObject({
        statusCode: 400,
        message: "ID del evento no especificado."
      });
    });

    test('debe eliminar documento correctamente', async () => {
      const deleteMock = jest.fn().mockResolvedValue({});
      const docMock = jest.fn().mockReturnValue({ delete: deleteMock });
      db.collection.mockReturnValue({ doc: docMock });
      
      const event = new EventModel({ id: 'test-id' });
      await event.delete();
      
      expect(db.collection).toHaveBeenCalledWith('Event');
      expect(docMock).toHaveBeenCalledWith('test-id');
      expect(deleteMock).toHaveBeenCalled();
    });

    test('debe capturar y relanzar error de Firestore', async () => {
      const deleteMock = jest.fn().mockRejectedValue(new Error('Firebase error'));
      const docMock = jest.fn().mockReturnValue({ delete: deleteMock });
      db.collection.mockReturnValue({ doc: docMock });
      
      const event = new EventModel({ id: 'test-id' });
      
      await expect(event.delete()).rejects.toThrow(ApiError);
      await expect(event.delete()).rejects.toMatchObject({
        statusCode: 500,
        message: "Error al eliminar el evento Inténtelo más tarde: Firebase error"
      });
    });
  });

  describe('findById', () => {
    test('debe encontrar evento por id', async () => {
      const getMock = jest.fn().mockResolvedValue({
        exists: true,
        id: 'test-id',
        data: () => ({
          Nombre: 'Test Event',
          descripcion: 'Test Description',
          fecha: new Date('2023-01-01')
        })
      });
      const docMock = jest.fn().mockReturnValue({ get: getMock });
      db.collection.mockReturnValue({ doc: docMock });
      
      const event = await EventModel.findById('test-id');
      
      expect(db.collection).toHaveBeenCalledWith('Event');
      expect(docMock).toHaveBeenCalledWith('test-id');
      expect(event).toBeInstanceOf(EventModel);
      expect(event.id).toBe('test-id');
      expect(event.Nombre).toBe('Test Event');
    });

    test('debe lanzar error si el evento no existe', async () => {
      const getMock = jest.fn().mockResolvedValue({
        exists: false
      });
      const docMock = jest.fn().mockReturnValue({ get: getMock });
      db.collection.mockReturnValue({ doc: docMock });
      
      await expect(EventModel.findById('no-existe')).rejects.toThrow(ApiError);
      await expect(EventModel.findById('no-existe')).rejects.toMatchObject({
        statusCode: 404,
        message: "Evento no encontrado."
      });
    });

    test('debe capturar otros errores como 500', async () => {
      const getMock = jest.fn().mockRejectedValue(new Error('Firebase error'));
      const docMock = jest.fn().mockReturnValue({ get: getMock });
      db.collection.mockReturnValue({ doc: docMock });
      
      await expect(EventModel.findById('test-id')).rejects.toThrow(ApiError);
      await expect(EventModel.findById('test-id')).rejects.toMatchObject({
        statusCode: 500,
        message: "Error al buscar el evento Inténtelo más tarde: Firebase error"
      });
    });
  });

  describe('findAll', () => {
    test('debe encontrar todos los eventos (primera página)', async () => {
      const docs = [
        {
          id: 'id1',
          data: () => ({ Nombre: 'Event 1', descripcion: 'Description 1' })
        },
        {
          id: 'id2',
          data: () => ({ Nombre: 'Event 2', descripcion: 'Description 2' })
        }
      ];
      
      const getMock = jest.fn().mockResolvedValue({ docs });
      const limitMock = jest.fn().mockReturnValue({ get: getMock });
      const orderByMock = jest.fn().mockReturnValue({ limit: limitMock });
      db.collection.mockReturnValue({ orderBy: orderByMock });
      
      const events = await EventModel.findAll();
      
      expect(db.collection).toHaveBeenCalledWith('Event');
      expect(orderByMock).toHaveBeenCalledWith('Nombre');
      expect(limitMock).toHaveBeenCalledWith(10);
      expect(events).toHaveLength(2);
      expect(events[0]).toBeInstanceOf(EventModel);
      expect(events[0].id).toBe('id1');
      expect(events[1].id).toBe('id2');
    });

    test('debe manejar paginación con startAfterId', async () => {
      const startAfterDocGetMock = jest.fn().mockResolvedValue({
        exists: true
      });
      const startAfterDocMock = jest.fn().mockReturnValue({ 
        get: startAfterDocGetMock 
      });
      
      const docs = [{ id: 'id3', data: () => ({ Nombre: 'Event 3' }) }];
      
      const getMock = jest.fn().mockResolvedValue({ docs });
      const startAfterMock = jest.fn().mockReturnValue({ get: getMock });
      const limitMock = jest.fn().mockReturnValue({ startAfter: startAfterMock });
      const orderByMock = jest.fn().mockReturnValue({ limit: limitMock });
      
      db.collection.mockImplementation((name) => {
        return { 
          orderBy: orderByMock,
          doc: startAfterDocMock 
        };
      });
      
      const events = await EventModel.findAll('start-id', 5);
      
      expect(startAfterDocMock).toHaveBeenCalledWith('start-id');
      expect(limitMock).toHaveBeenCalledWith(5);
      expect(startAfterMock).toHaveBeenCalled();
      expect(events).toHaveLength(1);
    });
  });

  describe('addMember', () => {
    test('debe lanzar error si no hay id del evento', async () => {
      const event = new EventModel({});
      
      await expect(event.addMember('member-id')).rejects.toThrow(ApiError);
      await expect(event.addMember('member-id')).rejects.toMatchObject({
        statusCode: 400,
        message: "ID del evento no especificado."
      });
    });

    test('debe lanzar error si no hay id del miembro', async () => {
      const event = new EventModel({ id: 'event-id' });
      
      await expect(event.addMember()).rejects.toThrow(ApiError);
      await expect(event.addMember()).rejects.toMatchObject({
        statusCode: 400,
        message: "ID del miembro no especificado."
      });
    });

    test('debe agregar miembro correctamente', async () => {
      const setMock = jest.fn().mockResolvedValue({});
      const docMock = jest.fn().mockReturnValue({ set: setMock });
      db.collection.mockReturnValue({ doc: docMock });
      
      const event = new EventModel({ id: 'event-id' });
      await event.addMember('member-id');
      
      expect(db.collection).toHaveBeenCalledWith('EventMember');
      expect(docMock).toHaveBeenCalledWith('event-id_member-id');
      expect(setMock).toHaveBeenCalledWith({
        eventId: 'event-id',
        memberId: 'member-id',
      });
    });
  });

  describe('removeMember', () => {
    test('debe lanzar error si no hay id del evento', async () => {
      const event = new EventModel({});
      
      await expect(event.removeMember('member-id')).rejects.toThrow(ApiError);
      await expect(event.removeMember('member-id')).rejects.toMatchObject({
        statusCode: 400,
        message: "ID del evento no especificado."
      });
    });

    test('debe lanzar error si no hay id del miembro', async () => {
      const event = new EventModel({ id: 'event-id' });
      
      await expect(event.removeMember()).rejects.toThrow(ApiError);
      await expect(event.removeMember()).rejects.toMatchObject({
        statusCode: 400,
        message: "ID del miembro no especificado."
      });
    });

    test('debe eliminar miembro correctamente', async () => {
      const deleteMock = jest.fn().mockResolvedValue({});
      const docMock = jest.fn().mockReturnValue({ delete: deleteMock });
      db.collection.mockReturnValue({ doc: docMock });
      
      const event = new EventModel({ id: 'event-id' });
      await event.removeMember('member-id');
      
      expect(db.collection).toHaveBeenCalledWith('EventMember');
      expect(docMock).toHaveBeenCalledWith('event-id_member-id');
      expect(deleteMock).toHaveBeenCalled();
    });
  });

  describe('getEventMembers', () => {
    test('debe lanzar error si no hay id del evento', async () => {
      await expect(EventModel.getEventMembers()).rejects.toThrow(ApiError);
      await expect(EventModel.getEventMembers()).rejects.toMatchObject({
        statusCode: 400,
        message: "ID del evento no especificado."
      });
    });

    test('debe obtener miembros correctamente', async () => {
      const docs = [
        { data: () => ({ memberId: 'member1' }) },
        { data: () => ({ memberId: 'member2' }) }
      ];
      
      const getMock = jest.fn().mockResolvedValue({ docs });
      const whereMock = jest.fn().mockReturnValue({ get: getMock });
      db.collection.mockReturnValue({ where: whereMock });
      
      const memberIds = await EventModel.getEventMembers('event-id');
      
      expect(db.collection).toHaveBeenCalledWith('EventMember');
      expect(whereMock).toHaveBeenCalledWith('eventId', '==', 'event-id');
      expect(memberIds).toEqual(['member1', 'member2']);
    });
  });
});


