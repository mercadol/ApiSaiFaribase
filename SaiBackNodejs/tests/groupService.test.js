"use strict";

// 🔹 Mock de Firestore correctamente estructurado
const mockDoc = {
  set: jest.fn(() => Promise.resolve()),
  get: jest.fn(() => Promise.resolve({ exists: false })), // 🔹 Mock de get()
};

const mockCollection = {
  doc: jest.fn(() => mockDoc),
};

const mockDb = {
  collection: jest.fn(() => mockCollection),
};

jest.mock("../firebase", () => ({
  db: mockDb,
}));

// Ahora importamos el servicio después de definir el mock
const groupService = require("../services/groupService");

describe("groupService.createGroup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {}); // 🔹 Oculta console.error
  });

  afterAll(() => {
    console.error.mockRestore(); // 🔹 Restaura console.error después de los tests
  });

  it("debería crear un nuevo grupo exitosamente", async () => {
    const groupData = {
      groupId: "newGroupId",
      name: "Grupo de Prueba",
      description: "Este es un grupo de prueba",
    };

    const result = await groupService.createGroup(groupData);

    expect(result).toBe(groupData.groupId);
    expect(mockDb.collection).toHaveBeenCalledWith("Group");
    expect(mockCollection.doc).toHaveBeenCalledWith(groupData.groupId);
    expect(mockDoc.set).toHaveBeenCalledWith(groupData);
  });

  it("Debería generar un error si el grupo ya existe", async () => {
    const groupData = { groupId: "existingGroupId" };

    // 🔹 Simular que el grupo ya existe
    mockDoc.get.mockResolvedValueOnce({ exists: true });

    await expect(groupService.createGroup(groupData)).rejects.toThrow(
      "Ya existe un grupo con el ID: existingGroupId"
    );
  });

  it("debería manejar errores de Firestore correctamente", async () => {
    const groupData = {
      groupId: "newGroupId",
      name: "Grupo de Prueba",
      description: "Este es un grupo de prueba",
    };

    // 🔹 Simular error en Firestore con un código específico
    const firestoreError = new Error("Error de Firestore");
    firestoreError.code = "firestore/unknown-error"; // 🔹 Añadir un código de Firestore
    mockDoc.get.mockRejectedValueOnce(firestoreError);

    await expect(groupService.createGroup(groupData)).rejects.toThrow(
      "Error al guardar el grupo. Por favor, inténtalo más tarde."
    );
  });

  it("should handle other errors correctly", async () => {
    const groupData = { groupId: "newGroupId" };

    // 🔹 Simular otro error
    mockDoc.set.mockRejectedValueOnce(new Error("Other error"));

    await expect(groupService.createGroup(groupData)).rejects.toThrow(
      "Other error"
    );
  });
});
