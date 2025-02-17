"use strict";

const { db } = require("../firebase");
const ApiError = require('../utils/ApiError');

class RelationOperationsService {
  constructor(collectionName) {
    if (!collectionName) throw new ApiError(400, "INVALID_COLLECTION");
    this.collection = db.collection(collectionName);
  }

  async validateExists(id, transaction = null) {
    const docRef = this.collection.doc(id);
    const doc = transaction ? 
      await transaction.get(docRef) : 
      await docRef.get();
    
    if (!doc.exists) {
      throw new ApiError(404, `Document ${id} not found in ${this.collection.id}`);
    }
    return doc;
  }

  async addRelation(fromId, toId, data = {}) {
    if (!fromId || !toId) {
      throw new ApiError(400, "Both fromId and toId are required.");
    }

    try {
      const docId = `${fromId}_${toId}`;
      await this.collection.doc(docId).set({
        fromId,
        toId,
        ...data,
      });
      return { id: docId, fromId, toId, ...data };
    } catch (error) {
      throw new ApiError(500, "Error creating relation. Please try again later.");
    }
  }

  async removeRelation(fromId, toId) {
    const docId = `${fromId}_${toId}`;
    const doc = await this.collection.doc(docId).get();
    
    if (!doc.exists) {
      throw new ApiError(404, `Relation not found for fromId: ${fromId} and toId: ${toId}`);
    }

    try {
      await this.collection.doc(docId).delete();
      return true;
    } catch (error) {
      throw new ApiError(500, "Error removing relation. Please try again later.");
    }
  }

  _handleError(error) {
    if (error instanceof ApiError) return error;
    
    const statusCodes = {
      'NOT_FOUND': 404,
      'ALREADY_EXISTS': 409,
      'VALIDATION_ERROR': 400
    };

    return new ApiError(
      statusCodes[error.type] || 500,
      error.message || 'Error en la operación de relación'
    );
  }
}

module.exports = RelationOperationsService;
