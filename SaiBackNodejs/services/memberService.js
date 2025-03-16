// services/memberService.js
"use strict";

const MemberModel = require("../models/MemberModel");

/**
 * Servicio para la gestión de miembros.
 */
const memberService = {
  /**
   * Obtiene un listado de miembros con paginación.
   *
   * @param {string|null} startAfterId - ID para la paginación.
   * @param {number} pageSize - Tamaño de la página.
   * @returns {Promise<Array>} Array de miembros.
   */
  getAll: async (startAfterId = null, pageSize = 10) => {
    return MemberModel.findAll(startAfterId, pageSize);
  },

  /**
   * Obtiene un miembro por su ID.
   *
   * @param {string} id - Identificador del miembro.
   * @returns {Promise<Object>} Objeto del miembro encontrado.
   */
  getById: async (id) => {
    return MemberModel.findById(id);
  },

  /**
   * Crea un nuevo miembro.
   *
   * @param {Object} memberData - Datos del miembro a crear.
   * @returns {Promise<string>} ID del miembro creado.
   */
  create: async (memberData) => {
    const member = new MemberModel({
      Nombre: memberData.Nombre,
      Email: memberData.Email,
      EstadoCivil: memberData.EstadoCivil,
      TipoMiembro: memberData.TipoMiembro,
      Oficio: memberData.Oficio,
      FechaRegistro: memberData.FechaRegistro || new Date()
    });
    await member.save();
    return member.id;
  },

  /**
   * Actualiza la información de un miembro.
   *
   * @param {string} id - Identificador del miembro.
   * @param {Object} updatedData - Datos actualizados del miembro.
   * @returns {Promise<Object>} Objeto del miembro actualizado.
   */
  update: async (id, updatedData) => {
    const member = await MemberModel.findById(id);

    if (updatedData.Nombre) member.Nombre = updatedData.Nombre;
    if (updatedData.Email) member.Email = updatedData.Email;
    if (updatedData.EstadoCivil) member.EstadoCivil = updatedData.EstadoCivil;
    if (updatedData.TipoMiembro) member.TipoMiembro = updatedData.TipoMiembro;
    if (updatedData.Oficio) member.Oficio = updatedData.Oficio;
    
    await member.save();
    return member;
  },

  /**
   * Elimina un miembro por su ID.
   *
   * @param {string} id - Identificador del miembro.
   * @returns {Promise<boolean>} Retorna true si la eliminación fue exitosa.
   */
  delete: async (id) => {
    const member = await MemberModel.findById(id);
    await member.delete();
    return true;
  },

  /**
   * Realiza una búsqueda de miembros basado en una cadena de búsqueda,
   * con soporte para paginación.
   *
   * @param {string} searchString - Cadena a buscar.
   * @param {string|null} startAfterId - ID para la paginación.
   * @param {number} pageSize - Tamaño de la página.
   * @returns {Promise<Array>} Array de miembros que coincidan con la búsqueda.
   */
  search: async (searchString, startAfterId = null, pageSize = 10) => {
    return MemberModel.search(searchString, startAfterId, pageSize);
  }
};

module.exports = memberService;
