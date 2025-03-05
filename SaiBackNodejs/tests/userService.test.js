"use strict";

const userService = require('../services/userService');
const UserModel = require('../models/UserModel');

// Mocks
jest.mock('../firebase', () => ({
  auth: {
    createUserWithEmailAndPassword: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signInWithPopup: jest.fn(),
    signInAnonymously: jest.fn(),
    signOut: jest.fn(),
    GoogleAuthProvider: jest.fn(),
  },
  firebase: {
    auth: {
      GoogleAuthProvider: jest.fn()
    }
  }
}));

jest.mock('../models/UserModel');

describe('userService', () => {
  const mockUser = { uid: 'test-uid', email: 'test@example.com' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Existing tests for createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  // signInAnonymously, and signOut methods...

  describe('signInWithGoogle', () => {
    it('debe iniciar sesión con Google exitosamente', async () => {
      const firebase = require('../firebase');
      const { auth } = require('../firebase');
      
      const mockGoogleProvider = {};
      firebase.auth.GoogleAuthProvider.mockReturnValue(mockGoogleProvider);
      auth.signInWithPopup.mockResolvedValue({ user: mockUser });

      const result = await userService.signInWithGoogle();
      
      expect(firebase.auth.GoogleAuthProvider).toHaveBeenCalled();
      expect(auth.signInWithPopup).toHaveBeenCalledWith(mockGoogleProvider);
      expect(result).toEqual(mockUser);
    });

    it('debe manejar error en inicio de sesión con Google', async () => {
      const firebase = require('../firebase');
      const { auth } = require('../firebase');
      const error = new Error('Google Sign-in Error');
      
      firebase.auth.GoogleAuthProvider.mockReturnValue({});
      auth.signInWithPopup.mockRejectedValue(error);

      await expect(userService.signInWithGoogle()).rejects.toThrow('Google Sign-in Error');
    });
  });

  describe('getCurrentUser', () => {
    it('debe obtener usuario actual con token válido', async () => {
      const token = 'valid-token';
      const req = { headers: { authorization: `Bearer ${token}` } };
      
      UserModel.getCurrentUser = jest.fn().mockResolvedValue(mockUser);

      const result = await userService.getCurrentUser(req);
      
      expect(UserModel.getCurrentUser).toHaveBeenCalledWith(token);
      expect(result).toEqual(mockUser);
    });

    it('debe rechazar petición sin token', async () => {
      const req = { headers: {} };

      await expect(userService.getCurrentUser(req)).rejects.toThrow('Token no proporcionado');
    });
  });

  describe('getUserByUid', () => {
    it('debe obtener información de usuario por UID', async () => {
      const uid = 'test-uid';
      UserModel.findByUid = jest.fn().mockResolvedValue(mockUser);

      const result = await userService.getUserByUid(uid);
      
      expect(UserModel.findByUid).toHaveBeenCalledWith(uid);
      expect(result).toEqual(mockUser);
    });

    it('debe manejar caso de usuario no encontrado', async () => {
      const uid = 'nonexistent-uid';
      UserModel.findByUid = jest.fn().mockResolvedValue(null);

      const result = await userService.getUserByUid(uid);
      
      expect(UserModel.findByUid).toHaveBeenCalledWith(uid);
      expect(result).toBeNull();
    });
  });
});
