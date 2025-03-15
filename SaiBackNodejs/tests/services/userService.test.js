"use strict";

const userService = require('../../services/userService');
const UserModel = require('../../models/UserModel');

// Mocks más consistentes
jest.mock('../../firebase', () => {
  // Crear mocks para las funciones de autenticación
  const mockAuth = {
    createUserWithEmailAndPassword: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signInWithPopup: jest.fn(),
    signInAnonymously: jest.fn(),
    signOut: jest.fn()
  };

  // Crear el mock de GoogleAuthProvider
  const GoogleAuthProvider = jest.fn();

  return {
    auth: mockAuth,
    auth: {
      ...mockAuth,
      GoogleAuthProvider
    }
  };
});

jest.mock('../../models/UserModel');

describe('userService', () => {
  const mockUser = { uid: 'test-uid', email: 'test@example.com' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUserWithEmailAndPassword', () => {
    it('debe crear un usuario con correo y contraseña exitosamente', async () => {
      const { auth } = require('../../firebase');
      const email = 'test@example.com';
      const password = 'password123';
      
      // Configuración de mocks
      auth.createUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });
      UserModel.prototype.save = jest.fn().mockResolvedValue(true);

      const result = await userService.createUserWithEmailAndPassword(email, password);
      
      // Verificaciones
      expect(auth.createUserWithEmailAndPassword).toHaveBeenCalledWith(email, password);
      expect(UserModel).toHaveBeenCalledWith({ uid: mockUser.uid, email: mockUser.email });
      expect(UserModel.prototype.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('debe manejar error en la creación de usuario', async () => {
      const { auth } = require('../../firebase');
      const email = 'test@example.com';
      const password = 'password123';
      const error = new Error('Error al crear usuario');
      
      auth.createUserWithEmailAndPassword.mockRejectedValue(error);

      await expect(userService.createUserWithEmailAndPassword(email, password))
        .rejects.toThrow('Error al crear usuario');
    });
  });

  describe('signInWithEmailAndPassword', () => {
    it('debe iniciar sesión con correo y contraseña exitosamente', async () => {
      const { auth } = require('../../firebase');
      const email = 'test@example.com';
      const password = 'password123';
      
      auth.signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });

      const result = await userService.signInWithEmailAndPassword(email, password);
      
      expect(auth.signInWithEmailAndPassword).toHaveBeenCalledWith(email, password);
      expect(result).toEqual(mockUser);
    });

    it('debe manejar error en inicio de sesión', async () => {
      const { auth } = require('../../firebase');
      const email = 'test@example.com';
      const password = 'password123';
      const error = new Error('Credenciales inválidas');
      
      auth.signInWithEmailAndPassword.mockRejectedValue(error);

      await expect(userService.signInWithEmailAndPassword(email, password))
        .rejects.toThrow('Credenciales inválidas');
    });
  });


  describe('signInAnonymously', () => {
    it('debe iniciar sesión anónima exitosamente', async () => {
      const { auth } = require('../../firebase');
      
      auth.signInAnonymously.mockResolvedValue({ user: mockUser });

      const result = await userService.signInAnonymously();
      
      expect(auth.signInAnonymously).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('debe manejar error en inicio de sesión anónima', async () => {
      const { auth } = require('../../firebase');
      const error = new Error('Error en inicio anónimo');
      
      auth.signInAnonymously.mockRejectedValue(error);

      await expect(userService.signInAnonymously()).rejects.toThrow('Error en inicio anónimo');
    });
  });

  describe('signOut', () => {
    it('debe cerrar sesión exitosamente', async () => {
      const { auth } = require('../../firebase');
      
      auth.signOut.mockResolvedValue();

      await userService.signOut();
      
      expect(auth.signOut).toHaveBeenCalled();
    });

    it('debe manejar error al cerrar sesión', async () => {
      const { auth } = require('../../firebase');
      const error = new Error('Error al cerrar sesión');
      
      auth.signOut.mockRejectedValue(error);

      await expect(userService.signOut()).rejects.toThrow('Error al cerrar sesión');
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

    it('debe manejar correctamente autorización sin formato Bearer', async () => {
      const req = { headers: { authorization: 'invalid-format' } };
      
      await expect(userService.getCurrentUser(req)).rejects.toThrow('Token no proporcionado');
    });

    it('debe rechazar petición sin token', async () => {
      const req = { headers: {} };

      await expect(userService.getCurrentUser(req)).rejects.toThrow('Token no proporcionado');
    });

    it('debe rechazar petición sin headers', async () => {
      const req = {};

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
