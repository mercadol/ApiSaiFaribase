'use strict';

const db = require('../firebase').db; // Importar la conexión a Firestore

const memberService = {
  // Función para obtener todos los miembros
  
  getMiembros: async (startAfterDoc = null, pageSize = 10) => {
    try {
      let query = db.collection('Member').orderBy('Name').limit(pageSize); // Ordenar por nombre y limitar el tamaño de la página
      
      if (startAfterDoc) {
        query = query.startAfter(startAfterDoc); // Si se proporciona un documento de inicio, utilizarlo para la paginación
        console.log("Aplicando startAfter con el documento:", startAfterDoc.id);
      }

      const membersSnapshot = await query.get();
      console.log("Documentos en la consulta:", membersSnapshot.docs.map(doc => doc.id));
      console.log("snapshot obtenido:", membersSnapshot.size);  // Muestra la cantidad de documentos obtenidos

      const members = [];
      membersSnapshot.forEach((doc) => {
        members.push({ id: doc.id, ...doc.data() });
      });
      console.log("Miembros después de la consulta:", members);  // Verifica los miembros que se están agregando al array


      // Obtener el último documento de la página actual
      const lastDoc = membersSnapshot.docs[membersSnapshot.docs.length - 1];
      console.log("Último documento:", lastDoc ? lastDoc.id : null);  // Verifica si el último documento existe y es válido


      return { members, lastDoc }; // Devolver los miembros y el último documento para la paginación
      
    } catch (error) {
      console.error('Error al obtener miembros:', error);
      throw new Error('Ocurrió un error al intentar obtener la lista de miembros. Por favor, inténtalo más tarde.');
    }
  },

  // Función para obtener un Miembro
  /**
   * Obtiene un miembro específico por su ID.
   * @param {string} id - ID del miembro a buscar.
   * @returns {Promise<Object>} - Un objeto con los datos del miembro.
   * @throws {Error} - Si no se encuentra el miembro o ocurre un error.
   */
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
  /**
   * Crea un nuevo miembro en la base de datos.
   * @param {Object} memberData - Datos del miembro proporcionados por el cliente.
   * @returns {Promise<string>} - El ID del miembro creado.
   * @throws {Error} - Si ocurre un problema al guardar el miembro.
   */
  createMember: async (memberData) => {
    try {
      // Guardar el miembro en Firestore
      await db.collection('Member').doc(memberData.id).set(memberData);
      return memberData.id; // Retornar el ID del miembro creado
    } catch (error) {
      console.error('Error al crear miembro:', error.message);
      throw new Error('Error al guardar el miembro. Por favor, inténtalo más tarde.');
    }
  },

  // Función para eliminar un Miembro por ID
  /**
   * Obtiene un miembro específico por su ID.
   * @param {string} id - ID del miembro a eliminar.
   * @throws {Error} - Si no se encuentra el miembro o ocurre un error.
   */
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

  // Puedes agregar más funciones para otras operaciones con 'Member' aquí
};

module.exports = memberService;
