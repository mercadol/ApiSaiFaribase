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
      id: "newEventId",
      name: "Evento de Prueba",
      date: "2023-12-31",
      location: "Ciudad de Prueba",
    };

    const result = await eventService.createEvent(eventData);

    expect(result).toBe(eventData.id); // 🔹 Verificar que se retorna el ID correcto
    expect(mockDb.collection).toHaveBeenCalledWith("Event");
    expect(mockCollection.doc).toHaveBeenCalledWith(eventData.id);
    expect(mockDoc.set).toHaveBeenCalledWith(eventData);
  });

  it("Debería generar un error si el evento ya existe", async () => {
    const eventData = { id: "existingEventId" };

    // 🔹 Simular que el evento ya existe
    mockDoc.get.mockResolvedValueOnce({ exists: true });

    await expect(eventService.createEvent(eventData)).rejects.toThrow(
      "Ya existe un evento con el ID: existingEventId"
    );
  });

  it("debería manejar errores de Firestore correctamente", async () => {
    const eventData = {
      id: "newEventId",
      name: "Evento de Prueba",
      date: "2023-12-31",
      location: "Ciudad de Prueba",
    };

    // 🔹 Simular error en Firestore
    const firestoreError = new Error("Error de Firestore");
    mockDoc.get.mockRejectedValueOnce(firestoreError);

    await expect(eventService.createEvent(eventData)).rejects.toThrow(
      "Error al guardar el evento. Por favor, inténtalo más tarde."
    );
  });

  it("should handle other errors correctly", async () => {
    const eventData = { id: "newEventId" };

    // 🔹 Simular otro error
    mockDoc.set.mockRejectedValueOnce(new Error("Other error"));

    await expect(eventService.createEvent(eventData)).rejects.toThrow(
      "Other error"
    );
  });
});
