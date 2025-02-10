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

  describe('create', () => {
    it('should create a document when it does not exist', async () => {
      mockDoc.get.mockResolvedValueOnce({ exists: false });
      const data = { name: 'Test' };

      await service.create( data);

      expect(mockCollection.doc).toHaveBeenCalledWith('test-id');
      expect(mockDoc.add).toHaveBeenCalledWith(data);
    });
  });

  describe('getById', () => {
    it('should return document if it exists', async () => {
      const mockData = { name: 'Test' };
      mockDoc.get.mockResolvedValueOnce({
        exists: true,
        id: 'test-id',
        data: () => mockData
      });

      const result = await service.getById('test-id');

      expect(result).toEqual({
        id: 'test-id',
        ...mockData
      });
    });

    it('should throw error if document does not exist', async () => {
      mockDoc.get.mockResolvedValueOnce({ exists: false });

      await expect(service.getById('test-id'))
        .rejects.toThrow('Document with ID test-id not found');
    });
  });

  describe('getAll', () => {
    it('should return paginated results', async () => {
      const mockDocs = [
        { id: '1', data: () => ({ name: 'Test 1' }) },
        { id: '2', data: () => ({ name: 'Test 2' }) }
      ];
      mockCollection.get.mockResolvedValueOnce({ docs: mockDocs });

      const result = await service.getAll(null, 10);

      expect(result).toEqual({
        items: mockDocs.map(doc => ({ id: doc.id, ...doc.data() })),
        lastDoc: mockDocs[mockDocs.length - 1]
      });
    });
  });
});
