// services/validators/courseValidator.js
const { body, param, validationResult } = require("express-validator");
const ApiError = require("../../utils/ApiError");
// const Validations = require('../validations'); // Opcional si necesitas validaciones personalizadas asíncronas

// Middleware reutilizable para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors
      .array()
      .map((err) => `${err.msg} (param: ${err.path})`)
      .join(", ");
    // Usar el primer error o un mensaje concatenado
    // const firstError = errors.array({ onlyFirstError: true })[0];
    // return next(new ApiError(400, `${firstError.msg} (en ${firstError.path})`));
    return next(new ApiError(400, `Error de validación: ${formattedErrors}`));
  }
  next();
};

// Validador común para ID en parámetro (ajusta isMongoId si usas otro formato como UUID o numérico)
const idParamValidation = (paramName = "id", entityName = "entidad") => [
  param(paramName)
    .notEmpty()
    .withMessage(`ID de ${entityName} no puede estar vacío`)
    .isAlphanumeric()
    .withMessage(`ID de ${entityName} inválido (alfanumérico esperado)`), // Ejemplo si tus IDs son los de Firestore
  handleValidationErrors,
];

const createCourseValidation = [
  body("Nombre")
    .trim()
    .notEmpty()
    .withMessage("El campo Nombre es obligatorio")
    .isLength({ min: 3, max: 100 })
    .withMessage("Nombre debe tener entre 3 y 100 caracteres"),
  body("Descripcion")
    .trim()
    .notEmpty()
    .withMessage("El campo Descripcion es obligatorio")
    .isLength({ max: 500 })
    .withMessage("Descripción no puede exceder 500 caracteres"),
  body("Duracion")
    .optional({ checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage("Duración debe ser un número entero no negativo")
    .toInt(),
  body("FechaInicio")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Fecha de inicio debe ser una fecha válida (YYYY-MM-DD)")
    .toDate(),
  body("Nivel")
    .optional()
    .trim()
    .isIn(["Basico", "Intermedio", "Avanzado"])
    .withMessage("Nivel debe ser Basico, Intermedio o Avanzado"),
  body("Estado")
    .optional()
    .trim()
    .isIn(["Activo", "Inactivo", "Pendiente"])
    .withMessage("Estado debe ser Activo, Inactivo o Pendiente"),
  handleValidationErrors,
];

const updateCourseValidation = [
  ...idParamValidation("id", "curso"),
  body("Nombre")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Nombre no puede estar vacío si se provee")
    .isLength({ min: 3, max: 100 })
    .withMessage("Nombre debe tener entre 3 y 100 caracteres"),
  body("Descripcion")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Descripción no puede estar vacía si se provee")
    .isLength({ max: 500 })
    .withMessage("Descripción no puede exceder 500 caracteres"),
  body("Duracion")
    .optional({ checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage("Duración debe ser un número entero no negativo")
    .toInt(),
  body("FechaInicio")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Fecha de inicio debe ser una fecha válida (YYYY-MM-DD)")
    .toDate(),
  body("Nivel")
    .optional()
    .trim()
    .isIn(["Basico", "Intermedio", "Avanzado"])
    .withMessage("Nivel debe ser Basico, Intermedio o Avanzado"),
  body("Estado")
    .optional()
    .trim()
    .isIn(["Activo", "Inactivo", "Pendiente"])
    .withMessage("Estado debe ser Activo, Inactivo o Pendiente"),
  body().custom((value, { req }) => {
    const allowedFields = [
      "Nombre",
      "Descripcion",
      "Duracion",
      "FechaInicio",
      "Nivel",
      "Estado",
    ];
    const hasUpdateData = Object.keys(req.body).some((key) =>
      allowedFields.includes(key)
    );
    if (!hasUpdateData) {
      throw new Error("No se proporcionaron datos válidos para actualizar");
    }
    return true;
  }),
  handleValidationErrors,
];

// Validación para rutas de relación Curso-Miembro
const courseMemberValidation = [
  ...idParamValidation("courseId", "curso"),
  body("memberId")
    .notEmpty()
    .withMessage("ID de miembro es requerido en el body")
    .isAlphanumeric()
    .withMessage("ID de miembro inválido (alfanumérico esperado)"),
  // Añadir validaciones para 'data' opcional si es necesario
  handleValidationErrors,
];

const courseMemberDeleteValidation = [
  ...idParamValidation("courseId", "curso"),
  ...idParamValidation("memberId", "miembro"),
  handleValidationErrors,
];

const memberCoursesValidation = [
  ...idParamValidation("memberId", "miembro"),
  handleValidationErrors,
];

module.exports = {
  createCourseValidation,
  updateCourseValidation,
  courseIdValidation: idParamValidation("id", "curso"),
  courseMemberValidation,
  courseMemberDeleteValidation,
  getCourseMembersValidation: idParamValidation("courseId", "curso"),
  memberCoursesValidation,
};
