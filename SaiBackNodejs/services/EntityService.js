"use strict";

const BaseOperationsService = require('./BaseOperationsService');
const RelationOperationsService = require('./RelationOperationsService');

class MemberService extends BaseOperationsService {
  constructor() {
    super("Member");
  }

  async search(searchString, startAfterDoc = null, pageSize = 10) {
    try {
      let query = this.collection
        .where("Name", ">=", searchString)
        .where("Name", "<=", searchString + "\uf8ff")
        .orderBy("Name")
        .limit(pageSize);

      if (startAfterDoc) query = query.startAfter(startAfterDoc);

      const snapshot = await query.get();
      const members = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { members, lastDoc: snapshot.docs[snapshot.docs.length - 1] };
    } catch (error) {
      console.error("Error searching members:", error);
      throw new Error("Error al buscar miembros. Inténtalo más tarde.");
    }
  }
}

class CourseService extends BaseOperationsService {
  constructor() {
    super("Course");
  }
}

class GroupService extends BaseOperationsService {
  constructor() {
    super("Group");
  }
}

class EventService extends BaseOperationsService {
  constructor() {
    super("Event");
  }
}

class MemberRelationService extends RelationOperationsService {
  constructor(collectionName) {
    super(collectionName);
  }
}

module.exports = {
  MemberService: new MemberService(),
  CourseService: new CourseService(),
  GroupService: new GroupService(),
  EventService: new EventService(),
  MemberRelationService,
};