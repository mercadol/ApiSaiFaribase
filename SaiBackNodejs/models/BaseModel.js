// BaseModel.js
'use strict';

/**
 * Clase base para modelos de base de datos.
 * Centraliza operaciones comunes como CRUD, paginación y búsqueda.
 */
class BaseModel {
  /**
   * @param {string} collectionName - Nombre de la colección/tabla en la base de datos
   * @param {object} db - Instancia de conexión a la base de datos (Firestore, MySQL, etc.)
   */
  constructor(collectionName, db) {
    if (!collectionName || !db) {
      throw new Error('Parámetros incompletos: collectionName y db son requeridos');
    }
    this.collection = db.collection(collectionName); // Adaptar según el driver de BD
    this.db = db;
  }

  /**
   * Obtiene todos los documentos con paginación
   * @param {number} pageSize - Tamaño de la página (por defecto 10)
   * @param {string} startAfterId - ID del documento para paginación
   * @returns {Promise<Array>} - Lista de documentos
   */
  async getAll(pageSize = 10, startAfterId = null) {
    try {
      let query = this.collection.limit(pageSize);
      
      if (startAfterId) {
        const startDoc = await this.collection.doc(startAfterId).get();
        query = query.startAfter(startDoc);
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error(`Error al obtener registros: ${error.message}`);
    }
  }

  /**
   * Obtiene un documento por su ID
   * @param {string} id - ID del documento
   * @returns {Promise<object>} - Documento encontrado
   */
  async getById(id) {
    try {
      const doc = await this.collection.doc(id).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    } catch (error) {
      throw new Error(`Error al obtener documento ${id}: ${error.message}`);
    }
  }

  /**
   * Crea un nuevo documento
   * @param {object} data - Datos del documento
   * @returns {Promise<string>} - ID del documento creado
   */
  async create(data) {
    try {
      const docRef = await this.collection.add(data);
      return docRef.id;
    } catch (error) {
      throw new Error(`Error al crear documento: ${error.message}`);
    }
  }

  /**
   * Actualiza un documento existente
   * @param {string} id - ID del documento
   * @param {object} updatedData - Datos actualizados
   * @returns {Promise<object>} - Documento actualizado
   */
  async update(id, updatedData) {
    try {
      await this.collection.doc(id).update(updatedData);
      return this.getById(id); // Devuelve el documento actualizado
    } catch (error) {
      throw new Error(`Error al actualizar documento ${id}: ${error.message}`);
    }
  }

  /**
   * Elimina un documento
   * @param {string} id - ID del documento
   * @returns {Promise<boolean>} - Confirmación de eliminación
   */
  async delete(id) {
    try {
      await this.collection.doc(id).delete();
      return true;
    } catch (error) {
      throw new Error(`Error al eliminar documento ${id}: ${error.message}`);
    }
  }

  /**
   * Busca documentos por un campo específico
   * @param {string} field - Campo a buscar
   * @param {string} value - Valor del campo
   * @param {number} pageSize - Tamaño de la página
   * @returns {Promise<Array>} - Resultados de la búsqueda
   */
  async search(field, value, pageSize = 10) {
    try {
      const query = this.collection
        .where(field, '==', value)
        .limit(pageSize);

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error(`Error en búsqueda: ${error.message}`);
    }
  }
}

module.exports = BaseModel;
