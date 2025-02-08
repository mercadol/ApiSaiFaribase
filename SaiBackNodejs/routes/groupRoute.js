'use strict';

const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

/**
 * @swagger
 * tags:
 *   name: Groups
 *   description: The groups managing API
 */

/**
 * @swagger
 * /groups:
 *   get:
 *     summary: Returns a list of groups
 *     tags: [Groups]
 *     description: Retrieves a list of groups with optional pagination.
 *     parameters:
 *       - in: query
 *         name: startAfter
 *         schema:
 *           type: string
 *         description: The ID of the last document in the previous page.
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: Number of items to return per page.
 *     responses:
 *       200:
 *         description: A list of groups
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 groups:
 *                   type: array
 *                   items:
 *                 nextStartAfter:
 *                   type: string
 *       500:
 *         description: An error occurred
 */
router.get('/', groupController.getAll);

/**
 * @swagger
 * /groups/{id}:
 *   get:
 *     summary: Obtiene un grupo específico
 *     tags: [Groups]
 *     description: Devuelve los detalles de un grupo basado en su ID.
 *     responses:
 *       200:
 *         description: Detalles del grupo obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 nombre:
 *                   type: string
 *                 lider:
 *                   type: string
 *       404:
 *         description: Grupo no encontrado
 *       500:
 *         description: Error al obtener el grupo
 */
router.get('/:id', groupController.getById);

/**
 * @swagger
 * /groups:
 *   post:
 *     summary: Crea un nuevo grupo.
 *     tags: [Groups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Nombre
 *               - Descripcion
 *               - Nota
 * 
 *     responses:
 *       201:
 *         description: Grupo creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: El ID del grupo creado.
 *             example:
 *               id: "grupo1"
 *       400:
 *         description: Error de validación por campos faltantes o inválidos.
 *         content:
 *           application/json:
 *             example:
 *               error: "El campos Nombre  es obligatorio."
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al guardar el grupo. Por favor, inténtalo más tarde."
 */
router.post('/', groupController.create);

/**
 * Elimina un grupo por su ID.
 * @swagger
 * /groups/{id}:
 *  delete:
 *     summary: Elimina un grupo específico
 *     tags: [Groups]
 *     description: Devuelve TRUE si encuentra y elimina un grupo basado en su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del grupo a eliminar.
 *     responses:
 *       200:
 *         description: Grupo eliminado correctamente
 *         content:
 *           @returns {boolean} - true
 *       404:
 *         description: Grupo no encontrado
 *       400:
 *         description: Id del Grupo no es valido
 *       500:
 *         description: Error al eliminar el grupo
 */
router.delete('/:id', groupController.delete);

/**
 * @swagger
 * /groups/{id}:
 *  put:
 *      summary: Actualiza un grupo existente por su ID.
 *      tags: [Groups]
 *      requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Id
 *               - {data}
 * */
router.put('/:id', groupController.update);

//relaciones
/**
 * @swagger
 * /groups/{groupId}/members:
 *   post:
 *     summary: Agrega un miembro a un grupo
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del grupo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               memberId:
 *                 type: string
 *               data:
 *                 type: object
 *     responses:
 *       201:
 *         description: Miembro agregado correctamente
 *       500:
 *         description: Error interno del servidor
 */
router.post('/:groupId/members', groupController.addMember);

/**
 * @swagger
 * /groups/{groupId}/members/{memberId}:
 *   delete:
 *     summary: Elimina un miembro de un grupo
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del grupo
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del miembro a eliminar
 *     responses:
 *       200:
 *         description: Miembro eliminado correctamente
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:groupId/members/:memberId', groupController.removeMember);

/**
 * @swagger
 * /groups/{groupId}/members:
 *   get:
 *     summary: Obtiene la lista de miembros de un grupo
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del grupo
 *     responses:
 *       200:
 *         description: Lista de miembros obtenida exitosamente
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:groupId/members', groupController.getGroupMembers);

/**
 * @swagger
 * /members/{memberId}/groups:
 *   get:
 *     summary: Obtiene la lista de grupos a los que pertenece un miembro
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del miembro
 *     responses:
 *       200:
 *         description: Lista de grupos obtenida exitosamente
 *       500:
 *         description: Error interno del servidor
 */
router.get('/members/:memberId/groups', groupController.getMemberGroups);

module.exports = router;