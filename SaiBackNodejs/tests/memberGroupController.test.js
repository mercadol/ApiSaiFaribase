"use strict";

const request = require("supertest");
const express = require("express");
const memberGroupController = require("../controllers/memberGroupController");
const memberGroupService = require("../services/memberGroupService");

// Crear una app Express simulada para las pruebas
const app = express();
app.use(express.json());

// Definir la ruta bajo prueba
app.post("/member-group", memberGroupController.addMemberToGroup);
app.delete("/member-group", memberGroupController.removeMemberFromGroup);

jest.mock("../services/memberGroupService");

describe("MemberGroupController - addMemberToGroup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {}); // 🔹 Oculta console.error
  });

  afterAll(() => {
    console.error.mockRestore(); // 🔹 Restaura console.error después de los tests
  });

  test("Debe agregar un miembro a un grupo correctamente", async () => {
    const mockResponse = {
      id: "789",
      groupName: "Grupo de jóvenes",
      memberName: "John Doe",
      memberRoll: "Líder",
    };

    memberGroupService.addMemberToGroup.mockResolvedValue(mockResponse);

    const response = await request(app).post("/member-group").send({
      memberId: "123",
      groupId: "456",
      memberName: "John Doe",
      memberRoll: "Líder",
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: "Miembro añadido al grupo con éxito.",
      data: mockResponse,
    });
  });

  test("Debe devolver un error 400 si falta memberId", async () => {
    const response = await request(app).post("/member-group").send({
      groupId: "456",
      memberName: "John Doe",
      memberRoll: "Líder",
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "ID de miembro es obligatorio." });
  });

  test("Debe devolver un error 400 si falta groupId", async () => {
    const response = await request(app).post("/member-group").send({
      memberId: "123",
      memberName: "John Doe",
      memberRoll: "Líder",
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "ID de grupo es obligatorio." });
  });

  test("Debe devolver un error 400 si falta memberName", async () => {
    const response = await request(app).post("/member-group").send({
      memberId: "123",
      groupId: "456",
      memberRoll: "Asistente",
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "El nombre del miembro es obligatorio y debe ser un texto válido.",
    });
  });

  test('Debe asignar "Asistente" como valor por defecto si no se envía memberRoll', async () => {
    const mockResponse = {
      id: "789",
      groupName: "Grupo de jóvenes",
      memberName: "John Doe",
      memberRoll: "Asistente",
    };

    memberGroupService.addMemberToGroup.mockResolvedValue(mockResponse);

    const response = await request(app).post("/member-group").send({
      memberId: "123",
      groupId: "456",
      memberName: "John Doe",
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: "Miembro añadido al grupo con éxito.",
      data: mockResponse,
    });
  });

  test("Debe devolver un error 500 si ocurre un problema en el servidor", async () => {
    memberGroupService.addMemberToGroup.mockRejectedValue(
      new Error("Fallo en la base de datos")
    );

    const response = await request(app).post("/member-group").send({
      memberId: "123",
      groupId: "456",
      memberName: "John Doe",
      memberRoll: "Asistente",
    });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error:
        "Error al añadir miembro al grupo. Por favor, inténtalo más tarde.",
    });
  });
});

describe("MemberGroupController - removeMemberFromGroup", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {}); // 🔹 Oculta console.error
  });

  afterAll(() => {
    console.error.mockRestore(); // 🔹 Restaura console.error después de los tests
  });

  it("debería eliminar correctamente una relación miembro-grupo", async () => {
    // Mock del servicio
    memberGroupService.removeMemberFromGroup.mockResolvedValue({
      success: true,
      message: "Relación eliminada correctamente.",
    });

    const response = await request(app).delete("/member-group").send({
      memberId: "12345",
      groupId: "67890",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Relación eliminada correctamente.",
    });

    expect(memberGroupService.removeMemberFromGroup).toHaveBeenCalledWith(
      "12345",
      "67890"
    );
  });

  it("debería devolver un error 400 si faltan parámetros obligatorios", async () => {
    const response = await request(app).delete("/member-group").send({
      memberId: "12345",
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Faltan parámetros obligatorios: memberId y groupId.",
    });
  });

  it("debería manejar errores internos del servidor", async () => {
    // Mock de error en el servicio
    memberGroupService.removeMemberFromGroup.mockRejectedValue(
      new Error("Error al eliminar la relación.")
    );

    const response = await request(app).delete("/member-group").send({
      memberId: "12345",
      groupId: "67890",
    });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error:
        "Error al eliminar la relación miembro-grupo. Por favor, inténtalo más tarde.",
    });

    expect(memberGroupService.removeMemberFromGroup).toHaveBeenCalledWith(
      "12345",
      "67890"
    );
  });
});
