"use strict";

const { MemberService } = require("./EntityService");

const memberService = {
  // Operaciones base
  getAll: async (startAfterDoc = null, pageSize = 10) => {
    return MemberService.getAll(startAfterDoc, pageSize, "Name");
  },

  getById: async (id) => {
    return MemberService.getById(id);
  },

  create: async (memberData) => {
    return MemberService.create( memberData);
  },

  update: async (id, updatedData) => {
    return MemberService.update(id, updatedData);
  },

  delete: async (id) => {
    return MemberService.delete(id);
  },

  search: async (searchString, startAfterDoc = null, pageSize = 10) => {
    return MemberService.search(searchString, startAfterDoc, pageSize);
  },

};

module.exports = memberService;

