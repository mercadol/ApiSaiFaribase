"use strict";

const { EventService, MemberRelationService } = require("./EntityService");

const eventRelations = new MemberRelationService("MemberEvent");

const eventService = {
  // Base operations
  getAll: async (startAfterDoc = null, pageSize = 10) => {
    return EventService.getAll(startAfterDoc, pageSize, "Nombre");
  },

  getById: async (id) => {
    return EventService.getById(id);
  },

  create: async (eventData) => {
    return EventService.create( eventData);
  },

  update: async (id, updatedData) => {
    return EventService.update(id, updatedData);
  },

  delete: async (id) => {
    return EventService.delete(id);
  },

  // Relation operations
  addMember: async (memberId, eventId, data = {}) => {
    return eventRelations.addRelation(memberId, eventId, data);
  },

  removeMember: async (memberId, eventId) => {
    return eventRelations.removeRelation(memberId, eventId);
  },

  getEventMembers: async (eventId) => {
    return eventRelations.getRelatedDocuments(
      eventId,
      "Member",
      "toId",
      "fromId"
    );
  },

  getMemberEvents: async (memberId) => {
    return eventRelations.getRelatedDocuments(
      memberId,
      "Event", 
      "fromId",
      "toId"
    );
  }
};

module.exports = eventService;

