"use strict";

const BaseOperationsService = require("./BaseOperationsService");
const RelationOperationsService = require("./RelationOperationsService");
const Validations = require("./validations");

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
      const results = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { results, lastDoc: snapshot.docs[snapshot.docs.length - 1] };
    } catch (error) {
      console.error("Error searching results:", error);
      throw new Error("Error al buscar miembros. Inténtalo más tarde.");
    }
  }
}

class CourseService extends BaseOperationsService {
  constructor() {
    super("Course");
  }

  async create(courseData) {
    // Validar que el nombre del curso sea único.
    const isNameUnique = await Validations.isFieldUnique("Course", "Nombre", courseData.Nombre);
    if (!isNameUnique) {
      throw new Error("El nombre del curso ya existe.");
    }

    // Crear el curso.
    return super.create(courseData);
  }
  async update(id, updatedData) {
    // Validar que el curso exista antes de actualizar.
    const courseExists = await Validations.validateCourseExists(id);
    if (!courseExists) {
      throw new Error("El curso no existe.");
    }

    // Actualizar el curso.
    return super.update(id, updatedData);
  }

  async validateMemberExists(memberId, transaction) {
    try {
      const memberDoc = await db.collection("Member").doc(memberId);
      const member = transaction
        ? await transaction.get(memberDoc)
        : await memberDoc.get();

      if (!member.exists) {
        throw {
          type: "NOT_FOUND",
          message: `Member ${memberId} not found`,
        };
      }
      return member;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  async validateCourseExists(courseId, transaction) {
    try {
      const courseDoc = await this.validateExists(courseId, transaction);
      // Aquí podrías añadir validaciones específicas del curso
      // Por ejemplo, verificar si el curso está activo
      return courseDoc;
    } catch (error) {
      throw this._handleError(error);
    }
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
  
  async validateEventExists(eventId, transaction) {
    try {
      const eventDoc = await this.validateExists(eventId, transaction);
      return eventDoc;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  async validateEventDate(eventData) {
    if (!eventData.Fecha) {
      throw {
        type: 'VALIDATION_ERROR',
        message: 'La fecha del evento es requerida'
      };
    }
    // Aquí puedes añadir más validaciones específicas de eventos
    return true;
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
