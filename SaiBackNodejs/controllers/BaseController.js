// controllers/BaseController.js
"use strict";

const ApiError = require("../utils/ApiError");
const validator = require("validator");

/**
 * Clase BaseController que define operaciones CRUD básicas para las entidades.
 * Se espera que los controladores hijos sobrescriban los métodos de validación y preparación de datos.
 */
class BaseController {
  /**
   * Constructor de la clase BaseController.
   * @param {Object} config - Configuración necesaria para el controlador.
   * @param {Object} config.service - Servicio para la entidad.
   * @param {string} config.entityName - Nombre de la entidad (singular).
   * @param {string} config.entityPlural - Nombre de la entidad (plural).
   */
  constructor(config) {
    if (!config.service) {
      throw new Error("Service is required in BaseController");
    }
    this.service = config.service;
    this.entityName = config.entityName;
    this.entityPlural = config.entityPlural;
    this.validator = validator;

    // Bind de los métodos para mantener el contexto correcto de 'this'
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.search = this.search.bind(this);
  }

  /**
   * Obtiene un listado de documentos con paginación.
   * @param {Object} req - Objeto de solicitud de Express.
   * @param {Object} res - Objeto de respuesta de Express.
   * @param {Function} next - Función next para pasar errores.
   */
  async getAll(req, res, next) {
      const pageSize = parseInt(req.query.pageSize) || 10;
      const startAfterId = req.query.startAfter || null;
      const result = await this.service.getAll(startAfterId, pageSize);
      res.status(200).json(result);
  }

  /**
   * Obtiene un documento por su ID.
   * @param {Object} req - Objeto de solicitud de Express.
   * @param {Object} res - Objeto de respuesta de Express.
   */
  async getById(req, res) {
    const { id } = req.params;
    const result = await this.service.getById(id);
    if (!result) {
      throw new ApiError(404, `${this.entityName} no encontrado`); // Not Found
    }
    res.status(200).json(result);
  }

  /**
   * Crea un nuevo documento.
   * Valida y prepara los datos antes de crear la entidad.
   * @param {Object} req - Objeto de solicitud de Express.
   * @param {Object} res - Objeto de respuesta de Express.
   */
  async create(req, res) {
    const data = this.prepareCreateData(req.body);

    // Validaciones específicas antes de crear la entidad
    const validationError = this.validateCreateData(data);
    if (validationError) {
      throw new ApiError(400, validationError); // Bad Request
    }

    const result = await this.service.create(data);
    res.status(201).json(result); // Created
  }

  /**
   * Actualiza un documento existente.
   * Valida los datos antes de proceder con la actualización.
   * @param {Object} req - Objeto de solicitud de Express.
   * @param {Object} res - Objeto de respuesta de Express.
   */
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

  /**
   * Elimina un documento según su ID.
   * @param {Object} req - Objeto de solicitud de Express.
   * @param {Object} res - Objeto de respuesta de Express.
   */
  async delete(req, res) {
    const { id } = req.params;
    const result = await this.service.delete(id);
    if (!result) {
      throw new ApiError(404, `${this.entityName} no encontrado`); // Not Found
    }
    res.status(200).json({ message: `${this.entityName} eliminado correctamente` });
  }

  /**
   * Realiza una búsqueda de documentos basándose en un parámetro de búsqueda.
   * @param {Object} req - Objeto de solicitud de Express.
   * @param {Object} res - Objeto de respuesta de Express.
   */
  async search(req, res) {
    const { searchString } = req.query;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const startAfterId = req.query.startAfter || null;

    // Validar parámetros de búsqueda
    if (!searchString || typeof searchString !== "string") {
      throw new ApiError(400, "El parámetro de búsqueda es requerido");
    }

    // Llamamos al servicio de búsqueda
    const result = await this.service.search(searchString, startAfterId, pageSize);
    res.status(200).json(result);
  }

  /**
   * Método para validar los datos de creación.
   * Este método debe ser sobrescrito en los controladores hijos.
   * @param {Object} data - Datos a validar.
   * @throws {Error} Si no es implementado.
   */
  validateCreateData(/* data */) {
    throw new Error("Método validateCreateData no implementado");
  }

  /**
   * Método para preparar los datos de creación.
   * Este método debe ser sobrescrito en los controladores hijos.
   * @param {Object} data - Datos a preparar.
   * @throws {Error} Si no es implementado.
   */
  prepareCreateData(/* data */) {
    throw new Error("Método prepareCreateData no implementado");
  }

  /**
   * Método para validar los datos de actualización.
   * Por defecto, no se realiza ninguna validación.
   * @param {Object} data - Datos a validar.
   * @returns {null|string} Null si no hay errores, o un mensaje de error.
   */
  validateUpdateData(/* data */) {
    // Implementación básica por defecto
    return null;
  }
}

module.exports = BaseController;
