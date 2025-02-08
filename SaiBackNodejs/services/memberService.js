"use strict";

const { MemberService } = require("./EntityService");

const memberService = {
  // Operaciones base de miembros
  getAll: async (startAfterDoc = null, pageSize = 10) => {
    return MemberService.getAll(startAfterDoc, pageSize, "Name");
  },

  getById: async (id) => {
    return MemberService.getById(id);
  },

  create: async (memberData) => {
    return MemberService.create(memberData.id, memberData);
  },

  update: async (id, updatedData) => {
    return MemberService.update(id, updatedData);
  },

  delete: async (id) => {
    return MemberService.delete(id);
  },

  searchMembers: async (searchString, startAfterDoc = null, pageSize = 10) => {
    return MemberService.searchMembers(searchString, startAfterDoc, pageSize);
  },

};

module.exports = memberService;

