"use strict";

// 🔹 Mock de Firestore correctamente estructurado
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
const eventService = require("../services/eventService");

describe("eventService.createEvent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {}); // 🔹 Oculta console.error
  });

  afterAll(() => {
    console.error.mockRestore(); // 🔹 Restaura console.error después de los tests
  });

  it("debería crear un nuevo evento exitosamente", async () => {
    const eventData = {
      id: "newId",
      Nombre: "Evento de Prueba",
      Fecha: "2023-12-31",
      Descripcion: "Auditorio de Prueba",
    };

    const result = await eventService.createEvent(eventData);

    expect(result).toBe(eventData.id); // 🔹 Verificar que se retorna el ID correcto
    expect(mockDb.collection).toHaveBeenCalledWith("Event");
    expect(mockCollection.doc).toHaveBeenCalledWith(eventData.id);
    expect(mockDoc.set).toHaveBeenCalledWith(eventData);
  });

  it("Debería generar un error si el evento ya existe", async () => {
    const eventData = { id: "existingId" };

    // 🔹 Simular que el evento ya existe
    mockDoc.get.mockResolvedValueOnce({ exists: true });

    await expect(eventService.createEvent(eventData)).rejects.toThrow(
      "Ya existe un evento con el ID: existingId"
    );
  });

  it("debería manejar errores de Firestore correctamente", async () => {
    const eventData = {
      id: "newId",
      Nombre: "Evento de Prueba",
      Fecha: "2023-12-31",
      Descripcion: "Auditorio de Prueba",
    };

    // 🔹 Simular error en Firestore
    const firestoreError = new Error("Error de Firestore");
    mockDoc.get.mockRejectedValueOnce(firestoreError);

    await expect(eventService.createEvent(eventData)).rejects.toThrow(
      "Error al guardar el evento. Por favor, inténtalo más tarde."
    );
  });

  it("should handle other errors correctly", async () => {
    const eventData = { id: "newId" };

    // 🔹 Simular otro error
    mockDoc.set.mockRejectedValueOnce(new Error("Other error"));

    await expect(eventService.createEvent(eventData)).rejects.toThrow(
      "Other error"
    );
  });
});

describe("eventService.deleteEventById", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {}); // 🔹 Oculta console.error
  });

  afterAll(() => {
    console.error.mockRestore(); // 🔹 Restaura console.error después de los tests
  });

  it("debería eliminar un evento exitosamente", async () => {
    const id = "existingId";

    // 🔹 Simular que el evento existe
    mockDoc.get.mockResolvedValueOnce({ exists: true });

    const result = await eventService.deleteEventById(id);

    expect(result).toBe(true); // 🔹 Verificar que la eliminación fue exitosa
    expect(mockDb.collection).toHaveBeenCalledWith("Event");
    expect(mockCollection.doc).toHaveBeenCalledWith(id);
    expect(mockDoc.delete).toHaveBeenCalled();
  });

  it("Debería generar un error si el evento no existe", async () => {
    const id = "nonExistingId";

    // 🔹 Simular que el evento no existe
    mockDoc.get.mockResolvedValueOnce({ exists: false });

    await expect(eventService.deleteEventById(id)).rejects.toThrow(
      `No existe un evento con el ID: ${id}`
    );
  });

  it("debería manejar errores de Firestore correctamente", async () => {
    const id = "existingid";

    // 🔹 Simular error en Firestore
    const firestoreError = new Error("Error de Firestore");
    mockDoc.get.mockRejectedValueOnce(firestoreError);

    await expect(eventService.deleteEventById(id)).rejects.toThrow(
      "Error al eliminar el evento. Por favor, inténtalo más tarde."
    );
  });

  it("should handle other errors correctly", async () => {
    const id = "existingid";

    // 🔹 Simular que el evento existe
    mockDoc.get.mockResolvedValueOnce({ exists: true });

    // 🔹 Simular un error en la operación delete
    mockDoc.delete.mockRejectedValueOnce(new Error("Other error"));

    await expect(eventService.deleteEventById(id)).rejects.toThrow(
      "Other error"
    );
  });
});
