const RelationController = require('../../controllers/RelationController');
const ApiError = require('../../utils/ApiError');

describe('RelationController', () => {
  let controller;
  let mockService;
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockService = {
      addMember: jest.fn(),
      removeMember: jest.fn(),
      getEntityMembers: jest.fn(),
      getMemberEntities: jest.fn()
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockNext = jest.fn();

    controller = new RelationController(mockService, 'TestEntity');
  });

  describe('addMember', () => {
    test('debe agregar miembro exitosamente', async () => {
      mockReq = {
        params: { entityId: 'entity1' },
        body: { memberId: 'member1', data: { role: 'admin' } }
      };
      mockService.addMember.mockResolvedValue({ id: 'relation1' });

      await controller.addMember(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Member added to TestEntity successfully',
        result: { id: 'relation1' }
      });
    });

    test('debe manejar errores con next', async () => {
      mockReq = {
        params: { entityId: 'entity1' },
        body: { memberId: 'member1' }
      };
      mockService.addMember.mockRejectedValue(new Error('Test error'));

      await controller.addMember(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });
  });

  describe('removeMember', () => {
    test('debe eliminar miembro exitosamente', async () => {
      mockReq = {
        params: { entityId: 'entity1', memberId: 'member1' }
      };
      mockService.removeMember.mockResolvedValue(true);

      await controller.removeMember(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Member removed from TestEntity successfully'
      });
    });
  });

  describe('getEntityMembers', () => {
    test('debe obtener miembros exitosamente', async () => {
      mockReq = {
        params: { entityId: 'entity1' }
      };
      const mockMembers = [{ id: 'member1' }];
      mockService.getEntityMembers.mockResolvedValue(mockMembers);

      await controller.getEntityMembers(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockMembers);
    });
  });

  describe('getMemberEntities', () => {
    test('debe obtener entidades exitosamente', async () => {
      mockReq = {
        params: { memberId: 'member1' }
      };
      const mockEntities = [{ id: 'entity1' }];
      mockService.getMemberEntities.mockResolvedValue(mockEntities);

      await controller.getMemberEntities(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockEntities);
    });
  });
});
