"use strict";

const { EventService } = require("./EntityService");
const { RelationOperationsService } = require("./RelationOperationsService");

const eventRelations = new RelationOperationsService("MemberEvent");

const eventService = {
  // Base operations
  getEvents: async (startAfterDoc = null, pageSize = 10) => {
    return EventService.getAll(startAfterDoc, pageSize, "Name");
  },

  getEvent: async (id) => {
    return EventService.getById(id);
  },

  createEvent: async (eventData) => {
    return EventService.create(eventData.id, eventData);
  },

  updateEventById: async (id, updatedData) => {
    return EventService.update(id, updatedData);
  },

  deleteEventById: async (id) => {
    return EventService.delete(id);
  },

  // Relation operations
  addMemberToEvent: async (memberId, eventId, data = {}) => {
    return eventRelations.addRelation(memberId, eventId, data);
  },

  removeMemberFromEvent: async (memberId, eventId) => {
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

