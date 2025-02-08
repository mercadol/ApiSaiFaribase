"use strict";

const mockDoc = {
  set: jest.fn(() => Promise.resolve()),
  get: jest.fn(() => Promise.resolve({ exists: false, data: () => ({}) })),
};

const mockCollection = {
  doc: jest.fn(() => mockDoc),
  where: jest.fn(() => mockCollection),
  orderBy: jest.fn(() => mockCollection),
  limit: jest.fn(() => mockCollection),
  startAfter: jest.fn(() => mockCollection),
  get: jest.fn(() => Promise.resolve({ docs: [] })),
};

const mockDb = {
  collection: jest.fn(() => mockCollection),
};

jest.mock("../firebase", () => ({
  db: mockDb
}));

const { MemberService } = require("../services/EntityService");

describe("MemberService", () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MemberService();
  });

  it("should initialize with Member collection", () => {
    expect(mockDb.collection).toHaveBeenCalledWith("Member");
  });

  describe("searchMembers", () => {
    it("should return search results", async () => {
      const mockDocs = [
        { id: "1", data: () => ({ Name: "John Doe" }) },
        { id: "2", data: () => ({ Name: "John Smith" }) }
      ];
      mockCollection.get.mockResolvedValueOnce({ docs: mockDocs });

      const result = await service.searchMembers("John");

      expect(mockCollection.where).toHaveBeenCalledWith("Name", ">=", "John");
      expect(mockCollection.where).toHaveBeenCalledWith("Name", "<=", "John\uf8ff");
      expect(mockCollection.orderBy).toHaveBeenCalledWith("Name");
      expect(result).toEqual({
        members: mockDocs.map(doc => ({ id: doc.id, ...doc.data() })),
        lastDoc: mockDocs[mockDocs.length - 1]
      });
    });

    it("should handle pagination", async () => {
      const startAfterDoc = { id: "0", data: () => ({ Name: "Previous" }) };
      await service.searchMembers("John", startAfterDoc, 5);

      expect(mockCollection.startAfter).toHaveBeenCalledWith(startAfterDoc);
      expect(mockCollection.limit).toHaveBeenCalledWith(5);
    });

    it("should handle search errors", async () => {
      mockCollection.get.mockRejectedValueOnce(new Error("Search failed"));

      await expect(service.searchMembers("John"))
        .rejects.toThrow("Error al buscar miembros. Inténtalo más tarde.");
    });
  });
});
