'use strict';

const express = require('express');
const router = express.Router();
const memberGroupController = require('../controllers/memberGroupController');

/**
 * @swagger
 * tags:
 *   name: MemberGroups
 *   description: API para gestionar las relaciones entre miembros y grupos
 */

/**
 * @swagger
 * /memberGroups/member/{memberId}:
 *   get:
 *     summary: Obtiene todos los grupos asociados a un miembro.
 *     tags: [MemberGroups]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         schema:
 *           type: string
 *         required: true
 *         description: El ID del miembro.
 *     responses:
 *       200:
 *         description: Lista de grupos asociados al miembro.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID del grupo.
 *                   groupName:
 *                     type: string
 *                     description: Nombre del grupo.
 *                   memberName:
 *                     type: string
 *                     description: Nombre del miembro en el grupo.
 *                   memberRoll:
 *                     type: string
 *                     enum: [Asistente, Líder]
 *                     description: Rol del miembro en el grupo (por defecto "Asistente").
 *             example:
 *               - id: "123"
 *                 groupName: "Grupo de jóvenes"
 *                 memberName: "John Doe"
 *                 memberRoll: "Asistente"
 *               - id: "456"
 *                 groupName: "Grupo de estudio bíblico"
 *                 memberName: "John Doe"
 *                 memberRoll: "Líder"
 *       404:
 *         description: No se encontraron grupos asociados al miembro.
 *         content:
 *           application/json:
 *             example:
 *               error: "No se encontró ninguna relación con este ID."
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al obtener la relación del miembro con el grupo. Por favor, inténtalo más tarde."
 */
router.get('/member/:memberId', memberGroupController.getGroupsOfMember);

/**
 * @swagger
 * /memberGroups/group/{groupId}:
 *   get:
 *     summary: Obtiene todos los miembros asociados a un grupo.
 *     tags: [MemberGroups]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         schema:
 *           type: string
 *         required: true
 *         description: El ID del grupo.
 *     responses:
 *       200:
 *         description: Lista de miembros asociados al grupo.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID del miembro.
 *                   memberName:
 *                     type: string
 *                     description: Nombre del miembro.
 *                   memberRoll:
 *                     type: string
 *                     enum: [Asistente, Líder]
 *                     description: Rol del miembro en el grupo (por defecto "Asistente").
 *             example:
 *               - id: "789"
 *                 memberName: "John Doe"
 *                 memberRoll: "Asistente"
 *               - id: "012"
 *                 memberName: "Jane Doe"
 *                 memberRoll: "Líder"
 *       404:
 *         description: No se encontraron miembros asociados al grupo.
 *         content:
 *           application/json:
 *             example:
 *               error: "No se encontró ninguna relación con este ID."
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al obtener la relación del grupo con los miembros. Por favor, inténtalo más tarde."
 */
router.get('/group/:groupId', memberGroupController.getMembersOfGroup);

/**
 * @swagger
 * /memberGroups:
 *   post:
 *     summary: Añade un miembro a un grupo.
 *     tags: [MemberGroups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - memberId
 *               - groupId
 *             properties:
 *               memberId:
 *                 type: string
 *                 description: ID del miembro.
 *               groupId:
 *                 type: string
 *                 description: ID del grupo.
 *               memberName:
 *                 type: string
 *                 description: Nombre del miembro.
 *               memberRoll:
 *                 type: string
 *                 enum: [Asistente, Líder]
 *                 description: Rol del miembro en el grupo (por defecto "Asistente").
 *           example:
 *             memberId: "123"
 *             groupId: "456"
 *             memberName: "John Doe"
 *             memberRoll: "Líder"
 *     responses:
 *       201:
 *         description: Relación creada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID de la relación creada.
 *                 groupName:
 *                   type: string
 *                   description: Nombre del grupo.
 *                 memberName:
 *                   type: string
 *                   description: Nombre del miembro.
 *                 memberRoll:
 *                   type: string
 *                   enum: [Asistente, Líder]
 *                   description: Rol del miembro en el grupo.
 *             example:
 *               id: "789"
 *               groupName: "Grupo de jóvenes"
 *               memberName: "John Doe"
 *               memberRoll: "Líder"
 *       400:
 *         description: Error de validación por campos faltantes o inválidos.
 *         content:
 *           application/json:
 *             example:
 *               error: "Los campos memberId y groupId son obligatorios."
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al añadir el miembro al grupo. Por favor, inténtalo más tarde."
 */
router.post('/', memberGroupController.addMemberToGroup);

/**
 * @swagger
 * /memberGroups:
 *   delete:
 *     summary: Elimina un miembro de un grupo.
 *     tags: [MemberGroups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - memberId
 *               - groupId
 *             properties:
 *               memberId:
 *                 type: string
 *                 description: ID del miembro.
 *               groupId:
 *                 type: string
 *                 description: ID del grupo.
 *           example:
 *             memberId: "123"
 *             groupId: "456"
 *     responses:
 *       200:
 *         description: Relación eliminada exitosamente.
 *       400:
 *         description: Error de validación por campos faltantes o inválidos.
 *         content:
 *           application/json:
 *             example:
 *               error: "Los campos memberId y groupId son obligatorios."
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al eliminar el miembro del grupo. Por favor, inténtalo más tarde."
 */
router.delete('/', memberGroupController.removeMemberFromGroup);

module.exports = router;
