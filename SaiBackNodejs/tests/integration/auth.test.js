// tests/integration/auth.test.js
const request = require('supertest');
const app = require('../../app');
const { auth } = require('../../firebase');

// Mock de la clase UserModel
jest.mock('../../models/UserModel', () => {
  return function() {
    return {
      save: jest.fn().mockResolvedValue(true)
    };
  };
});

// Mock de Firebase Auth
jest.mock('../../firebase', () => {
  const mockAuth = {
    createUserWithEmailAndPassword: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signInAnonymously: jest.fn(),
    signOut: jest.fn(),
    verifyIdToken: jest.fn()
  };

  return { 
    auth: mockAuth,
    db: {
      collection: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      set: jest.fn().mockResolvedValue(true)
    }
  };
});

describe('Rutas de Autenticación', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/signup', () => {
    test('debe crear un usuario con credenciales válidas', async () => {
      // Mock de respuesta de Firebase
      const mockUser = { uid: 'user125', email: 'test1@example.com' };
      auth.createUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });
    
      try {
        const response = await request(app)
          .post('/api/auth/signup')
          .send({
            email: 'test1@example.com',
            password: 'password125'
          });
        
        expect(response.status).toBe(201);
        expect(response.body).toEqual(mockUser);
        expect(auth.createUserWithEmailAndPassword).toHaveBeenCalledWith('test1@example.com', 'password125');
      } catch (error) {
          console.error('Error en la prueba:', error);
        throw error;
      }
    });

    test('debe rechazar email inválido', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'invalid-email',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Email no válido');
      expect(auth.createUserWithEmailAndPassword).not.toHaveBeenCalled();
    });

    test('debe rechazar contraseña demasiado corta', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: '12345'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Contraseña debe tener al menos 6 caracteres');
      expect(auth.createUserWithEmailAndPassword).not.toHaveBeenCalled();
    });

    test('debe manejar errores de Firebase', async () => {
      auth.createUserWithEmailAndPassword.mockRejectedValue(
        new Error('Email already in use')
      );

      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toContain('Email already in use');
    });
  });

  describe('POST /api/auth/signin', () => {
    test('debe iniciar sesión con credenciales válidas', async () => {
      const mockUser = { uid: 'user123', email: 'test@example.com', token: 'mock-token' };
      auth.signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });

      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
      expect(auth.signInWithEmailAndPassword).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    test('debe rechazar credenciales inválidas', async () => {
      auth.signInWithEmailAndPassword.mockRejectedValue(
        new Error('Invalid credentials')
      );

      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'test@example.com',
          password: 'wrong-password'
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toContain('Invalid credentials');
    });
  });

  describe('POST /api/auth/signin/anonymous', () => {
    test('debe iniciar sesión anónima correctamente', async () => {
      const mockUser = { uid: 'anon123', isAnonymous: true };
      auth.signInAnonymously.mockResolvedValue({ user: mockUser });

      const response = await request(app)
        .post('/api/auth/signin/anonymous');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
      expect(auth.signInAnonymously).toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/signout', () => {
    test('debe cerrar sesión correctamente', async () => {
      auth.signOut.mockResolvedValue();

      const response = await request(app)
        .post('/api/auth/signout');

      expect(response.status).toBe(204);
      expect(auth.signOut).toHaveBeenCalled();
    });
  });
});
