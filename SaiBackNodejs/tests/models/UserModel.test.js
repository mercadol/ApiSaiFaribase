// tests/models/UserModel.test.js
"use strict";

const { db, auth } = require('../../firebase');
const UserModel = require('../../models/UserModel');
const ApiError = require('../../utils/ApiError');

// Mock de Firebase
jest.mock('../../firebase', () => ({
  db: {
    collection: jest.fn(),
  },
  auth: {
    verifyIdToken: jest.fn(),
    getUser: jest.fn(),
  }
}));

describe('UserModel', () => {
  // Reiniciar mocks antes de cada prueba
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('debe crear un objeto UserModel con propiedades por defecto', () => {
      const user = new UserModel({});
      expect(user.uid).toBeNull();
      expect(user.email).toBe('');
    });

    test('debe crear un objeto UserModel con propiedades especificadas', () => {
      const user = new UserModel({ uid: 'test-uid', email: 'test@example.com' });
      expect(user.uid).toBe('test-uid');
      expect(user.email).toBe('test@example.com');
    });
  });

  describe('save', () => {
    test('debe lanzar error si no hay uid', async () => {
      const user = new UserModel({});
      await expect(user.save()).rejects.toThrow(ApiError);
      await expect(user.save()).rejects.toMatchObject({
        statusCode: 400,
        message: "UID del usuario no especificado."
      });
    });

    test('debe guardar el usuario correctamente en Firestore', async () => {
      // Mock para el método set de Firestore
      const setMock = jest.fn().mockResolvedValue(true);
      const docMock = jest.fn().mockReturnValue({ set: setMock });
      const collectionMock = jest.fn().mockReturnValue({ doc: docMock });
      
      db.collection.mockReturnValue({ doc: docMock });
      
      const user = new UserModel({ uid: 'test-uid', email: 'test@example.com' });
      await user.save();
      
      expect(db.collection).toHaveBeenCalledWith('users');
      expect(docMock).toHaveBeenCalledWith('test-uid');
      expect(setMock).toHaveBeenCalledWith({
        email: 'test@example.com'
      });
    });

    test('debe capturar y relanzar error de Firestore', async () => {
      // Mock para simular un error en Firestore
      const setMock = jest.fn().mockRejectedValue(new Error('Firebase error'));
      const docMock = jest.fn().mockReturnValue({ set: setMock });
      db.collection.mockReturnValue({ doc: docMock });
      
      const user = new UserModel({ uid: 'test-uid', email: 'test@example.com' });
      
      await expect(user.save()).rejects.toThrow(ApiError);
      await expect(user.save()).rejects.toMatchObject({
        statusCode: 500,
        message: "Error al guardar el usuario. Inténtelo más tarde."
      });
    });
  });

  describe('findByUid', () => {
    test('debe encontrar un usuario por uid', async () => {
      // Mock para el método get de Firestore
      const getMock = jest.fn().mockResolvedValue({
        exists: true,
        id: 'test-uid',
        data: () => ({ email: 'test@example.com' })
      });
      const docMock = jest.fn().mockReturnValue({ get: getMock });
      db.collection.mockReturnValue({ doc: docMock });
      
      const user = await UserModel.findByUid('test-uid');
      
      expect(db.collection).toHaveBeenCalledWith('users');
      expect(docMock).toHaveBeenCalledWith('test-uid');
      expect(user).toBeInstanceOf(UserModel);
      expect(user.uid).toBe('test-uid');
      expect(user.email).toBe('test@example.com');
    });

    test('debe lanzar error si el usuario no existe', async () => {
      // Mock para el método get cuando no existe el documento
      const getMock = jest.fn().mockResolvedValue({
        exists: false
      });
      const docMock = jest.fn().mockReturnValue({ get: getMock });
      db.collection.mockReturnValue({ doc: docMock });
      
      await expect(UserModel.findByUid('no-existe')).rejects.toThrow(ApiError);
      await expect(UserModel.findByUid('no-existe')).rejects.toMatchObject({
        statusCode: 404,
        message: "Usuario no encontrado."
      });
    });

    test('debe capturar y relanzar error de Firestore', async () => {
      // Mock para simular un error en Firestore
      const getMock = jest.fn().mockRejectedValue(new Error('Firebase error'));
      const docMock = jest.fn().mockReturnValue({ get: getMock });
      db.collection.mockReturnValue({ doc: docMock });
      
      await expect(UserModel.findByUid('test-uid')).rejects.toThrow(ApiError);
      await expect(UserModel.findByUid('test-uid')).rejects.toMatchObject({
        statusCode: 500,
        message: "Error al buscar el usuario. Inténtelo más tarde."
      });
    });
  });

  describe('getCurrentUser', () => {
    test('debe obtener el usuario actual por token', async () => {
      // Mock para auth.verifyIdToken y auth.getUser
      auth.verifyIdToken.mockResolvedValue({ uid: 'test-uid' });
      auth.getUser.mockResolvedValue({ 
        uid: 'test-uid', 
        email: 'test@example.com' 
      });
      
      const user = await UserModel.getCurrentUser('fake-token');
      
      expect(auth.verifyIdToken).toHaveBeenCalledWith('fake-token');
      expect(auth.getUser).toHaveBeenCalledWith('test-uid');
      expect(user).toBeInstanceOf(UserModel);
      expect(user.uid).toBe('test-uid');
      expect(user.email).toBe('test@example.com');
    });

    test('debe capturar y relanzar error de autenticación', async () => {
      // Mock para simular un error en auth
      auth.verifyIdToken.mockRejectedValue(new Error('Auth error'));
      
      await expect(UserModel.getCurrentUser('fake-token')).rejects.toThrow(ApiError);
      await expect(UserModel.getCurrentUser('fake-token')).rejects.toMatchObject({
        statusCode: 500,
        message: "Error al obtener el usuario actual. Inténtelo más tarde."
      });
    });
  });
});
