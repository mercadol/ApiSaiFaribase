'use strict';

const express = require('express');
const memberController = require('../controllers/memberController');
const router = express.Router();
const asyncHandler = require("../middlewares/asyncHandler");

/**
 * @swagger
 * /members:
 *   get:
 *     summary: Obtiene la lista de miembros
 *     tags: [Members]
 *     description: Devuelve todos los miembros con soporte para paginación opcional.
 *     parameters:
 *       - in: query
 *         name: startAfter
 *         schema:
 *           type: string
 *         description: ID del documento desde el que se debe comenzar la paginación.
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: Número de documentos por página (por defecto, 10).
 *     responses:
 *       200:
 *         description: Lista de miembros obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 members:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                 nextStartAfter:
 *                   type: string
 *       500:
 *         description: Error al obtener los miembros
 */
router.get('/', asyncHandler((req, res, next) => memberController.getAll(req, res, next)));

/**
 * @swagger
 * /members/{id}:
 *   get:
 *     summary: Obtiene un miembro específico
 *     tags: [Members]
 *     description: Devuelve los detalles de un miembro basado en su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del miembro.
 *     responses:
 *       200:
 *         description: Detalles del miembro obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 memberType:
 *                   type: string
 *       404:
 *         description: Miembro no encontrado
 *       500:
 *         description: Error al obtener el miembro
 */
router.get('/:id', memberController.getById);

/**
 * @swagger
 * /members:
 *   post:
 *     summary: Crea un nuevo miembro.
 *     tags: [Members]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Name
 *               - MemberType
 *               - Notas
 *             properties:
 *               Name:
 *                 type: string
 *                 description: Nombre del miembro (mínimo 3 caracteres).
 *                 minLength: 3
 *               MemberType:
 *                 type: string
 *                 description: Tipo de miembro (tomará valores específicos en el futuro).
 *               EstadoCivil:
 *                 type: string
 *                 description: Estado civil del miembro (opcional).
 *               Email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del miembro (opcional).
 *               Telephono:
 *                 type: string
 *                 description: Teléfono del miembro (opcional).
 *               Oficio:
 *                 type: string
 *                 description: Ocupación del miembro (opcional).
 *               Notas:
 *                 type: string
 *                 description: Notas adicionales sobre el miembro.
 *           example:
 *             Name: "John Doe"
 *             MemberType: "Bautizado"
 *             EstadoCivil: "Soltero"
 *             Email: "johndoe@example.com"
 *             Telephono: "1234567890"
 *             Oficio: "Desarrollador"
 *             Notas: "Este miembro ha sido registrado como parte del grupo Bautizado."
 *     responses:
 *       201:
 *         description: Miembro creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: El ID del miembro creado.
 *             example:
 *               id: "12345"
 *       400:
 *         description: Error de validación por campos faltantes o inválidos.
 *         content:
 *           application/json:
 *             example:
 *               error: "Los Name y MemberType son obligatorios."
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al guardar el miembro. Por favor, inténtalo más tarde."
 */
router.post('/', memberController.create);

/**
 * Elimina un miembro por su ID.
 * @swagger
 * /members/{id}:
 *  delete:
 *     summary: Elimina un miembro específico
 *     tags: [Members]
 *     description: Devuelve TRUE si encuentra y elimina un miembro basado en su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del miembro a eliminar.
 *     responses:
 *       200:
 *         description: Miembro eliminado correctamente
 *         content:
 *           @returns {boolean} - true
 *       404:
 *         description: Miembro no encontrado
 *       400:
 *         description: Id del Miembro no es valido
 *       500:
 *         description: Error al eliminar el miembro
 */
router.delete('/:id', memberController.delete);

/**
 * @swagger
 * /members/{id}:
 *  put:
 *      summary: Actualiza un miembro existente por su ID.
 *      parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *      tags: [Members]
 *      requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - Name
 *               - MemberType
 *             properties:
 *               Name:
 *                 type: string
 *                 description: Nombre del miembro (mínimo 3 caracteres).
 *                 minLength: 3
 *               MemberType:
 *                 type: string
 *                 description: Tipo de miembro (tomará valores específicos en el futuro).
 *               EstadoCivil:
 *                 type: string
 *                 description: Estado civil del miembro (opcional).
 *               Email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del miembro (opcional).
 *               Telephono:
 *                 type: string
 *                 description: Teléfono del miembro (opcional).
 *               Oficio:
 *                 type: string
 *                 description: Ocupación del miembro (opcional).
 *               Notas:
 *                 type: string
 *                 description: Notas adicionales sobre el miembro.
 *           example:
 *             Name: "John Doe"
 *             MemberType: "Bautizado"
 *             EstadoCivil: "Soltero"
 *             Email: "johndoe@example.com"
 *             Telephono: "1234567890"
 *             Oficio: "Desarrollador"
 *             Notas: "Este miembro ha sido registrado como parte del grupo de servidores."
 * @group Miembros - Operaciones sobre miembros
 * @param {string} id.path.required - El ID del miembro a actualizar
 * @param {Member} member.body.required - Los nuevos datos del miembro
 * @property {string} member.body.name - El nuevo nombre del miembro
 * @property {string} member.body.email - El nuevo correo electrónico del miembro
 * ... (otros campos que se pueden actualizar)
 * @returns {object} 200 - Miembro actualizado exitosamente
 * @returns {object} 400 - Solicitud inválida (datos faltantes o incorrectos)
 * @returns {object} 404 - Miembro no encontrado
 * @returns {object} 500 - Error interno del servidor
 */
router.put('/:id', memberController.update);

/**
 * @swagger
 * /members/search/searchString:
 *   get:
 *     summary: Busca miembros por nombre
 *     tags: [Members]
 *     description: Busca miembros cuyo nombre coincida con el término de búsqueda.
 *     parameters:
 *       - in: query
 *         name: searchString
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *       - in: query
 *         name: startAfter
 *         schema:
 *           type: string
 *         description: ID del documento desde el que se debe comenzar la paginación.
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: Número de documentos por página (por defecto, 10).
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
 *       404:
 *         description: No se encontraron miembros
 *       500:
 *         description: Error al realizar la búsqueda
 */
router.get('/search/:searchString', memberController.search);

module.exports = router;
