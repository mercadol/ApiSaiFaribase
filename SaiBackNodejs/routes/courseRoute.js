'use strict';

const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: The course managing API
 */

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Returns a list of courses
 *     tags: [Courses]
 *     description: Retrieves a list of courses with optional pagination.
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
 *         description: A list of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 courses:
 *                   type: array
 *                   items:
 *                 nextStartAfter:
 *                   type: string
 *       500:
 *         description: An error occurred
 */
router.get('/', courseController.getCursos);

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Obtiene un curso específico
 *     tags: [Courses]
 *     description: Devuelve los detalles de un curso basado en su ID.
 *     responses:
 *       200:
 *         description: Detalles del curso obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 nombre:
 *                   type: string
 *                 maestro:
 *                   type: string
 *       404:
 *         description: Curso no encontrado
 *       500:
 *         description: Error al obtener el curso
 */
router.get('/:id', courseController.getCursoById);

/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Crea un nuevo course.
 *     tags: [Courses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - Nombre
 *               - Maestro
 *     responses:
 *       201:
 *         description: Curso creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: El ID del curso creado.
 *             example:
 *               id: "curso1"
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
 *               error: "Error al guardar el curso. Por favor, inténtalo más tarde."
 */
router.post('/', courseController.createCurso);

/**
 * Elimina un curso por su ID.
 * @swagger
 * /courses/{id}:
 *  delete:
 *     summary: Elimina un curso específico
 *     tags: [Courses]
 *     description: Devuelve TRUE si encuentra y elimina un curso basado en su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del curso a eliminar.
 *     responses:
 *       200:
 *         description: Curso eliminado correctamente
 *         content:
 *           @returns {boolean} - true
 *       404:
 *         description: Curso no encontrado
 *       400:
 *         description: Id del Curso no es valido
 *       500:
 *         description: Error al eliminar el curso
 */
router.delete('/:id', courseController.deleteCurso);

/**
 * @swagger
 * /courses/{id}:
 *  put:
 *      summary: Actualiza un curso existente por su ID.
 *      tags: [Courses]
 *      requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Name
 * */
router.put('/:id', courseController.updateCurso);

module.exports = router;