const groupController = require('../controllers/groupController');
const groupService = require('../services/groupService');
const { mockRequest, mockResponse } = require('jest-mock-req-res');

// Mock del servicio y generador de IDs
jest.mock('../services/groupService');
jest.mock('../utilities/idGenerator');

describe('GroupController', () => {
  let req;
  let res;

  beforeEach(() => {
    // Reiniciar los mocks antes de cada prueba
    jest.clearAllMocks();
    req = mockRequest();
    res = mockResponse();
  });

  describe('validateCreateData', () => {
    it('debería retornar error si no se proporciona nombre', () => {
      const result = groupController.validateCreateData({});
      expect(result).toBe('El nombre del grupo es obligatorio');
    });

    it('debería retornar error si el nombre es muy corto', () => {
      const result = groupController.validateCreateData({ Nombre: 'ab' });
      expect(result).toBe('El nombre debe tener entre 3 y 50 caracteres');
    });

    it('debería retornar error si el nombre es muy largo', () => {
      const nombreLargo = 'a'.repeat(51);
      const result = groupController.validateCreateData({ Nombre: nombreLargo });
      expect(result).toBe('El nombre debe tener entre 3 y 50 caracteres');
    });

    it('debería retornar error si la descripción es muy larga', () => {
      const descripcionLarga = 'a'.repeat(501);
      const result = groupController.validateCreateData({
        Nombre: 'Grupo válido',
        Descripcion: descripcionLarga
      });
      expect(result).toBe('La descripción no puede superar los 500 caracteres');
    });

    it('debería retornar null para datos válidos', () => {
      const result = groupController.validateCreateData({
        Nombre: 'Grupo válido',
        Descripcion: 'Descripción válida'
      });
      expect(result).toBeNull();
    });
  });

  describe('prepareCreateData', () => {
    it('debería preparar los datos correctamente', () => {
      const data = {
        Nombre: 'Grupo de prueba',
        Descripcion: 'Descripción de prueba'
      };
      const generatedId = 'test-id-123';

      const result = groupController.prepareCreateData(data, generatedId);

      expect(result).toEqual({
        groupId: generatedId,
        Nombre: data.Nombre,
        Descripcion: data.Descripcion
      });
    });
  });

  describe('addMember', () => {
    it('debería agregar un miembro exitosamente', async () => {
      const mockData = { role: 'discipulo' };
      req.body = {
        memberId: 'member-123',
        groupId: 'group-123',
        data: mockData
      };

      groupService.addMemberToGroup.mockResolvedValue({ success: true });

      await groupController.addMember(req, res);

      expect(groupService.addMemberToGroup).toHaveBeenCalledWith(
        'member-123',
        'group-123',
        mockData
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Member added successfully',
        result: { success: true }
      });
    });

    it('debería manejar errores al agregar un miembro', async () => {
      const error = new Error('Error test');
      groupService.addMemberToGroup.mockRejectedValue(error);

      req.body = {
        memberId: 'member-123',
        groupId: 'group-123'
      };

      await groupController.addMember(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('removeMember', () => {
    it('debería eliminar un miembro exitosamente', async () => {
      req.params = {
        memberId: 'member-123',
        groupId: 'group-123'
      };

      groupService.removeMemberFromGroup.mockResolvedValue();

      await groupController.removeMember(req, res);

      expect(groupService.removeMemberFromGroup).toHaveBeenCalledWith(
        'member-123',
        'group-123'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Member removed successfully'
      });
    });

    it('debería manejar errores al eliminar un miembro', async () => {
      const error = new Error('Error test');
      groupService.removeMemberFromGroup.mockRejectedValue(error);

      req.params = {
        memberId: 'member-123',
        groupId: 'group-123'
      };

      await groupController.removeMember(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('getGroupMembers', () => {
    it('debería obtener los miembros del grupo exitosamente', async () => {
      const mockMembers = [
        { id: 'member-1', name: 'Member 1' },
        { id: 'member-2', name: 'Member 2' }
      ];

      req.params = { groupId: 'group-123' };
      groupService.getGroupMembers.mockResolvedValue(mockMembers);

      await groupController.getGroupMembers(req, res);

      expect(groupService.getGroupMembers).toHaveBeenCalledWith('group-123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockMembers);
    });

    it('debería manejar errores al obtener los miembros', async () => {
      const error = new Error('Error test');
      groupService.getGroupMembers.mockRejectedValue(error);

      req.params = { groupId: 'group-123' };

      await groupController.getGroupMembers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('getMemberGroups', () => {
    it('debería obtener los grupos del miembro exitosamente', async () => {
      const mockGroups = [
        { id: 'group-1', name: 'Group 1' },
        { id: 'group-2', name: 'Group 2' }
      ];

      req.params = { memberId: 'member-123' };
      groupService.getMemberGroups.mockResolvedValue(mockGroups);

      await groupController.getMemberGroups(req, res);

      expect(groupService.getMemberGroups).toHaveBeenCalledWith('member-123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockGroups);
    });

    it('debería manejar errores al obtener los grupos', async () => {
      const error = new Error('Error test');
      groupService.getMemberGroups.mockRejectedValue(error);

      req.params = { memberId: 'member-123' };

      await groupController.getMemberGroups(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });
});
