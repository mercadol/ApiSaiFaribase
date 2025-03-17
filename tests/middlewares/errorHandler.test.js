
// tests/middlewares/errorHandler.test.js
const errorHandler = require('../../middlewares/errorHandler');
const ApiError = require('../../utils/ApiError');

describe('Middleware errorHandler', () => {
  let req, res, next;
  const originalEnv = process.env.NODE_ENV;
  
  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    // Mock para console.error
    console.error = jest.fn();
  });
  
  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    jest.clearAllMocks();
  });
  
  test('debe manejar instancia de ApiError con el código y mensaje correctos', () => {
    const error = new ApiError(400, 'Datos inválidos');
    
    errorHandler(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: 'Datos inválidos'
    }));
    expect(console.error).toHaveBeenCalled();
  });
  
  test('debe usar código 500 para errores estándar', () => {
    const error = new Error('Error interno');
    
    errorHandler(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: 'Error interno'
    }));
  });
  
  test('debe incluir stack trace en entorno no productivo', () => {
    process.env.NODE_ENV = 'development';
    const error = new Error('Error de prueba');
    error.stack = 'Stack trace simulado';
    
    errorHandler(error, req, res, next);
    
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: 'Error de prueba',
      stack: 'Stack trace simulado'
    }));
  });
  
  test('no debe incluir stack trace en entorno productivo', () => {
    process.env.NODE_ENV = 'production';
    const error = new Error('Error de prueba');
    error.stack = 'Stack trace simulado';
    
    errorHandler(error, req, res, next);
    
    expect(res.json).toHaveBeenCalledWith({
      error: 'Error de prueba'
    });
    expect(res.json).not.toHaveBeenCalledWith(expect.objectContaining({
      stack: expect.anything()
    }));
  });
  
  test('debe usar "Internal Server Error" si no hay mensaje de error', () => {
    const error = new Error();
    error.message = null;
    
    errorHandler(error, req, res, next);
    
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: 'Internal Server Error'
    }));
  });
});
