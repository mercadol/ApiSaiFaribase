"use strict";

// 🔹 Mock de Firestore correctamente estructurado
const mockDoc = {
  set: jest.fn(() => Promise.resolve()),
};

const mockCollection = {
  doc: jest.fn(() => mockDoc),
};

const mockDb = {
  collection: jest.fn(() => mockCollection),
};

// 🔹 Mock de la importación de Firestore
jest.mock("../firebase", () => ({
  db: mockDb,
}));

// Ahora importamos el servicio después de definir el mock
const memberGroupService = require("../services/memberGroupService");

describe("memberGroupService.addMemberToGroup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {}); // 🔹 Oculta console.error
  });

  afterAll(() => {
    console.error.mockRestore(); // 🔹 Restaura console.error después de los tests
  });

  it("debería agregar un miembro a un grupo exitosamente", async () => {
    const memberId = "23e4567";
    const groupId = "87e6543";
    const memberName = "John Doe";
    const memberRoll = "Lider";

    const result = await memberGroupService.addMemberToGroup({
      memberId,
      groupId,
      memberName,
      memberRoll,
    });

    expect(result).toEqual({
      message: "Relación creada con éxito.",
      id: `${memberId}_${groupId}`,
      groupId,
      memberId,
      memberName,
      memberRoll,
    });
  });

  it("debería lanzar un error si faltan IDs", async () => {
    await expect(
      memberGroupService.addMemberToGroup({}) 
    ).rejects.toThrow(
      "El ID del miembro, el ID del grupo y el nombre del miembro son obligatorios."
    );
  });

  it("debería manejar errores de Firestore correctamente", async () => {
    mockDoc.set.mockRejectedValue(new Error("Error de Firestore"));

    await expect(
      memberGroupService.addMemberToGroup({
        memberId: "123",
        groupId: "456",
        memberName: "John Doe",
        memberRoll: "Asistente",
      })
    ).rejects.toThrow(
      "Error al crear la relación. Por favor, inténtalo más tarde."
    );
  });
});

describe("memberGroupService.removeMemberFromGroup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {}); // 🔹 Oculta console.error
  });

  afterAll(() => {
    console.error.mockRestore(); // 🔹 Restaura console.error después de los tests
  });

  it("debería eliminar un miembro de un grupo exitosamente", async () => {
    // 🔹 Simula que Firestore encuentra un documento
    const mockQuerySnapshot = {
      empty: false,
      forEach: jest.fn((callback) => {
        callback({ ref: { delete: jest.fn() } }); // 🔹 Simula documento con referencia eliminable
      }),
    };

    const mockBatch = {
      delete: jest.fn(),
      commit: jest.fn().mockResolvedValue(), // 🔹 Simula que el commit se realiza correctamente
    };

    mockDb.batch = jest.fn(() => mockBatch); // 🔹 Mock de batch()

    mockDb.collection.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue(mockQuerySnapshot),
    });

    const result = await memberGroupService.removeMemberFromGroup("123", "456");

    expect(mockDb.collection).toHaveBeenCalledWith("MiembroGrupo");
    expect(mockBatch.delete).toHaveBeenCalled(); // 🔹 Verifica que se llama a delete()
    expect(mockBatch.commit).toHaveBeenCalled(); // 🔹 Verifica que se ejecuta commit()
    expect(result).toEqual({
      success: true,
      message: "Relación eliminada correctamente.",
    });
  });

  it("debería lanzar un error si la relación no existe", async () => {
    // 🔹 Simular que Firestore devuelve un snapshot vacío
    const mockQuerySnapshot = {
      empty: true, // 🔹 Indica que no hay documentos
      forEach: jest.fn(),
    };

    mockDb.collection.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue(mockQuerySnapshot),
    });

    await expect(
      memberGroupService.removeMemberFromGroup("123", "456")
    ).rejects.toThrow(
      "No se encontró la relación miembro-grupo para memberId: 123 y groupId: 456"
    );
  });

  it("debería manejar errores de Firestore correctamente", async () => {
    // 🔹 Simular error en Firestore
    mockDb.collection.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      get: jest.fn().mockRejectedValue(new Error("Error de Firestore")),
    });

    await expect(
      memberGroupService.removeMemberFromGroup("123", "456")
    ).rejects.toThrow(
      "Error al eliminar la relación. Por favor, inténtalo más tarde."
    );
  });
});
