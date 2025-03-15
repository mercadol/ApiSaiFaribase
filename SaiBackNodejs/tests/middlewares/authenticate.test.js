// test/middlewares/authenticate.test.js
const authenticate = require('../../middlewares/authenticate');
const { auth } = require('../../firebase');

// Mock de firebase
jest.mock('../../firebase', () => ({
  auth: {
    verifyIdToken: jest.fn(),
    getUser: jest.fn()
  }
}));

describe('Middleware authenticate', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {
        authorization: 'Bearer valid-token-123'
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('debe permitir acceso con token válido', async () => {
    const mockUser = { uid: 'user123', email: 'user@example.com' };
    
    // Configura los mocks para simular autenticación exitosa
    auth.verifyIdToken.mockResolvedValueOnce({ uid: 'user123' });
    auth.getUser.mockResolvedValueOnce(mockUser);

    await authenticate(req, res, next);

    expect(auth.verifyIdToken).toHaveBeenCalledWith('valid-token-123');
    expect(auth.getUser).toHaveBeenCalledWith('user123');
    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('debe rechazar solicitud sin token', async () => {
    // Simula solicitud sin token
    req.headers.authorization = undefined;

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No se proporcionó token' });
    expect(next).not.toHaveBeenCalled();
  });

  test('debe rechazar solicitud con formato de token inválido', async () => {
    // Token sin formato Bearer
    req.headers.authorization = 'invalid-format';

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No se proporcionó token' });
    expect(next).not.toHaveBeenCalled();
  });

  test('debe rechazar token inválido', async () => {
    // Simula token que Firebase rechaza
    auth.verifyIdToken.mockRejectedValueOnce(new Error('Token inválido'));

    await authenticate(req, res, next);

    expect(auth.verifyIdToken).toHaveBeenCalledWith('valid-token-123');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token no válido' });
    expect(next).not.toHaveBeenCalled();
  });

  test('debe manejar error al obtener información del usuario', async () => {
    // Simula éxito al verificar token pero fallo al obtener usuario
    auth.verifyIdToken.mockResolvedValueOnce({ uid: 'user123' });
    auth.getUser.mockRejectedValueOnce(new Error('Usuario no encontrado'));

    await authenticate(req, res, next);

    expect(auth.verifyIdToken).toHaveBeenCalledWith('valid-token-123');
    expect(auth.getUser).toHaveBeenCalledWith('user123');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token no válido' });
    expect(next).not.toHaveBeenCalled();
  });
});
