// tests/models/GroupModel.test.js
const { db } = require('../../firebase');
const GroupModel = require('../../models/GroupModel');
const ApiError = require('../../utils/ApiError');

// Mock de Firebase
jest.mock('../../firebase', () => ({
  db: {
    collection: jest.fn(),
  }
}));

describe('GroupModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('debe crear objeto con propiedades por defecto', () => {
      const group = new GroupModel({});
      expect(group.id).toBeNull();
      expect(group.Nombre).toBe('');
      expect(group.descripcion).toBe('');
      expect(group.fechaCreacion).toBeInstanceOf(Date);
    });

    test('debe crear objeto con propiedades especificadas', () => {
      const data = {
        id: 'test-id',
        Nombre: 'Test Group',
        descripcion: 'Test Description',
        fechaCreacion: new Date('2023-01-01')
      };
      const group = new GroupModel(data);
      expect(group.id).toBe('test-id');
      expect(group.Nombre).toBe('Test Group');
      expect(group.descripcion).toBe('Test Description');
      expect(group.fechaCreacion).toEqual(new Date('2023-01-01'));
    });
  });

  describe('save', () => {
    test('debe crear nuevo documento si no hay id', async () => {
      const addMock = jest.fn().mockResolvedValue({ id: 'new-id' });
      db.collection.mockReturnValue({ add: addMock });
      
      const group = new GroupModel({
        Nombre: 'Test Group',
        descripcion: 'Test Description'
      });
      
      await group.save();
      
      expect(db.collection).toHaveBeenCalledWith('Group');
      expect(addMock).toHaveBeenCalledWith({
        Nombre: 'Test Group',
        descripcion: 'Test Description',
        fechaCreacion: expect.any(Date)
      });
      expect(group.id).toBe('new-id');
    });

    test('debe actualizar documento existente si hay id', async () => {
      const updateMock = jest.fn().mockResolvedValue({});
      const docMock = jest.fn().mockReturnValue({ update: updateMock });
      db.collection.mockReturnValue({ doc: docMock });
      
      const group = new GroupModel({
        id: 'existing-id',
        Nombre: 'Test Group',
        descripcion: 'Updated Description'
      });
      
      await group.save();
      
      expect(db.collection).toHaveBeenCalledWith('Group');
      expect(docMock).toHaveBeenCalledWith('existing-id');
      expect(updateMock).toHaveBeenCalledWith({
        Nombre: 'Test Group',
        descripcion: 'Updated Description',
        fechaCreacion: expect.any(Date)
      });
    });

    test('debe capturar y relanzar error de Firestore', async () => {
      db.collection.mockImplementation(() => {
        throw new Error('Firebase error');
      });
      
      const group = new GroupModel({ Nombre: 'Test Group' });
      
      await expect(group.save()).rejects.toThrow(ApiError);
      await expect(group.save()).rejects.toMatchObject({
        statusCode: 500,
        message: 'Error al guardar el grupo. Inténtelo más tarde: Firebase error'
      });
    });
  });

  describe('delete', () => {
    test('debe lanzar error si no hay id', async () => {
      const group = new GroupModel({});
      
      await expect(group.delete()).rejects.toThrow(ApiError);
      await expect(group.delete()).rejects.toMatchObject({
        statusCode: 400,
        message: "ID del grupo no especificado."
      });
    });

    test('debe eliminar documento correctamente', async () => {
      const deleteMock = jest.fn().mockResolvedValue({});
      const docMock = jest.fn().mockReturnValue({ delete: deleteMock });
      db.collection.mockReturnValue({ doc: docMock });
      
      const group = new GroupModel({ id: 'test-id' });
      await group.delete();
      
      expect(db.collection).toHaveBeenCalledWith('Group');
      expect(docMock).toHaveBeenCalledWith('test-id');
      expect(deleteMock).toHaveBeenCalled();
    });

    test('debe capturar y relanzar error de Firestore', async () => {
      const deleteMock = jest.fn().mockRejectedValue(new Error('Firebase error'));
      const docMock = jest.fn().mockReturnValue({ delete: deleteMock });
      db.collection.mockReturnValue({ doc: docMock });
      
      const group = new GroupModel({ id: 'test-id' });
      
      await expect(group.delete()).rejects.toThrow(ApiError);
      await expect(group.delete()).rejects.toMatchObject({
        statusCode: 500,
        message: "Error al eliminar el grupo. Inténtelo más tarde: Firebase error"
      });
    });
  });

  describe('findById', () => {
    test('debe encontrar grupo por id', async () => {
      const getMock = jest.fn().mockResolvedValue({
        exists: true,
        id: 'test-id',
        data: () => ({
          Nombre: 'Test Group',
          descripcion: 'Test Description',
          fechaCreacion: new Date('2023-01-01')
        })
      });
      const docMock = jest.fn().mockReturnValue({ get: getMock });
      db.collection.mockReturnValue({ doc: docMock });
      
      const group = await GroupModel.findById('test-id');
      
      expect(db.collection).toHaveBeenCalledWith('Group');
      expect(docMock).toHaveBeenCalledWith('test-id');
      expect(group).toBeInstanceOf(GroupModel);
      expect(group.id).toBe('test-id');
      expect(group.Nombre).toBe('Test Group');
    });

    test('debe lanzar error si el grupo no existe', async () => {
      const getMock = jest.fn().mockResolvedValue({
        exists: false
      });
      const docMock = jest.fn().mockReturnValue({ get: getMock });
      db.collection.mockReturnValue({ doc: docMock });
      
      await expect(GroupModel.findById('no-existe')).rejects.toThrow(ApiError);
      await expect(GroupModel.findById('no-existe')).rejects.toMatchObject({
        statusCode: 404,
        message: "Grupo no encontrado."
      });
    });

    test('debe capturar otros errores como 500', async () => {
      const getMock = jest.fn().mockRejectedValue(new Error('Firebase error'));
      const docMock = jest.fn().mockReturnValue({ get: getMock });
      db.collection.mockReturnValue({ doc: docMock });
      
      await expect(GroupModel.findById('test-id')).rejects.toThrow(ApiError);
      await expect(GroupModel.findById('test-id')).rejects.toMatchObject({
        statusCode: 500,
        message: "Error al buscar el grupo. Inténtelo más tarde: Firebase error"
      });
    });
  });

  describe('findAll', () => {
    test('debe encontrar todos los grupos (primera página)', async () => {
      const docs = [
        {
          id: 'id1',
          data: () => ({ Nombre: 'Group 1', descripcion: 'Description 1' })
        },
        {
          id: 'id2',
          data: () => ({ Nombre: 'Group 2', descripcion: 'Description 2' })
        }
      ];
      
      const getMock = jest.fn().mockResolvedValue({ docs });
      const limitMock = jest.fn().mockReturnValue({ get: getMock });
      const orderByMock = jest.fn().mockReturnValue({ limit: limitMock });
      db.collection.mockReturnValue({ orderBy: orderByMock });
      
      const groups = await GroupModel.findAll();
      
      expect(db.collection).toHaveBeenCalledWith('Group');
      expect(orderByMock).toHaveBeenCalledWith('Nombre');
      expect(limitMock).toHaveBeenCalledWith(10);
      expect(groups).toHaveLength(2);
      expect(groups[0]).toBeInstanceOf(GroupModel);
      expect(groups[0].id).toBe('id1');
      expect(groups[1].id).toBe('id2');
    });

    test('debe manejar paginación con startAfterId', async () => {
      const startAfterDocGetMock = jest.fn().mockResolvedValue({
        exists: true
      });
      const startAfterDocMock = jest.fn().mockReturnValue({ 
        get: startAfterDocGetMock 
      });
      
      const docs = [{ id: 'id3', data: () => ({ Nombre: 'Group 3' }) }];
      
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
      
      const groups = await GroupModel.findAll('start-id', 5);
      
      expect(startAfterDocMock).toHaveBeenCalledWith('start-id');
      expect(limitMock).toHaveBeenCalledWith(5);
      expect(startAfterMock).toHaveBeenCalled();
      expect(groups).toHaveLength(1);
    });
  });

  describe('addMember', () => {
    test('debe lanzar error si no hay id del grupo', async () => {
      const group = new GroupModel({});
      
      await expect(group.addMember('member-id')).rejects.toThrow(ApiError);
      await expect(group.addMember('member-id')).rejects.toMatchObject({
        statusCode: 400,
        message: "ID del grupo no especificado."
      });
    });

    test('debe lanzar error si no hay id del miembro', async () => {
      const group = new GroupModel({ id: 'group-id' });
      
      await expect(group.addMember()).rejects.toThrow(ApiError);
      await expect(group.addMember()).rejects.toMatchObject({
        statusCode: 400,
        message: "ID del miembro no especificado."
      });
    });

    test('debe agregar miembro correctamente', async () => {
      const setMock = jest.fn().mockResolvedValue({});
      const docMock = jest.fn().mockReturnValue({ set: setMock });
      db.collection.mockReturnValue({ doc: docMock });
      
      const group = new GroupModel({ id: 'group-id' });
      await group.addMember('member-id');
      
      expect(db.collection).toHaveBeenCalledWith('GroupMember');
      expect(docMock).toHaveBeenCalledWith('group-id_member-id');
      expect(setMock).toHaveBeenCalledWith({
        groupId: 'group-id',
        memberId: 'member-id'
      });
    });
  });

  describe('removeMember', () => {
    test('debe lanzar error si no hay id del grupo', async () => {
      const group = new GroupModel({});
      
      await expect(group.removeMember('member-id')).rejects.toThrow(ApiError);
      await expect(group.removeMember('member-id')).rejects.toMatchObject({
        statusCode: 400,
        message: "ID del grupo no especificado."
      });
    });

    test('debe lanzar error si no hay id del miembro', async () => {
      const group = new GroupModel({ id: 'group-id' });
      
      await expect(group.removeMember()).rejects.toThrow(ApiError);
      await expect(group.removeMember()).rejects.toMatchObject({
        statusCode: 400,
        message: "ID del miembro no especificado."
      });
    });

    test('debe eliminar miembro correctamente', async () => {
      const deleteMock = jest.fn().mockResolvedValue({});
      const docMock = jest.fn().mockReturnValue({ delete: deleteMock });
      db.collection.mockReturnValue({ doc: docMock });
      
      const group = new GroupModel({ id: 'group-id' });
      await group.removeMember('member-id');
      
      expect(db.collection).toHaveBeenCalledWith('GroupMember');
      expect(docMock).toHaveBeenCalledWith('group-id_member-id');
      expect(deleteMock).toHaveBeenCalled();
    });
  });

  describe('getGroupMembers', () => {
    test('debe lanzar error si no hay id del grupo', async () => {
      await expect(GroupModel.getGroupMembers()).rejects.toThrow(ApiError);
      await expect(GroupModel.getGroupMembers()).rejects.toMatchObject({
        statusCode: 400,
        message: "ID del grupo no especificado."
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
      
      const memberIds = await GroupModel.getGroupMembers('group-id');
      
      expect(db.collection).toHaveBeenCalledWith('GroupMember');
      expect(whereMock).toHaveBeenCalledWith('groupId', '==', 'group-id');
      expect(memberIds).toEqual(['member1', 'member2']);
    });
  });
});
