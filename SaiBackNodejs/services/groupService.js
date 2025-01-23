'use strict';

const db = require('../firebase').db; // Importar la conexión a Firestore

const groupService = {
  // Función para obtener todos los grupos
  getGrupos: async (startAfterDoc = null, pageSize = 10) => {
    try {
      let query = db.collection('Group').orderBy('Nombre').limit(pageSize); // Ordenar por nombre y limitar el tamaño de la página
      
      if (startAfterDoc) {
        query = query.startAfter(startAfterDoc); // Si se proporciona un documento de inicio, utilizarlo para la paginación
      }

      const groupsSnapshot = await query.get();

      const groups = [];
      groupsSnapshot.forEach((doc) => {
        groups.push({ id: doc.id, ...doc.data() });
      });

      // Obtener el último documento de la página actual
      const lastDoc = groupsSnapshot.docs[groupsSnapshot.docs.length - 1];

      return { groups, lastDoc }; // Devolver los grupos y el último documento para la paginación
      
    } catch (error) {
      console.error('Error al obtener grupos:', error);
      throw new Error('Ocurrió un error al intentar obtener la lista de grupos. Por favor, inténtalo más tarde.');
    }
  },
  // Puedes agregar más funciones para otras operaciones con 'Group' aquí
};

module.exports = groupService;
