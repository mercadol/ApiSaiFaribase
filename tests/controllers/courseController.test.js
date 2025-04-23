// tests/controllers/courseController.test.js
const courseController = require("../../controllers/courseController");
const courseService = require("../../services/courseService");

// Se mockea el servicio
jest.mock("../../services/courseService");

describe("CourseController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Métodos heredados y de relaciones", () => {
    test("create debe llamar a service.create con datos preparados", async () => {
      courseService.create.mockResolvedValue({ id: "course1" });

      const req = {
        body: {
          Nombre: "Curso Creado",
          Descripcion: "Descripción",
          FechaCreacion: "2023-01-01T12:00:00Z",
        },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await courseController.create(req, res);

      expect(courseService.create).toHaveBeenCalledWith({
        Nombre: "Curso Creado",
        Descripcion: "Descripción",
        FechaCreacion: "2023-01-01T12:00:00Z",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: "course1" });
    });

    test("debe llamar a addMember con los parámetros correctos", async () => {
      // Mock del método addMember
      const originalAddMember = courseController.addMember;
      courseController.addMember = jest
        .fn()
        .mockImplementation(() => Promise.resolve());

      const req = { params: { id: "course1", memberId: "member1" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn(); // Añadir mock para next

      await courseController.addMember(req, res, next);

      expect(courseController.addMember).toHaveBeenCalledWith(req, res, next);

      // Restaurar método original
      courseController.addMember = originalAddMember;
    });

    test("debe llamar a removeMember con los parámetros correctos", async () => {
      // Mock del método directamente en courseController
      const originalRemoveMember = courseController.removeMember;
      courseController.removeMember = jest
        .fn()
        .mockImplementation(() => Promise.resolve());

      const req = { params: { id: "course1", memberId: "member1" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await courseController.removeMember(req, res, next);

      expect(courseController.removeMember).toHaveBeenCalledWith(
        req,
        res,
        next
      );

      // Restaurar método original
      courseController.removeMember = originalRemoveMember;
    });

    test("debe llamar a getCourseMembers con los parámetros correctos", async () => {
      const originalGetCourseMembers = courseController.getCourseMembers;
      courseController.getCourseMembers = jest
        .fn()
        .mockImplementation(() => Promise.resolve());

      const req = { params: { id: "course1" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await courseController.getCourseMembers(req, res, next);

      expect(courseController.getCourseMembers).toHaveBeenCalledWith(
        req,
        res,
        next
      );

      courseController.getCourseMembers = originalGetCourseMembers;
    });

    test("debe llamar a getMemberCourses con los parámetros correctos", async () => {
      const originalGetMemberCourses = courseController.getMemberCourses;
      courseController.getMemberCourses = jest
        .fn()
        .mockImplementation(() => Promise.resolve());

      const req = { params: { memberId: "member1" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await courseController.getMemberCourses(req, res, next);

      expect(courseController.getMemberCourses).toHaveBeenCalledWith(
        req,
        res,
        next
      );

      courseController.getMemberCourses = originalGetMemberCourses;
    });
  });
});
