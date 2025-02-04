"use strict";

const memberCourseService = require("../services/memberCourseService");

const memberCourseController = {
  // Obtener los cursos de un miembro
  getCoursesOfMember: async (req, res) => {
    try {
      const { memberId } = req.params;

      // Validar el ID del miembro
      if (!memberId) {
        return res
          .status(400)
          .json({ error: "ID de miembro inválido o faltante." });
      }

      // Llamar al servicio
      const cursos = await memberCourseService.getCoursesOfMember(memberId);

      return res.status(200).json({ cursos });
    } catch (error) {
      console.error("Error en getCoursesOfMember:", error.message);
      return res.status(500).json({
        error:
          "Error al obtener los cursos del miembro. Por favor, inténtalo más tarde.",
      });
    }
  },

  // Obtener los miembros de un curso
  getMembersOfCourse: async (req, res) => {
    try {
      const { courseId } = req.params;

      // Validar el ID del curso
      if (!courseId) {
        return res
          .status(400)
          .json({ error: "ID de curso inválido o faltante." });
      }

      // Llamar al servicio
      const miembros = await memberCourseService.getMembersOfCourse(courseId);

      return res.status(200).json({ miembros });
    } catch (error) {
      console.error("Error en getMembersOfCourse:", error.message);
      return res.status(500).json({
        error:
          "Error al obtener los miembros del curso. Por favor, inténtalo más tarde.",
      });
    }
  },

  // Inscribir un miembro a un curso
  addMemberToCourse: async (req, res) => {
    try {
      const { memberId, courseId, memberName, memberRoll } = req.body;

      // Validar que memberId existe
      if (!memberId) {
        return res.status(400).json({ error: "ID de miembro es obligatorio." });
      }

      // Validar que courseId existe
      if (!courseId) {
        return res.status(400).json({ error: "ID de curso es obligatorio." });
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

      // Validar que memberRoll sea "Estudiante" o "Maestro", por defecto "Estudiante"
      const validRoles = ["Estudiante", "Maestro"];
      const role = validRoles.includes(memberRoll) ? memberRoll : "Estudiante";

      // Llamar al servicio
      const result = await memberCourseService.addMemberToCourse({
        memberId,
        courseId,
        memberName,
        memberRoll: role,
      });

      return res.status(201).json({
        message: "Miembro inscrito al curso con éxito.",
        data: result,
      });
    } catch (error) {
      console.error("Error en addMemberToCourse:", error.message);
      return res.status(500).json({
        error:
          "Error al Inscribir miembro al curso. Por favor, inténtalo más tarde.",
      });
    }
  },

  removeMemberFromCourse: async (req, res) => {
    try {
      const { memberId, courseId } = req.body;

      // Validar que los IDs estén presentes en el cuerpo de la solicitud
      if (!memberId || !courseId) {
        return res.status(400).json({
          error: "Faltan parámetros obligatorios: memberId y courseId.",
        });
      }

      // Llamar al servicio para eliminar la relación
      const result = await memberCourseService.removeMemberFromCourse(
        memberId,
        courseId
      );

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error en removeMemberFromCourse:", error.message);
      return res.status(500).json({
        error:
          "Error al eliminar la relación miembro-curso. Por favor, inténtalo más tarde.",
      });
    }
  },
};

module.exports = memberCourseController;
