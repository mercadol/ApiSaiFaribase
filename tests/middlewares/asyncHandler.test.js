// tests/middlewares/asyncHandler.test.js
const asyncHandler = require('../../middlewares/asyncHandler');

describe('asyncHandler middleware', () => {
  test('debe ejecutar correctamente una función asíncrona exitosa', async () => {
    const mockReq = {};
    const mockRes = {};
    const mockNext = jest.fn();
    
    const mockFn = jest.fn().mockResolvedValue('resultado');
    const handler = asyncHandler(mockFn);
    
    await handler(mockReq, mockRes, mockNext);
    
    expect(mockFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
    expect(mockNext).not.toHaveBeenCalled();
  });
  
  test('debe pasar los errores a next()', async () => {
    const mockReq = {};
    const mockRes = {};
    const mockNext = jest.fn();
    const mockError = new Error('Error de prueba');
    
    const mockFn = jest.fn().mockRejectedValue(mockError);
    const handler = asyncHandler(mockFn);
    
    await handler(mockReq, mockRes, mockNext);
    
    expect(mockFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledWith(mockError);
  });
  
  test('debe lanzar TypeError si no recibe una función', () => {
    expect(() => asyncHandler('no-es-función')).toThrow(TypeError);
    expect(() => asyncHandler(null)).toThrow(TypeError);
    expect(() => asyncHandler(undefined)).toThrow(TypeError);
    expect(() => asyncHandler(123)).toThrow(TypeError);
  });
});
