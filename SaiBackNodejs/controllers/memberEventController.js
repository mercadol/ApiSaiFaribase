"use strict";

const memberEventService = require("../services/memberEventService");

const memberEventController = {
  // Obtener los eventos de un miembro
  getEventsOfMember: async (req, res) => {
    try {
      const { memberId } = req.params;

      // Validar el ID del miembro
      if (!memberId) {
        return res
          .status(400)
          .json({ error: "ID de miembro inválido o faltante." });
      }

      // Llamar al servicio
      const eventos = await memberEventService.getEventsOfMember(memberId);

      return res.status(200).json({ eventos });
    } catch (error) {
      console.error("Error en getEventsOfMember:", error.message);
      return res.status(500).json({
        error:
          "Error al obtener los eventos del miembro. Por favor, inténtalo más tarde.",
      });
    }
  },

  // Obtener los miembros de un evento
  getMembersOfEvent: async (req, res) => {
    try {
      const { eventId } = req.params;

      // Validar el ID del evento
      if (!eventId) {
        return res
          .status(400)
          .json({ error: "ID de evento inválido o faltante." });
      }

      // Llamar al servicio
      const miembros = await memberEventService.getMembersOfEvent(eventId);

      return res.status(200).json({ miembros });
    } catch (error) {
      console.error("Error en getMembersOfEvent:", error.message);
      return res.status(500).json({
        error:
          "Error al obtener los miembros del evento. Por favor, inténtalo más tarde.",
      });
    }
  },

  // Añadir un miembro a un evento
  addMemberToEvent: async (req, res) => {
    try {
      const { memberId, eventId, memberName, memberRoll } = req.body;

      // Validar que memberId existe
      if (!memberId) {
        return res.status(400).json({ error: "ID de miembro es obligatorio." });
      }

      // Validar que eventId existe
      if (!eventId) {
        return res.status(400).json({ error: "ID de evento es obligatorio." });
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
      const result = await memberEventService.addMemberToEvent({
        memberId,
        eventId,
        memberName,
        memberRoll: role,
      });

      return res.status(201).json({
        message: "Miembro añadido al evento con éxito.",
        data: result,
      });
    } catch (error) {
      console.error("Error en addMemberToEvent:", error.message);
      return res.status(500).json({
        error:
          "Error al añadir miembro al evento. Por favor, inténtalo más tarde.",
      });
    }
  },

  removeMemberFromEvent: async (req, res) => {
    try {
      const { memberId, eventId } = req.body;

      // Validar que los IDs estén presentes en el cuerpo de la solicitud
      if (!memberId || !eventId) {
        return res.status(400).json({
          error: "Faltan parámetros obligatorios: memberId y eventId.",
        });
      }

      // Llamar al servicio para eliminar la relación
      const result = await memberEventService.removeMemberFromEvent(
        memberId,
        eventId
      );

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error en removeMemberFromEvent:", error.message);
      return res.status(500).json({
        error:
          "Error al eliminar la relación miembro-evento. Por favor, inténtalo más tarde.",
      });
    }
  },
};

module.exports = memberEventController;
