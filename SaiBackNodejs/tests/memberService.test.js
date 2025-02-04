"use strict";

const mockDoc = {
  set: jest.fn(() => Promise.resolve()),
  delete: jest.fn(() => Promise.resolve()), // 🔹 Mock de delete()
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
const memberService = require("../services/memberService");

describe("memberService.createMember", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {}); // 🔹 Oculta console.error
  });

  afterAll(() => {
    console.error.mockRestore(); // 🔹 Restaura console.error después de los tests
  });

  it("debería crear un nuevo miembro exitosamente", async () => {
    const memberData = {
      memberId: "newMemberId",
      name: "John Doe",
      memberType: "visitante",
      Oficio: "docente",
      telephono: "5555-5555",
      nota: "Invitado por maria",
      estadoCivil: "Casado",
    };
    const result = await memberService.createMember(memberData);

    expect(result).toBe(memberData.memberId);
    expect(mockDb.collection).toHaveBeenCalledWith("Member");
    expect(mockCollection.doc).toHaveBeenCalledWith(memberData.memberId);
    expect(mockDoc.set).toHaveBeenCalledWith(memberData);
  });

  it("Debería generar un error si el miembro ya existe", async () => {
    const memberData = { memberId: "existingMemberId" };
    mockDoc.get.mockResolvedValueOnce({ exists: true });

    await expect(memberService.createMember(memberData)).rejects.toThrow(
      "Ya existe un miembro con el ID: existingMemberId"
    );
  });

  it("debería manejar errores de Firestore correctamente", async () => {
    const memberData = {
      memberId: "newMemberId",
      name: "John Doe",
      memberType: "visitante",
      Oficio: "docente",
      telephono: "5555-5555",
      nota: "Invitado por maria",
      estadoCivil: "Casado",
    };

    // 🔹 Simular error en Firestore
    mockDoc.get.mockRejectedValueOnce(new Error("Error de Firestore"));

    await expect(memberService.createMember(memberData)).rejects.toThrow(
      "Error al guardar el miembro. Por favor, inténtalo más tarde."
    );
  });

  it("should handle other errors correctly", async () => {
    const memberData = { memberId: "newMemberId" };
  
    // 🔹 Simular otro error
    mockDoc.set.mockRejectedValueOnce(new Error("Other error"));
  
    await expect(memberService.createMember(memberData)).rejects.toThrow(
      "Other error"
    );
  });
});

