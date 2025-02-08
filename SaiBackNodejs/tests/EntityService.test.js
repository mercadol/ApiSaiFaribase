
const mockCollection = {
    doc: jest.fn(() => mockDoc),
  };

const mockDb = {
    collection: jest.fn(() => mockCollection),
  };
  
  jest.mock("../firebase", () => ({
    db: mockDb
  }));
  
  const { CourseService, EventService, GroupService } = require("../services/EntityService");

  describe('Test de todas las entidades', ()=>{

    describe('CourseService', () => {
        it('should use correct collection name', () => {
          const service = CourseService;
          expect(mockDb.collection).toHaveBeenCalledWith('Course');
        });
    
      });

      describe('EventService', () => {
        it('should use correct collection name', () => {
          const service = EventService;
          expect(mockDb.collection).toHaveBeenCalledWith('Event');
        });
    
      });

      describe('GroupService', () => {
        it('should use correct collection name', () => {
          const service = GroupService;
          expect(mockDb.collection).toHaveBeenCalledWith('Group');
        });
    
      });
  });