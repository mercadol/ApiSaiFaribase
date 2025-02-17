"use strict";

const userService = require('../services/userService');

// Mocks
jest.mock('../firebase', () => ({
  auth: {
    createUserWithEmailAndPassword: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signInAnonymously: jest.fn(),
    signOut: jest.fn(),
    verifyIdToken: jest.fn(),
    getUser: jest.fn(),
  },
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        set: jest.fn()
      }))
    }))
  }
}));

describe('userService', () => {
  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUserWithEmailAndPassword', () => {
    it('debe crear usuario y guardar en Firestore', async () => {
      const { auth, db } = require('../firebase');
      auth.createUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });

      const result = await userService.createUserWithEmailAndPassword('test@example.com', 'password123');

      expect(auth.createUserWithEmailAndPassword).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(db.collection).toHaveBeenCalledWith('users');
      expect(result).toEqual(mockUser);
    });

    it('debe propagar error de autenticación', async () => {
      const { auth } = require('../firebase');
      const error = new Error('Auth error');
      auth.createUserWithEmailAndPassword.mockRejectedValue(error);

      await expect(
        userService.createUserWithEmailAndPassword('test@example.com', 'password123')
      ).rejects.toThrow('Auth error');
    });
  });

  describe('signInWithEmailAndPassword', () => {
    it('debe iniciar sesión exitosamente', async () => {
      const { auth } = require('../firebase');
      auth.signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });

      const result = await userService.signInWithEmailAndPassword('test@example.com', 'password123');

      expect(auth.signInWithEmailAndPassword).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(result).toEqual(mockUser);
    });
  });

  describe('signInAnonymously', () => {
    it('debe crear sesión anónima', async () => {
      const { auth } = require('../firebase');
      auth.signInAnonymously.mockResolvedValue({ user: { uid: 'anon-uid' } });

      const result = await userService.signInAnonymously();

      expect(auth.signInAnonymously).toHaveBeenCalled();
      expect(result).toEqual({ uid: 'anon-uid' });
    });
  });

  describe('signOut', () => {
    it('debe cerrar sesión exitosamente', async () => {
      const { auth } = require('../firebase');
      
      await userService.signOut();

      expect(auth.signOut).toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('debe obtener usuario actual con token válido', async () => {
      const { auth } = require('../firebase');
      const token = 'valid-token';
      const req = { headers: { authorization: `Bearer ${token}` } };

      auth.verifyIdToken.mockResolvedValue({ uid: mockUser.uid });
      auth.getUser.mockResolvedValue(mockUser);

      const result = await userService.getCurrentUser(req);

      expect(auth.verifyIdToken).toHaveBeenCalledWith(token);
      expect(auth.getUser).toHaveBeenCalledWith(mockUser.uid);
      expect(result).toEqual(mockUser);
    });

    it('debe rechazar petición sin token', async () => {
      const req = { headers: {} };

      await expect(
        userService.getCurrentUser(req)
      ).rejects.toThrow('Token no proporcionado');
    });
  });
});
