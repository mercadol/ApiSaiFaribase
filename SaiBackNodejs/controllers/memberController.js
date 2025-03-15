// controller/memberController.js
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

  validateUpdateData(data) {
    // Implementa validaciones similares a las de create
    if (data.Nombre && (data.Nombre.length < 3 || data.Nombre.length > 50)) {
      return 'El campo Nombre debe tener entre 3 y 50 caracteres';
    }
    // Agrega más validaciones según sea necesario
    return null;
  }  
  validateCreateData(data) {
    const validMemberTypes = ['Miembro', 'Visitante', 'Bautizado'];
    const validEstadosCiviles = ['Soltero', 'Casado', 'Divorciado', 'Viudo'];

    if (!data.Nombre) return 'El campo Nombre es obligatorio';
    if (data.Nombre.length < 3 || data.Nombre.length > 50) {
      return 'El campo Nombre debe tener entre 3 y 50 caracteres';
    }

    if (!validMemberTypes.includes(data.TipoMiembro)) {
      console.log("data: ",data);
      console.log("tipoMiembro: ", data.TipoMiembro);
      return `TipoMiembro debe ser: ${validMemberTypes.join(', ')}`;
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

    return data;
  }
}

module.exports = new memberController();
