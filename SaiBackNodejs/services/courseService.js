"use strict";

const { CourseService, MemberRelationService } = require("./EntityService");

const courseRelations = new MemberRelationService("MemberCourse");

const courseService = {
  // Base operations
  getAll: async (startAfterDoc = null, pageSize = 10) => {
    return CourseService.getAll(startAfterDoc, pageSize, "Name");
  },

  getById: async (id) => {
    return CourseService.getById(id);
  },

  create: async (courseData) => {
    return CourseService.create(courseData.id, courseData);
  },

  update: async (id, updatedData) => {
    return CourseService.update(id, updatedData);
  },

  delete: async (id) => {
    return CourseService.delete(id);
  },

  // Relation operations
  addMemberToCourse: async (memberId, courseId, data = {}) => {
    return courseRelations.addRelation(memberId, courseId, data);
  },

  removeMemberFromCourse: async (memberId, courseId) => {
    return courseRelations.removeRelation(memberId, courseId);
  },

  getCourseMembers: async (courseId) => {
    return courseRelations.getRelatedDocuments(
      courseId,
      "Member",
      "toId",
      "fromId"
    );
  },

  getMemberCourses: async (memberId) => {
    return courseRelations.getRelatedDocuments(
      memberId,
      "Course", 
      "fromId",
      "toId"
    );
  }
};

module.exports = courseService;
