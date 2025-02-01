"use strict";

const memberGroupService = require("../services/memberGroupService"); // Importar el servicio
const idGenerator = require("../utilities/idGenerator");
const validator = require("validator");

const memberGroupController = {
  // Obtener los grupos de un miembro
  getGroupsOfMember: async (req, res) => {
    try {
      const { memberId } = req.params;

      // Validar el ID del miembro
      if (!memberId || !validator.isUUID(memberId)) {
        return res
          .status(400)
          .json({ error: "ID de miembro inválido o faltante." });
      }

      // Llamar al servicio
      const grupos = await memberGroupService.getGroupsOfMember(memberId);

      return res.status(200).json({ grupos });
    } catch (error) {
      console.error("Error en getGroupsOfMember:", error.message);
      return res.status(500).json({
        error:
          "Error al obtener los grupos del miembro. Por favor, inténtalo más tarde.",
      });
    }
  },

  // Obtener los miembros de un grupo
  getMembersOfGroup: async (req, res) => {
    try {
      const { groupId } = req.params;

      // Validar el ID del grupo
      if (!groupId || !validator.isUUID(groupId)) {
        return res
          .status(400)
          .json({ error: "ID de grupo inválido o faltante." });
      }

      // Llamar al servicio
      const miembros = await memberGroupService.getMembersOfGroup(groupId);

      return res.status(200).json({ miembros });
    } catch (error) {
      console.error("Error en getMembersOfGroup:", error.message);
      return res.status(500).json({
        error:
          "Error al obtener los miembros del grupo. Por favor, inténtalo más tarde.",
      });
    }
  },

  // Añadir un miembro a un grupo
  addMemberToGroup: async (req, res) => {
    try {
      const { memberId, groupId, memberName, memberRoll } = req.body;

      // Validar que memberId existe antes de verificar si es un UUID
      if (!memberId) {
        return res.status(400).json({ error: "ID de miembro es obligatorio." });
      }

      // Validar que groupId existe antes de verificar si es un UUID
      if (!groupId) {
        return res.status(400).json({ error: "ID de grupo es obligatorio." });
      }

      // Validar que memberName es un string válido
      if (
        !memberName ||
        typeof memberName !== "string" ||
        memberName.trim() === ""
      ) {
        return res
          .status(400)
          .json({
            error:
              "El nombre del miembro es obligatorio y debe ser un texto válido.",
          });
      }

      // Validar que memberRoll sea "Asistente" o "Líder", por defecto "Asistente"
      const validRoles = ["Asistente", "Líder"];
      const role = validRoles.includes(memberRoll) ? memberRoll : "Asistente";

      // Llamar al servicio
      const result = await memberGroupService.addMemberToGroup({
        memberId,
        groupId,
        memberName,
        memberRoll: role,
      });

      return res.status(201).json({
        message: "Miembro añadido al grupo con éxito.",
        data: result,
      });
    } catch (error) {
      console.error("Error en addMemberToGroup:", error.message);
      return res.status(500).json({
        error:
          "Error al añadir miembro al grupo. Por favor, inténtalo más tarde.",
      });
    }
  },

  removeMemberFromGroup: async (req, res) => {
    try {
      const { memberId, groupId } = req.body;

      // Validar que los IDs estén presentes en el cuerpo de la solicitud
      if (!memberId || !groupId) {
        return res.status(400).json({
          error: "Faltan parámetros obligatorios: memberId y groupId.",
        });
      }

      // Llamar al servicio para eliminar la relación
      const result = await memberGroupService.removeMemberFromGroup(
        memberId,
        groupId
      );

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error en removeMemberFromGroup:", error.message);
      return res.status(500).json({
        error:
          "Error al eliminar la relación miembro-grupo. Por favor, inténtalo más tarde.",
      });
    }
  },
};

module.exports = memberGroupController;
