// services/memberService.js
"use strict";

const MemberModel = require("../models/MemberModel");

const memberService = {
  // Operaciones base
  getAll: async (startAfterId = null, pageSize = 10) => {
    return MemberModel.findAll(startAfterId, pageSize);
  },

  getById: async (id) => {
    return MemberModel.findById(id);
  },

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
    return member.id; // Devolver el ID del miembro creado
  
  },

  update: async (id, updatedData) => {
    const member = await MemberModel.findById(id);
    
    // Actualizar propiedades
    if (updatedData.Nombre) member.Nombre = updatedData.Nombre;
    if (updatedData.Email) member.Email = updatedData.Email;
    if (updatedData.EstadoCivil) member.EstadoCivil = updatedData.EstadoCivil;
    if (updatedData.TipoMiembro) member.TipoMiembro = updatedData.TipoMiembro;
    if (updatedData.Oficio) member.Oficio = updatedData.Oficio;
    
    await member.save();
    return member;
  },

  delete: async (id) => {
    const member = await MemberModel.findById(id);
    await member.delete();
    return true;
  },

  search: async (searchString, startAfterId = null, pageSize = 10) => {
    return MemberModel.search(searchString, startAfterId, pageSize);
  }
};

module.exports = memberService;
