const validator = require('validator');

class Member {
    constructor({
      id,
      name,
      memberType,
      estadoCivil,
      email,
      telefono,
      oficio,
      notas,
      cursos,
      grupos,
      eventos,
    }) {
      this.id = id;
      this.name = name;
      this.memberType = memberType;
      this.estadoCivil = estadoCivil;
      this.email = email;
      this.telefono = telefono;
      this.oficio = oficio;
      this.notas = notas;
      this.cursos = cursos || []; // Inicializar como array vacío si no se proporciona
      this.grupos = grupos || [];
      this.eventos = eventos || [];
  
      // Validaciones básicas (puedes agregar más según tus necesidades)
      if (!id || !name || !memberType) {
        throw new Error('ID, Name y MemberType son campos obligatorios');
      }
      if (memberType !== 'Bautizado' && memberType !== 'Visitante') {
        throw new Error('MemberType debe ser "Bautizado" o "Visitante"');
      }
      if (!validator.isEmail(data.email)) {
        throw new Error('El correo electrónico no es válido');
      }
    }
  }
  
  module.exports = Member;