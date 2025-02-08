"use strict";

const db = require("../firebase").db;

class RelationOperationsService {
  constructor(collectionName) {
    if (!collectionName) {
      throw new Error("Error: Collection name is required.");
    }
    this.collection = db.collection(collectionName);
  }

  async getRelatedDocuments(toId, relatedCollection, toField, fromField) {
    try {
      const querySnapshot = await this.collection
        .where(toField, "==", toId)
        .get();

      if (querySnapshot.empty) return [];

      const relatedIds = querySnapshot.docs.map((doc) => doc.data()[fromField]);
      return this.getDocumentsFromIds(relatedCollection, relatedIds);
    } catch (error) {
      console.error("Error getting related documents:", error);
      throw new Error("Error retrieving related data. Please try again later.");
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
}

module.exports = RelationOperationsService;
