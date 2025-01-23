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
  // Puedes agregar más funciones para otras operaciones con 'Member' aquí
};

module.exports = memberService;
