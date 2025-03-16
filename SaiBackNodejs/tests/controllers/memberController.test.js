const memberController = require('../../controllers/memberController');
const memberService = require('../../services/memberService');
const { mockRequest, mockResponse } = require('jest-mock-req-res');

jest.mock('../../services/memberService');

describe('MemberController', () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = mockRequest();
    res = mockResponse();
  });

  describe('validateCreateData', () => {
    it('debería validar Nombre requerido', () => {
      const result = memberController.validateCreateData({});
      expect(result).toBe('El campo Nombre es obligatorio');
    });

    it('debería validar longitud del Nombre', () => {
      const shortName = { Nombre: 'ab', TipoMiembro: 'Miembro' };
      const longName = { Nombre: 'a'.repeat(51), TipoMiembro: 'Miembro' };
      
      expect(memberController.validateCreateData(shortName))
        .toBe('El campo Nombre debe tener entre 3 y 50 caracteres');
      expect(memberController.validateCreateData(longName))
        .toBe('El campo Nombre debe tener entre 3 y 50 caracteres');
    });

    it('debería validar tipo de miembro', () => {
      const data = {
        Nombre: 'Test Name',
        TipoMiembro: 'InvalidType'
      };
      
      const result = memberController.validateCreateData(data);
      expect(result).toBe('TipoMiembro debe ser: Miembro, Visitante, Bautizado');
    });

    it('debería validar estado civil', () => {
      const data = {
        Nombre: 'Test Name',
        TipoMiembro: 'Miembro',
        EstadoCivil: 'InvalidStatus'
      };
      
      const result = memberController.validateCreateData(data);
      expect(result).toBe('EstadoCivil debe ser: Soltero, Casado, Divorciado, Viudo');
    });

    it('debería validar email', () => {
      const data = {
        Nombre: 'Test Name',
        TipoMiembro: 'Miembro',
        Email: 'invalid-email'
      };
      
      const result = memberController.validateCreateData(data);
      expect(result).toBe('Formato de email inválido');
    });

    it('debería aceptar datos válidos', () => {
      const data = {
        Nombre: 'Test Name',
        TipoMiembro: 'Visitante',
        EstadoCivil: 'Soltero',
        Email: 'test@example.com'
      };
      
      const result = memberController.validateCreateData(data);
      expect(result).toBeNull();
    });
  });
});
