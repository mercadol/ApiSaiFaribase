// services/evenServices.js
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
      Nombre: eventData.Nombre,
      Descripcion: eventData.Descripcion,
      Fecha: eventData.Fecha || new Date(),
      Estado: eventData.Estado || "",
      Lugar: eventData.Lugar
    });
    await event.save();
    return event.id;
  },

  update: async (id, updatedData) => {
    const event = await EventModel.findById(id);
    
    // Actualizar propiedades
    if (updatedData.Nombre) event.Nombre = updatedData.Nombre;
    if (updatedData.Descripcion) event.Descripcion = updatedData.Descripcion;
    if (updatedData.Fecha) event.Fecha = updatedData.Fecha;
    if (updatedData.Estado) event.Estado=updatedData.Estado;
    if (updatedData.Lugar) event.Lugar =updatedData.Lugar;
    
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
  addMember: async (memberId, eventId, role) => {
    const event = await EventModel.findById(eventId);
    await event.addMember(memberId, role);
    return { eventId, memberId, role };
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
