"use strict";

const db = require("../firebase").db;

class BaseOperationsService {
  constructor(collectionName) {
    if (!collectionName) {
      throw new Error("Error: El nombre de la colección no se pasó correctamente.");
    }
    this.collection = db.collection(collectionName);
    
  }

  async getAll(startAfterDoc = null, pageSize = 10, orderByField = "name") {
    try {
      let query = this.collection.orderBy(orderByField).limit(pageSize);
      if (startAfterDoc) query = query.startAfter(startAfterDoc);

      const snapshot = await query.get();

      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      
      return { items, lastDoc: snapshot.docs[snapshot.docs.length - 1] };
    } catch (error) {
      console.error(`Error getting documents from ${this.collection.id}:`, error);
      throw new Error("Error retrieving data. Please try again later.");
    }
  }

  async getById(id) {
    try {
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) throw new Error(`Document with ID ${id} not found`);
      return { id: doc.id, ...doc };
    } catch (error) {
      console.error(`Error getting document ${id} from ${this.collection.id}:`, error);
      if (error.message.includes("not found")) throw error;
      if (error.message.includes("Firestore"))
        throw new Error("Error retrieving document. Please try again later.");

      // Para otros errores, relanzar el error original
      throw error;
    }
  }

  async create( data) {
    try {
      const docRef = await this.collection.add(data); // Usa add()
      return docRef.id; // Devuelve el ID generado por Firestore
    } catch (error) {
      console.error(`Error creating document in ${this.collection.id}:`, error);
      if (error.message.includes("already exists")) throw error;
      if (error.message.includes("Firestore"))
        throw new Error("Error retrieving document. Please try again later.");

      // Para otros errores, relanzar el error original
      throw error;
    }
  }

  async update(id, updatedData) {
    try {     
      await this.collection.doc(id).update(updatedData);
      return await this.getById(id);
    } catch (error) {
      console.error(`Error updating document ${id} in ${this.collection.id}:`, error);
      throw new Error("Error updating document. Please try again later.");
    }
  }

  async delete(id) {
    try {
      await this.collection.doc(id).delete();
      return true;
    } catch (error) {
      console.error(`Error deleting document ${id} in ${this.collection.id}:`, error);

      if (error.message.includes("Firestore"))
        throw new Error("Error deleting document. Please try again later.");

      // Para otros errores, relanzar el error original
      throw error;
    }
  }
}

module.exports = BaseOperationsService;
