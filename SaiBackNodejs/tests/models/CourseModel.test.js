// tests/models/CourseModel.test.js
"use strict";

const { db } = require('../../firebase');
const CourseModel = require('../../models/CourseModel');
const ApiError = require('../../utils/ApiError');

// Mock de Firebase
jest.mock('../../firebase', () => ({
  db: {
    collection: jest.fn(),
  }
}));

describe('CourseModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('debe crear objeto con propiedades por defecto', () => {
      const course = new CourseModel({});
      expect(course.id).toBeNull();
      expect(course.nombre).toBe('');
      expect(course.descripcion).toBe('');
      expect(course.fechaCreacion).toBeInstanceOf(Date);
    });

    test('debe crear objeto con propiedades especificadas', () => {
      const data = {
        id: 'test-id',
        nombre: 'Test Course',
        descripcion: 'Test Description',
        fechaCreacion: new Date('2023-01-01')
      };
      const course = new CourseModel(data);
      expect(course.id).toBe('test-id');
      expect(course.nombre).toBe('Test Course');
      expect(course.descripcion).toBe('Test Description');
      expect(course.fechaCreacion).toEqual(new Date('2023-01-01'));
    });
  });

  describe('save', () => {
    test('debe crear nuevo documento si no hay id', async () => {
      const addMock = jest.fn().mockResolvedValue({ id: 'new-id' });
      db.collection.mockReturnValue({ add: addMock });
      
      const course = new CourseModel({
        nombre: 'Test Course',
        descripcion: 'Test Description'
      });
      
      await course.save();
      
      expect(db.collection).toHaveBeenCalledWith('Course');
      expect(addMock).toHaveBeenCalledWith({
        nombre: 'Test Course',
        descripcion: 'Test Description',
        fechaCreacion: expect.any(Date)
      });
      expect(course.id).toBe('new-id');
    });

    test('debe actualizar documento existente si hay id', async () => {
      const updateMock = jest.fn().mockResolvedValue({});
      const docMock = jest.fn().mockReturnValue({ update: updateMock });
      db.collection.mockReturnValue({ doc: docMock });
      
      const course = new CourseModel({
        id: 'existing-id',
        nombre: 'Test Course',
        descripcion: 'Updated Description'
      });
      
      await course.save();
      
      expect(db.collection).toHaveBeenCalledWith('Course');
      expect(docMock).toHaveBeenCalledWith('existing-id');
      expect(updateMock).toHaveBeenCalledWith({
        nombre: 'Test Course',
        descripcion: 'Updated Description',
        fechaCreacion: expect.any(Date)
      });
    });

    test('debe capturar y relanzar error de Firestore', async () => {
      db.collection.mockImplementation(() => {
        throw new Error('Firebase error');
      });
      
      const course = new CourseModel({ nombre: 'Test Course' });
      
      await expect(course.save()).rejects.toThrow(ApiError);
      await expect(course.save()).rejects.toMatchObject({
        statusCode: 500,
        message: "Error al guardar el curso Inténtelo más tarde: Firebase error"
      });
    });
  });

  describe('delete', () => {
    test('debe lanzar error si no hay id', async () => {
      const course = new CourseModel({});
      
      await expect(course.delete()).rejects.toThrow(ApiError);
      await expect(course.delete()).rejects.toMatchObject({
        statusCode: 400,
        message: "ID del curso no especificado."
      });
    });

    test('debe eliminar documento correctamente', async () => {
      const deleteMock = jest.fn().mockResolvedValue({});
      const docMock = jest.fn().mockReturnValue({ delete: deleteMock });
      db.collection.mockReturnValue({ doc: docMock });
      
      const course = new CourseModel({ id: 'test-id' });
      await course.delete();
      
      expect(db.collection).toHaveBeenCalledWith('Course');
      expect(docMock).toHaveBeenCalledWith('test-id');
      expect(deleteMock).toHaveBeenCalled();
    });

    test('debe capturar y relanzar error de Firestore', async () => {
      const deleteMock = jest.fn().mockRejectedValue(new Error('Firebase error'));
      const docMock = jest.fn().mockReturnValue({ delete: deleteMock });
      db.collection.mockReturnValue({ doc: docMock });
      
      const course = new CourseModel({ id: 'test-id' });
      
      await expect(course.delete()).rejects.toThrow(ApiError);
      await expect(course.delete()).rejects.toMatchObject({
        statusCode: 500,
        message: "Error al eliminar el curso Inténtelo más tarde: Firebase error"
      });
    });
  });

  describe('findById', () => {
    test('debe encontrar curso por id', async () => {
      const getMock = jest.fn().mockResolvedValue({
        exists: true,
        id: 'test-id',
        data: () => ({
          nombre: 'Test Course',
          descripcion: 'Test Description',
          fechaCreacion: new Date('2023-01-01')
        })
      });
      const docMock = jest.fn().mockReturnValue({ get: getMock });
      db.collection.mockReturnValue({ doc: docMock });
      
      const course = await CourseModel.findById('test-id');
      
      expect(db.collection).toHaveBeenCalledWith('Course');
      expect(docMock).toHaveBeenCalledWith('test-id');
      expect(course).toBeInstanceOf(CourseModel);
      expect(course.id).toBe('test-id');
      expect(course.nombre).toBe('Test Course');
    });

    test('debe lanzar error si el curso no existe', async () => {
      const getMock = jest.fn().mockResolvedValue({
        exists: false
      });
      const docMock = jest.fn().mockReturnValue({ get: getMock });
      db.collection.mockReturnValue({ doc: docMock });
      
      await expect(CourseModel.findById('no-existe')).rejects.toThrow(ApiError);
      await expect(CourseModel.findById('no-existe')).rejects.toMatchObject({
        statusCode: 404,
        message: "Curso no encontrado."
      });
    });

    test('debe capturar otros errores como 500', async () => {
      const getMock = jest.fn().mockRejectedValue(new Error('Firebase error'));
      const docMock = jest.fn().mockReturnValue({ get: getMock });
      db.collection.mockReturnValue({ doc: docMock });
      
      await expect(CourseModel.findById('test-id')).rejects.toThrow(ApiError);
      await expect(CourseModel.findById('test-id')).rejects.toMatchObject({
        statusCode: 500,
        message: "Error al buscar el curso Inténtelo más tarde: Firebase error"
      });
    });
  });

  describe('findAll', () => {
    test('debe encontrar todos los cursos (primera página)', async () => {
      const docs = [
        {
          id: 'id1',
          data: () => ({ nombre: 'Course 1', descripcion: 'Description 1' })
        },
        {
          id: 'id2',
          data: () => ({ nombre: 'Course 2', descripcion: 'Description 2' })
        }
      ];
      
      const getMock = jest.fn().mockResolvedValue({ docs });
      const limitMock = jest.fn().mockReturnValue({ get: getMock });
      const orderByMock = jest.fn().mockReturnValue({ limit: limitMock });
      db.collection.mockReturnValue({ orderBy: orderByMock });
      
      const courses = await CourseModel.findAll();
      
      expect(db.collection).toHaveBeenCalledWith('Course');
      expect(orderByMock).toHaveBeenCalledWith('nombre');
      expect(limitMock).toHaveBeenCalledWith(10);
      expect(courses).toHaveLength(2);
      expect(courses[0]).toBeInstanceOf(CourseModel);
      expect(courses[0].id).toBe('id1');
      expect(courses[1].id).toBe('id2');
    });

    test('debe manejar paginación con startAfterId', async () => {
      const startAfterDocGetMock = jest.fn().mockResolvedValue({
        exists: true
      });
      const startAfterDocMock = jest.fn().mockReturnValue({ 
        get: startAfterDocGetMock 
      });
      
      const docs = [{ id: 'id3', data: () => ({ nombre: 'Course 3' }) }];
      
      const getMock = jest.fn().mockResolvedValue({ docs });
      const startAfterMock = jest.fn().mockReturnValue({ get: getMock });
      const limitMock = jest.fn().mockReturnValue({ startAfter: startAfterMock });
      const orderByMock = jest.fn().mockReturnValue({ limit: limitMock });
      
      db.collection.mockImplementation((name) => {
        return { 
          orderBy: orderByMock,
          doc: startAfterDocMock 
        };
      });
      
      const courses = await CourseModel.findAll('start-id', 5);
      
      expect(startAfterDocMock).toHaveBeenCalledWith('start-id');
      expect(limitMock).toHaveBeenCalledWith(5);
      expect(startAfterMock).toHaveBeenCalled();
      expect(courses).toHaveLength(1);
    });
  });

  describe('addMember', () => {
    test('debe lanzar error si no hay id del curso', async () => {
      const course = new CourseModel({});
      
      await expect(course.addMember('member-id')).rejects.toThrow(ApiError);
      await expect(course.addMember('member-id')).rejects.toMatchObject({
        statusCode: 400,
        message: "ID del curso no especificado."
      });
    });

    test('debe lanzar error si no hay id del miembro', async () => {
      const course = new CourseModel({ id: 'course-id' });
      
      await expect(course.addMember()).rejects.toThrow(ApiError);
      await expect(course.addMember()).rejects.toMatchObject({
        statusCode: 400,
        message: "ID del miembro no especificado."
      });
    });

    test('debe agregar miembro correctamente', async () => {
      const setMock = jest.fn().mockResolvedValue({});
      const docMock = jest.fn().mockReturnValue({ set: setMock });
      db.collection.mockReturnValue({ doc: docMock });
      
      const course = new CourseModel({ id: 'course-id' });
      await course.addMember('member-id');
      
      expect(db.collection).toHaveBeenCalledWith('CourseMember');
      expect(docMock).toHaveBeenCalledWith('course-id_member-id');
      expect(setMock).toHaveBeenCalledWith({
        courseId: 'course-id',
        memberId: 'member-id',
      });
    });
  });

  describe('removeMember', () => {
    test('debe lanzar error si no hay id del curso', async () => {
      const course = new CourseModel({});
      
      await expect(course.removeMember('member-id')).rejects.toThrow(ApiError);
      await expect(course.removeMember('member-id')).rejects.toMatchObject({
        statusCode: 400,
        message: "ID del curso no especificado."
      });
    });

    test('debe lanzar error si no hay id del miembro', async () => {
      const course = new CourseModel({ id: 'course-id' });
      
      await expect(course.removeMember()).rejects.toThrow(ApiError);
      await expect(course.removeMember()).rejects.toMatchObject({
        statusCode: 400,
        message: "ID del miembro no especificado."
      });
    });

    test('debe eliminar miembro correctamente', async () => {
      const deleteMock = jest.fn().mockResolvedValue({});
      const docMock = jest.fn().mockReturnValue({ delete: deleteMock });
      db.collection.mockReturnValue({ doc: docMock });
      
      const course = new CourseModel({ id: 'course-id' });
      await course.removeMember('member-id');
      
      expect(db.collection).toHaveBeenCalledWith('CourseMember');
      expect(docMock).toHaveBeenCalledWith('course-id_member-id');
      expect(deleteMock).toHaveBeenCalled();
    });
  });

  describe('getCourseMembers', () => {
    test('debe lanzar error si no hay id del curso', async () => {
      await expect(CourseModel.getCourseMembers()).rejects.toThrow(ApiError);
      await expect(CourseModel.getCourseMembers()).rejects.toMatchObject({
        statusCode: 400,
        message: "ID del curso no especificado."
      });
    });

    test('debe obtener miembros correctamente', async () => {
      const docs = [
        { data: () => ({ memberId: 'member1' }) },
        { data: () => ({ memberId: 'member2' }) }
      ];
      
      const getMock = jest.fn().mockResolvedValue({ docs });
      const whereMock = jest.fn().mockReturnValue({ get: getMock });
      db.collection.mockReturnValue({ where: whereMock });
      
      const memberIds = await CourseModel.getCourseMembers('course-id');
      
      expect(db.collection).toHaveBeenCalledWith('CourseMember');
      expect(whereMock).toHaveBeenCalledWith('courseId', '==', 'course-id');
      expect(memberIds).toEqual(['member1', 'member2']);
    });
  });
});


