'use strict';

const express = require('express');
const courseController = require('../controllers/courseController');
const router = express.Router();

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
router.get('/', courseController.getAll);

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Obtiene un curso específico
 *     tags: [Courses]
 *     description: Devuelve los detalles de un curso basado en su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del Curso.
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
 *                 Nombre:
 *                   type: string
 *                 maestro:
 *                   type: string
 *       404:
 *         description: Curso no encontrado
 *       500:
 *         description: Error al obtener el curso
 */
router.get('/:id', courseController.getById);

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
 *               - Nombre
 *               - Descripcion
 *               - FechaInicio
 *               - FechaFin
 *     responses:
 *       201:
 *         description: Curso creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Nombre:
 *                   type: string
 *                   description: El Nombre del Curso creado.
 *                 Descripcion:
 *                   type: string
 *                   description: Breve descripcion del Curso.
 *                 FechaInicio:
 *                   type: Data
 *                   description: Fecha de inicio del curso.
 *                 FechaFin:
 *                   type: Data
 *                   description: Fecha clausura del curso.
 *             example:
 *               Nombre: "Grupo de aseo"
 *               Descripcion: "Grupo encargado de velar por el aseo de las instalaciones"
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
 *               error: "Error al guardar el curso. Por favor, inténtalo más tarde."
 */
router.post('/', courseController.create);

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
router.delete('/:id', courseController.delete);

/**
 * @swagger
 * /courses/{id}:
 *  put:
 *      summary: Actualiza un curso existente por su ID.
 *      parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *      tags: [Courses]
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
router.put('/:id', courseController.update);

/**
 * @swagger
 * /courses/search/searchString:
 *   get:
 *     summary: Busca cursos por Nombre
 *     tags: [Courses]
 *     description: Busca cursos cuyo Nombre coincida con el término de búsqueda.
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
 *         description: Lista de cursos encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 courses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *       404:
 *         description: No se encontraron cursos
 *       500:
 *         description: Error al realizar la búsqueda
 */
router.get('/search/:searchString', courseController.search);

//relaciones curso-Miembro
/**
 * @swagger
 * /courses/{courseId}/members:
 *   post:
 *     summary: Agrega un miembro a un curso
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *           example: "CURSO_ABC123"
 *         description: ID único del curso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - memberId
 *             properties:
 *               memberId:
 *                 type: string
 *                 example: "MIEMBRO_XYZ789"
 *                 description: ID único del miembro a agregar
 *               data:
 *                 type: object
 *                 example: { "rol": "estudiante", "fecha_inscripcion": "2024-03-01" }
 *                 description: Datos adicionales de la relación
 *     responses:
 *       201:
 *         description: Miembro agregado exitosamente al curso
 *         content:
 *           application/json:
 *             example:
 *               message: "Miembro agregado al curso correctamente"
 *               result: { courseId: "CURSO_ABC123", memberId: "MIEMBRO_XYZ789" }
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al agregar miembro al curso"
 */
router.post('/:courseId/members', courseController.addMember);

/**
 * @swagger
 * /courses/{courseId}/members/{memberId}:
 *   delete:
 *     summary: Elimina un miembro de un curso
 *     description: Remueve la asociación de un miembro con un curso específico
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *           example: "CURSO_ABC123"
 *         description: ID único del curso
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *           example: "MIEMBRO_XYZ789"
 *         description: ID único del miembro a eliminar
 *     responses:
 *       200:
 *         description: Miembro eliminado exitosamente del curso
 *         content:
 *           application/json:
 *             example:
 *               message: "Miembro removido del curso correctamente"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al eliminar miembro del curso"
 */
router.delete('/:courseId/members/:memberId', courseController.removeMember);

/**
 * @swagger
 * /courses/{courseId}/members:
 *   get:
 *     summary: Obtiene todos los miembros de un curso
 *     description: Devuelve la lista completa de miembros asociados a un curso específico
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *           example: "CURSO_ABC123"
 *         description: ID único del curso
 *     responses:
 *       200:
 *         description: Lista de miembros obtenida exitosamente
 *         content:
 *           application/json:
 *             example:
 *               - id: "MIEMBRO_XYZ789"
 *                 nombre: "Juan Pérez"
 *                 rol: "estudiante"
 *               - id: "MIEMBRO_DEF456"
 *                 nombre: "María García"
 *                 rol: "instructor"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al obtener miembros del curso"
 */
router.get('/:courseId/members', courseController.getCourseMembers);

/**
 * @swagger
 * /courses/members/{memberId}/courses:
 *   get:
 *     summary: Obtiene todos los cursos de un miembro
 *     description: Devuelve la lista de cursos asociados a un miembro específico
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *           example: "MIEMBRO_XYZ789"
 *         description: ID único del miembro
 *     responses:
 *       200:
 *         description: Lista de cursos obtenida exitosamente
 *         content:
 *           application/json:
 *             example:
 *               - id: "CURSO_ABC123"
 *                 nombre: "Introducción a la programación"
 *                 fecha_inscripcion: "2024-03-01"
 *               - id: "CURSO_DEF456"
 *                 nombre: "Bases de datos avanzadas"
 *                 fecha_inscripcion: "2024-02-15"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al obtener cursos del miembro"
 */
router.get('/members/:memberId/courses', courseController.getMemberCourses);

module.exports = router;  
