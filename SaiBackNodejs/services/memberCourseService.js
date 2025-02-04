"use strict";

const db = require("../firebase").db;

const memberCourseService = {
  // Obtener los cursos de un miembro
  getCoursesOfMember: async (memberId) => {
    try {
      if (!memberId) throw new Error("El ID del miembro es obligatorio.");

      const querySnapshot = await db
        .collection("MiembroCurso")
        .where("memberId", "==", memberId)
        .get();

      if (querySnapshot.empty) {
        throw new Error(
          `No se encontraron cursos para el miembro con ID: ${memberId}`
        );
      }

      const courseIDs = querySnapshot.docs.map((doc) => doc.data().courseId);

      const courses = await Promise.all(
        courseIDs.map(async (courseId) => {
          const courseDoc = await db.collection("Course").doc(courseId).get();
          return courseDoc.exists ? { id: courseId, ...courseDoc.data() } : null;
        })
      );

      return courses.filter(Boolean);
    } catch (error) {
      console.error("Error al obtener los cursos del miembro:", error.message);
      throw new Error(
        "Error al obtener los cursos. Por favor, inténtalo más tarde."
      );
    }
  },

  // Obtener los miembros de un curso
  getMembersOfCourse: async (courseId) => {
    try {
      if (!courseId) throw new Error("El ID del curso es obligatorio.");

      const querySnapshot = await db
        .collection("MiembroCurso")
        .where("courseId", "==", courseId)
        .get();

      if (querySnapshot.empty) {
        throw new Error(
          `No se encontraron miembros para el curso con ID: ${courseId}`
        );
      }

      const memberIDs = querySnapshot.docs.map((doc) => doc.data().memberId);

      const members = await Promise.all(
        memberIDs.map(async (memberId) => {
          const memberDoc = await db.collection("Member").doc(memberId).get();
          return memberDoc.exists
            ? { id: memberId, ...memberDoc.data() }
            : null;
        })
      );

      return members.filter(Boolean);
    } catch (error) {
      console.error("Error al obtener los miembros del curso:", error.message);
      throw new Error(
        "Error al obtener los miembros. Por favor, inténtalo más tarde."
      );
    }
  },

  // Añadir un miembro a un curso
  addMemberToCourse: async ({ memberId, courseId, enrollmentDate, role }) => {
    try {
      if (!memberId || !courseId) {
        throw new Error(
          "El ID del miembro y el ID del curso son obligatorios.");
      }

      // Verificar existencia del miembro y curso
      const [memberDoc, courseDoc] = await Promise.all([
        db.collection("Member").doc(memberId).get(),
        db.collection("Course").doc(courseId).get(),
      ]);

      if (!memberDoc.exists) {
        throw new Error(`No existe un miembro con ID: ${memberId}`);
      }
      if (!courseDoc.exists) {
        throw new Error(`No existe un curso con ID: ${courseId}`);
      }

      const docId = `${memberId}_${courseId}`;
      await db.collection("MiembroCurso").doc(docId).set({
        memberId,
        courseId,
        role: role || "estudiante",
        enrollmentDate: enrollmentDate || new Date().toISOString(),
      });

      return {
        message: "Inscripción creada con éxito.",
        id: docId,
        courseId,
        memberId,
        role,
        enrollmentDate,
      };
    } catch (error) {
      console.error("Error al añadir miembro al curso:", error.message);
      throw new Error(
        error.message.includes("obligatorios") || error.message.includes("No existe")
          ? error.message
          : "Error al crear la inscripción. Por favor, inténtalo más tarde."
      );
    }
  },

  // Eliminar un miembro de un curso
  removeMemberFromCourse: async (memberId, courseId) => {
    try {
      const querySnapshot = await db
        .collection("MiembroCurso")
        .where("memberId", "==", memberId)
        .where("courseId", "==", courseId)
        .get();

      if (querySnapshot.empty) {
        throw new Error(
          `No se encontró la inscripción para memberId: ${memberId} y courseId: ${courseId}`
        );
      }

      const batch = db.batch();
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      return { success: true, message: "Inscripción eliminada correctamente." };
    } catch (error) {
      console.error("Error al eliminar la inscripción:", error.message);
      throw new Error(
        error.message.includes("No se encontró")
          ? error.message
          : "Error al eliminar la inscripción. Por favor, inténtalo más tarde."
      );
    }
  },
};

module.exports = memberCourseService;
