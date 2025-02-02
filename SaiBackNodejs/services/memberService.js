'use strict';

const db = require('../firebase').db; // Importar la conexión a Firestore

const memberService = {
  // Función para obtener todos los miembros
  getMiembros: async (startAfterDoc = null, pageSize = 10) => {
    try {
      let query = db.collection('Member').orderBy('Name').limit(pageSize); // Ordenar por nombre y limitar el tamaño de la página
      
      if (startAfterDoc) {
        query = query.startAfter(startAfterDoc); // Si se proporciona un documento de inicio, utilizarlo para la paginación
      }

      const membersSnapshot = await query.get();
      
      const members = [];
      membersSnapshot.forEach((doc) => {
        members.push({ id: doc.id, ...doc.data() });
      });

      // Obtener el último documento de la página actual
      const lastDoc = membersSnapshot.docs[membersSnapshot.docs.length - 1];

      return { members, lastDoc }; // Devolver los miembros y el último documento para la paginación
      
    } catch (error) {
      console.error('Error al obtener miembros:', error);
      throw new Error('Ocurrió un error al intentar obtener la lista de miembros. Por favor, inténtalo más tarde.');
    }
  },

  // Función para obtener un Miembro
  getMiembro: async (id) => {
    try {
      const doc = await db.collection('Member').doc(id).get(); // Obtener documento por ID

      if (!doc.exists) {
        throw new Error(`No se encontró ningún miembro con el ID: ${id}`);
      }

      return { id: doc.id, ...doc.data() }; // Retornar datos del miembro
    } catch (error) {
      console.error('Error al obtener miembro:', error.message);
      throw new Error('Error al obtener el miembro. Por favor, inténtalo más tarde.');
    }
  },

  //Funcion para crear un nuevo Miembro
  createMember: async (memberData) => {
    try {
      const doc = await db.collection('Member').doc(memberData.memberId).get(); // Obtener documento por ID

      if (doc.exists) {
        throw new Error(`Ya existe un miembro con el ID: ${memberData.memberId}`);
      }

      // Guardar el miembro en Firestore
      await db.collection('Member').doc(memberData.memberId).set(memberData); 
      return memberData.memberId;
    } catch (error) {
      console.error("Error en createMember:", error);

      // Si el error es específico (miembro ya existe), relanzarlo
      if (error.message.includes("Ya existe un miembro")) {
        throw error;
      }

      // Si es un error de Firestore
      if (error.message.includes("Firestore")) {
        throw new Error("Error al guardar el miembro. Por favor, inténtalo más tarde.");
      }

      // Para otros errores, relanzar el error original
      throw error;
    }
  },

  // Función para eliminar un Miembro por ID
  deleteMemberById: async (memberId)=> {
    try {
      // Eliminar el documento del miembro por su ID
      await db.collection('members').doc(memberId).delete();

      return true; // Indica que la eliminación fue exitosa
    } catch (error) {
      console.error('Error al eliminar el miembro:', error);
      throw new Error('Error al guardar Eliminar. Por favor, inténtalo más tarde.');
    }
  },

  updateMemberById: async (memberId, updatedData) => {
    try {
      // Actualizar el documento en Firestore
      const memberRef = db.collection('members').doc(memberId);
      await memberRef.update(updatedData);
  
      // Obtener el miembro actualizado (opcional)
      const updatedMember = await memberRef.get();
      return updatedMember.data();
    } catch (error) {
      console.error('Error al actualizar el miembro:', error);
      throw error;
    }
  },
  
  //metodo search
  searchMembers: async (searchString, startAfterDoc = null, pageSize = 10)=> {
    try {
      const membersRef = db.collection('Member');
      let query = membersRef;
  
      // Construir la consulta en función del término de búsqueda
      query = query.where('Name', '>=', searchString)
                   .where('Name', '<=', searchString + '\uf8ff'); // Búsqueda parcial insensible a mayúsculas y minúsculas
  
      // Paginación
      if (startAfterDoc) {
        query = query.startAfter(startAfterDoc);
      }
      query = query.limit(pageSize);
  
      const querySnapshot = await query.get();
      const members = [];
      querySnapshot.forEach((doc) => {
        members.push({ id: doc.id, ...doc.data() });
      });
  
      const lastDoc = membersSnapshot.docs[membersSnapshot.docs.length - 1];
      return { members, lastDoc };
    } catch (error) {
      console.error('Error al buscar miembros:', error);
      throw new Error('Ocurrió un error al intentar buscar miembros. Por favor, inténtalo más tarde.');
    }
  },
};

module.exports = memberService;
