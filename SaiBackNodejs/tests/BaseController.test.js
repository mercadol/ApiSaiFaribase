// tests/BaseController.test.js
const BaseController = require("../controllers/BaseController");
const { mockRequest, mockResponse } = require("jest-mock-req-res");
// Se importa el módulo firebase para manipular sus mocks
const firebase = require("../firebase");

// Creamos un mock para firebase.db. Esto permite que al invocar
// db.collection(...).doc(...).get() se retorne por defecto un objeto simulando que el documento existe.
jest.mock("../firebase", () => ({
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({ exists: true, id: "dummyDocId" })),
      })),
    })),
  },
}));

// Creamos una subclase de BaseController que implementa los métodos abstractos
class TestController extends BaseController {
  validateCreateData(data) {
    // Por defecto, asumimos que la data es válida
    return null;
  }
  prepareCreateData(data, generatedId) {
    // Simplemente agregamos el id generado a la data
    return { ...data, id: generatedId };
  }
  validateUpdateData(data) {
    return null;
  }
}

describe("BaseController", () => {
  let controller;
  let service;
  let idGenerator;
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
      search: jest.fn().mockResolvedValue({
        results: [],
        lastDoc: { id: "last-id" },
      }),
      // Se utiliza esta propiedad para obtener el nombre de la colección en getAll
      collection: { id: "testCollection" },
    };

    // Función simulada para generar id
    idGenerator = jest.fn().mockReturnValue("generated-id");

    // Instanciamos el controlador de prueba
    controller = new TestController({
      service,
      entityName: "TestEntity",
      entityPlural: "testEntities",
      idGenerator,
    });

    // Se crean objetos simulados para req y res
    req = mockRequest();
    res = mockResponse();

    // Mock de Firebase configurable
    firebase.db.collection.mockImplementation(() => ({
      doc: jest.fn().mockImplementation((id) => ({
        get: jest.fn().mockResolvedValue({
          exists: id !== "non-existent-id", // Simula un documento que no existe
          id: id || "dummyDocId", // Usa 'dummyDocId' como valor por defecto
          data: () => ({}), // Método data para compatibilidad
        }),
      })),
    }));
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getAll", () => {
    it("debe retornar los elementos y nextStartAfter con parámetros por defecto cuando no se envía startAfter", async () => {
      // Configuramos la respuesta del servicio
      const items = [{ id: 1 }, { id: 2 }];
      const lastDoc = { id: "lastDocId" };
      service.getAll.mockResolvedValue({ items, lastDoc });

      // req.query sin startAfter; pageSize no definido, se usará 10 por defecto.
      req.query = {};

      await controller.getAll(req, res);

      // Se espera que se llame a service.getAll con startAfterDoc === null y pageSize 10
      expect(service.getAll).toHaveBeenCalledWith(null, 10);
      // Se verifica que se envíe la respuesta JSON con los datos correspondientes
      expect(res.json).toHaveBeenCalledWith({
        testEntities: items,
        nextStartAfter: lastDoc.id,
      });
    });

    it('debe utilizar el documento obtenido de firebase cuando se pasa startAfter y este existe', async () => {
      // Configura el mock de Firebase para devolver el documento esperado
      firebase.db.collection.mockReturnValueOnce({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            exists: true,
            id: 'dummyDocId',
            data: () => ({})
          })
        })
      });
    
      req.query = {
        startAfter: 'dummyDocId',
        pageSize: '5'
      };
    
      await controller.getAll(req, res);
    
      expect(service.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ exists: true, id: 'dummyDocId' }),
        5
      );
    });

    it("debe enviar null al servicio cuando el documento startAfter no existe", async () => {
      // Configuramos la respuesta del servicio
      const items = [{ id: 4 }];
      const lastDoc = null;
      service.getAll.mockResolvedValue({ items, lastDoc });

      // Simulamos query con startAfter
      req.query = { startAfter: "docNoExist", pageSize: "7" };

      // Sobreescribimos el mock para que el documento no exista
      // **CORRECCIÓN IMPORTANTE:** Mockear docRef.get() directamente
      firebase.db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn(() => ({ exists: false })), // Retorna el objeto directamente
        }),
      });

      await controller.getAll(req, res);

      // Se debe pasar null en lugar de un documento no existente
      expect(service.getAll).toHaveBeenCalledWith(null, 7);
      expect(res.json).toHaveBeenCalledWith({
        testEntities: items,
        nextStartAfter: null,
      });
    });

    it("debe retornar error 500 cuando service.getAll arroja una excepción", async () => {
      const errorMessage = "Error en getAll";
      service.getAll.mockRejectedValue(new Error(errorMessage));
      req.query = {};

      await controller.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
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

    it('debe retornar error 404 cuando el error indica "No se encontró"', async () => {
      const errorMsg = "No se encontró la entidad";
      service.getById.mockRejectedValue(new Error(errorMsg));

      req.params = { id: "abc123" };

      await controller.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: errorMsg });
    });

    it("debe retornar error 500 para otros errores", async () => {
      const errorMsg = "Error inesperado";
      service.getById.mockRejectedValue(new Error(errorMsg));

      req.params = { id: "abc123" };

      await controller.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: errorMsg });
    });
  });

  describe("create", () => {
    it("debe crear la entidad y retornar status 201", async () => {
      const data = { name: "Nuevo" };
      // La función validateCreateData de TestController retorna null (válido)
      // y prepareCreateData agrega el id generado a los datos.
      const createdResult = { id: "generated-id", name: "Nuevo" };
      service.create.mockResolvedValue(createdResult);

      req.body = data;

      await controller.create(req, res);

      expect(idGenerator).toHaveBeenCalled();
      expect(service.create).toHaveBeenCalledWith("generated-id", {
        ...data
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdResult);
    });

    it("debe retornar error 400 si la validación de creación falla", async () => {
      // Forzamos que validateCreateData retorne un mensaje de error
      controller.validateCreateData = jest
        .fn()
        .mockReturnValue("Error de validación");
      req.body = { name: "" };

      await controller.create(req, res);

      expect(controller.validateCreateData).toHaveBeenCalledWith(req.body);
      // No debe llamar al servicio para crear la entidad
      expect(service.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Error de validación" });
    });

    it("debe retornar error 409 cuando el error indica que ya existe", async () => {
      const errorMsg = "El registro ya existe";
      service.create.mockRejectedValue(new Error(errorMsg));
      req.body = { name: "Duplicado" };

      await controller.create(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: errorMsg });
    });

    it("debe retornar error 500 para otros errores en create", async () => {
      const errorMsg = "Error al crear";
      service.create.mockRejectedValue(new Error(errorMsg));
      req.body = { name: "Test" };

      await controller.create(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: errorMsg });
    });
  });

  describe("update", () => {
    it("debe actualizar la entidad y retornar status 200", async () => {
      const updatedData = { name: "Actualizado" };
      const result = { id: "entity123", name: "Actualizado" };
      service.update.mockResolvedValue(result);

      // Mockear validateUpdateData
      controller.validateUpdateData = jest.fn().mockReturnValue(null); // Simula que no hay errores de validación

      req.params = { id: "entity123" };
      req.body = updatedData;

      await controller.update(req, res);

      expect(controller.validateUpdateData).toHaveBeenCalledWith(updatedData);
      expect(service.update).toHaveBeenCalledWith("entity123", updatedData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it("debe retornar error 400 si la validación de actualización falla", async () => {
      // Forzamos que la validación falle
      controller.validateUpdateData = jest
        .fn()
        .mockReturnValue("Actualización inválida");
      req.params = { id: "entity123" };
      req.body = { name: "" };

      await controller.update(req, res);

      expect(controller.validateUpdateData).toHaveBeenCalledWith(req.body);
      expect(service.update).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Actualización inválida",
      });
    });

    it("debe retornar error 500 si service.update arroja una excepción", async () => {
      const errorMsg = "Error en update";
      service.update.mockRejectedValue(new Error(errorMsg));
      req.params = { id: "entity123" };
      req.body = { name: "Nuevo nombre" };

      await controller.update(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: errorMsg });
    });
  });

  describe("delete", () => {
    it("debe eliminar la entidad y retornar status 200", async () => {
      req.params = { id: "entity123" };
      service.delete.mockResolvedValue();

      await controller.delete(req, res);

      expect(service.delete).toHaveBeenCalledWith("entity123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "TestEntity eliminado correctamente",
      });
    });

    it("debe retornar error 500 si service.delete arroja una excepción", async () => {
      const errorMsg = "Error al eliminar";
      service.delete.mockRejectedValue(new Error(errorMsg));
      req.params = { id: "entity123" };

      await controller.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: errorMsg });
    });
  });

  describe("search", () => {
    it("debe retornar los resultados de la busqueda", async () => {
      const mockResults = [{ id: "1", name: "test" }];
      const mockLastDoc = { id: "lastId" };
      service.search.mockResolvedValue({
        results: mockResults,
        lastDoc: mockLastDoc,
      });
      req.query = {
        searchString: "test",
        pageSize: "10",
      };
      await controller.search(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        results: mockResults,
        nextStartAfter: mockLastDoc.id,
      });
    });

    it("debe retornar error 400 si searchString está ausente", async () => {
      req.query = { pageSize: "10" };
      await controller.search(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error:
          "El parámetro de búsqueda es requerido y debe ser una cadena de texto",
      });
    });

    it("debe retornar error 400 si searchString no es string", async () => {
      req.query = { searchString: 123, pageSize: "10" };
      await controller.search(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("debe retornar error 400 si pageSize no es número", async () => {
      req.query = { searchString: "test", pageSize: "abc" };
      await controller.search(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("debe retornar error 400 si pageSize es menor a 1", async () => {
      req.query = { searchString: "test", pageSize: "0" };
      await controller.search(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("debe retornar error 400 si pageSize es mayor a 100", async () => {
      req.query = { searchString: "test", pageSize: "101" };
      await controller.search(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("debe retornar error 500 si el servicio lanza una excepción", async () => {
      service.search.mockRejectedValue(new Error("Error en servicio"));

      req.query = {
        searchString: "test",
        pageSize: "10",
      };

      await controller.search(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error al buscar elementos. Inténtelo más tarde.",
      });
    });
  });
});
