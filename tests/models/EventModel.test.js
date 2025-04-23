// tests/models/EventModel.test.js
const { db } = require("../../firebase");
const EventModel = require("../../models/EventModel");
const ApiError = require("../../utils/ApiError");

// Mock de Firebase
jest.mock("../../firebase", () => ({
  db: {
    collection: jest.fn(),
  },
}));

describe("EventModel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    test("debe crear objeto con propiedades por defecto", () => {
      const event = new EventModel({});
      expect(event.id).toBeNull();
      expect(event.Nombre).toBe("");
      expect(event.Descripcion).toBe("");
      expect(event.Fecha).toBeInstanceOf(Date);
      expect(event.Estado).toBe("");
      expect(event.Lugar).toBe("");
    });

    test("debe crear objeto con propiedades especificadas", () => {
      const data = {
        id: "test-id",
        Nombre: "Test Event",
        Descripcion: "Test Description",
        Fecha: new Date("2023-01-01"),
        Estado: "Activo",
        Lugar: "Online",
      };
      const event = new EventModel(data);
      expect(event.id).toBe("test-id");
      expect(event.Nombre).toBe("Test Event");
      expect(event.Descripcion).toBe("Test Description");
      expect(event.Fecha).toEqual(new Date("2023-01-01"));
      expect(event.Estado).toBe("Activo");
      expect(event.Lugar).toBe("Online");
    });
  });

  describe("save", () => {
    test("debe crear nuevo documento si no hay id", async () => {
      const addMock = jest.fn().mockResolvedValue({ id: "new-id" });
      db.collection.mockReturnValue({ add: addMock });

      const event = new EventModel({
        Nombre: "Test Event",
        Descripcion: "Test Description",
        Estado: "Activo",
        Lugar: "Online",
      });

      await event.save();

      expect(db.collection).toHaveBeenCalledWith("Event");
      expect(addMock).toHaveBeenCalledWith({
        Nombre: "Test Event",
        Descripcion: "Test Description",
        Fecha: expect.any(Date),
        Estado: "Activo",
        Lugar: "Online",
      });
      expect(event.id).toBe("new-id");
    });

    test("debe actualizar documento existente si hay id", async () => {
      const updateMock = jest.fn().mockResolvedValue({});
      const docMock = jest.fn().mockReturnValue({ update: updateMock });
      db.collection.mockReturnValue({ doc: docMock });

      const event = new EventModel({
        id: "existing-id",
        Nombre: "Test Event",
        Descripcion: "Updated Description",
        Estado: "Inactivo",
        Lugar: "Hybrid",
      });

      await event.save();

      expect(db.collection).toHaveBeenCalledWith("Event");
      expect(docMock).toHaveBeenCalledWith("existing-id");
      expect(updateMock).toHaveBeenCalledWith({
        Nombre: "Test Event",
        Descripcion: "Updated Description",
        Fecha: expect.any(Date),
        Estado: "Inactivo",
        Lugar: "Hybrid",
      });
    });

    test("debe capturar y relanzar error de Firestore", async () => {
      db.collection.mockImplementation(() => {
        throw new Error("Firebase error");
      });

      const event = new EventModel({ Nombre: "Test Event" });

      await expect(event.save()).rejects.toThrow(ApiError);
      await expect(event.save()).rejects.toMatchObject({
        statusCode: 500,
        message:
          "Error al guardar el evento Inténtelo más tarde: Firebase error",
      });
    });
  });

  describe("delete", () => {
    test("debe lanzar error si no hay id", async () => {
      const event = new EventModel({});

      await expect(event.delete()).rejects.toThrow(ApiError);
      await expect(event.delete()).rejects.toMatchObject({
        statusCode: 400,
        message: "ID del evento no especificado.",
      });
    });

    test("debe eliminar documento correctamente", async () => {
      const deleteMock = jest.fn().mockResolvedValue({});
      const docMock = jest.fn().mockReturnValue({ delete: deleteMock });
      db.collection.mockReturnValue({ doc: docMock });

      const event = new EventModel({ id: "test-id" });
      await event.delete();

      expect(db.collection).toHaveBeenCalledWith("Event");
      expect(docMock).toHaveBeenCalledWith("test-id");
      expect(deleteMock).toHaveBeenCalled();
    });

    test("debe capturar y relanzar error de Firestore", async () => {
      const deleteMock = jest
        .fn()
        .mockRejectedValue(new Error("Firebase error"));
      const docMock = jest.fn().mockReturnValue({ delete: deleteMock });
      db.collection.mockReturnValue({ doc: docMock });

      const event = new EventModel({ id: "test-id" });

      await expect(event.delete()).rejects.toThrow(ApiError);
      await expect(event.delete()).rejects.toMatchObject({
        statusCode: 500,
        message:
          "Error al eliminar el evento Inténtelo más tarde: Firebase error",
      });
    });
  });

  describe("findById", () => {
    test("debe encontrar evento por id", async () => {
      const getMock = jest.fn().mockResolvedValue({
        exists: true,
        id: "test-id",
        data: () => ({
          Nombre: "Test Event",
          Descripcion: "Test Description",
          Fecha: new Date("2023-01-01"),
          Estado: "Activo",
          Lugar: "Online",
        }),
      });
      const docMock = jest.fn().mockReturnValue({ get: getMock });
      db.collection.mockReturnValue({ doc: docMock });

      const event = await EventModel.findById("test-id");

      expect(db.collection).toHaveBeenCalledWith("Event");
      expect(docMock).toHaveBeenCalledWith("test-id");
      expect(event).toBeInstanceOf(EventModel);
      expect(event.id).toBe("test-id");
      expect(event.Nombre).toBe("Test Event");
      expect(event.Estado).toBe("Activo");
      expect(event.Lugar).toBe("Online");
    });

    test("debe lanzar error si el evento no existe", async () => {
      const getMock = jest.fn().mockResolvedValue({
        exists: false,
      });
      const docMock = jest.fn().mockReturnValue({ get: getMock });
      db.collection.mockReturnValue({ doc: docMock });

      await expect(EventModel.findById("no-existe")).rejects.toThrow(ApiError);
      await expect(EventModel.findById("no-existe")).rejects.toMatchObject({
        statusCode: 404,
        message: "Evento no encontrado.",
      });
    });

    test("debe capturar otros errores como 500", async () => {
      const getMock = jest.fn().mockRejectedValue(new Error("Firebase error"));
      const docMock = jest.fn().mockReturnValue({ get: getMock });
      db.collection.mockReturnValue({ doc: docMock });

      await expect(EventModel.findById("test-id")).rejects.toThrow(ApiError);
      await expect(EventModel.findById("test-id")).rejects.toMatchObject({
        statusCode: 500,
        message:
          "Error al buscar el evento Inténtelo más tarde: Firebase error",
      });
    });
  });

  describe("findAll", () => {
    test("debe encontrar todos los eventos (primera página)", async () => {
      const docs = [
        {
          id: "id1",
          data: () => ({
            Nombre: "Event 1",
            Descripcion: "Description 1",
            Fecha: new Date("2023-01-01"),
            Estado: "Activo",
            Lugar: "Online",
          }),
        },
        {
          id: "id2",
          data: () => ({
            Nombre: "Event 2",
            Descripcion: "Description 2",
            Fecha: new Date("2023-02-01"),
            Estado: "Inactivo",
            Lugar: "Presencial",
          }),
        },
      ];

      const getMock = jest.fn().mockResolvedValue({ docs });
      const limitMock = jest.fn().mockReturnValue({ get: getMock });
      const orderByMock = jest.fn().mockReturnValue({ limit: limitMock });
      db.collection.mockReturnValue({ orderBy: orderByMock });

      const events = await EventModel.findAll();

      expect(db.collection).toHaveBeenCalledWith("Event");
      expect(orderByMock).toHaveBeenCalledWith("Nombre");
      expect(limitMock).toHaveBeenCalledWith(10);
      expect(events).toHaveLength(2);
      expect(events[0]).toBeInstanceOf(EventModel);
      expect(events[0].id).toBe("id1");
      expect(events[1].id).toBe("id2");
      expect(events[0].Estado).toBe("Activo");
      expect(events[1].Lugar).toBe("Presencial");
    });

    test("debe manejar paginación con startAfterId", async () => {
      const startAfterDocGetMock = jest.fn().mockResolvedValue({
        exists: true,
      });
      const startAfterDocMock = jest.fn().mockReturnValue({
        get: startAfterDocGetMock,
      });

      const docs = [
        {
          id: "id3",
          data: () => ({
            Nombre: "Event 3",
            Descripcion: "Description 3",
            Fecha: new Date("2023-03-01"),
            Estado: "Activo",
            Lugar: "Hybrid",
          }),
        },
      ];

      const getMock = jest.fn().mockResolvedValue({ docs });
      const startAfterMock = jest.fn().mockReturnValue({ get: getMock });
      const limitMock = jest
        .fn()
        .mockReturnValue({ startAfter: startAfterMock });
      const orderByMock = jest.fn().mockReturnValue({ limit: limitMock });

      db.collection.mockImplementation((name) => {
        return {
          orderBy: orderByMock,
          doc: startAfterDocMock,
        };
      });

      const events = await EventModel.findAll("start-id", 5);

      expect(startAfterDocMock).toHaveBeenCalledWith("start-id");
      expect(limitMock).toHaveBeenCalledWith(5);
      expect(startAfterMock).toHaveBeenCalled();
      expect(events).toHaveLength(1);
      expect(events[0].Lugar).toBe("Hybrid");
    });
  });

  describe("search", () => {
    test("debe buscar eventos por nombre", async () => {
      const docs = [
        {
          id: "id1",
          data: () => ({
            Nombre: "Conferencia",
            Descripcion: "Descripción de la conferencia",
            Fecha: new Date("2023-01-15"),
            Estado: "Activo",
            Lugar: "Online",
          }),
        },
      ];

      const getMock = jest.fn().mockResolvedValue({ docs });
      const limitMock = jest.fn().mockReturnValue({ get: getMock });
      const orderByMock = jest.fn().mockReturnValue({ limit: limitMock });
      const where2Mock = jest.fn().mockReturnValue({ orderBy: orderByMock });
      const whereMock = jest.fn().mockReturnValue({ where: where2Mock });
      db.collection.mockReturnValue({ where: whereMock });

      const result = await EventModel.search("Conf");

      expect(db.collection).toHaveBeenCalledWith("Event");
      expect(whereMock).toHaveBeenCalledWith("Nombre", ">=", "Conf");
      expect(where2Mock).toHaveBeenCalledWith("Nombre", "<=", "Conf\uf8ff");
      expect(result.results).toHaveLength(1);
      expect(result.results[0]).toBeInstanceOf(EventModel);
      expect(result.results[0].Nombre).toBe("Conferencia");
    });
  });

  describe("addMember", () => {
    test("debe lanzar error si no hay id del evento", async () => {
      const event = new EventModel({});

      await expect(event.addMember("member-id")).rejects.toThrow(ApiError);
      await expect(event.addMember("member-id")).rejects.toMatchObject({
        statusCode: 400,
        message: "ID del evento no especificado.",
      });
    });

    test("debe lanzar error si no hay id del miembro", async () => {
      const event = new EventModel({ id: "event-id" });

      await expect(event.addMember()).rejects.toThrow(ApiError);
      await expect(event.addMember()).rejects.toMatchObject({
        statusCode: 400,
        message: "ID del miembro no especificado.",
      });
    });

    test("debe agregar miembro correctamente", async () => {
      const setMock = jest.fn().mockResolvedValue({});
      const docMock = jest.fn().mockReturnValue({ set: setMock });
      db.collection.mockReturnValue({ doc: docMock });

      const event = new EventModel({ id: "event-id" });
      await event.addMember("member-id");

      expect(db.collection).toHaveBeenCalledWith("EventMember");
      expect(docMock).toHaveBeenCalledWith("event-id_member-id");
      expect(setMock).toHaveBeenCalledWith({
        eventId: "event-id",
        memberId: "member-id",
      });
    });
  });

  describe("removeMember", () => {
    test("debe lanzar error si no hay id del evento", async () => {
      const event = new EventModel({});

      await expect(event.removeMember("member-id")).rejects.toThrow(ApiError);
      await expect(event.removeMember("member-id")).rejects.toMatchObject({
        statusCode: 400,
        message: "ID del evento no especificado.",
      });
    });

    test("debe lanzar error si no hay id del miembro", async () => {
      const event = new EventModel({ id: "event-id" });

      await expect(event.removeMember()).rejects.toThrow(ApiError);
      await expect(event.removeMember()).rejects.toMatchObject({
        statusCode: 400,
        message: "ID del miembro no especificado.",
      });
    });

    test("debe eliminar miembro correctamente", async () => {
      const deleteMock = jest.fn().mockResolvedValue({});
      const docMock = jest.fn().mockReturnValue({ delete: deleteMock });
      db.collection.mockReturnValue({ doc: docMock });

      const event = new EventModel({ id: "event-id" });
      await event.removeMember("member-id");

      expect(db.collection).toHaveBeenCalledWith("EventMember");
      expect(docMock).toHaveBeenCalledWith("event-id_member-id");
      expect(deleteMock).toHaveBeenCalled();
    });
  });

  describe("getEventMembers", () => {
    test("debe lanzar error si no hay id del evento", async () => {
      await expect(EventModel.getEventMembers()).rejects.toThrow(ApiError);
      await expect(EventModel.getEventMembers()).rejects.toMatchObject({
        statusCode: 400,
        message: "ID del evento no especificado.",
      });
    });

    test("debe obtener miembros correctamente", async () => {
      const docs = [
        { data: () => ({ memberId: "member1" }) },
        { data: () => ({ memberId: "member2" }) },
      ];

      const getMock = jest.fn().mockResolvedValue({ docs });
      const whereMock = jest.fn().mockReturnValue({ get: getMock });
      db.collection.mockReturnValue({ where: whereMock });

      const memberIds = await EventModel.getEventMembers("event-id");

      expect(db.collection).toHaveBeenCalledWith("EventMember");
      expect(whereMock).toHaveBeenCalledWith("eventId", "==", "event-id");
      expect(memberIds).toEqual(["member1", "member2"]);
    });
  });

  describe("getMemberEvents", () => {
    test("debe lanzar error si no hay id del miembro", async () => {
      await expect(EventModel.getMemberEvents()).rejects.toThrow(ApiError);
      await expect(EventModel.getMemberEvents()).rejects.toMatchObject({
        statusCode: 400,
        message: "ID del miembro no especificado.",
      });
    });

    test("debe obtener eventos de un miembro correctamente", async () => {
      // Mock para la consulta de EventMember
      const memberDocs = [
        { data: () => ({ eventId: "event1" }) },
        { data: () => ({ eventId: "event2" }) },
      ];

      const memberGetMock = jest.fn().mockResolvedValue({ docs: memberDocs });
      const memberWhereMock = jest.fn().mockReturnValue({ get: memberGetMock });

      // Mock para findById (para cada evento)
      const event1Data = {
        exists: true,
        id: "event1",
        data: () => ({
          Nombre: "Event 1",
          Descripcion: "Desc 1",
          Fecha: new Date("2023-04-01"),
          Estado: "Activo",
          Lugar: "Online",
        }),
      };

      const event2Data = {
        exists: true,
        id: "event2",
        data: () => ({
          Nombre: "Event 2",
          Descripcion: "Desc 2",
          Fecha: new Date("2023-05-01"),
          Estado: "Inactivo",
          Lugar: "Presencial",
        }),
      };

      // Configurar mocks para simular llamadas encadenadas
      let callCount = 0;
      const eventGetMock = jest.fn().mockImplementation(() => {
        callCount++;
        return callCount === 1 ? event1Data : event2Data;
      });

      const eventDocMock = jest.fn().mockReturnValue({ get: eventGetMock });

      db.collection.mockImplementation((name) => {
        if (name === "EventMember") {
          return { where: memberWhereMock };
        } else if (name === "Event") {
          return { doc: eventDocMock };
        }
      });

      const events = await EventModel.getMemberEvents("member-id");

      expect(db.collection).toHaveBeenCalledWith("EventMember");
      expect(memberWhereMock).toHaveBeenCalledWith(
        "memberId",
        "==",
        "member-id"
      );
      expect(events).toHaveLength(2);
      expect(events[0]).toBeInstanceOf(EventModel);
      expect(events[0].id).toBe("event1");
      expect(events[1].id).toBe("event2");
      expect(events[0].Lugar).toBe("Online");
      expect(events[1].Estado).toBe("Inactivo");
    });
  });
});
