// tests/controllers/eventController.test.js
const eventController = require("../../controllers/EventController");
const eventService = require("../../services/eventService");

// Se mockea el servicio
jest.mock("../../services/eventService");

describe("EventController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Métodos heredados y de relaciones", () => {
    test("create debe llamar a service.create con datos preparados", async () => {
      // Mock para el método create del servicio
      eventService.create.mockResolvedValue({ id: "event1" });

      // Simulamos req y res
      const req = {
        body: {
          Nombre: "Evento Creado",
          Descripcion: "Descripción",
          fecha: "2023-01-01T12:00:00Z",
        },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await eventController.create(req, res);

      // Se espera que prepareCreateData haya sanitado los datos
      expect(eventService.create).toHaveBeenCalledWith({
        Nombre: "Evento Creado",
        Descripcion: "Descripción",
        fecha: "2023-01-01T12:00:00Z",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: "event1" });
    });

    test("addMember debe llamar a service.addMember con los parámetros correctos", async () => {
      // Mock del método addMember
      const originalAddMember = eventController.addMember;
      eventController.addMember = jest
        .fn()
        .mockImplementation(() => Promise.resolve());

      const req = {
        params: { eventId: "event1" },
        body: { memberId: "member1" },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await eventController.addMember(req, res, next);

      expect(eventController.addMember).toHaveBeenCalledWith(req, res, next);
      
      // Restaurar método original
      eventController.addMember = originalAddMember;
    });

    test("removeMember debe llamar a service.removeMember con los parámetros correctos", async () => {
      eventService.removeMember.mockResolvedValue();

      const req = {
        params: { eventId: "event1", memberId: "member1" },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await eventController.removeMember(req, res, next);

      expect(eventService.removeMember).toHaveBeenCalledWith(
        "member1",
        "event1"
      );
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).not.toHaveBeenCalled(); // No se espera que se llame a json
    });

    test("getEventMembers debe llamar a service.getEventMembers con el parámetro correcto", async () => {
      eventService.getEventMembers.mockResolvedValue(["member1", "member2"]);

      const req = { params: { eventId: "event1" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await eventController.getEventMembers(req, res, next);

      expect(eventService.getEventMembers).toHaveBeenCalledWith("event1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(["member1", "member2"]);
    });

    test("getMemberEvents debe llamar a service.getMemberEvents con el parámetro correcto", async () => {
      eventService.getMemberEvents.mockResolvedValue(["event1", "event2"]);

      const req = { params: { memberId: "member1" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await eventController.getMemberEvents(req, res, next);

      expect(eventService.getMemberEvents).toHaveBeenCalledWith("member1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(["event1", "event2"]);
    });
  });
});
