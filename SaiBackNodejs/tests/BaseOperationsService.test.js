"use strict";

// Firebase mocks
const mockDoc = {
  add: jest.fn(() => Promise.resolve()),
  delete: jest.fn(() => Promise.resolve()),
  update: jest.fn(() => Promise.resolve()),
  get: jest.fn(() => Promise.resolve({ exists: false, id: "testId", data: () => ({ foo: "bar" }) })),
};

const mockCollection = {
  doc: jest.fn(() => mockDoc),
  add: jest.fn(() => Promise.resolve({ id: 'testId' })),
  update: jest.fn(() => Promise.resolve({updateData: {name: 'Updated'}})),
  orderBy: jest.fn(() => mockCollection),
  where: jest.fn(() => mockCollection),
  limit: jest.fn(() => mockCollection),
  startAfter: jest.fn(() => mockCollection),
  get: jest.fn(() => Promise.resolve({ docs: [] })),
};

const mockDb = {
  collection: jest.fn(() => mockCollection)
};

jest.mock("../firebase", () => ({
  db: mockDb
}));

const BaseOperationsService = require('../services/BaseOperationsService');

describe('BaseOperationsService', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BaseOperationsService('TestCollection');
  });

  describe('getAll', () => {
    const mockDocs = [
      { id: 'doc1', data: () => ({ name: 'Test 1' }) },
      { id: 'doc2', data: () => ({ name: 'Test 2' }) }
    ];
  
    it('debe obtener documentos paginados correctamente', async () => {
      mockCollection.get.mockResolvedValueOnce({ docs: mockDocs });
      
      const result = await service.getAll();
      
      expect(mockCollection.orderBy).toHaveBeenCalledWith('name');
      expect(mockCollection.limit).toHaveBeenCalledWith(10);
      expect(result.items).toHaveLength(2);
      expect(result.items[0]).toEqual({ id: 'doc1', name: 'Test 1' });
    });
  
    it('debe manejar la paginación con startAfterId', async () => {
      const startAfterDoc = { id: 'startDoc', data: () => ({ name: 'Start' }) };
      mockCollection.doc().get.mockResolvedValueOnce({ exists: true, ...startAfterDoc });
      mockCollection.get.mockResolvedValueOnce({ docs: mockDocs });
  
      const result = await service.getAll('startDoc', 5);
  
      expect(mockCollection.startAfter).toHaveBeenCalled();
      expect(mockCollection.limit).toHaveBeenCalledWith(5);
    });
  
    it('debe lanzar error en caso de fallo', async () => {
      mockCollection.get.mockRejectedValueOnce(new Error('DB Error'));
  
      await expect(service.getAll())
        .rejects
        .toThrow('Error al recuperar datos. Inténtelo más tarde.');
    });
  });
  
  describe('getById', () => {
    it('debe obtener un documento por ID exitosamente', async () => {
      const mockDoc = {
        exists: true,
        id: 'testId',
        data: () => ({ name: 'Test' })
      };
      mockCollection.doc().get.mockResolvedValueOnce(mockDoc);
  
      const result = await service.getById('testId');
  
      expect(result).toEqual({ id: 'testId', ...mockDoc });
      expect(mockCollection.doc).toHaveBeenCalledWith('testId');
    });
  
    it('debe lanzar error si el documento no existe', async () => {
      mockCollection.doc().get.mockResolvedValueOnce({ exists: false });
  
      await expect(service.getById('nonexistent'))
        .rejects
        .toThrow('Document with ID nonexistent not found');
    });
  
    it('debe manejar errores de Firestore', async () => {
      mockCollection.doc().get.mockRejectedValueOnce(new Error('Firestore error'));
  
      await expect(service.getById('testId'))
        .rejects
        .toThrow('Error retrieving document. Please try again later.');
    });
  });

  describe('create', () => {
    const testData = { name: 'Test' };
    const testId = 'test-id';
    it('debe crear un documento exitosamente y retornar su ID', async () => {
      mockCollection.add.mockResolvedValueOnce({ id: testId });
      
      const result = await service.create(testData);
      
      expect(result).toBe(testId);
      expect(mockCollection.add).toHaveBeenCalledWith(testData);
    });

    it('debe propagar el error cuando el documento ya existe', async () => {
      const error = new Error('Document already exists');
      mockCollection.add.mockRejectedValueOnce(error);
      
      await expect(service.create(testData))
        .rejects
        .toThrow('Document already exists');
    });
  
    it('debe lanzar un error personalizado cuando hay un problema con Firestore', async () => {
      const error = new Error('Firestore connection failed');
      mockCollection.add.mockRejectedValueOnce(error);
      
      await expect(service.create(testData))
        .rejects
        .toThrow('Error retrieving document. Please try again later.');
    });
  
    it('debe propagar errores desconocidos sin modificar', async () => {
      const error = new Error('Unknown error');
      mockCollection.add.mockRejectedValueOnce(error);
      
      await expect(service.create(testData))
        .rejects
        .toThrow('Unknown error');
    });
  });

  describe('update', () => {
    const testId = 'test-id';
    const updateData = { name: 'Updated' };
  
    it('debe actualizar y retornar el documento', async () => {
      mockCollection.doc().update.mockResolvedValueOnce();
      const mockUpdatedDoc = {
        exists: true,
        id: testId,
        data: () => updateData
      };
      mockCollection.doc().get.mockResolvedValueOnce(mockUpdatedDoc);
  
      const result = await service.update(testId, updateData);
      
      expect(mockCollection.doc).toHaveBeenCalledWith(testId);
      expect(mockCollection.doc().update).toHaveBeenCalledWith(updateData);
      expect(result).toEqual({ id: testId, ...mockUpdatedDoc });
    });
  
    it('debe manejar errores de actualización', async () => {
      mockCollection.doc().update.mockRejectedValueOnce(new Error('Update failed'));
  
      await expect(service.update(testId, updateData))
        .rejects
        .toThrow('Error updating document. Please try again later.');
    });
  });
  
  describe('delete', () => {
    const testId = 'test-id';
  
    it('debe eliminar un documento exitosamente', async () => {
      mockCollection.doc().delete.mockResolvedValueOnce();
  
      const result = await service.delete(testId);
  
      expect(result).toBe(true);
      expect(mockCollection.doc).toHaveBeenCalledWith(testId);
    });
  
    it('debe manejar errores de Firestore', async () => {
      mockCollection.doc().delete.mockRejectedValueOnce(new Error('Firestore error'));
  
      await expect(service.delete(testId))
        .rejects
        .toThrow('Error deleting document. Please try again later.');
    });
  
    it('debe propagar otros errores', async () => {
      const error = new Error('Other error');
      mockCollection.doc().delete.mockRejectedValueOnce(error);
  
      await expect(service.delete(testId))
        .rejects
        .toThrow('Other error');
    });
  });
  
  describe('search', () => {
    const searchString = 'test';
    const mockDocs = [
      { id: 'doc1', data: () => ({ Nombre: 'Test 1' }) },
      { id: 'doc2', data: () => ({ Nombre: 'Test 2' }) }
    ];
  
    it('debe buscar documentos correctamente', async () => {
      mockCollection.get.mockResolvedValueOnce({ docs: mockDocs });
  
      const result = await service.search(searchString);
  
      expect(mockCollection.where).toHaveBeenCalledWith('Nombre', '>=', searchString);
      expect(mockCollection.where).toHaveBeenCalledWith('Nombre', '<=', searchString + '\uf8ff');
      expect(result.items).toHaveLength(2);
    });
  
    it('debe manejar paginación en búsqueda', async () => {
      const startAfterDoc = { id: 'startDoc', exists: true };
      mockCollection.doc().get.mockResolvedValueOnce(startAfterDoc);
      mockCollection.get.mockResolvedValueOnce({ docs: mockDocs });
  
      const result = await service.search(searchString, 'startDoc', 5);
  
      expect(mockCollection.startAfter).toHaveBeenCalled();
      expect(mockCollection.limit).toHaveBeenCalledWith(5);
    });
  
    it('debe manejar errores de búsqueda', async () => {
      mockCollection.get.mockRejectedValueOnce(new Error('Search failed'));
  
      await expect(service.search(searchString))
        .rejects
        .toThrow('Error al buscar datos. Inténtelo más tarde.');
    });
  });

});
