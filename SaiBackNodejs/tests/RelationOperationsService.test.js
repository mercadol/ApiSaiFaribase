"use strict";

// Mocks para Firestore
const mockDoc = {
    set: jest.fn(() => Promise.resolve()),
    delete: jest.fn(() => Promise.resolve()),
    update: jest.fn(() => Promise.resolve()),
    get: jest.fn(() => Promise.resolve({ exists: false, id: "testId", data: () => ({ foo: "bar" }) })),
  };
  
  const mockCollection = {
    doc: jest.fn(() => mockDoc),
    orderBy: jest.fn(() => mockCollection),
    where: jest.fn(() => mockCollection),
    limit: jest.fn(() => mockCollection),
    startAfter: jest.fn(() => mockCollection),
    get: jest.fn(() => Promise.resolve({ docs: [] })),
  };
  
  const mockDb = {
    collection: jest.fn(() => mockCollection),
    batch: jest.fn(() => ({
      delete: jest.fn(),
      commit: jest.fn(() => Promise.resolve()),
    })),
  };
  
jest.mock("../firebase", () => ({
  db: mockDb
}));

const RelationOperationsService = require('../services/RelationOperationsService');

describe('RelationOperationsService', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RelationOperationsService('TestRelations');
  });

  describe('addRelation', () => {
    it('should create relation with composite ID', async () => {
      const fromId = 'from123';
      const toId = 'to456';
      const data = { role: 'admin' };

      await service.addRelation(fromId, toId, data);

      expect(mockCollection.doc).toHaveBeenCalledWith(`${fromId}_${toId}`);
      expect(mockDoc.set).toHaveBeenCalledWith({
        fromId,
        toId,
        ...data
      });
    });

    it('should throw error if ids are missing', async () => {
      await expect(service.addRelation(null, 'to456'))
        .rejects.toThrow('Both fromId and toId are required.');
    });
  });

  describe('getRelatedDocuments', () => {
    it('should return related documents', async () => {
      const mockDocs = [
        { data: () => ({ fromId: 'related1' }) },
        { data: () => ({ fromId: 'related2' }) }
      ];
      mockCollection.get.mockResolvedValueOnce({ docs: mockDocs, empty: false });

      // Mock getDocumentsFromIds response
      const mockRelatedDocs = [
        { id: 'related1', name: 'Related 1' },
        { id: 'related2', name: 'Related 2' }
      ];
      jest.spyOn(service, 'getDocumentsFromIds')
        .mockResolvedValueOnce(mockRelatedDocs);

      const result = await service.getRelatedDocuments(
        'test-id',
        'RelatedCollection',
        'toId',
        'fromId'
      );

      expect(result).toEqual(mockRelatedDocs);
      expect(mockCollection.where).toHaveBeenCalledWith('toId', '==', 'test-id');
    });

    it('should return empty array if no relations found', async () => {
      mockCollection.get.mockResolvedValueOnce({ docs: [], empty: true });

      const result = await service.getRelatedDocuments(
        'test-id',
        'RelatedCollection',
        'toId',
        'fromId'
      );

      expect(result).toEqual([]);
    });
  });

  describe('removeRelation', () => {
    it('should delete relation document', async () => {
      mockDoc.get.mockResolvedValueOnce({ exists: true });

      await service.removeRelation('from123', 'to456');

      expect(mockCollection.doc).toHaveBeenCalledWith('from123_to456');
      expect(mockDoc.delete).toHaveBeenCalled();
    });

    it('should throw error if relation not found', async () => {
      mockDoc.get.mockResolvedValueOnce({ exists: false });

      await expect(service.removeRelation('from123', 'to456'))
        .rejects.toThrow('Relation not found');
    });
  });
});
