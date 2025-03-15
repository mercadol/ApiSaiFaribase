// services/evenServices.js
"use strict";

const EventModel = require("../models/EventModel");

const eventService = {
  // Base operations
  getAll: async (startAfterId = null, pageSize = 10) => {
    return EventModel.findAll(startAfterId, pageSize);
  },

  getById: async (id) => {
    return EventModel.findById(id);;
  },

  create: async (eventData) => {
    
    const event = new EventModel({
      nombre: eventData.Nombre,
      descripcion: eventData.Descripcion,
      fecha: eventData.Fecha || new Date()
    });
    await event.save();
    return event.id;
  },

  update: async (id, updatedData) => {
    const event = await EventModel.findById(id);
    
    // Actualizar propiedades
    if (updatedData.Nombre) event.nombre = updatedData.Nombre;
    if (updatedData.Descripcion) event.descripcion = updatedData.Descripcion;
    if (updatedData.Fecha) event.fecha = updatedData.Fecha;
    
    await event.save();
    return event;
  },

  delete: async (id) => {
    const event = await EventModel.findById(id);
    await event.delete();
    return true;
  },

  search: async (searchString, startAfterId = null, pageSize = 10) => {
    return EventModel.search(searchString, startAfterId, pageSize);
  },

  // Relation operations
  addMember: async (memberId, eventId) => {
    const event = await EventModel.findById(eventId);
    await event.addMember(memberId);
    return { eventId, memberId };
  },

  removeMember: async (memberId, eventId) => {
    const event = await EventModel.findById(eventId);
    await event.removeMember(memberId);
    return true;
  },

  getEventMembers: async (eventId) => {
    return EventModel.getEventMembers(eventId);
  },

  getMemberEvents: async (memberId) => {
    return EventModel.getMemberEvents(memberId);
  },
  
};

module.exports = eventService;
