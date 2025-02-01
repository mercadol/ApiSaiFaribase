"use strict";

const db = require("../firebase").db; // Importar la conexión a Firestore

const memberGroupService = {
  // Obtener los grupos de un miembro
  getGroupsOfMember: async (memberId) => {
    try {
      if (!memberId) throw new Error("El ID del miembro es obligatorio.");

      const querySnapshot = await db
        .collection("MiembroGrupo")
        .where("memberId", "==", memberId)
        .get();

      if (querySnapshot.empty) {
        throw new Error(
          `No se encontraron grupos para el miembro con ID: ${memberId}`
        );
      }

      const grupoIDs = querySnapshot.docs.map((doc) => doc.data().groupId);

      const grupos = await Promise.all(
        grupoIDs.map(async (groupId) => {
          const grupoDoc = await db.collection("Group").doc(groupId).get();
          return grupoDoc.exists ? { id: groupId, ...grupoDoc.data() } : null;
        })
      );

      return grupos.filter(Boolean); // Filtrar grupos inexistentes
    } catch (error) {
      console.error("Error al obtener los grupos del miembro:", error.message);
      throw new Error(
        "Error al obtener los grupos. Por favor, inténtalo más tarde."
      );
    }
  },

  // Obtener los miembros de un grupo
  getMembersOfGroup: async (groupId) => {
    try {
      if (!groupId) throw new Error("El ID del grupo es obligatorio.");

      const querySnapshot = await db
        .collection("MiembroGrupo")
        .where("groupId", "==", groupId)
        .get();

      if (querySnapshot.empty) {
        throw new Error(
          `No se encontraron miembros para el grupo con ID: ${groupId}`
        );
      }

      const miembroIDs = querySnapshot.docs.map((doc) => doc.data().memberId);

      const miembros = await Promise.all(
        miembroIDs.map(async (memberId) => {
          const miembroDoc = await db.collection("Member").doc(memberId).get();
          return miembroDoc.exists
            ? { id: memberId, ...miembroDoc.data() }
            : null;
        })
      );

      return miembros.filter(Boolean); // Filtrar miembros inexistentes
    } catch (error) {
      console.error("Error al obtener los miembros del grupo:", error.message);
      throw new Error(
        "Error al obtener los miembros. Por favor, inténtalo más tarde."
      );
    }
  },

  // Añadir un miembro a un grupo
  addMemberToGroup: async ({ memberId, groupId, memberName, memberRoll }) => {
    try {
      if (!memberId || !groupId || !memberName) {
        throw new Error(
          "El ID del miembro, el ID del grupo y el nombre del miembro son obligatorios."
        );
      }

      if (!memberRoll) {
        throw new Error("El miembro debe tener un rol asignado.");
      }

      const docId = `${memberId}_${groupId}`; //reconsiderar cambiar en el futuro
      await db.collection("MiembroGrupo").doc(docId).set({
        memberId,
        groupId,
        memberName,
        memberRoll, // Ahora almacenamos el rol
        fecha: new Date().toISOString(),
      });

      return {
        message: "Relación creada con éxito.",
        id: docId,
        groupId,
        memberId,
        memberName,
        memberRoll,
      };
    } catch (error) {
      console.error("Error al añadir miembro al grupo:", error.message);
      if (error.message.includes("obligatorios")) {
        throw error;
      } else {
        throw new Error(
          "Error al crear la relación. Por favor, inténtalo más tarde."
        );
      }
    }
  },

  // Eliminar un Miembro de un Grupo
  removeMemberFromGroup: async (memberId, groupId) => {
    try {
      const querySnapshot = await db
        .collection("MiembroGrupo")
        .where("memberId", "==", memberId)
        .where("groupId", "==", groupId)
        .get();

      if (querySnapshot.empty) {
        return Promise.reject(
          new Error(
            `No se encontró la relación miembro-grupo para memberId: ${memberId} y groupId: ${groupId}`
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
        "Error al eliminar la relación miembro-grupo:",
        error.message
      );

      // ✅ Si el error viene de Firestore, mostramos el mensaje adecuado
      if (error.message.includes("No se encontró la relación miembro-grupo")) {
        throw error; // 🔹 Relanzamos el error esperado
      }

      throw new Error(
        "Error al eliminar la relación. Por favor, inténtalo más tarde."
      );
    }
  },
};

module.exports = memberGroupService;
