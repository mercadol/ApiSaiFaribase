// tests/services/memberService.test.js
const memberService = require("../../services/memberService");
const MemberModel = require("../../models/MemberModel");

jest.mock("../../models/MemberModel");

describe("memberService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("should return all members", async () => {
      const mockMembers = [
        { id: "1", Nombre: "John Doe", email: "john@example.com" },
        { id: "2", Nombre: "Jane Smith", email: "jane@example.com" },
      ];
      MemberModel.findAll.mockResolvedValue(mockMembers);

      const result = await memberService.getAll();
      expect(result).toEqual(mockMembers);
      expect(MemberModel.findAll).toHaveBeenCalledWith(null, 10);
    });

    it("should return members with pagination", async () => {
      const mockMembers = [
        { id: "1", Nombre: "John Doe", email: "john@example.com" },
        { id: "2", Nombre: "Jane Smith", email: "jane@example.com" },
      ];
      MemberModel.findAll.mockResolvedValue(mockMembers);

      const result = await memberService.getAll("123", 20);
      expect(result).toEqual(mockMembers);
      expect(MemberModel.findAll).toHaveBeenCalledWith("123", 20);
    });
  });

  describe("getById", () => {
    it("should return a member by ID", async () => {
      const mockMember = {
        id: "1",
        Nombre: "John Doe",
        email: "john@example.com",
      };
      MemberModel.findById.mockResolvedValue(mockMember);

      const result = await memberService.getById("1");
      expect(result).toEqual(mockMember);
      expect(MemberModel.findById).toHaveBeenCalledWith("1");
    });
  });

  describe("create", () => {
    it("should create a new member", async () => {
      const mockMemberData = {
        Nombre: "John Doe",
        Email: "john@example.com",
        EstadoCivil: "Soltero",
        TipoMiembro: "Regular",
        Oficio: "Developer",
        FechaRegistro: new Date(),
      };
      const mockMember = { id: "1", ...mockMemberData };
      MemberModel.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockMember),
        id: "1", // Add id property to the mock
      }));

      const result = await memberService.create(mockMemberData);
      expect(result).toEqual(mockMember.id);
      expect(MemberModel).toHaveBeenCalledWith({
        Nombre: mockMemberData.Nombre, // Updated to match new field names
        Email: mockMemberData.Email,
        EstadoCivil: mockMemberData.EstadoCivil,
        TipoMiembro: mockMemberData.TipoMiembro,
        Oficio: mockMemberData.Oficio,
        FechaRegistro: mockMemberData.FechaRegistro,
      });
    });
  });

  describe("update", () => {
    it("should update an existing member", async () => {
      const mockMember = {
        id: "1",
        Nombre: "John Doe", // Updated field names
        Email: "john@example.com",
        EstadoCivil: "Soltero",
        TipoMiembro: "Regular",
        Oficio: "Developer",
        FechaRegistro: new Date(),
        save: jest.fn().mockResolvedValue(true),
      };
      const updatedData = {
        Nombre: "Jane Doe",
        Email: "jane@example.com",
        EstadoCivil: "Casado",
        TipoMiembro: "Premium",
        Oficio: "Designer",
      };
      MemberModel.findById.mockResolvedValue(mockMember);

      const result = await memberService.update("1", updatedData);
      expect(result).toEqual(mockMember);
      expect(mockMember.Nombre).toEqual("Jane Doe"); // Updated field names
      expect(mockMember.Email).toEqual("jane@example.com");
      expect(mockMember.EstadoCivil).toEqual("Casado");
      expect(mockMember.TipoMiembro).toEqual("Premium");
      expect(mockMember.Oficio).toEqual("Designer");
      expect(mockMember.save).toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("should delete a member", async () => {
      const mockMember = {
        id: "1",
        delete: jest.fn().mockResolvedValue(true),
      };
      MemberModel.findById.mockResolvedValue(mockMember);

      const result = await memberService.delete("1");
      expect(result).toBe(true);
      expect(mockMember.delete).toHaveBeenCalled();
    });
  });

  describe("search", () => {
    it("should search for members", async () => {
      const mockMembers = [
        { id: "1", Nombre: "John Doe", email: "john@example.com" },
        { id: "2", Nombre: "Jane Smith", email: "jane@example.com" },
      ];
      MemberModel.search.mockResolvedValue(mockMembers);

      const result = await memberService.search("John", "123", 20);
      expect(result).toEqual(mockMembers);
      expect(MemberModel.search).toHaveBeenCalledWith("John", "123", 20);
    });
  });
});
