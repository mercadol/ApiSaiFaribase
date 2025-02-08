"use strict";

const { GroupService, MemberRelationService } = require("./EntityService");

const groupRelations = new MemberRelationService("MemberGroup");

const groupService = {
  // Base operations
  getGroups: async (startAfterDoc = null, pageSize = 10) => {
    return GroupService.getAll(startAfterDoc, pageSize, "Name");
  },

  getGroup: async (id) => {
    return GroupService.getById(id);
  },

  createGroup: async (groupData) => {
    return GroupService.create(groupData.id, groupData);
  },

  updateGroupById: async (id, updatedData) => {
    return GroupService.update(id, updatedData);
  },

  deleteGroupById: async (id) => {
    return GroupService.delete(id);
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
