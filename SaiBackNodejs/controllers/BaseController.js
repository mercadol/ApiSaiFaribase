
// BaseController.js
'use strict';

const db = require('../firebase').db;
const validator = require('validator');

class BaseController {
  constructor(config) {
    this.service = config.service;
    this.entityName = config.entityName;
    this.entityPlural = config.entityPlural;
    this.idGenerator = config.idGenerator;
    this.validator = validator;
    
    // Bindear métodos para mantener el contexto
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
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
      const generatedId = this.idGenerator();
      const data = req.body;

      // Validaciones específicas
      const validationError = this.validateCreateData(data);
      if (validationError) return res.status(400).json({ error: validationError });

      // Preparar datos específicos
      const entityData = this.prepareCreateData(data, generatedId);

      // Crear en el servicio
      const result = await this.service.create(generatedId, entityData);
      
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

  // Métodos para sobrescribir en los controladores hijos
  validateCreateData(/* data */) {
    throw new Error('Método validateCreateData no implementado');
  }

  prepareCreateData(/* data, generatedId */) {
    throw new Error('Método prepareCreateData no implementado');
  }

  validateUpdateData(/* data */) {
    // Implementación básica por defecto
    return null;
  }
}

module.exports = BaseController;
