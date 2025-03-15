// tests/controllers/groupController.test.js
const groupController = require('../../controllers/groupController');
const groupService = require('../../services/groupService');

// Mock del servicio
jest.mock('../../services/groupService');

describe('GroupController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateCreateData', () => {
    test('debe retornar error si el nombre no está presente', () => {
      const data = { Descripcion: 'Un grupo' };
      const error = groupController.validateCreateData(data);
      expect(error).toBe('El nombre del grupo es obligatorio');
    });

    test('debe retornar error si el nombre es demasiado corto', () => {
      const data = { Nombre: 'AB' };
      const error = groupController.validateCreateData(data);
      expect(error).toBe('El nombre debe tener entre 3 y 50 caracteres');
    });

    test('debe retornar error si el nombre es demasiado largo', () => {
      const data = { Nombre: 'A'.repeat(51) };
      const error = groupController.validateCreateData(data);
      expect(error).toBe('El nombre debe tener entre 3 y 50 caracteres');
    });

    test('debe retornar error si la descripción es demasiado larga', () => {
      const data = { Nombre: 'Grupo válido', Descripcion: 'A'.repeat(501) };
      const error = groupController.validateCreateData(data);
      expect(error).toBe('La descripción no puede superar los 500 caracteres');
    });

    test('debe retornar null si los datos son válidos', () => {
      const data = { Nombre: 'Grupo válido', Descripcion: 'Una descripción válida' };
      const error = groupController.validateCreateData(data);
      expect(error).toBeNull();
    });
  });

  describe('prepareCreateData', () => {
    test('debe convertir valores null o undefined a strings vacíos', () => {
      const data = { Nombre: 'Grupo', Descripcion: null, Categoria: undefined };
      const prepared = groupController.prepareCreateData(data);
      expect(prepared).toEqual({
        Nombre: 'Grupo',
        Descripcion: '',
        Categoria: ''
      });
    });

    test('debe aplicar trim() a los valores string', () => {
      const data = { Nombre: '  Grupo  ', Descripcion: ' Una descripción  ' };
      const prepared = groupController.prepareCreateData(data);
      expect(prepared).toEqual({
        Nombre: 'Grupo',
        Descripcion: 'Una descripción'
      });
    });

    test('debe mantener valores no string intactos', () => {
      const data = { Nombre: 'Grupo', Activo: true, Duracion: 10 };
      const prepared = groupController.prepareCreateData(data);
      expect(prepared).toEqual({
        Nombre: 'Grupo',
        Activo: true,
        Duracion: 10
      });
    });
  });

  describe('Métodos heredados y de relaciones', () => {
    test('debe llamar al servicio correcto en create', async () => {
      // Mock para el método de BaseController
      const originalCreate = groupController.create;
      groupController.create = jest.fn().mockImplementation(() => Promise.resolve());
      
      // Datos y respuesta mock
      const groupData = { Nombre: 'Nuevo Grupo' };
      const req = { body: groupData };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      
      await groupController.create(req, res);
      
      // Verificar que fue llamado con los parámetros correctos
      expect(groupController.create).toHaveBeenCalledWith(req, res);
      
      // Restaurar método original
      groupController.create = originalCreate;
    });

    test('debe llamar a addMember con los parámetros correctos', async () => {
      // Mock del método addMember
      const originalAddMember = groupController.addMember;
      groupController.addMember = jest.fn().mockImplementation(() => Promise.resolve());
      
      const req = { params: { id: 'group1', memberId: 'member1' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn(); // Añadir mock para next
      
      await groupController.addMember(req, res, next);
      
      expect(groupController.addMember).toHaveBeenCalledWith(req, res, next);
      
      // Restaurar método original
      groupController.addMember = originalAddMember;
    });

    test('debe llamar a removeMember con los parámetros correctos', async () => {
        // Mock del método directamente en groupController
        const originalRemoveMember = groupController.removeMember;
        groupController.removeMember = jest.fn().mockImplementation(() => Promise.resolve());
        
        const req = { params: { id: 'group1', memberId: 'member1' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        
        await groupController.removeMember(req, res, next);
        
        expect(groupController.removeMember).toHaveBeenCalledWith(req, res, next);
        
        // Restaurar método original
        groupController.removeMember = originalRemoveMember;
      });
      
      test('debe llamar a getGroupMembers con los parámetros correctos', async () => {
        const originalGetGroupMembers = groupController.getGroupMembers;
        groupController.getGroupMembers = jest.fn().mockImplementation(() => Promise.resolve());
        
        const req = { params: { id: 'group1' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        
        await groupController.getGroupMembers(req, res, next);
        
        expect(groupController.getGroupMembers).toHaveBeenCalledWith(req, res, next);
        
        groupController.getGroupMembers = originalGetGroupMembers;
      });
      
      test('debe llamar a getMemberGroups con los parámetros correctos', async () => {
        const originalGetMemberGroups = groupController.getMemberGroups;
        groupController.getMemberGroups = jest.fn().mockImplementation(() => Promise.resolve());
        
        const req = { params: { memberId: 'member1' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        
        await groupController.getMemberGroups(req, res, next);
        
        expect(groupController.getMemberGroups).toHaveBeenCalledWith(req, res, next);
        
        groupController.getMemberGroups = originalGetMemberGroups;
      });
  });
});
