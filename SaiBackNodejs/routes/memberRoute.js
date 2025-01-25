'use strict';

const express = require('express');
const memberController = require('../controllers/memberController');
const router = express.Router();

/**
 * @swagger
 * /members/test:
 *   get:
 *     summary: Endpoint de prueba
 *     description: Devuelve un mensaje para verificar que la API está activa.
 *     responses:
 *       200:
 *         description: Mensaje de prueba obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get('/test', memberController.test);

/**
 * @swagger
 * /members:
 *   get:
 *     summary: Obtiene la lista de miembros
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
router.get('/', memberController.getMembers);

/**
 * @swagger
 * /members/{id}:
 *   get:
 *     summary: Obtiene un miembro específico
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
 *                 email:
 *                   type: string
 *       404:
 *         description: Miembro no encontrado
 *       500:
 *         description: Error al obtener el miembro
 */
router.get('/:id', memberController.getMember);

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
 *               - id
 *               - Name
 *               - MemberType
 *               - Notas
 *             properties:
 *               id:
 *                 type: string
 *                 description: Identificador único del miembro.
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
 *               Cursos:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lista de cursos asociados al miembro.
 *               Grupos:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lista de grupos asociados al miembro.
 *               Eventos:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lista de eventos asociados al miembro.
 *           example:
 *             id: "12345"
 *             Name: "John Doe"
 *             MemberType: "Premium"
 *             EstadoCivil: "Soltero"
 *             Email: "johndoe@example.com"
 *             Telephono: "1234567890"
 *             Oficio: "Desarrollador"
 *             Notas: "Este miembro ha sido registrado como parte del grupo Premium."
 *             Cursos: ["Curso de liderazgo", "Curso de comunicación"]
 *             Grupos: ["Grupo A", "Grupo B"]
 *             Eventos: ["Evento 1", "Evento 2"]
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
 *               error: "Los campos id, Name y MemberType son obligatorios."
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al guardar el miembro. Por favor, inténtalo más tarde."
 */
router.post('/', memberController.createMember);

module.exports = router;

