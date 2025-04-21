// controllers/BaseController.js
const ApiError = require("../utils/ApiError");

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
    res.status(200).json(result);
  }

  /**
   * Crea un nuevo documento.
   * Valida y prepara los datos antes de crear la entidad.
   * @param {Object} req - Objeto de solicitud de Express.
   * @param {Object} res - Objeto de respuesta de Express.
   */
  async create(req, res) {
    const data = req.body;
    const result = await this.service.create(data);
    res.status(201).json(result);
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
    await this.service.delete(id);
    res.status(204).send();
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

    // Llamamos al servicio de búsqueda
    const result = await this.service.search(
      searchString,
      startAfterId,
      pageSize
    );
    res.status(200).json(result);
  }
}

module.exports = BaseController;
