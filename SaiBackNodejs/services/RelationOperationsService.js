"use strict";

const db = require("../firebase").db;

class RelationOperationsService {
  constructor(collectionName) {
      if (!collectionName) throw new Error("INVALID_COLLECTION");
    this.collection = db.collection(collectionName);
  }

  // metodo para validaciones
  async validateExists(id, transaction = null) {
    const docRef = this.collection.doc(id);
    const doc = transaction ? 
      await transaction.get(docRef) : 
      await docRef.get();
    
    if (!doc.exists) {
      throw {
        type: 'NOT_FOUND',
        message: `Document ${id} not found in ${this.collection.id}`
      };
    }
    return doc;
  }

  //soporte de transacciones
  async executeTransaction(operations) {
    return db.runTransaction(async transaction => {
      for (const operation of operations) {
        await operation(transaction);
      }
    });
  }



  async getRelatedDocuments(toId, relatedCollection, toField, fromField) {
    try {
      const query = this.collection.where(toField, "==", toId);
      const { items } = await this._executeQuery(query);
      const relatedIds = items.map(doc => doc[fromField]);
      return this.getDocumentsFromIds(relatedCollection, relatedIds);
    } catch (error) {
      throw this._handleError(error);
    }
  }

  async getDocumentsFromIds(collectionName, ids) {
    if (!ids || ids.length === 0) return [];

    const relatedCollection = db.collection(collectionName);
    const promises = ids.map(async (id) => {
      const doc = await relatedCollection.doc(id).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    });
    
    return Promise.all(promises).then((results) => results.filter(Boolean));
  }

  async addRelation(fromId, toId, data = {}) {
    try {
      if (!fromId || !toId) {
        throw new Error("Both fromId and toId are required.");
      }
      const docId = `${fromId}_${toId}`;
      
      await this.collection.doc(docId).set({
        fromId,
        toId,
        ...data,
      });
      return { id: docId, fromId, toId, ...data };
    } catch (error) {
      console.error("Error creating relation:", error);
      throw new Error(
        error.message.includes("are required")
          ? error.message
          : "Error creating relation. Please try again later."
      );
    }
  }

  async removeRelation(fromId, toId) {
    try {
      const docId = `${fromId}_${toId}`;
      const doc = await this.collection.doc(docId).get();
      
      if (!doc.exists) {
        throw new Error(`Relation not found for fromId: ${fromId} and toId: ${toId}`);
      }

      await this.collection.doc(docId).delete();
      return true;
    } catch (error) {
      console.error("Error removing relation:", error);
      throw new Error(
        error.message.includes("not found")
          ? error.message
          : "Error removing relation. Please try again later."
      );
    }
  }

  _handleError(error) {
    // Similar al manejo de errores en BaseOperationsService
    const errorTypes = {
      'NOT_FOUND': true,
      'ALREADY_EXISTS': true,
      'VALIDATION_ERROR': true
    };

    return {
      type: errorTypes[error.type] ? error.type : 'DEFAULT',
      message: error.message || 'Error en la operación de relación'
    };
  }
}

module.exports = RelationOperationsService;
