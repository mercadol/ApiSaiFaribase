// tests/BaseController.test.js
const BaseController = require("../../controllers/BaseController");
const { mockRequest, mockResponse } = require("jest-mock-req-res");

jest.mock("../../firebase", () => ({})); // Mock vacío

describe("BaseController", () => {
  let controller;
  let service;
  let req;
  let res;

  beforeEach(() => {
    // Configuración base de mocks
    jest.clearAllMocks();

    // Mock del servicio con todos los métodos necesarios
    service = {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      search: jest.fn(),
    };

    // Instanciamos el controlador
    controller = new BaseController({
      service,
      entityName: "TestEntity",
      entityPlural: "testEntities",
    });

    // Se crean objetos simulados para req y res
    req = mockRequest();
    res = mockResponse();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("constructor", () => {
    it("debe lanzar error si no se proporciona un servicio", () => {
      expect(() => new BaseController({})).toThrow(
        "Service is required in BaseController"
      );
    });

    it("debe inicializar correctamente las propiedades", () => {
      expect(controller.service).toBe(service);
      expect(controller.entityName).toBe("TestEntity");
      expect(controller.entityPlural).toBe("testEntities");
    });
  });

  describe("getAll", () => {
    it("debe llamar a service.getAll con los parámetros correctos", async () => {
      req.query = { startAfter: "doc123", pageSize: "50" };
      await controller.getAll(req, res);
      expect(service.getAll).toHaveBeenCalledWith("doc123", 50);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it("debe usar valores por defecto cuando no se proporcionan parámetros", async () => {
      req.query = {};
      await controller.getAll(req, res);
      expect(service.getAll).toHaveBeenCalledWith(null, 10);
    });
  });

  describe("getById", () => {
    it("debe obtener una entidad por su ID", async () => {
      const mockEntity = { id: "abc123", name: "Test" };
      service.getById.mockResolvedValue(mockEntity);
      req.params = { id: "abc123" };

      await controller.getById(req, res);

      expect(service.getById).toHaveBeenCalledWith("abc123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockEntity);
    });
  });

  describe("create", () => {
    it("debe crear una nueva entidad", async () => {
      const mockData = { name: "Test Entity" };
      const createdEntity = { id: "new123", ...mockData };
      req.body = mockData;
      service.create.mockResolvedValue(createdEntity);

      await controller.create(req, res);

      expect(service.create).toHaveBeenCalledWith(mockData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdEntity);
    });
  });

  describe("update", () => {
    it("debe actualizar una entidad existente", async () => {
      const mockData = { name: "Updated Test" };
      const updatedEntity = { id: "entity123", ...mockData };
      req.params = { id: "entity123" };
      req.body = mockData;
      service.update.mockResolvedValue(updatedEntity);

      await controller.update(req, res);

      expect(service.update).toHaveBeenCalledWith("entity123", mockData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedEntity);
    });
  });

  describe("delete", () => {
    it("debe eliminar una entidad y devolver código 204", async () => {
      req.params = { id: "entity123" };

      await controller.delete(req, res);

      expect(service.delete).toHaveBeenCalledWith("entity123");
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe("search", () => {
    it("debe buscar entidades con los parámetros proporcionados", async () => {
      const searchResults = {
        data: [{ id: "found123", name: "Found Entity" }],
        lastDoc: null,
      };
      req.query = {
        searchString: "test",
        pageSize: "20",
        startAfter: "start123",
      };
      service.search.mockResolvedValue(searchResults);

      await controller.search(req, res);

      expect(service.search).toHaveBeenCalledWith("test", "start123", 20);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(searchResults);
    });

    it("debe usar valores por defecto cuando no se proporcionan todos los parámetros", async () => {
      req.query = { searchString: "test" };
      service.search.mockResolvedValue({ data: [], lastDoc: null });

      await controller.search(req, res);

      expect(service.search).toHaveBeenCalledWith("test", null, 10);
    });
  });
});
