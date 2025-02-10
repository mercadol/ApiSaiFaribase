
// BaseController.js
'use strict';

const db = require('../firebase').db;
const validator = require('validator');

class BaseController {
  constructor(config) {
    this.service = config.service;
    this.entityName = config.entityName;
    this.entityPlural = config.entityPlural;
    this.validator = validator;
    
    // Bindear métodos para mantener el contexto
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.search = this.search.bind(this);
  }

  async getAll(req, res) {
    try {
      const pageSize = parseInt(req.query.pageSize) || 10;
      const startAfterId = req.query.startAfter;
      let startAfterDoc = null;

      if (startAfterId) {
        const collectionName = this.service.collection.id;
        const docRef = db.collection(collectionName).doc(startAfterId);
        startAfterDoc = await docRef.get();
        if (!startAfterDoc.exists) startAfterDoc = null;
      }

      const { items, lastDoc } = await this.service.getAll(startAfterDoc, pageSize);
      const nextStartAfter = lastDoc ? lastDoc.id : null;

      res.json({
        [this.entityPlural]: items,
        nextStartAfter
      });
    } catch (error) {
      console.error(`Error al obtener ${this.entityPlural}:`, error);
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const result = await this.service.getById(id);
      res.status(200).json(result);
    } catch (error) {
      console.error(`Error al obtener ${this.entityName}:`, error);
      res.status(error.message.includes('No se encontró') ? 404 : 500).json({ error: error.message });
    }
  }

  async create(req, res) {
    try {
      let data = req.body;      

      // Validaciones específicas
      const validationError = this.validateCreateData(data);
      if (validationError) return res.status(400).json({ error: validationError });

      // Preparar datos específicos
      data = this.prepareCreateData(data);
      
      // Crear en el servicio
      const result = await this.service.create( data);
      
      res.status(201).json(result);
    } catch (error) {
      console.error(`Error al crear ${this.entityName}:`, error);
      res.status(error.message.includes('ya existe') ? 409 : 500).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const updatedData = req.body;
      
      const validationError = this.validateUpdateData(updatedData);
      if (validationError) return res.status(400).json({ error: validationError });

      const result = await this.service.update(id, updatedData);
      res.status(200).json(result);
    } catch (error) {
      console.error(`Error al actualizar ${this.entityName}:`, error);
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await this.service.delete(id);
      res.status(200).json({ message: `${this.entityName} eliminado correctamente` });
    } catch (error) {
      console.error(`Error al eliminar ${this.entityName}:`, error);
      res.status(500).json({ error: error.message });
    }
  }

  async search(req, res) {
      try {
        const { searchString, pageSize = 10, startAfter } = req.query;
        
  
        // Validar parámetros de búsqueda
        if (!searchString || typeof searchString !== 'string') {
          return res.status(400).json({ error: 'El parámetro de búsqueda es requerido y debe ser una cadena de texto' });
        }
  
        if (isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
          return res.status(400).json({ error: 'El tamaño de página debe ser un número entre 1 y 100' });
        }
  
        // Obtener el documento de inicio para la paginación
        let startAfterDoc = null;
        if (startAfter) {
          const docRef = this.service.collection.doc(startAfter);
          startAfterDoc = await docRef.get();
          if (!startAfterDoc.exists) startAfterDoc = null;
        }
  
        // Realizar la búsqueda
        const { results, lastDoc } = await this.service.search(
          searchString,
          startAfterDoc,
          parseInt(pageSize)
        );
  
        // Preparar respuesta
        const response = {
          results,
          nextStartAfter: lastDoc ? lastDoc.id : null
        };
  
        res.status(200).json(response);
      } catch (error) {
        console.error('Error al buscar elementos:', error);
        res.status(500).json({ error: 'Error al buscar elementos. Inténtelo más tarde.' });
      }
    }

  // Métodos para sobrescribir en los controladores hijos
  validateCreateData(/* data */) {
    throw new Error('Método validateCreateData no implementado');
  }

  prepareCreateData(/* data */) {
    throw new Error('Método prepareCreateData no implementado');
  }

  validateUpdateData(/* data */) {
    // Implementación básica por defecto
    return null;
  }
}

module.exports = BaseController;
