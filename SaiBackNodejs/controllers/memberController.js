// memberController.js
'use strict';

const BaseController = require('./BaseController');
const memberService = require('../services/memberService');

class memberController extends BaseController {
  constructor() {
    super({
      service: memberService,
      entityName: 'Member',
      entityPlural: 'members'
    });
  }


  validateCreateData(data) {
    const validMemberTypes = ['Miembro', 'Visitante', 'Bautizado'];
    const validEstadosCiviles = ['Soltero', 'Casado', 'Divorciado', 'Viudo'];

    if (!data.Name) return 'El campo Name es obligatorio';
    if (data.Name.length < 3 || data.Name.length > 50) {
      return 'El campo Name debe tener entre 3 y 50 caracteres';
    }

    if (!validMemberTypes.includes(data.MemberType)) {
      return `MemberType debe ser: ${validMemberTypes.join(', ')}`;
    }

    if (data.EstadoCivil && !validEstadosCiviles.includes(data.EstadoCivil)) {
      return `EstadoCivil debe ser: ${validEstadosCiviles.join(', ')}`;
    }

    if (data.Email && !this.validator.isEmail(data.Email)) {
      return 'Formato de email inválido';
    }

    return null;
  }

  prepareCreateData(data) {
    
    for (let key in data) {
      if (data[key] === null || data[key] === undefined) {
      
        // Si es null o undefined, lo cambiamos por una cadena vacía
        data[key] = "";
      } else if (typeof data[key] === 'string') {
        // Si es una cadena, aplicamos trim()
        data[key] = data[key].trim();
      }
    }

    return  data;

  }

}
module.exports = new memberController();
