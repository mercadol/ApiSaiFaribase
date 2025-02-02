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
const courseService = require("../services/courseService");

describe("courseService.createCourse", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {}); // 🔹 Oculta console.error
  });

  afterAll(() => {
    console.error.mockRestore(); // 🔹 Restaura console.error después de los tests
  });

  it("debería crear un nuevo curso exitosamente", async () => {
    const courseData = {
      id: "newCourseId",
      name: "Curso de Prueba",
      description: "Este es un curso de prueba",
      duration: "10 horas",
    };

    const result = await courseService.createCourse(courseData);

    expect(result).toBe(courseData.id);
    expect(mockDb.collection).toHaveBeenCalledWith("Course");
    expect(mockCollection.doc).toHaveBeenCalledWith(courseData.id);
    expect(mockDoc.set).toHaveBeenCalledWith(courseData);
  });

  it("Debería generar un error si el curso ya existe", async () => {
    const courseData = { id: "existingCourseId" };

    // 🔹 Simular que el curso ya existe
    mockDoc.get.mockResolvedValueOnce({ exists: true });

    await expect(courseService.createCourse(courseData)).rejects.toThrow(
      "Ya existe un curso con el ID: existingCourseId"
    );
  });

  it("debería manejar errores de Firestore correctamente", async () => {
    const courseData = {
      id: "newCourseId",
      name: "Curso de Prueba",
      description: "Este es un curso de prueba",
      duration: "10 horas",
    };

    // 🔹 Simular error en Firestore
    const firestoreError = new Error("Error de Firestore");
    mockDoc.get.mockRejectedValueOnce(firestoreError);

    await expect(courseService.createCourse(courseData)).rejects.toThrow(
      "Error al guardar el curso. Por favor, inténtalo más tarde."
    );
  });

  it("should handle other errors correctly", async () => {
    const courseData = { id: "newCourseId" };

    // 🔹 Simular otro error
    mockDoc.set.mockRejectedValueOnce(new Error("Other error"));

    await expect(courseService.createCourse(courseData)).rejects.toThrow(
      "Other error"
    );
  });
});
