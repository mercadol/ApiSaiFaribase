
// tests/middlewares/errorHandler.test.js
const errorHandler = require('../../middlewares/errorHandler');
const ApiError = require('../../utils/ApiError');
const logger = require('../../utils/logger');

// Mock del logger
jest.mock('../../utils/logger', () => ({
  error: jest.fn()
}));

describe('errorHandler middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;
  
  beforeEach(() => {
    mockReq = {
      path: '/test',
      method: 'GET',
      ip: '127.0.0.1'
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    mockNext = jest.fn();
    
    // Guarda y restaura NODE_ENV entre tests
    process.env.NODE_ENV_ORIGINAL = process.env.NODE_ENV;
  });
  
  afterEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = process.env.NODE_ENV_ORIGINAL;
  });
  
  test('debe manejar ApiError con el código de estado correcto', () => {
    const apiError = new ApiError(400, 'Error de validación');
    
    errorHandler(apiError, mockReq, mockRes, mockNext);
    
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Error de validación',
      stack: expect.any(String)
    });
    expect(logger.error).toHaveBeenCalled();
  });
  
  test('debe manejar errores genéricos con código 500', () => {
    const genericError = new Error('Error interno');
    
    errorHandler(genericError, mockReq, mockRes, mockNext);
    
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Ocurrió un error inesperado en el servidor.',
      stack: expect.any(String)
    });
    expect(logger.error).toHaveBeenCalled();
  });
  
  test('no debe exponer stack trace en producción', () => {
    process.env.NODE_ENV = 'production';
    const error = new Error('Error en producción');
    
    errorHandler(error, mockReq, mockRes, mockNext);
    
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Ocurrió un error inesperado en el servidor.'
    });
    expect(mockRes.json.mock.calls[0][0]).not.toHaveProperty('stack');
  });
  
  test('debe exponer mensajes de ApiError incluso en producción', () => {
    process.env.NODE_ENV = 'production';
    const apiError = new ApiError(403, 'Acceso denegado');
    
    errorHandler(apiError, mockReq, mockRes, mockNext);
    
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Acceso denegado'
    });
  });
});
