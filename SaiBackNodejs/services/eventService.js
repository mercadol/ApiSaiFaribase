"use strict";

const db = require("../firebase").db; // Importar la conexión a Firestore

const eventService = {
    // Función para obtener todos los eventos
    getEventos: async (startAfterDoc = null, pageSize = 10) => {
      try {
        let query = db.collection("Event").orderBy("Nombre").limit(pageSize); // Ordenar por nombre y limitar el tamaño de la página
  
        if (startAfterDoc) {
          query = query.startAfter(startAfterDoc); // Si se proporciona un documento de inicio, utilizarlo para la paginación
        }
  
        const eventsSnapshot = await query.get();
  
        const events = [];
        eventsSnapshot.forEach((doc) => {
          events.push({ id: doc.id, ...doc.data() });
        });
  
        // Obtener el último documento de la página actual
        const lastDoc = eventsSnapshot.docs[eventsSnapshot.docs.length - 1];
  
        return { events, lastDoc }; // Devolver los eventos y el último documento para la paginación
      } catch (error) {
        console.error("Error al obtener eventos:", error);
        throw new Error(
          "Ocurrió un error al intentar obtener la lista de eventos. Por favor, inténtalo más tarde."
        );
      }
    },
  
    getEvento: async (id) => {
      try {
        const doc = await db.collection("Event").doc(id).get(); // Obtener documento por ID
  
        if (!doc.exists) {
          throw new Error(`No se encontró ningún evento con el ID: ${id}`);
        }
  
        return { id: doc.id, ...doc.data() }; // Retornar datos del evento
      } catch (error) {
        console.error("Error al obtener evento:", error.message);
        throw new Error(
          "Error al obtener el evento. Por favor, inténtalo más tarde."
        );
      }
    },
  
    //Funcion para crear un nuevo Evento
  
    createEvent: async (eventData) => {
      try {
        // Validar que eventData tenga un id
        if (!eventData.id) {
          throw new Error("El ID del evento es obligatorio.");
        }
  
        // Verificar si el evento ya existe
        const doc = await db.collection("Event").doc(eventData.id).get();
  
        if (doc.exists) {
          throw new Error(`Ya existe un evento con el ID: ${eventData.id}`);
        }
  
        // Guardar el evento en Firestore
        await db.collection("Event").doc(eventData.id).set(eventData);
        return eventData.id; // Retornar el ID del evento creado
      } catch (error) {
        console.error("Error al crear evento:", error);
        // Si el error es específico (evento ya existe), relanzarlo
        if (error.message.includes("Ya existe un evento")) {
          throw error;
        }
  
        // Si es un error de Firestore
        if (error.message.includes("Firestore")) {
          throw new Error(
            "Error al guardar el evento. Por favor, inténtalo más tarde."
          );
        }
  
        // Para otros errores, relanzar el error original
        throw error;
      }
    },
  
    deleteEventById: async (id) => {
      try {
        // Validar que id no sea nulo, vacío o indefinido
        if (!id) {
          throw new Error("El ID del evento es obligatorio.");
        }
    
        // Verificar si el evento existe antes de eliminarlo
        const eventRef = db.collection("Event").doc(id);
        const doc = await eventRef.get();
    
        if (!doc.exists) {
          throw new Error(`No existe un evento con el ID: ${id}`);
        }
    
        // Eliminar el documento del evento por su ID
        await eventRef.delete();
    
        return true; // Indica que la eliminación fue exitosa
      } catch (error) {
        console.error("Error al eliminar el evento:", error);
    
        // Si el error es específico (evento no existe), relanzarlo
        if (error.message.includes("No existe un evento")) {
          throw error;
        }
    
        // Si es un error de Firestore, lanzar un mensaje personalizado
        if (error.message.includes("Firestore")) {
          throw new Error("Error al eliminar el evento. Por favor, inténtalo más tarde.");
        }
    
        // Para otros errores, relanzar el error original
        throw error;
      }
    },
  
    updateEventById: async (id, updatedData) => {
      try {
        // Validar que id no sea nulo, vacío o indefinido
        if (!id) {
          throw new Error("El ID del evento es obligatorio.");
        }
    
        // Validar que updatedData no esté vacío
        if (!updatedData || Object.keys(updatedData).length === 0) {
          throw new Error("Los datos de actualización son obligatorios.");
        }
    
        // Verificar si el evento existe antes de actualizarlo
        const eventRef = db.collection("events").doc(id);
        const doc = await eventRef.get();
    
        if (!doc.exists) {
          throw new Error(`No existe un evento con el ID: ${id}`);
        }
    
        // Actualizar el documento en Firestore
        await eventRef.update(updatedData);
    
        // Obtener el evento actualizado (opcional)
        const updatedEvent = await eventRef.get();
        return updatedEvent.data();
      } catch (error) {
        console.error("Error al actualizar el evento:", error);
    
        // Si el error es específico (evento no existe), relanzarlo
        if (error.message.includes("No existe un evento")) {
          throw error;
        }
    
        // Si es un error de Firestore, lanzar un mensaje personalizado
        if (error.code && error.code.startsWith("firestore/")) {
          throw new Error("Error al actualizar el evento. Por favor, inténtalo más tarde.");
        }
    
        // Para otros errores, relanzar el error original
        throw error;
      }
    },
  
    //metodo search
    searchEvents: async (searchString, startAfterDoc = null, pageSize = 10) => {
      try {
        const eventsRef = db.collection("Event");
        let query = eventsRef;
  
        // Construir la consulta en función del término de búsqueda
        query = query
          .where("Name", ">=", searchString)
          .where("Name", "<=", searchString + "\uf8ff"); // Búsqueda parcial insensible a mayúsculas y minúsculas
  
        // Paginación
        if (startAfterDoc) {
          query = query.startAfter(startAfterDoc);
        }
        query = query.limit(pageSize);
  
        const querySnapshot = await query.get();
        const events = [];
        querySnapshot.forEach((doc) => {
          events.push({ id: doc.id, ...doc.data() });
        });
  
        const lastDoc = eventsSnapshot.docs[eventsSnapshot.docs.length - 1];
        return { events, lastDoc };
      } catch (error) {
        console.error("Error al buscar eventos:", error);
        throw new Error(
          "Ocurrió un error al intentar buscar eventos. Por favor, inténtalo más tarde."
        );
      }
    },
};

module.exports = eventService;
