// tests/integration/member.test.js
const request = require("supertest");
const app = require("../../app");
const { db } = require("../../firebase");


// Mock de Firebase Firestore
jest.mock("../../firebase", () => {
  // En el mock de Firestore, modifica la definición:
  const mockFirestore = {
    collection: jest.fn(() => mockFirestore), // Devuelve el mismo objeto
    doc: jest.fn(() => mockFirestore),
    add: jest.fn().mockResolvedValue({ id: 'test-member-id' }),
    update: jest.fn().mockResolvedValue(true),
    delete: jest.fn().mockResolvedValue(true),
    get: jest.fn().mockResolvedValue({ exists: true }), 
    where: jest.fn(() => mockFirestore),
    orderBy: jest.fn(() => mockFirestore),
    limit: jest.fn(() => mockFirestore),
    startAfter: jest.fn(() => mockFirestore) // Asegura el encadenamiento
  };

  return {
    db: mockFirestore,
  };
});

describe("Rutas de Miembros", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/members", () => {
    test("debe obtener la lista de miembros", async () => {
      // Mock de respuesta de Firestore
      const mockMembers = [
        {
          id: "member1",
          Nombre: "Juan Pérez",
          TipoMiembro: "Bautizado",
          Email: "juan@example.com",
        },
        {
          id: "member2",
          Nombre: "María López",
          TipoMiembro: "Miembro",
          Email: "maria@example.com",
        },
      ];

      db.get.mockResolvedValue({
        docs: mockMembers.map((member) => ({
          id: member.id,
          data: () => member,
          exists: true,
        })),
      });

      const response = await request(app).get("/api/members");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(db.collection).toHaveBeenCalledWith("Member");
      expect(db.orderBy).toHaveBeenCalledWith("Nombre");
      expect(db.limit).toHaveBeenCalledWith(10);
    });

    test('debe manejar correctamente la paginación', async () => {
      const mockMembers = [{ id: 'member3', Nombre: 'Carlos Ruiz' }];
      
      db.get.mockImplementationOnce(() => Promise.resolve({
        docs: mockMembers.map(member => ({
          id: member.id,
          data: () => member,
          exists: true
        }))
      }));
    
      // Simula el documento de startAfter
      db.doc.mockReturnThis();
      db.startAfter.mockReturnThis();
    
      const response = await request(app)
        .get('/api/members')
        .query({ startAfter: 'member2', pageSize: '5' });
      
      expect(response.status).toBe(200);
      expect(db.doc).toHaveBeenCalledWith('member2');
      expect(db.startAfter).toHaveBeenCalled();
      expect(db.limit).toHaveBeenCalledWith(5);
    });
  });

  describe("GET /api/members/:id", () => {
    test("debe obtener un miembro por su ID", async () => {
      const mockMember = {
        id: "member1",
        Nombre: "Juan Pérez",
        TipoMiembro: "Bautizado",
        Email: "juan@example.com",
        EstadoCivil: "Soltero",
        Oficio: "Ingeniero",
      };

      db.get.mockResolvedValue({
        id: mockMember.id,
        data: () => mockMember,
        exists: true,
      });

      const response = await request(app).get("/api/members/member1");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id", "member1");
      expect(response.body).toHaveProperty("Nombre", "Juan Pérez");
      expect(db.collection).toHaveBeenCalledWith("Member");
      expect(db.doc).toHaveBeenCalledWith("member1");
    });

    test('debe devolver 404 si el miembro no existe', async () => {
      // Simular doc().get() con exists: false
      db.doc.mockImplementationOnce(() => ({
        get: jest.fn().mockResolvedValue({ exists: false })
      }));
    
      const response = await request(app).get('/api/members/nonexistent-id');
      
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Miembro no encontrado.");
    }, 10000);
  });

  describe("POST /api/members", () => {
    test("debe crear un miembro con datos válidos", async () => {
      const newMember = {
        Nombre: "Ana García",
        TipoMiembro: "Miembro",
        Email: "ana@example.com",
        EstadoCivil: "Casado",
        Oficio: "Doctora",
      };

      const response = await request(app).post("/api/members").send(newMember);

      expect(response.status).toBe(201);
      expect(response.body).toBe("test-member-id");
      expect(db.collection).toHaveBeenCalledWith("Member");
      expect(db.add).toHaveBeenCalledWith(
        expect.objectContaining({
          Nombre: "Ana García",
          TipoMiembro: "Miembro",
        })
      );
    });

    test('debe rechazar la creación con datos inválidos', async () => {
      const invalidMember = { Nombre: 'An', TipoMiembro: 'Invalido' };
    
      const response = await request(app)
        .post('/api/members')
        .send(invalidMember);
      
      expect(response.status).toBe(400);
      // Asegurar que no se llamó a Firestore
      expect(db.add).not.toHaveBeenCalled();
    }, 10000); // Timeout de 10 segundos
  });

  describe("PUT /api/members/:id", () => {
    test("debe actualizar un miembro existente", async () => {
      const updatedData = {
        Nombre: "Juan Pérez Actualizado",
        Email: "juan.nuevo@example.com",
      };

      // Mock para findById
      db.get.mockResolvedValue({
        id: "member1",
        data: () => ({
          Nombre: "Juan Pérez",
          Email: "juan@example.com",
          TipoMiembro: "Bautizado",
        }),
        exists: true,
      });

      const response = await request(app)
        .put("/api/members/member1")
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(db.doc).toHaveBeenCalledWith("member1");
      expect(db.update).toHaveBeenCalled();
    });

    test("debe rechazar la actualización con datos inválidos", async () => {
      const invalidData = { Nombre: "Ab" };
    
      // Mock para simular que el documento existe
      db.get.mockResolvedValueOnce({
        exists: true,
        data: () => ({ 
          Nombre: "Juan Pérez", 
          TipoMiembro: "Bautizado" 
        })
      });
    
      const response = await request(app)
        .put("/api/members/member1")
        .send(invalidData);
    
      expect(response.status).toBe(400);
      expect(db.update).not.toHaveBeenCalled();
    });
  });

  describe("DELETE /api/members/:id", () => {
    test("debe eliminar un miembro existente", async () => {
      db.get.mockResolvedValue({
        id: "member1",
        data: () => ({
          Nombre: "Juan Pérez",
          TipoMiembro: "Bautizado",
        }),
        exists: true,
      });

      const response = await request(app).delete("/api/members/member1");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "Member eliminado correctamente"
      );
      expect(db.collection).toHaveBeenCalledWith("Member");
      expect(db.doc).toHaveBeenCalledWith("member1");
      expect(db.delete).toHaveBeenCalled();
    });

    test('debe devolver 404 si intenta eliminar un miembro inexistente', async () => {
      // Configurar el mock para doc().get()
      db.doc.mockImplementationOnce(() => ({
        get: jest.fn().mockResolvedValue({ exists: false })
      }));
    
      const response = await request(app).delete('/api/members/nonexistent');
      
      expect(response.status).toBe(404);
      expect(db.collection).toHaveBeenCalledWith('Member');
      expect(db.doc).toHaveBeenCalledWith('nonexistent');
    }, 10000); // Aumentar timeout
  });

  describe("GET /api/members/search/:searchString", () => {
    test("debe buscar miembros por nombre", async () => {
      const mockMembers = [
        { id: "member1", Nombre: "Juan Pérez", TipoMiembro: "Bautizado" },
      ];

      db.get.mockResolvedValue({
        docs: mockMembers.map((member) => ({
          id: member.id,
          data: () => member,
        })),
      });

      const response = await request(app)
        .get("/api/members/search/Juan")
        .query({ searchString: "Juan" });

      expect(response.status).toBe(200);
      expect(db.collection).toHaveBeenCalledWith("Member");
      expect(db.where).toHaveBeenCalledWith("Nombre", ">=", "Juan");
      expect(db.where).toHaveBeenCalledWith("Nombre", "<=", "Juan\uf8ff");
    });
  });
});
