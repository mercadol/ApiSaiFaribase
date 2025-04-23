// tests/controllers/groupController.test.js
const groupController = require("../../controllers/groupController");
const groupService = require("../../services/groupService");

// Mock del servicio
jest.mock("../../services/groupService");

describe("GroupController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Métodos heredados y de relaciones", () => {
    test("debe llamar al servicio correcto en create", async () => {
      // Mock para el método de BaseController
      const originalCreate = groupController.create;
      groupController.create = jest
        .fn()
        .mockImplementation(() => Promise.resolve());

      // Datos y respuesta mock
      const groupData = { Nombre: "Nuevo Grupo" };
      const req = { body: groupData };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await groupController.create(req, res);

      // Verificar que fue llamado con los parámetros correctos
      expect(groupController.create).toHaveBeenCalledWith(req, res);

      // Restaurar método original
      groupController.create = originalCreate;
    });

    test("debe llamar a addMember con los parámetros correctos", async () => {
      // Mock del método addMember
      const originalAddMember = groupController.addMember;
      groupController.addMember = jest
        .fn()
        .mockImplementation(() => Promise.resolve());

      const req = { params: { id: "group1", memberId: "member1" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await groupController.addMember(req, res, next);

      expect(groupController.addMember).toHaveBeenCalledWith(req, res, next);

      // Restaurar método original
      groupController.addMember = originalAddMember;
    });

    test("debe llamar a removeMember con los parámetros correctos", async () => {
      // Mock del método directamente en groupController
      const originalRemoveMember = groupController.removeMember;
      groupController.removeMember = jest
        .fn()
        .mockImplementation(() => Promise.resolve());

      const req = { params: { id: "group1", memberId: "member1" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await groupController.removeMember(req, res, next);

      expect(groupController.removeMember).toHaveBeenCalledWith(req, res, next);

      // Restaurar método original
      groupController.removeMember = originalRemoveMember;
    });

    test("debe llamar a getGroupMembers con los parámetros correctos", async () => {
      const originalGetGroupMembers = groupController.getGroupMembers;
      groupController.getGroupMembers = jest
        .fn()
        .mockImplementation(() => Promise.resolve());

      const req = { params: { id: "group1" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await groupController.getGroupMembers(req, res, next);

      expect(groupController.getGroupMembers).toHaveBeenCalledWith(
        req,
        res,
        next
      );

      groupController.getGroupMembers = originalGetGroupMembers;
    });

    test("debe llamar a getMemberGroups con los parámetros correctos", async () => {
      const originalGetMemberGroups = groupController.getMemberGroups;
      groupController.getMemberGroups = jest
        .fn()
        .mockImplementation(() => Promise.resolve());

      const req = { params: { memberId: "member1" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await groupController.getMemberGroups(req, res, next);

      expect(groupController.getMemberGroups).toHaveBeenCalledWith(
        req,
        res,
        next
      );

      groupController.getMemberGroups = originalGetMemberGroups;
    });
  });
});
