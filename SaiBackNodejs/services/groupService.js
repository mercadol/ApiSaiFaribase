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

// Función para obtener un Grupo
  getGrupo: async (id) => {
    try {
      const doc = await db.collection('Group').doc(id).get(); // Obtener documento por ID

      if (!doc.exists) {
        throw new Error(`No se encontró ningún grupo con el ID: ${id}`);
      }

      return { id: doc.id, ...doc.data() }; // Retornar datos del grupo
    } catch (error) {
      console.error('Error al obtener grupo:', error.message);
      throw new Error('Error al obtener el grupo. Por favor, inténtalo más tarde.');
    }
  },

  //Funcion para crear un nuevo Grupo

  createGroup: async (groupData) => {
    try {
      const doc = await db.collection('Group').doc(groupData.groupId).get(); // Obtener documento por ID

      if (doc.exists) {
        throw new Error(`Ya existe un Grupo con el ID: ${groupId}`);
      }

      // Guardar el grupo en Firestore
      await db.collection('Group').doc(groupData.groupId).set(groupData);
      return groupData.id; // Retornar el ID del grupo creado
    } catch (error) {
      console.error('Error al crear grupo:', error.message);
      throw new Error('Error al guardar el grupo. Por favor, inténtalo más tarde.');
    }
  },

  // Función para eliminar un Grupo por ID
  deleteGroupById: async (groupId)=> {
    try {
      // Eliminar el documento del grupo por su ID
      await db.collection('groups').doc(groupId).delete();

      return true; // Indica que la eliminación fue exitosa
    } catch (error) {
      console.error('Error al eliminar el grupo:', error);
      throw new Error('Error al guardar Eliminar. Por favor, inténtalo más tarde.');
    }
  },

  updateGroupById: async (groupId, updatedData) => {
    try {
      // Actualizar el documento en Firestore
      const groupRef = db.collection('groups').doc(groupId);
      await groupRef.update(updatedData);

      // Obtener el grupo actualizado (opcional)
      const updatedGroup = await groupRef.get();
      return updatedGroup.data();
    } catch (error) {
      console.error('Error al actualizar el grupo:', error);
      throw error;
    }
  },

  //metodo search
  searchGroups: async (searchString, startAfterDoc = null, pageSize = 10)=> {
    try {
      const groupsRef = db.collection('Group');
      let query = groupsRef;

      // Construir la consulta en función del término de búsqueda
      query = query.where('Name', '>=', searchString)
                  .where('Name', '<=', searchString + '\uf8ff'); // Búsqueda parcial insensible a mayúsculas y minúsculas

      // Paginación
      if (startAfterDoc) {
        query = query.startAfter(startAfterDoc);
      }
      query = query.limit(pageSize);

      const querySnapshot = await query.get();
      const groups = [];
      querySnapshot.forEach((doc) => {
        groups.push({ id: doc.id, ...doc.data() });
      });

      const lastDoc = groupsSnapshot.docs[groupsSnapshot.docs.length - 1];
      return { groups, lastDoc };
    } catch (error) {
      console.error('Error al buscar grupos:', error);
      throw new Error('Ocurrió un error al intentar buscar grupos. Por favor, inténtalo más tarde.');
    }
  },
};


module.exports = groupService;
