// tests/models/CourseModel.test.js
const { db } = require("../../firebase");
const CourseModel = require("../../models/CourseModel");
const ApiError = require("../../utils/ApiError");

// Mock de Firebase
jest.mock("../../firebase", () => ({
  db: {
    collection: jest.fn(),
  },
}));

describe("CourseModel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    test("debe crear objeto con propiedades por defecto", () => {
      const course = new CourseModel({});
      expect(course.id).toBeNull();
      expect(course.Nombre).toBe("");
      expect(course.Descripcion).toBe("");
      expect(course.Duracion).toBe("");
      expect(course.FechaInicio).toBe("");
      expect(course.FechaCreacion).toBeInstanceOf(Date);
      expect(course.Nivel).toBe("");
      expect(course.Estado).toBe("");
    });

    test("debe crear objeto con propiedades especificadas", () => {
      const data = {
        id: "test-id",
        Nombre: "Test Course",
        Descripcion: "Test Description",
        Duracion: "3 meses",
        FechaInicio: "2023-06-01",
        FechaCreacion: new Date("2023-01-01"),
        Nivel: "Intermedio",
        Estado: "Activo",
      };
      const course = new CourseModel(data);
      expect(course.id).toBe("test-id");
      expect(course.Nombre).toBe("Test Course");
      expect(course.Descripcion).toBe("Test Description");
      expect(course.Duracion).toBe("3 meses");
      expect(course.FechaInicio).toBe("2023-06-01");
      expect(course.FechaCreacion).toEqual(new Date("2023-01-01"));
      expect(course.Nivel).toBe("Intermedio");
      expect(course.Estado).toBe("Activo");
    });
  });

  describe("save", () => {
    test("debe crear nuevo documento si no hay id", async () => {
      const addMock = jest.fn().mockResolvedValue({ id: "new-id" });
      db.collection.mockReturnValue({ add: addMock });

      const course = new CourseModel({
        Nombre: "Test Course",
        Descripcion: "Test Description",
        Duracion: "2 meses",
        FechaInicio: "2023-05-01",
        Nivel: "Básico",
        Estado: "Activo",
      });

      await course.save();

      expect(db.collection).toHaveBeenCalledWith("Course");
      expect(addMock).toHaveBeenCalledWith({
        Nombre: "Test Course",
        Descripcion: "Test Description",
        Duracion: "2 meses",
        FechaInicio: "2023-05-01",
        FechaCreacion: expect.any(Date),
        Nivel: "Básico",
        Estado: "Activo",
      });
      expect(course.id).toBe("new-id");
    });

    test("debe actualizar documento existente si hay id", async () => {
      const updateMock = jest.fn().mockResolvedValue({});
      const docMock = jest.fn().mockReturnValue({ update: updateMock });
      db.collection.mockReturnValue({ doc: docMock });

      const course = new CourseModel({
        id: "existing-id",
        Nombre: "Test Course",
        Descripcion: "Updated Description",
        Duracion: "4 meses",
        FechaInicio: "2023-07-01",
        Nivel: "Avanzado",
        Estado: "Inactivo",
      });

      await course.save();

      expect(db.collection).toHaveBeenCalledWith("Course");
      expect(docMock).toHaveBeenCalledWith("existing-id");
      expect(updateMock).toHaveBeenCalledWith({
        Nombre: "Test Course",
        Descripcion: "Updated Description",
        Duracion: "4 meses",
        FechaInicio: "2023-07-01",
        FechaCreacion: expect.any(Date),
        Nivel: "Avanzado",
        Estado: "Inactivo",
      });
    });

    test("debe capturar y relanzar error de Firestore", async () => {
      db.collection.mockImplementation(() => {
        throw new Error("Firebase error");
      });

      const course = new CourseModel({ Nombre: "Test Course" });

      await expect(course.save()).rejects.toThrow(ApiError);
      await expect(course.save()).rejects.toMatchObject({
        statusCode: 500,
        message:
          "Error al guardar el curso Inténtelo más tarde: Firebase error",
      });
    });
  });

  describe("delete", () => {
    test("debe lanzar error si no hay id", async () => {
      const course = new CourseModel({});

      await expect(course.delete()).rejects.toThrow(ApiError);
      await expect(course.delete()).rejects.toMatchObject({
        statusCode: 400,
        message: "ID del curso no especificado.",
      });
    });

    test("debe eliminar documento correctamente", async () => {
      const deleteMock = jest.fn().mockResolvedValue({});
      const docMock = jest.fn().mockReturnValue({ delete: deleteMock });
      db.collection.mockReturnValue({ doc: docMock });

      const course = new CourseModel({ id: "test-id" });
      await course.delete();

      expect(db.collection).toHaveBeenCalledWith("Course");
      expect(docMock).toHaveBeenCalledWith("test-id");
      expect(deleteMock).toHaveBeenCalled();
    });

    test("debe capturar y relanzar error de Firestore", async () => {
      const deleteMock = jest
        .fn()
        .mockRejectedValue(new Error("Firebase error"));
      const docMock = jest.fn().mockReturnValue({ delete: deleteMock });
      db.collection.mockReturnValue({ doc: docMock });

      const course = new CourseModel({ id: "test-id" });

      await expect(course.delete()).rejects.toThrow(ApiError);
      await expect(course.delete()).rejects.toMatchObject({
        statusCode: 500,
        message:
          "Error al eliminar el curso Inténtelo más tarde: Firebase error",
      });
    });
  });

  describe("findById", () => {
    test("debe encontrar curso por id", async () => {
      const getMock = jest.fn().mockResolvedValue({
        exists: true,
        id: "test-id",
        data: () => ({
          Nombre: "Test Course",
          Descripcion: "Test Description",
          Duracion: "3 meses",
          FechaInicio: "2023-06-01",
          FechaCreacion: new Date("2023-01-01"),
          Nivel: "Intermedio",
          Estado: "Activo",
        }),
      });
      const docMock = jest.fn().mockReturnValue({ get: getMock });
      db.collection.mockReturnValue({ doc: docMock });

      const course = await CourseModel.findById("test-id");

      expect(db.collection).toHaveBeenCalledWith("Course");
      expect(docMock).toHaveBeenCalledWith("test-id");
      expect(course).toBeInstanceOf(CourseModel);
      expect(course.id).toBe("test-id");
      expect(course.Nombre).toBe("Test Course");
      expect(course.Duracion).toBe("3 meses");
      expect(course.FechaInicio).toBe("2023-06-01");
      expect(course.Nivel).toBe("Intermedio");
      expect(course.Estado).toBe("Activo");
    });

    test("debe lanzar error si el curso no existe", async () => {
      const getMock = jest.fn().mockResolvedValue({
        exists: false,
      });
      const docMock = jest.fn().mockReturnValue({ get: getMock });
      db.collection.mockReturnValue({ doc: docMock });

      await expect(CourseModel.findById("no-existe")).rejects.toThrow(ApiError);
      await expect(CourseModel.findById("no-existe")).rejects.toMatchObject({
        statusCode: 404,
        message: "Curso no encontrado.",
      });
    });

    test("debe capturar otros errores como 500", async () => {
      const getMock = jest.fn().mockRejectedValue(new Error("Firebase error"));
      const docMock = jest.fn().mockReturnValue({ get: getMock });
      db.collection.mockReturnValue({ doc: docMock });

      await expect(CourseModel.findById("test-id")).rejects.toThrow(ApiError);
      await expect(CourseModel.findById("test-id")).rejects.toMatchObject({
        statusCode: 500,
        message: "Error al buscar el curso Inténtelo más tarde: Firebase error",
      });
    });
  });

  describe("findAll", () => {
    test("debe encontrar todos los cursos (primera página)", async () => {
      const docs = [
        {
          id: "id1",
          data: () => ({
            Nombre: "Course 1",
            Descripcion: "Description 1",
            Duracion: "2 meses",
            FechaInicio: "2023-05-01",
            Nivel: "Básico",
            Estado: "Activo",
          }),
        },
        {
          id: "id2",
          data: () => ({
            Nombre: "Course 2",
            Descripcion: "Description 2",
            Duracion: "3 meses",
            FechaInicio: "2023-06-01",
            Nivel: "Intermedio",
            Estado: "Inactivo",
          }),
        },
      ];

      const getMock = jest.fn().mockResolvedValue({ docs });
      const limitMock = jest.fn().mockReturnValue({ get: getMock });
      const orderByMock = jest.fn().mockReturnValue({ limit: limitMock });
      db.collection.mockReturnValue({ orderBy: orderByMock });

      const courses = await CourseModel.findAll();

      expect(db.collection).toHaveBeenCalledWith("Course");
      expect(orderByMock).toHaveBeenCalledWith("Nombre");
      expect(limitMock).toHaveBeenCalledWith(10);
      expect(courses).toHaveLength(2);
      expect(courses[0]).toBeInstanceOf(CourseModel);
      expect(courses[0].id).toBe("id1");
      expect(courses[1].id).toBe("id2");
      expect(courses[0].Duracion).toBe("2 meses");
      expect(courses[1].Estado).toBe("Inactivo");
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
            Nombre: "Course 3",
            Duracion: "4 meses",
            FechaInicio: "2023-07-01",
            Nivel: "Avanzado",
            Estado: "Activo",
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

      const courses = await CourseModel.findAll("start-id", 5);

      expect(startAfterDocMock).toHaveBeenCalledWith("start-id");
      expect(limitMock).toHaveBeenCalledWith(5);
      expect(startAfterMock).toHaveBeenCalled();
      expect(courses).toHaveLength(1);
      expect(courses[0].Duracion).toBe("4 meses");
      expect(courses[0].Nivel).toBe("Avanzado");
    });
  });

  describe("search", () => {
    test("debe buscar cursos por nombre", async () => {
      const docs = [
        {
          id: "id1",
          data: () => ({
            Nombre: "JavaScript",
            Descripcion: "Curso de JS",
            Duracion: "2 meses",
            Nivel: "Intermedio",
            Estado: "Activo",
          }),
        },
      ];

      const getMock = jest.fn().mockResolvedValue({ docs });
      const limitMock = jest.fn().mockReturnValue({ get: getMock });
      const orderByMock = jest.fn().mockReturnValue({ limit: limitMock });
      const where2Mock = jest.fn().mockReturnValue({ orderBy: orderByMock });
      const whereMock = jest.fn().mockReturnValue({ where: where2Mock });
      db.collection.mockReturnValue({ where: whereMock });

      const result = await CourseModel.search("Java");

      expect(db.collection).toHaveBeenCalledWith("Course");
      expect(whereMock).toHaveBeenCalledWith("Nombre", ">=", "Java");
      expect(where2Mock).toHaveBeenCalledWith("Nombre", "<=", "Java\uf8ff");
      expect(result.results).toHaveLength(1);
      expect(result.results[0]).toBeInstanceOf(CourseModel);
      expect(result.results[0].Nombre).toBe("JavaScript");
    });
  });

  describe("addMember", () => {
    test("debe lanzar error si no hay id del curso", async () => {
      const course = new CourseModel({});

      await expect(course.addMember("member-id")).rejects.toThrow(ApiError);
      await expect(course.addMember("member-id")).rejects.toMatchObject({
        statusCode: 400,
        message: "ID del curso no especificado.",
      });
    });

    test("debe lanzar error si no hay id del miembro", async () => {
      const course = new CourseModel({ id: "course-id" });

      await expect(course.addMember()).rejects.toThrow(ApiError);
      await expect(course.addMember()).rejects.toMatchObject({
        statusCode: 400,
        message: "ID del miembro no especificado.",
      });
    });

    test("debe agregar miembro correctamente", async () => {
      const setMock = jest.fn().mockResolvedValue({});
      const docMock = jest.fn().mockReturnValue({ set: setMock });
      db.collection.mockReturnValue({ doc: docMock });

      const course = new CourseModel({ id: "course-id" });
      await course.addMember("member-id");

      expect(db.collection).toHaveBeenCalledWith("CourseMember");
      expect(docMock).toHaveBeenCalledWith("course-id_member-id");
      expect(setMock).toHaveBeenCalledWith({
        courseId: "course-id",
        memberId: "member-id",
      });
    });
  });

  describe("removeMember", () => {
    test("debe lanzar error si no hay id del curso", async () => {
      const course = new CourseModel({});

      await expect(course.removeMember("member-id")).rejects.toThrow(ApiError);
      await expect(course.removeMember("member-id")).rejects.toMatchObject({
        statusCode: 400,
        message: "ID del curso no especificado.",
      });
    });

    test("debe lanzar error si no hay id del miembro", async () => {
      const course = new CourseModel({ id: "course-id" });

      await expect(course.removeMember()).rejects.toThrow(ApiError);
      await expect(course.removeMember()).rejects.toMatchObject({
        statusCode: 400,
        message: "ID del miembro no especificado.",
      });
    });

    test("debe eliminar miembro correctamente", async () => {
      const deleteMock = jest.fn().mockResolvedValue({});
      const docMock = jest.fn().mockReturnValue({ delete: deleteMock });
      db.collection.mockReturnValue({ doc: docMock });

      const course = new CourseModel({ id: "course-id" });
      await course.removeMember("member-id");

      expect(db.collection).toHaveBeenCalledWith("CourseMember");
      expect(docMock).toHaveBeenCalledWith("course-id_member-id");
      expect(deleteMock).toHaveBeenCalled();
    });
  });

  describe("getCourseMembers", () => {
    test("debe lanzar error si no hay id del curso", async () => {
      await expect(CourseModel.getCourseMembers()).rejects.toThrow(ApiError);
      await expect(CourseModel.getCourseMembers()).rejects.toMatchObject({
        statusCode: 400,
        message: "ID del curso no especificado.",
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

      const memberIds = await CourseModel.getCourseMembers("course-id");

      expect(db.collection).toHaveBeenCalledWith("CourseMember");
      expect(whereMock).toHaveBeenCalledWith("courseId", "==", "course-id");
      expect(memberIds).toEqual(["member1", "member2"]);
    });
  });

  describe("getMemberCourses", () => {
    test("debe lanzar error si no hay id del miembro", async () => {
      await expect(CourseModel.getMemberCourses()).rejects.toThrow(ApiError);
      await expect(CourseModel.getMemberCourses()).rejects.toMatchObject({
        statusCode: 400,
        message: "ID del miembro no especificado.",
      });
    });

    test("debe obtener cursos de un miembro correctamente", async () => {
      // Mock para la consulta de CourseMember
      const memberDocs = [
        { data: () => ({ courseId: "course1" }) },
        { data: () => ({ courseId: "course2" }) },
      ];

      const memberGetMock = jest.fn().mockResolvedValue({ docs: memberDocs });
      const memberWhereMock = jest.fn().mockReturnValue({ get: memberGetMock });

      // Mock para findById (para cada curso)
      const course1Data = {
        exists: true,
        id: "course1",
        data: () => ({
          Nombre: "Course 1",
          Descripcion: "Desc 1",
          Duracion: "2 meses",
          Nivel: "Básico",
          Estado: "Activo",
        }),
      };

      const course2Data = {
        exists: true,
        id: "course2",
        data: () => ({
          Nombre: "Course 2",
          Descripcion: "Desc 2",
          Duracion: "3 meses",
          Nivel: "Avanzado",
          Estado: "Inactivo",
        }),
      };

      // Configurar mocks para simular llamadas encadenadas
      let callCount = 0;
      const courseGetMock = jest.fn().mockImplementation(() => {
        callCount++;
        return callCount === 1 ? course1Data : course2Data;
      });

      const courseDocMock = jest.fn().mockReturnValue({ get: courseGetMock });

      db.collection.mockImplementation((name) => {
        if (name === "CourseMember") {
          return { where: memberWhereMock };
        } else if (name === "Course") {
          return { doc: courseDocMock };
        }
      });

      const courses = await CourseModel.getMemberCourses("member-id");

      expect(db.collection).toHaveBeenCalledWith("CourseMember");
      expect(memberWhereMock).toHaveBeenCalledWith(
        "memberId",
        "==",
        "member-id"
      );
      expect(courses).toHaveLength(2);
      expect(courses[0]).toBeInstanceOf(CourseModel);
      expect(courses[0].id).toBe("course1");
      expect(courses[1].id).toBe("course2");
      expect(courses[0].Duracion).toBe("2 meses");
      expect(courses[1].Nivel).toBe("Avanzado");
    });
  });
});
