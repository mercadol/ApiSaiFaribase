const userController = require('../../controllers/userController');
const userService = require('../../services/userService');

jest.mock('../../services/userService');

describe('userController', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      body: {},
      headers: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn()
    };
  });

  describe('createUser', () => {
    const validData = {
      email: 'test@example.com',
      password: 'Test123'
    };

    it('debe crear usuario exitosamente', async () => {
      mockReq.body = validData;
      userService.createUserWithEmailAndPassword.mockResolvedValue({ uid: '123', email: validData.email });

      await userController.createUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        uid: '123',
        email: validData.email
      }));
    });

    it('debe validar email requerido', async () => {
      mockReq.body = { password: 'Test123' };

      await userController.createUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Email y contraseña son requeridos'
      });
    });

    it('debe validar email formato', async () => {
      mockReq.body = { ...validData, email: 'invalid' };

      await userController.createUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Email no válido'
      });
    });
  });

  describe('signIn', () => {
    it('debe autenticar exitosamente', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'Test123'
      };
      userService.signInWithEmailAndPassword.mockResolvedValue({ uid: '123' });

      await userController.signIn(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        uid: '123'
      }));
    });
  });

  describe('signInAnonymously', () => {
    it('debe crear sesión anónima', async () => {
      userService.signInAnonymously.mockResolvedValue({ uid: 'anon123' });

      await userController.signInAnonymously(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        uid: 'anon123'
      }));
    });
  });

  describe('signOut', () => {
    it('debe cerrar sesión exitosamente', async () => {
      await userController.signOut(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.end).toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('debe obtener usuario actual', async () => {
      userService.getCurrentUser.mockResolvedValue({ uid: '123' });

      await userController.getCurrentUser(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        uid: '123'
      }));
    });
  });
});
