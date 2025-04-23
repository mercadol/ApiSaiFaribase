// test/middlewares/authenticate.test.js
const authenticate = require("../../middlewares/authenticate");
const { auth } = require("../../firebase");
const ApiError = require("../../utils/ApiError");

// Mock de firebase
jest.mock("../../firebase", () => ({
  auth: {
    verifyIdToken: jest.fn(),
    getUser: jest.fn(),
  },
}));

describe("Middleware authenticate", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {
        authorization: "Bearer valid-token-123",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("debe permitir acceso con token válido", async () => {
    const mockUser = { uid: "user123", email: "user@example.com" };

    auth.verifyIdToken.mockResolvedValueOnce({ uid: "user123" });
    auth.getUser.mockResolvedValueOnce(mockUser);

    await authenticate(req, res, next);

    expect(auth.verifyIdToken).toHaveBeenCalledWith("valid-token-123");
    expect(auth.getUser).toHaveBeenCalledWith("user123");
    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("debe rechazar solicitud sin token", async () => {
    req.headers.authorization = undefined;

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "No se proporcionó token",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("debe rechazar solicitud con formato de token inválido", async () => {
    req.headers.authorization = "invalid-format";

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "No se proporcionó token",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("debe rechazar token inválido", async () => {
    auth.verifyIdToken.mockRejectedValueOnce(new Error("Token inválido"));

    await authenticate(req, res, next);

    expect(auth.verifyIdToken).toHaveBeenCalledWith("valid-token-123");
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next.mock.calls[0][0].statusCode).toBe(401);
    expect(next.mock.calls[0][0].message).toBe("Token no válido");
    expect(res.status).not.toHaveBeenCalled();
  });

  test("debe manejar error al obtener información del usuario", async () => {
    auth.verifyIdToken.mockResolvedValueOnce({ uid: "user123" });
    auth.getUser.mockRejectedValueOnce(new Error("Usuario no encontrado"));

    await authenticate(req, res, next);

    expect(auth.verifyIdToken).toHaveBeenCalledWith("valid-token-123");
    expect(auth.getUser).toHaveBeenCalledWith("user123");
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next.mock.calls[0][0].statusCode).toBe(401);
    expect(next.mock.calls[0][0].message).toBe("Token no válido");
    expect(res.status).not.toHaveBeenCalled();
  });
});
