// routes/groupRoute.js
const express = require("express");
const groupController = require("../controllers/groupController");
const router = express.Router();
// Validadores
const {
  createGroupValidation,
  updateGroupValidation,
  groupIdValidation,
  groupMemberValidation,
  groupMemberDeleteValidation,
  getGroupMembersValidation,
  memberGroupsValidation,
} = require("../services/validators/groupValidator");
const authenticate = require("../middlewares/authenticate");

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
router.get("/", groupController.getAll);

/**
 * @swagger
 * /groups/{id}:
 *   get:
 *     summary: Obtiene un grupo específico
 *     tags: [Groups]
 *     description: Devuelve los detalles de un grupo basado en su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del grupo.
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
 *                 Nombre:
 *                   type: string
 *                 lider:
 *                   type: string
 *       404:
 *         description: Grupo no encontrado
 *       500:
 *         description: Error al obtener el grupo
 */
router.get("/:id", groupIdValidation, groupController.getById);

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
 *                 Nombre:
 *                   type: string
 *                   description: El Nombre del grupo creado.
 *                 Descripcion:
 *                   type: string
 *                   description: Breve descripcion del grupo o su finalidad.
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
 *               error: "Error al guardar el grupo. Por favor, inténtalo más tarde."
 */
router.post("/", createGroupValidation, groupController.create);

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
router.delete("/:id", groupIdValidation, groupController.delete);

/**
 * @swagger
 * /groups/{id}:
 *  put:
 *      summary: Actualiza un grupo existente por su ID.
 *      parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
router.put("/:id", updateGroupValidation, groupController.update);

/**
 * @swagger
 * /group/search/searchString:
 *   get:
 *     summary: Busca resultados por Nombre
 *     tags: [Groups]
 *     description: Busca resultados cuyo Nombre coincida con el término de búsqueda.
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
 *         description: Lista de resultados encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 members:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Groups'
 *       404:
 *         description: No se encontraron grupos
 *       500:
 *         description: Error al realizar la búsqueda
 */
router.get("/search/:searchString", groupController.search);

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
 *           example: "GRUPO_ABC123"
 *         description: ID del grupo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - memberId
 *               - role
 *             properties:
 *               memberId:
 *                 type: string
 *                 example: "MIEMBRO_XYZ789"
 *                 description: ID único del miembro a agregar
 *               role:
 *                 type: string
 *                 example: "Lider"
 *                 description: Rol del miembro
 *     responses:
 *       201:
 *         description: Miembro agregado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Miembro agregado correctamente"
 *                 result:
 *                   type: object
 *                   properties:
 *                     groupId:
 *                       type: string
 *                       example: "GRUPO_ABC123"
 *                     memberId:
 *                       type: string
 *                       example: "MIEMBRO_XYZ789"
 *       400:
 *         description: Solicitud incorrecta, falta información necesaria
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "ID del miembro no especificado."
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al agregar miembro"
 */
router.post(
  "/:groupId/members",
  groupMemberValidation,
  groupController.addMember
);

/**
 * @swagger
 * /groups/{groupId}/members/{memberId}:
 *   delete:
 *     summary: Elimina un miembro de un grupo
 *     description: Remueve la asociación de un miembro con un grupo específico
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *           example: "GRUPO_ABC123"
 *         description: ID del grupo
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
router.delete("/:groupId/members/:memberId", groupMemberDeleteValidation, groupController.removeMember);

/**
 * @swagger
 * /groups/{groupId}/members:
 *   get:
 *     summary: Obtiene la lista de miembros de un grupo
 *     description: Devuelve la lista completa de miembros asociados a un grupo específico
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *           example: "GRUPO_ABC123"
 *         description: ID del grupo del cual se obtendrán los miembros
 *     responses:
 *       200:
 *         description: Lista de miembros obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "MIEMBRO_XYZ789"
 *                   nombre:
 *                     type: string
 *                     example: "Juan Pérez"
 *                   rol:
 *                     type: string
 *                     example: "estudiante"
 *       404:
 *         description: Grupo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Grupo no encontrado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al obtener miembros"
 */
router.get(
  "/:groupId/members",
  getGroupMembersValidation,
  groupController.getGroupMembers
);

/**
 * @swagger
 * /groups/members/{memberId}/groups:
 *   get:
 *     summary: Obtiene la lista de grupos a los que pertenece un miembro
 *     description: Devuelve la lista asociados a un miembro específico
 *     tags: [Groups]
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
 *         description: Lista de grupos obtenida exitosamente
 *         content:
 *           application/json:
 *             example:
 *               - id: "GRUPO_ABC123"
 *                 nombre: "Introducción a la programación"
 *                 fecha_inscripcion: "2024-03-01"
 *               - id: "GRUPO_DEF456"
 *                 nombre: "Bases de datos avanzadas"
 *                 fecha_inscripcion: "2024-02-15"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al obtener grupos del miembro"
 */
router.get(
  "/members/:memberId/groups",
  memberGroupsValidation,
  groupController.getMemberGroups
);

module.exports = router;
