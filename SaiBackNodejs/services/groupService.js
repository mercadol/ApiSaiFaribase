// services/groupService.js
"use strict";

const GroupModel = require("../models/GroupModel");

const groupService = {
  // Base operations
  getAll: async (startAfterId = null, pageSize = 10) => {
    return GroupModel.findAll(startAfterId, pageSize);
  },

  getById: async (id) => {
    return GroupModel.findById(id);
  },

  create: async (groupData) => {
    const group = new GroupModel({
      nombre: groupData.Nombre,
      descripcion: groupData.Descripcion,
      fechaCreacion: groupData.FechaCreacion || new Date()
    });
    await group.save();
    return group.id;
  },

  update: async (id, updatedData) => {
    const group = await GroupModel.findById(id);
    
    // Actualizar propiedades
    if (updatedData.Nombre) group.nombre = updatedData.Nombre;
    if (updatedData.Descripcion) group.descripcion = updatedData.Descripcion;
    if (updatedData.FechaCreacion) group.fechaCreacion = updatedData.FechaCreacion;
    
    await group.save();
    return group;
  },

  delete: async (id) => {
    const group = await GroupModel.findById(id);
    await group.delete();
    return true;
  },

  search: async (searchString, startAfterId = null, pageSize = 10) => {
    return GroupModel.search(searchString, startAfterId, pageSize);
  },

  // Relation operations
  addMember: async (memberId, groupId) => {
    const group = await GroupModel.findById(groupId);
    await group.addMember(memberId);
    return { groupId, memberId };
  },

  removeMember: async (memberId, groupId) => {
    const group = await GroupModel.findById(groupId);
    await group.removeMember(memberId);
    return true;
  },

  getGroupMembers: async (groupId) => {
    return GroupModel.getGroupMembers(groupId);
  },

  getMemberGroups: async (memberId) => {
    return GroupModel.getMemberGroups(memberId);
  },

};

module.exports = groupService;
