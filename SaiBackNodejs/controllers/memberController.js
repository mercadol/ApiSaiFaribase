// memberController.js
'use strict';

const BaseController = require('./BaseController');
const memberService = require('../services/memberService');
const idGenerator = require('../utilities/idGenerator');
const validator = require('validator');

class memberController extends BaseController {
  constructor() {
    super({
      service: memberService,
      entityName: 'Member',
      entityPlural: 'members',
      idGenerator: idGenerator.generateTimestampedId
    });
  }

  /**
   * @swagger
   * /members/search:
   *   get:
   *     summary: Busca miembros por nombre
   *     description: Retorna una lista paginada de miembros cuyo nombre coincide con el término de búsqueda.
   *     tags:
   *       - Members
   *     parameters:
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         required: true
   *         description: Término de búsqueda para filtrar miembros por nombre
   *       - in: query
   *         name: pageSize
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *         description: Número máximo de resultados por página (por defecto 10)
   *       - in: query
   *         name: startAfter
   *         schema:
   *           type: string
   *         description: ID del último miembro de la página anterior para paginación
   *     responses:
   *       200:
   *         description: Lista de miembros encontrados
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 members:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Member'
   *                 nextStartAfter:
   *                   type: string
   *                   description: ID del último miembro para la siguiente página
   *       400:
   *         description: Parámetros de búsqueda inválidos
   *       500:
   *         description: Error interno del servidor
   */
  async searchMembers(req, res) {
    try {
      const { search: searchString, pageSize = 10, startAfter } = req.query;

      // Validar parámetros de búsqueda
      if (!searchString || typeof searchString !== 'string') {
        return res.status(400).json({ error: 'El parámetro de búsqueda es requerido y debe ser una cadena de texto' });
      }

      if (isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
        return res.status(400).json({ error: 'El tamaño de página debe ser un número entre 1 y 100' });
      }

      // Obtener el documento de inicio para la paginación
      let startAfterDoc = null;
      if (startAfter) {
        const docRef = this.service.collection.doc(startAfter);
        startAfterDoc = await docRef.get();
        if (!startAfterDoc.exists) startAfterDoc = null;
      }

      // Realizar la búsqueda
      const { members, lastDoc } = await this.service.searchMembers(
        searchString,
        startAfterDoc,
        parseInt(pageSize)
      );

      // Preparar respuesta
      const response = {
        members,
        nextStartAfter: lastDoc ? lastDoc.id : null
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error al buscar miembros:', error);
      res.status(500).json({ error: 'Error al buscar miembros. Inténtelo más tarde.' });
    }
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

    if (data.Email && !validator.isEmail(data.Email)) {
      return 'Formato de email inválido';
    }

    return null;
  }

  prepareCreateData(data, generatedId) {
    return {
      memberId: generatedId,
      ...data
    };
  }

}
module.exports = new memberController();
