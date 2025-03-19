// routes/eventRoute.js
const express = require('express');
const eventController = require('../controllers/eventController');
const router = express.Router();

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Returns a list of events
 *     tags: [Events]
 *     description: Retrieves a list of events with optional pagination.
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
 *         description: A list of events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 events:
 *                   type: array
 *                   items:
 *                 nextStartAfter:
 *                   type: string
 *       500:
 *         description: An error occurred
 */
router.get('/', eventController.getAll);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Obtiene un evento específico
 *     tags: [Events]
 *     description: Devuelve los detalles de un evento basado en su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del evento.
 *     responses:
 *       200:
 *         description: Detalles del evento obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 Nombre:
 *                   type: string
 *                 Descripcion:
 *                   type: string
 *       404:
 *         description: Evento no encontrado
 *       500:
 *         description: Error al obtener el evento
 */
router.get('/:id', eventController.getById);

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Crea un nuevo evento.
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Nombre
 *               - Descripcion
 *               - Fecha
 * 
 *     responses:
 *       201:
 *         description: Evento creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Nombre:
 *                   type: string
 *                   description: El Nombre del Evento creado.
 *                 Descripcion:
 *                   type: string
 *                   description: Breve descripcion del Evento.
 *             example:
 *               Nombre: "Concierto"
 *               Descripcion: "Concierto de jovenes de este sabado"
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
 *               error: "Error al guardar el evento. Por favor, inténtalo más tarde."
 */
router.post('/', eventController.create);

/**
 * Elimina un evento por su ID.
 * @swagger
 * /events/{id}:
 *  delete:
 *     summary: Elimina un evento específico
 *     tags: [Events]
 *     description: Devuelve TRUE si encuentra y elimina un evento basado en su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del evento a eliminar.
 *     responses:
 *       200:
 *         description: Evento eliminado correctamente
 *         content:
 *           @returns {boolean} - true
 *       404:
 *         description: Evento no encontrado
 *       400:
 *         description: Id del Evento no es valido
 *       500:
 *         description: Error al eliminar el evento
 */
router.delete('/:id', eventController.delete);

/**
 * @swagger
 * /events/{id}:
 *  put:
 *      summary: Actualiza un evento existente por su ID.
 *      parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *      tags: [Events]
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
router.put('/:id', eventController.update);

/**
 * @swagger
 * /events/search/searchString:
 *   get:
 *     summary: Busca eventos por Nombre
 *     tags: [Events]
 *     description: Busca eventos cuyo Nombre coincida con el término de búsqueda.
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
 *         description: Lista de eventos encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 events:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *       404:
 *         description: No se encontraron eventos
 *       500:
 *         description: Error al realizar la búsqueda
 */
router.get('/search/:searchString', eventController.search);

//relaciones
/**
 * @swagger
 * /events/{eventId}/members:
 *   post:
 *     summary: Agrega un miembro a un evento
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           example: "EVENTO_ABC123"
 *         description: ID del evento
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
 *                 example: { "rol": "Lider", "fecha_inscripcion": "2024-03-01" }
 *                 description: Datos adicionales de la relación
 *     responses:
 *       201:
 *         description: Miembro agregado correctamente    
 *         content:
 *           application/json:
 *             example:
 *               message: "Miembro agregado correctamente"
 *               result: { courseId: "EVENTO_ABC123", memberId: "MIEMBRO_XYZ789" }
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al agregar miembro"
 */
router.post('/:eventId/members', eventController.addMember);

/**
 * @swagger
 * /events/{eventId}/members/{memberId}:
 *   delete:
 *     summary: Elimina un miembro de un evento
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           example: "EVENTO_ABC123"
 *         description: ID del evento
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *           example: "MIEMBRO_XYZ789"
 *         description: ID del miembro a eliminar
 *     responses:
 *       200:
 *         description: Miembro eliminado correctamente
 *         content:
 *           application/json:
 *             example:
 *               message: "Miembro removido correctamente"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al eliminar miembro"
 */
router.delete('/:eventId/members/:memberId', eventController.removeMember);

/**
 * @swagger
 * /events/{eventId}/members:
 *   get:
 *     summary: Obtiene la lista de miembros de un evento
 *     description: Devuelve la lista completa de miembros asociados
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           example: "EVENTO_ABC123"
 *         description: ID del evento
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
 *               error: "Error al obtener miembros"
 */
router.get('/:eventId/members', eventController.getEventMembers);

/**
 * @swagger
 * /events/members/{memberId}/events:
 *   get:
 *     summary: Obtiene la lista de eventos a los que pertenece un miembro
 *     description: Devuelve la lista asociados a un miembro específico
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *           example: "MIEMBRO_XYZ789"
 *         description: ID del miembro
 *     responses:
 *       200:
 *         description: Lista de eventos obtenida exitosamente
 *         content:
 *           application/json:
 *             example:
 *               - id: "EVENTO_ABC123"
 *                 nombre: "Introducción a la programación"
 *                 fecha_inscripcion: "2024-03-01"
 *               - id: "EVENTO_DEF456"
 *                 nombre: "Bases de datos avanzadas"
 *                 fecha_inscripcion: "2024-02-15"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al obtener eventos del miembro"
 */
router.get('/members/:memberId/events', eventController.getMemberEvents);

module.exports = router;
