// tests/models/MemberModel.test.js
"use strict";

const { db } = require('../../firebase');
const MemberModel = require('../../models/MemberModel');
const ApiError = require('../../utils/ApiError');

// Mock de Firebase
jest.mock('../../firebase', () => ({
  db: {
    collection: jest.fn(),
  }
}));

describe('MemberModel', () => {
  // Reiniciar mocks antes de cada prueba
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('debe crear objeto con propiedades por defecto', () => {
      const member = new MemberModel({});
      expect(member.id).toBeNull();
      expect(member.Nombre).toBe('');
      expect(member.Email).toBe('');
      expect(member.EstadoCivil).toBe('');
      expect(member.TipoMiembro).toBe('Visitante');
      expect(member.Oficio).toBe('');
      expect(member.FechaRegistro).toBeInstanceOf(Date);
    });

    test('debe crear objeto con propiedades especificadas', () => {
      const data = {
        id: 'test-id',
        Nombre: 'Test User',
        Email: 'test@example.com',
        EstadoCivil: 'Soltero',
        TipoMiembro: 'Miembro',
        Oficio: 'Desarrollador',
        FechaRegistro: new Date('2023-01-01')
      };
      const member = new MemberModel(data);
      expect(member.id).toBe('test-id');
      expect(member.Nombre).toBe('Test User');
      expect(member.Email).toBe('test@example.com');
      expect(member.EstadoCivil).toBe('Soltero');
      expect(member.TipoMiembro).toBe('Miembro');
      expect(member.Oficio).toBe('Desarrollador');
      expect(member.FechaRegistro).toEqual(new Date('2023-01-01'));
    });
  });

  describe('save', () => {
    test('debe crear nuevo documento si no hay id', async () => {
      const addMock = jest.fn().mockResolvedValue({ id: 'new-id' });
      const collectionMock = jest.fn().mockReturnValue({ add: addMock });
      db.collection.mockReturnValue({ add: addMock });
      
      const member = new MemberModel({
        Nombre: 'Test User',
        Email: 'test@example.com'
      });
      
      await member.save();
      
      expect(db.collection).toHaveBeenCalledWith('Member');
      expect(addMock).toHaveBeenCalledWith({
        Nombre: 'Test User',
        Email: 'test@example.com',
        EstadoCivil: '',
        TipoMiembro: 'Visitante',
        Oficio: '',
        FechaRegistro: expect.any(Date)
      });
      expect(member.id).toBe('new-id');
    });

    test('debe actualizar documento existente si hay id', async () => {
      const updateMock = jest.fn().mockResolvedValue({});
      const docMock = jest.fn().mockReturnValue({ update: updateMock });
      db.collection.mockReturnValue({ doc: docMock });
      
      const member = new MemberModel({
        id: 'existing-id',
        Nombre: 'Test User',
        Email: 'test@example.com'
      });
      
      await member.save();
      
      expect(db.collection).toHaveBeenCalledWith('Member');
      expect(docMock).toHaveBeenCalledWith('existing-id');
      expect(updateMock).toHaveBeenCalledWith({
        Nombre: 'Test User',
        Email: 'test@example.com',
        EstadoCivil: '',
        TipoMiembro: 'Visitante',
        Oficio: '',
        FechaRegistro: expect.any(Date)
      });
    });

    test('debe capturar y relanzar error de Firestore', async () => {
      db.collection.mockImplementation(() => {
        throw new Error('Firebase error');
      });
      
      const member = new MemberModel({ Nombre: 'Test User' });
      
      await expect(member.save()).rejects.toThrow(ApiError);
      await expect(member.save()).rejects.toMatchObject({
        statusCode: 500,
        message: "Error al guardar el miembro. Inténtelo más tarde: Firebase error"
      });
    });
  });

  describe('delete', () => {
    test('debe lanzar error si no hay id', async () => {
      const member = new MemberModel({});
      
      await expect(member.delete()).rejects.toThrow(ApiError);
      await expect(member.delete()).rejects.toMatchObject({
        statusCode: 400,
        message: "ID del miembro no especificado."
      });
    });

    test('debe eliminar documento correctamente', async () => {
      const deleteMock = jest.fn().mockResolvedValue({});
      const docMock = jest.fn().mockReturnValue({ delete: deleteMock });
      db.collection.mockReturnValue({ doc: docMock });
      
      const member = new MemberModel({ id: 'test-id' });
      await member.delete();
      
      expect(db.collection).toHaveBeenCalledWith('Member');
      expect(docMock).toHaveBeenCalledWith('test-id');
      expect(deleteMock).toHaveBeenCalled();
    });

    test('debe capturar y relanzar error de Firestore', async () => {
      const deleteMock = jest.fn().mockRejectedValue(new Error('Firebase error'));
      const docMock = jest.fn().mockReturnValue({ delete: deleteMock });
      db.collection.mockReturnValue({ doc: docMock });
      
      const member = new MemberModel({ id: 'test-id' });
      
      await expect(member.delete()).rejects.toThrow(ApiError);
      await expect(member.delete()).rejects.toMatchObject({
        statusCode: 500,
        message: "Error al eliminar el miembro. Inténtelo más tarde: Firebase error"
      });
    });
  });

  describe('findById', () => {
    test('debe encontrar miembro por id', async () => {
      const getMock = jest.fn().mockResolvedValue({
        exists: true,
        id: 'test-id',
        data: () => ({
          Nombre: 'Test User',
          email: 'test@example.com',
          estadoCivil: 'Soltero',
          TipoMiembro: 'Miembro',
          oficio: 'Desarrollador',
          fechaRegistro: new Date('2023-01-01')
        })
      });
      const docMock = jest.fn().mockReturnValue({ get: getMock });
      db.collection.mockReturnValue({ doc: docMock });
      
      const member = await MemberModel.findById('test-id');
      
      expect(db.collection).toHaveBeenCalledWith('Member');
      expect(docMock).toHaveBeenCalledWith('test-id');
      expect(member).toBeInstanceOf(MemberModel);
      expect(member.id).toBe('test-id');
      expect(member.Nombre).toBe('Test User');
    });

    test('debe lanzar error si el miembro no existe', async () => {
      // Modificando para usar la misma lógica que en UserModel
      const getMock = jest.fn().mockResolvedValue({
        exists: false
      });
      const docMock = jest.fn().mockReturnValue({ get: getMock });
      db.collection.mockReturnValue({ doc: docMock });
      
      try {
        await MemberModel.findById('no-existe');
        // Si llega aquí, la prueba falla
        fail('Debería haber lanzado un error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe('Miembro no encontrado.');
      }
    });

    test('debe capturar otros errores como 500', async () => {
      const getMock = jest.fn().mockRejectedValue(new Error('Firebase error'));
      const docMock = jest.fn().mockReturnValue({ get: getMock });
      db.collection.mockReturnValue({ doc: docMock });
      
      await expect(MemberModel.findById('test-id')).rejects.toThrow(ApiError);
      await expect(MemberModel.findById('test-id')).rejects.toMatchObject({
        statusCode: 500,
        message: "Error al buscar el miembro. Inténtelo más tarde: Firebase error"
      });
    });
  });

  describe('findAll', () => {
    test('debe encontrar todos los miembros (primera página)', async () => {
      const docs = [
        {
          id: 'id1',
          data: () => ({ Nombre: 'User 1', email: 'user1@example.com' })
        },
        {
          id: 'id2',
          data: () => ({ Nombre: 'User 2', email: 'user2@example.com' })
        }
      ];
      
      const getMock = jest.fn().mockResolvedValue({ docs });
      const limitMock = jest.fn().mockReturnValue({ get: getMock });
      const orderByMock = jest.fn().mockReturnValue({ limit: limitMock });
      db.collection.mockReturnValue({ orderBy: orderByMock });
      
      const members = await MemberModel.findAll();
      
      expect(db.collection).toHaveBeenCalledWith('Member');
      expect(orderByMock).toHaveBeenCalledWith('Nombre');
      expect(limitMock).toHaveBeenCalledWith(10);
      expect(members).toHaveLength(2);
      expect(members[0]).toBeInstanceOf(MemberModel);
      expect(members[0].id).toBe('id1');
      expect(members[1].id).toBe('id2');
    });

    test('debe encontrar miembros con paginación', async () => {
      // Mock para startAfterDoc
      const startAfterDocGetMock = jest.fn().mockResolvedValue({
        exists: true,
        id: 'start-id',
        data: () => ({ Nombre: 'Start User' })
      });
      const startAfterDocMock = jest.fn().mockReturnValue({ 
        get: startAfterDocGetMock 
      });
      
      // Mock para la consulta paginada
      const docs = [
        {
          id: 'id3',
          data: () => ({ Nombre: 'User 3', email: 'user3@example.com' })
        }
      ];
      
      const getMock = jest.fn().mockResolvedValue({ docs });
      const startAfterMock = jest.fn().mockReturnValue({ get: getMock });
      const limitMock = jest.fn().mockReturnValue({ startAfter: startAfterMock });
      const orderByMock = jest.fn().mockReturnValue({ limit: limitMock });
      
      // Configurar los mocks
      db.collection.mockImplementation((Nombre) => {
        if (Nombre === 'Member') {
          return { 
            orderBy: orderByMock,
            doc: startAfterDocMock 
          };
        }
      });
      
      const members = await MemberModel.findAll('start-id', 5);
      
      expect(db.collection).toHaveBeenCalledWith('Member');
      expect(startAfterDocMock).toHaveBeenCalledWith('start-id');
      expect(orderByMock).toHaveBeenCalledWith('Nombre');
      expect(limitMock).toHaveBeenCalledWith(5);
      expect(startAfterMock).toHaveBeenCalled();
      expect(members).toHaveLength(1);
      expect(members[0].id).toBe('id3');
    });

    test('debe manejar startAfterId inexistente', async () => {
      // Mock para startAfterDoc que no existe
      const startAfterDocGetMock = jest.fn().mockResolvedValue({
        exists: false
      });
      const startAfterDocMock = jest.fn().mockReturnValue({ 
        get: startAfterDocGetMock 
      });
      
      // Mock para la consulta sin startAfter
      const docs = [
        {
          id: 'id1',
          data: () => ({ Nombre: 'User 1', email: 'user1@example.com' })
        }
      ];
      
      const getMock = jest.fn().mockResolvedValue({ docs });
      const limitMock = jest.fn().mockReturnValue({ get: getMock });
      const orderByMock = jest.fn().mockReturnValue({ limit: limitMock });
      
      // Configurar los mocks
      db.collection.mockImplementation((Nombre) => {
        if (Nombre === 'Member') {
          return { 
            orderBy: orderByMock,
            doc: startAfterDocMock 
          };
        }
      });
      
      const members = await MemberModel.findAll('invalid-id');
      
      expect(db.collection).toHaveBeenCalledWith('Member');
      expect(startAfterDocMock).toHaveBeenCalledWith('invalid-id');
      // Debería ignorar el startAfter y realizar una consulta normal
      expect(limitMock).toHaveBeenCalledWith(10);
      expect(members).toHaveLength(1);
    });

    test('debe capturar y relanzar error de Firestore', async () => {
      db.collection.mockImplementation(() => {
        throw new Error('Firebase error');
      });
      
      await expect(MemberModel.findAll()).rejects.toThrow(ApiError);
      await expect(MemberModel.findAll()).rejects.toMatchObject({
        statusCode: 500,
        message: "Error al buscar miembros. Inténtelo más tarde: Firebase error"
      });
    });
  });
});
