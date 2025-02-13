"use strict";

const { GroupService, MemberRelationService } = require("./EntityService");

const groupRelations = new MemberRelationService("MemberGroup");

const groupService = {
  // Base operations
  getAll: async (startAfterDoc = null, pageSize = 10) => {
    return GroupService.getAll(startAfterDoc, pageSize, "Nombre");
  },

  getById: async (id) => {
    return GroupService.getById(id);
  },

  create: async (groupData) => {
    return GroupService.create( groupData);
  },

  update: async (id, updatedData) => {
    return GroupService.update(id, updatedData);
  },

  delete: async (id) => {
    return GroupService.delete(id);
  },

  search: async (searchString, startAfterDoc = null, pageSize = 10) => {
    return GroupService.search(searchString, startAfterDoc, pageSize);
  },
  
  // Relation operations
  addMemberToGroup: async (memberId, groupId, data = {}) => {
    return groupRelations.addRelation(memberId, groupId, data);
  },

  removeMemberFromGroup: async (memberId, groupId) => {
    return groupRelations.removeRelation(memberId, groupId);
  },

  getGroupMembers: async (groupId) => {
    return groupRelations.getRelatedDocuments(
      groupId,
      "Member",
      "toId",
      "fromId"
    );
  },

  getMemberGroups: async (memberId) => {
    return groupRelations.getRelatedDocuments(
      memberId,
      "Group", 
      "fromId",
      "toId"
    );
  }
};

module.exports = groupService;
