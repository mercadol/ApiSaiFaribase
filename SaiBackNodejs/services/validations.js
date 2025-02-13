"use strict";

const db = require("../firebase").db;

class Validations {
  /**
   * Valida si un documento existe en una colección.
   * @param {string} collectionName - Nombre de la colección.
   * @param {string} docId - ID del documento a validar.
   * @param {object} [transaction] - Transacción de Firestore (opcional).
   * @returns {Promise<boolean>} - True si el documento existe, false en caso contrario.
   */
  async documentExists(collectionName, docId, transaction = null) {
    try {
      const docRef = db.collection(collectionName).doc(docId);
      const doc = transaction ? await transaction.get(docRef) : await docRef.get();
      return doc.exists;
    } catch (error) {
      console.error(`Error validando existencia del documento ${docId} en ${collectionName}:`, error);
      throw new Error("Error al validar la existencia del documento.");
    }
  }

  /**
   * Valida si un miembro existe.
   * @param {string} memberId - ID del miembro.
   * @param {object} [transaction] - Transacción de Firestore (opcional).
   * @returns {Promise<boolean>} - True si el miembro existe, false en caso contrario.
   */
  async validateMemberExists(memberId, transaction = null) {
    return this.documentExists("Member", memberId, transaction);
  }

  /**
   * Valida si un curso existe.
   * @param {string} courseId - ID del curso.
   * @param {object} [transaction] - Transacción de Firestore (opcional).
   * @returns {Promise<boolean>} - True si el curso existe, false en caso contrario.
   */
  async validateCourseExists(courseId, transaction = null) {
    return this.documentExists("Course", courseId, transaction);
  }

  /**
   * Valida si un evento existe.
   * @param {string} eventId - ID del evento.
   * @param {object} [transaction] - Transacción de Firestore (opcional).
   * @returns {Promise<boolean>} - True si el evento existe, false en caso contrario.
   */
  async validateEventExists(eventId, transaction = null) {
    return this.documentExists("Event", eventId, transaction);
  }

  /**
   * Valida si una fecha de evento es válida.
   * @param {string} date - Fecha del evento.
   * @returns {boolean} - True si la fecha es válida, false en caso contrario.
   */
  validateEventDate(date) {
    if (!date) {
      throw new Error("La fecha del evento es requerida.");
    }
    // Aquí puedes añadir más validaciones específicas de fecha.
    return true;
  }

  /**
   * Valida si un campo es único en una colección.
   * @param {string} collectionName - Nombre de la colección.
   * @param {string} field - Campo a validar.
   * @param {string} value - Valor del campo.
   * @returns {Promise<boolean>} - True si el valor es único, false en caso contrario.
   */
  async isFieldUnique(collectionName, field, value) {
    try {
      const query = db.collection(collectionName).where(field, "==", value);
      const snapshot = await query.get();
      return snapshot.empty; // Si está vacío, el valor es único.
    } catch (error) {
      console.error(`Error validando unicidad del campo ${field} en ${collectionName}:`, error);
      throw new Error("Error al validar la unicidad del campo.");
    }
  }
}

module.exports = new Validations();
