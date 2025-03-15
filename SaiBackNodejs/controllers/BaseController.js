// controllers/BaseController.js
"use strict";

const ApiError = require("../utils/ApiError");
const validator = require("validator");

class BaseController {
  constructor(config) {
    if (!config.service) {
      throw new Error("Service is required in BaseController");
  }
    this.service = config.service;
    this.entityName = config.entityName;
    this.entityPlural = config.entityPlural;
    this.validator = validator;

    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.search = this.search.bind(this);
  }

  async getAll(req, res, next) {
    
      const pageSize = parseInt(req.query.pageSize) || 10;
      const startAfterId = req.query.startAfter || null;
      const result = await this.service.getAll(startAfterId, pageSize);
      res.status(200).json(result);
    
  }

  async getById(req, res) {
    const { id } = req.params;
    const result = await this.service.getById(id);
    if (!result) {
      throw new ApiError(404, `${this.entityName} no encontrado`); // Not Found
    }
    res.status(200).json(result);
  }

  async create(req, res) {
    const data = this.prepareCreateData(req.body);

    // Validaciones específicas antes de crear
    const validationError = this.validateCreateData(data);
    if (validationError) {
      throw new ApiError(400, validationError); // Bad Request
    }

    const result = await this.service.create(data);
    res.status(201).json(result); // Created
  }

  async update(req, res) {
    const { id } = req.params;
    const updatedData = req.body;

    // Validación de datos antes de actualizar
    const validationError = this.validateUpdateData(updatedData);
    if (validationError) {
      throw new ApiError(400, validationError); // Bad Request
    }
    const result = await this.service.update(id, updatedData);
    res.status(200).json(result);
  }

  async delete(req, res) {
    const { id } = req.params;
    const result = await this.service.delete(id);
    if (!result) {
      throw new ApiError(404, `${this.entityName} no encontrado`); // Not Found
    }

    res
      .status(200)
      .json({ message: `${this.entityName} eliminado correctamente` });
  }

  async search(req, res) {
    const { searchString } = req.query;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const startAfterId = req.query.startAfter || null;

    // Validar parámetros de búsqueda
    if (!searchString || typeof searchString !== "string") {
      throw new ApiError(400, "El parámetro de búsqueda es requerido");
    }

    // Llamamos al servicio de búsqueda
    const result = await this.service.search(
      searchString,
      startAfterId,
      pageSize
    );

    res.status(200).json(result);
  }

  // Métodos para sobrescribir en los controladores hijos
  validateCreateData(/* data */) {
    throw new Error("Método validateCreateData no implementado");
  }

  prepareCreateData(/* data */) {
    throw new Error("Método prepareCreateData no implementado");
  }

  validateUpdateData(/* data */) {
    // Implementación básica por defecto
    return null;
  }
}

module.exports = BaseController;
