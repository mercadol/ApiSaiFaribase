// services/groupService.js
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
      Nombre: groupData.Nombre,
      Descripcion: groupData.Descripcion,
      FechaCreacion: groupData.FechaCreacion || new Date()
    });
    await group.save();
    return group.id;
  },

  update: async (id, updatedData) => {
    const group = await GroupModel.findById(id);
    
    // Actualizar propiedades
    if (updatedData.Nombre) group.Nombre = updatedData.Nombre;
    if (updatedData.Descripcion) group.Descripcion = updatedData.Descripcion;
    if (updatedData.FechaCreacion) group.FechaCreacion = updatedData.FechaCreacion;
    
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
