'use strict';

const memberService = require('../services/memberService'); // Importar el servicio
const idGenerator = require('../utilities/idGenerator');

const validator = require('validator');

var memberController = {
  
  // Ruta para obtener miembros con paginación
  getMembers: async (req, res) => {
    try {
      const pageSize = 10; // Tamaño de la página (puedes hacerlo dinámico si lo necesitas)
      let startAfterDoc = null;

      // Si el cliente envía un "startAfter" (que es el ID del último miembro de la página anterior)
      if (req.query.startAfter) {
        const startAfterId = req.query.startAfter;
        const startAfterSnapshot = await db.collection('Member').doc(startAfterId).get();
        startAfterDoc = startAfterSnapshot.exists ? startAfterSnapshot : null;
      }

      // Obtener la página de miembros correspondiente
      const { members, lastDoc } = await memberService.getMiembros(startAfterDoc, pageSize);

      // Si hay un "lastDoc", significa que hay más miembros, por lo que el cliente puede solicitar la siguiente página.
      const nextStartAfter = lastDoc ? lastDoc.id : null;

      // Enviar los miembros y la información sobre la siguiente página
      res.json({
        members,
        nextStartAfter
      });
    } catch (error) {
      console.error('Error al obtener miembros:', error);
      res.status(500).send(error.message); // Mostrar el mensaje de error
    }
  },

  // Ruta para obtener un miembro por su ID
  getMember: async (req, res) => {
    try {
      const id = req.params.id; // Obtener el ID de la ruta
      if (!id) {
        return res.status(400).json({ error: 'El ID es obligatorio.' });
      }

      const miembro = await memberService.getMiembro(id); // Llamar al servicio
      res.status(200).json(miembro); // Responder con los datos del miembro
    } catch (error) {
      console.error('Error en getMiembro:', error.message);
      res.status(500).json({ error: error.message });
    }
  },

  //Ruta para crear un nuevo Miembro
  createMember: async (req, res) => {
    try {
      const { Name, MemberType, EstadoCivil, Email, Telephono, Oficio, Notas, Cursos, Grupos, Eventos } = req.body;

      // Validaciones con validator
      if (!validator.isEmail(Email)) {
        return res.status(400).json({ error: 'El formato del correo electrónico es inválido' });
      }
      if (Telephono && !validator.isMobilePhone(Telephono)) {
        return res.status(400).json({ error: 'El número de teléfono tiene un formato inválido' });
      }
      
      // Validar campos obligatorios
      if ( !Name || !MemberType) {
        return res.status(400).json({ error: 'Los campos Name y MemberType son obligatorios.' });
      }

      // Validar longitud de campos
      if (Name.length < 3) {
        return res.status(400).json({ error: 'El campo Name debe tener al menos 3 caracteres.' });
      }

      // Construir el objeto del miembro
      const memberId = idGenerator.generateTimestampedId();
      
      const memberData = {
        memberId,
        Name,
        MemberType,
        EstadoCivil: EstadoCivil || null,
        Email: Email || null,
        Telephono: Telephono || null,
        Oficio: Oficio || null,
        Notas: Notas || '',
        Cursos: Array.isArray(Cursos) ? Cursos : [],
        Grupos: Array.isArray(Grupos) ? Grupos : [],
        Eventos: Array.isArray(Eventos) ? Eventos : [],
      };

      // Guardar el miembro llamando al servicio
      const createdId = await memberService.createMember(memberData);

      // Responder con el ID del miembro creado
      res.status(201).json({ id: createdId });
    } catch (error) {
      console.error('Error en createMember:', error.message);
      res.status(500).json({ error: error.message });
    }
  },

  //Ruta para eliminar un miembro por su ID
  
  deleteMember: async (req, res) =>{
    try {
      const memberId = req.params.id;
  
      // Validación con validator: verificamos si es un UUID válido
      if (!validator.isUUID(memberId)) {
        return res.status(400).json({ error: 'El ID del miembro debe ser un UUID válido' });
      }
  
      // Llamada al servicio para eliminar el miembro
      const deletedMember = await memberService.deleteMemberById(memberId);
  
      if (deletedMember) {
        return res.status(200).json({ message: 'Miembro eliminado exitosamente' });
      } else {
        return res.status(404).json({ error: 'Miembro no encontrado' });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al eliminar el miembro' });
    }
  },

  //actualizar por id
  updateMember: async (req, res)=> {
    try {
      const memberId = req.params.id;
      const { id, Name, MemberType, EstadoCivil, Email, Telephono, Oficio, Notas, Cursos, Grupos, Eventos } = req.body;
  
      // Validaciones con validator
      if (!validator.isUUID(id)) {
        return res.status(400).json({ error: 'El ID debe ser un UUID válido' });
      }
      if (!validator.isEmail(Email)) {
        return res.status(400).json({ error: 'El formato del correo electrónico es inválido' });
      }
      if (Telephono && !validator.isMobilePhone(Telephono)) {
        return res.status(400).json({ error: 'El número de teléfono tiene un formato inválido' });
      }
      
      // Validar campos obligatorios
      if (!id || !Name || !MemberType) {
        return res.status(400).json({ error: 'Los campos id, Name y MemberType son obligatorios.' });
      }

      // Validar longitud de campos
      if (Name.length < 3) {
        return res.status(400).json({ error: 'El campo Name debe tener al menos 3 caracteres.' });
      }
  
      // Llamar al servicio para actualizar el miembro
      const updatedMemberData = await memberService.updateMemberById(memberId, updatedMemberData);
  
      res.status(200).json(updatedMemberData);
    } catch (error) {
      console.error('Error al actualizar el miembro:', error);
      res.status(500).json({ error: 'Error al actualizar el miembro' });
    }
  },

  //metodo search
  searchMember: async (req, res) => {
    const { searchString, page, pageSize } = req.query;
    let startAfterDoc = null; // Inicializar el documento de inicio
  
    try {
      if (page > 1) {
        // Obtener el documento de inicio para la paginación
        const previousPageResults = await memberService.searchMembers(searchString, startAfterDoc, pageSize);
        startAfterDoc = previousPageResults.lastDoc;
      }
  
      const results = await memberService.searchMembers(searchString, startAfterDoc, pageSize);
      res.json(results.members);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  },

};
module.exports = memberController;
