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
 *                     $ref: '#/components/schemas/Group'
 *                 nextStartAfter:
 *                   type: string
 *       500:
 *         description: An error occurred
 */
router.get('/', groupController.getGrupos);

/**
 * @swagger
 * components:
 *   schemas:
 *     Group:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         Nombre:
 *           type: string
 *         Lider:
 *           type: string
 *         Descripcion:
 *           type: string
 *         Asistentes:
 *           type: array
 *           items:
 *             type: string
 */
router.get('/:id', groupController.getGrupoById);

/**
 * @swagger
 * components:
 *   schemas:
 *     Group:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         Nombre:
 *           type: string
 *         Lider:
 *           type: string
 *         Descripcion:
 *           type: string
 *         Asistentes:
 *           type: array
 *           items:
 *             type: string
 */
router.post('/', groupController.createGrupo);

/**
 * @swagger
 * components:
 *   schemas:
 *     Group:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         Nombre:
 *           type: string
 *         Lider:
 *           type: string
 *         Descripcion:
 *           type: string
 *         Asistentes:
 *           type: array
 *           items:
 *             type: string
 */
router.put('/:id', groupController.updateGrupo);

/**
 * @swagger
 * components:
 *   schemas:
 *     Group:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         Nombre:
 *           type: string
 *         Lider:
 *           type: string
 *         Descripcion:
 *           type: string
 *         Asistentes:
 *           type: array
 *           items:
 *             type: string
 */
router.delete('/:id', groupController.deleteGrupo);


module.exports = router;