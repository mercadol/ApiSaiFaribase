// tests/BaseController.test.js
const BaseController = require("../../controllers/BaseController");
const { mockRequest, mockResponse } = require("jest-mock-req-res");
const ApiError = require("../../utils/ApiError"); // Importa ApiError

jest.mock("../../firebase", () => ({})); // Mock vacío

// Creamos una subclase de BaseController que implementa los métodos abstractos
class TestController extends BaseController {
  validateCreateData(data) {
    // Por defecto, asumimos que la data es válida
    return null;
  }
  prepareCreateData(data) {
    return { data };
  }
  validateUpdateData(data) {
    return null;
  }
}

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
      search: jest.fn()
    };

    // Instanciamos el controlador de prueba
    controller = new TestController({
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

  describe("validateUpdateData", () => {
    it("debe retornar null por defecto (no lanzar error)", () => {
      expect(controller.validateUpdateData({})).toBeNull();
    });
  });
  // ======== PRUEBAS PARA MÉTODOS ABSTRACTOS ========
  describe("Métodos abstractos", () => {
    it("validateCreateData debe lanzar error si no se implementa", async () => {
      const baseController = new BaseController({ service: {} });
      expect(() => baseController.validateCreateData({})).toThrow(
        "Método validateCreateData no implementado"
      );
    });

    it("prepareCreateData debe lanzar error si no se implementa", async () => {
      const baseController = new BaseController({ service: {} });
      expect(() => baseController.prepareCreateData({})).toThrow(
        "Método prepareCreateData no implementado"
      );
    });
  });

  describe("getAll", () => {
    it("debe llamar a service.getAll con startAfterId como string y pageSize entre 1-100", async () => {
      req.query = { startAfter: "doc123", pageSize: "50" };
      await controller.getAll(req, res);
      expect(service.getAll).toHaveBeenCalledWith("doc123", 50);
    });

    it("debe forzar pageSize a 10 si no es número", async () => {
      req.query = { pageSize: "invalid" };
      await controller.getAll(req, res);
      expect(service.getAll).toHaveBeenCalledWith(null, 10);
    });
  });

  describe("getById", () => {
    it("debe retornar el elemento encontrado con status 200", async () => {
      const result = { id: "abc123", name: "Test" };
      service.getById.mockResolvedValue(result);
  
      req.params = { id: "abc123" };
  
      await controller.getById(req, res);
  
      expect(service.getById).toHaveBeenCalledWith("abc123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });
  });

  describe('create', () => {
    beforeEach(() => {
      controller.validateCreateData = jest.fn();
    });

    test('debe crear entidad exitosamente', async () => {
      const mockData = { name: 'Test Entity' };
      req = { body: mockData };
      service.create.mockResolvedValue({ id: 1, ...mockData });

      await controller.create(req, res);

      expect(controller.validateCreateData).toHaveBeenCalledWith({ data: mockData });
      expect(service.create).toHaveBeenCalledWith({ data: mockData });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 1, ...mockData });
    });

    test('debe lanzar error si validación falla', async () => {
      req = { body: {} };
      controller.validateCreateData.mockReturnValue('Error de validación');

      await expect(controller.create(req, res))
        .rejects.toThrow(ApiError);
    });
  });

  describe('update', () => {
    beforeEach(() => {
      controller.validateUpdateData = jest.fn();
    });

    test('debe actualizar entidad exitosamente', async () => {
      const mockData = { name: 'Updated Test' };
      req = { 
        params: { id: '1' },
        body: mockData 
      };
      service.update.mockResolvedValue({ id: 1, ...mockData });

      await controller.update(req, res);

      expect(controller.validateUpdateData).toHaveBeenCalledWith(mockData);
      expect(service.update).toHaveBeenCalledWith('1', mockData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: 1, ...mockData });
    });

    test('debe lanzar error si validación falla', async () => {
      req = { 
        params: { id: '1' },
        body: {} 
      };
      controller.validateUpdateData.mockReturnValue('Error de validación');

      await expect(controller.update(req, res))
        .rejects.toThrow(ApiError);
    });
  });

  describe("delete", () => {
    it("debe eliminar la entidad y retornar status 200", async () => {
      req.params = { id: "entity123" };
      service.delete.mockResolvedValue(true); // Simula eliminación exitosa
  
      await controller.delete(req, res);
  
      expect(service.delete).toHaveBeenCalledWith("entity123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "TestEntity eliminado correctamente",
      });
    });

    it("debe retornar error 404 si la entidad no se encuentra", async () => {
      req.params = { id: "entity123" };
      const notFoundMessage = "TestEntity no encontrado";
      service.delete.mockRejectedValue(new ApiError(404, notFoundMessage)); // Mock con ApiError
  
      try {
        await controller.delete(req, res);
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError); // Verifica que sea una instancia de ApiError
        expect(error.statusCode).toBe(404); // Verifica el código de estado
        expect(error.message).toBe(notFoundMessage); // Verifica el mensaje
      }
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("debe retornar error 500 si service.delete arroja una excepción genérica", async () => {
      const errorMsg = "Error al eliminar";
      service.delete.mockRejectedValue(new Error(errorMsg)); // Mock con Error genérico
      req.params = { id: "entity123" };
  
      try {
        await controller.delete(req, res);
      } catch (error) {
        expect(error).toBeInstanceOf(Error); // Verifica que sea una instancia de Error
        expect(error.message).toBe(errorMsg); // Verifica el mensaje
      }
  
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
    
  });

});
