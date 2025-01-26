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
router.get('/', groupController.getGrupos);

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
router.get('/:id', groupController.getGrupoById);

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
 *               - id
 *               - Nombre
 *               - Lider
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
 *               error: "Los campos id y nombre  son obligatorios."
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al guardar el grupo. Por favor, inténtalo más tarde."
 */
router.post('/', groupController.createGrupo);

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
 *               - Name
 * */
router.put('/:id', groupController.updateGrupo);

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
router.delete('/:id', groupController.deleteGrupo);


module.exports = router;