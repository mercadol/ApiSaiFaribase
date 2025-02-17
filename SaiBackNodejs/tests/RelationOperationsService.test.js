"use strict";

// Mocks para Firestore
const RelationOperationsService = require('../services/RelationOperationsService');
const ApiError = require('../utils/ApiError');

// Mock de Firebase
jest.mock('../firebase', () => ({
  db: {
    collection: jest.fn()
  }
}));

describe('RelationOperationsService', () => {
  let service;
  let mockCollection;
  let mockDoc;
  
  beforeEach(() => {
    // Configuración de mocks
    mockDoc = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn()
    };
    
    mockCollection = {
      doc: jest.fn().mockReturnValue(mockDoc),
      id: 'testCollection'
    };
    
    require('../firebase').db.collection.mockReturnValue(mockCollection);
    
    service = new RelationOperationsService('testCollection');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('debe lanzar error si no se proporciona nombre de colección', () => {
      expect(() => new RelationOperationsService()).toThrow(ApiError);
      expect(() => new RelationOperationsService()).toThrow('INVALID_COLLECTION');
    });

    test('debe crear instancia correctamente con nombre de colección válido', () => {
      expect(service.collection).toBeDefined();
      expect(service.collection).toBe(mockCollection);
    });
  });

  describe('validateExists', () => {
    test('debe validar documento existente', async () => {
      mockDoc.get.mockResolvedValue({ exists: true });
      await expect(service.validateExists('testId')).resolves.toEqual({ exists: true });
    });

    test('debe lanzar error si documento no existe', async () => {
      mockDoc.get.mockResolvedValue({ exists: false });
      await expect(service.validateExists('testId')).rejects.toThrow(ApiError);
    });
  });

  describe('addRelation', () => {
    test('debe crear relación exitosamente', async () => {
      const data = { extra: 'data' };
      mockDoc.set.mockResolvedValue(undefined);

      const result = await service.addRelation('from1', 'to1', data);
      
      expect(result).toEqual({
        id: 'from1_to1',
        fromId: 'from1',
        toId: 'to1',
        extra: 'data'
      });
      expect(mockDoc.set).toHaveBeenCalledWith({
        fromId: 'from1',
        toId: 'to1',
        extra: 'data'
      });
    });

    test('debe lanzar error si faltan IDs', async () => {
      await expect(service.addRelation()).rejects.toThrow('Both fromId and toId are required');
    });

    test('debe manejar error de Firebase', async () => {
      mockDoc.set.mockRejectedValue(new Error('Firebase error'));
      await expect(service.addRelation('from1', 'to1')).rejects.toThrow(ApiError);
    });
  });

  describe('removeRelation', () => {
    test('debe eliminar relación exitosamente', async () => {
      mockDoc.get.mockResolvedValue({ exists: true });
      mockDoc.delete.mockResolvedValue(true);

      const result = await service.removeRelation('from1', 'to1');
      expect(result).toBe(true);
    });

    test('debe lanzar error si la relación no existe', async () => {
      mockDoc.get.mockResolvedValue({ exists: false });
      await expect(service.removeRelation('from1', 'to1')).rejects.toThrow(ApiError);
    });

    test('debe manejar error de Firebase en eliminación', async () => {
      mockDoc.get.mockResolvedValue({ exists: true });
      mockDoc.delete.mockRejectedValue(new Error('Firebase error'));
      await expect(service.removeRelation('from1', 'to1')).rejects.toThrow(ApiError);
    });
  });

  describe('_handleError', () => {
    test('debe manejar ApiError correctamente', () => {
      const apiError = new ApiError(400, 'Test error');
      expect(service._handleError(apiError)).toBe(apiError);
    });

    test('debe convertir errores normales a ApiError', () => {
      const error = { type: 'NOT_FOUND', message: 'Test message' };
      const result = service._handleError(error);
      expect(result).toBeInstanceOf(ApiError);
      expect(result.statusCode).toBe(404);
    });
  });
});
