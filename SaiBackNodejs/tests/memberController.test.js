const memberController = require('../controllers/memberController');
const memberService = require('../services/memberService');
const { mockRequest, mockResponse } = require('jest-mock-req-res');

jest.mock('../services/memberService');
jest.mock('../utilities/idGenerator');

describe('MemberController', () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = mockRequest();
    res = mockResponse();
  });

  describe('searchMembers', () => {
    it('debería validar el parámetro de búsqueda', async () => {
      req.query = { pageSize: 10 };
      
      await memberController.searchMembers(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'El parámetro de búsqueda es requerido y debe ser una cadena de texto'
      });
    });

    it('debería validar el tamaño de página', async () => {
      req.query = { search: 'test', pageSize: 101 };
      
      await memberController.searchMembers(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'El tamaño de página debe ser un número entre 1 y 100'
      });
    });

    it('debería realizar una búsqueda exitosa sin startAfter', async () => {
      const mockMembers = [{ id: 1, name: 'Test' }];
      const mockLastDoc = { id: 'lastDoc123' };
      
      memberService.searchMembers.mockResolvedValue({
        members: mockMembers,
        lastDoc: mockLastDoc
      });

      req.query = { search: 'test', pageSize: 10 };
      
      await memberController.searchMembers(req, res);
      
      expect(memberService.searchMembers).toHaveBeenCalledWith(
        'test',
        null,
        10
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        members: mockMembers,
        nextStartAfter: 'lastDoc123'
      });
    });

    it('debería manejar errores en la búsqueda', async () => {
      memberService.searchMembers.mockRejectedValue(new Error('Error test'));
      req.query = { search: 'test', pageSize: 10 };
      
      await memberController.searchMembers(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error al buscar miembros. Inténtelo más tarde.'
      });
    });
  });

  describe('validateCreateData', () => {
    it('debería validar nombre requerido', () => {
      const result = memberController.validateCreateData({});
      expect(result).toBe('El campo Name es obligatorio');
    });

    it('debería validar longitud del nombre', () => {
      const shortName = { Name: 'ab', MemberType: 'Miembro' };
      const longName = { Name: 'a'.repeat(51), MemberType: 'Miembro' };
      
      expect(memberController.validateCreateData(shortName))
        .toBe('El campo Name debe tener entre 3 y 50 caracteres');
      expect(memberController.validateCreateData(longName))
        .toBe('El campo Name debe tener entre 3 y 50 caracteres');
    });

    it('debería validar tipo de miembro', () => {
      const data = {
        Name: 'Test Name',
        MemberType: 'InvalidType'
      };
      
      const result = memberController.validateCreateData(data);
      expect(result).toBe('MemberType debe ser: Miembro, Visitante, Bautizado');
    });

    it('debería validar estado civil', () => {
      const data = {
        Name: 'Test Name',
        MemberType: 'Miembro',
        EstadoCivil: 'InvalidStatus'
      };
      
      const result = memberController.validateCreateData(data);
      expect(result).toBe('EstadoCivil debe ser: Soltero, Casado, Divorciado, Viudo');
    });

    it('debería validar email', () => {
      const data = {
        Name: 'Test Name',
        MemberType: 'Miembro',
        Email: 'invalid-email'
      };
      
      const result = memberController.validateCreateData(data);
      expect(result).toBe('Formato de email inválido');
    });

    it('debería aceptar datos válidos', () => {
      const data = {
        Name: 'Test Name',
        MemberType: 'Miembro',
        EstadoCivil: 'Soltero',
        Email: 'test@example.com'
      };
      
      const result = memberController.validateCreateData(data);
      expect(result).toBeNull();
    });
  });

  describe('prepareCreateData', () => {
    it('debería preparar los datos correctamente', () => {
      const data = {
        Name: 'Test Name',
        MemberType: 'Miembro',
        EstadoCivil: 'Soltero'
      };
      const generatedId = 'test-id-123';

      const result = memberController.prepareCreateData(data, generatedId);
      
      expect(result).toEqual({
        memberId: generatedId,
        ...data
      });
    });
  });
});
