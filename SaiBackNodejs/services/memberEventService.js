"use strict";

const db = require("../firebase").db; // Importar la conexión a Firestore

const memberEventService = {
  // Obtener los eventos de un miembro
  getEventsOfMember: async (memberId) => {
    try {
      if (!memberId) throw new Error("El ID del miembro es obligatorio.");

      const querySnapshot = await db
        .collection("MiembroEvento")
        .where("memberId", "==", memberId)
        .get();

      if (querySnapshot.empty) {
        throw new Error(
          `No se encontraron eventos para el miembro con ID: ${memberId}`
        );
      }

      const eventIDs = querySnapshot.docs.map((doc) => doc.data().eventId);

      const events = await Promise.all(
        eventIDs.map(async (eventId) => {
          const eventDoc = await db.collection("Event").doc(eventId).get();
          return eventDoc.exists ? { id: eventId, ...eventDoc.data() } : null;
        })
      );

      return events.filter(Boolean); // Filtrar eventos inexistentes
    } catch (error) {
      console.error("Error al obtener los eventos del miembro:", error.message);
      throw new Error(
        "Error al obtener los eventos. Por favor, inténtalo más tarde."
      );
    }
  },

  // Obtener los miembros de un evento
  getMembersOfEvent: async (eventId) => {
    try {
      if (!eventId) throw new Error("El ID del evento es obligatorio.");

      const querySnapshot = await db
        .collection("MiembroEvento")
        .where("eventId", "==", eventId)
        .get();

      if (querySnapshot.empty) {
        throw new Error(
          `No se encontraron miembros para el evento con ID: ${eventId}`
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

      return members.filter(Boolean); // Filtrar miembros inexistentes
    } catch (error) {
      console.error("Error al obtener los miembros del evento:", error.message);
      throw new Error(
        "Error al obtener los miembros. Por favor, inténtalo más tarde."
      );
    }
  },

  // Añadir un miembro a un evento
  addMemberToEvent: async ({ memberId, eventId, memberName, memberRole }) => {
    try {
      if (!memberId || !eventId || !memberName) {
        throw new Error(
          "El ID del miembro, el ID del evento y el nombre del miembro son obligatorios."
        );
      }

      if (!memberRole) {
        throw new Error("El miembro debe tener un rol asignado.");
      }

      const docId = `${memberId}_${eventId}`; // ID único para la relación
      await db.collection("MiembroEvento").doc(docId).set({
        memberId,
        eventId,
        memberName,
        memberRole,
        fecha: new Date().toISOString(),
      });

      return {
        message: "Relación creada con éxito.",
        id: docId,
        eventId,
        memberId,
        memberName,
        memberRole,
      };
    } catch (error) {
      console.error("Error al añadir miembro al evento:", error.message);
      if (error.message.includes("obligatorios")) {
        throw error;
      } else {
        throw new Error(
          "Error al crear la relación. Por favor, inténtalo más tarde."
        );
      }
    }
  },

  // Eliminar un miembro de un evento
  removeMemberFromEvent: async (memberId, eventId) => {
    try {
      const querySnapshot = await db
        .collection("MiembroEvento")
        .where("memberId", "==", memberId)
        .where("eventId", "==", eventId)
        .get();

      if (querySnapshot.empty) {
        return Promise.reject(
          new Error(
            `No se encontró la relación miembro-evento para memberId: ${memberId} y eventId: ${eventId}`
          )
        );
      }

      const batch = db.batch();
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      return { success: true, message: "Relación eliminada correctamente." };
    } catch (error) {
      console.error(
        "Error al eliminar la relación miembro-evento:",
        error.message
      );

      // Si el error viene de Firestore, mostramos el mensaje adecuado
      if (error.message.includes("No se encontró la relación miembro-evento")) {
        throw error; // Relanzamos el error esperado
      }

      throw new Error(
        "Error al eliminar la relación. Por favor, inténtalo más tarde."
      );
    }
  },
};

module.exports = memberEventService;
