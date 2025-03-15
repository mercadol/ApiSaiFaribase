// tests/unit/groupService.test.js
const groupService = require("../../services/groupService");
const GroupModel = require("../../models/GroupModel");

jest.mock("../../models/GroupModel");

describe("groupService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("debería devolver todos los grupos", async () => {
      const mockGroups = [
        { id: 1, nombre: "Grupo 1" },
        { id: 2, nombre: "Grupo 2" },
      ];
      GroupModel.findAll.mockResolvedValue(mockGroups);

      const result = await groupService.getAll();
      expect(result).toEqual(mockGroups);
      expect(GroupModel.findAll).toHaveBeenCalledWith(null, 10);
    });
  });

  describe("getById", () => {
    it("debería devolver un grupo por ID", async () => {
      const mockGroup = { id: 1, nombre: "Grupo 1" };
      GroupModel.findById.mockResolvedValue(mockGroup);

      const result = await groupService.getById(1);
      expect(result).toEqual(mockGroup);
      expect(GroupModel.findById).toHaveBeenCalledWith(1);
    });
  });

  describe("create", () => {
    it("debería crear un nuevo grupo y devolver su ID", async () => {
      const groupData = {
        Nombre: "Grupo 1",
        Descripcion: "Descripción del grupo",
      };
      const mockGroup = {
        id: 1,
        ...groupData,
        save: jest.fn().mockResolvedValue(),
      };
      GroupModel.mockImplementation(() => mockGroup);

      const result = await groupService.create(groupData);
      expect(result).toBe(mockGroup.id);
      expect(mockGroup.save).toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("debería actualizar un grupo existente", async () => {
      const mockGroup = {
        id: 1,
        nombre: "Grupo 1",
        descripcion: "Descripción",
        save: jest.fn().mockResolvedValue(),
      };
      GroupModel.findById.mockResolvedValue(mockGroup);

      const updatedData = {
        Nombre: "Grupo Actualizado",
        Descripcion: "Nueva Descripción",
      };
      const result = await groupService.update(1, updatedData);

      expect(result.nombre).toBe(updatedData.Nombre);
      expect(result.descripcion).toBe(updatedData.Descripcion);
      expect(mockGroup.save).toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("debería eliminar un grupo existente", async () => {
      const mockGroup = { id: 1, delete: jest.fn().mockResolvedValue() };
      GroupModel.findById.mockResolvedValue(mockGroup);

      const result = await groupService.delete(1);
      expect(result).toBe(true);
      expect(mockGroup.delete).toHaveBeenCalled();
    });
  });

  describe("addMember", () => {
    it("debería agregar un miembro a un grupo", async () => {
      const mockGroup = { id: 1, addMember: jest.fn().mockResolvedValue() };
      GroupModel.findById.mockResolvedValue(mockGroup);

      const result = await groupService.addMember("memberId", 1);
      expect(result).toEqual({ groupId: 1, memberId: "memberId" });
      expect(mockGroup.addMember).toHaveBeenCalledWith("memberId");
    });
  });

  describe("removeMember", () => {
    it("debería eliminar un miembro de un grupo", async () => {
      const mockGroup = { id: 1, removeMember: jest.fn().mockResolvedValue() };
      GroupModel.findById.mockResolvedValue(mockGroup);

      const result = await groupService.removeMember("memberId", 1);
      expect(result).toBe(true);
      expect(mockGroup.removeMember).toHaveBeenCalledWith("memberId");
    });
  });

  describe("getGroupMembers", () => {
    it("debería devolver los miembros de un grupo", async () => {
      const mockMembers = [{ id: "member1" }, { id: "member2" }];
      GroupModel.getGroupMembers = jest.fn().mockResolvedValue(mockMembers);

      const result = await groupService.getGroupMembers(1);
      expect(result).toEqual(mockMembers);
      expect(GroupModel.getGroupMembers).toHaveBeenCalledWith(1);
    });
  });

  describe("getMemberGroups", () => {
    it("debería devolver los grupos a los que pertenece un miembro", async () => {
      const mockGroups = [
        { id: 1, nombre: "Grupo 1" },
        { id: 2, nombre: "Grupo 2" },
      ];
      GroupModel.getMemberGroups = jest.fn().mockResolvedValue(mockGroups); // Mockear el método del modelo

      const result = await groupService.getMemberGroups("memberId");
      expect(result).toEqual(mockGroups);
      expect(GroupModel.getMemberGroups).toHaveBeenCalledWith("memberId");
    });

    it("debería manejar errores al obtener grupos del miembro", async () => {
      const errorMessage = "Error al obtener grupos del miembro";
      GroupModel.getMemberGroups = jest
        .fn()
        .mockRejectedValue(new Error(errorMessage)); // Mockear el error

      await expect(groupService.getMemberGroups("memberId")).rejects.toThrow(
        "Error al obtener grupos del miembro"
      );
      expect(GroupModel.getMemberGroups).toHaveBeenCalledWith("memberId");
    });
  });
});
