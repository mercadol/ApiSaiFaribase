// services/validators/memberValidator.js
const { body, param, validationResult } = require("express-validator");
const ApiError = require("../../utils/ApiError");

// Reutilizar el handler de errores
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors
      .array()
      .map((err) => `${err.msg} (param: ${err.path})`)
      .join(", ");
    return next(new ApiError(400, `Error de validación: ${formattedErrors}`));
  }
  next();
};

// Reutilizar el validador de ID (ajusta formato si es necesario)
const idParamValidation = (paramName = "id", entityName = "entidad") => [
  param(paramName)
    .notEmpty()
    .withMessage(`ID de ${entityName} no puede estar vacío`)
    .isAlphanumeric()
    .withMessage(`ID de ${entityName} inválido (alfanumérico esperado)`),
  handleValidationErrors,
];

const createMemberValidation = [
  body("Nombre")
    .trim()
    .notEmpty()
    .withMessage("El campo Nombre es obligatorio")
    .isLength({ min: 3, max: 50 })
    .withMessage("Nombre debe tener entre 3 y 50 caracteres"),
  body("Email")
    .optional({ checkFalsy: true }) // Permite '', null, undefined
    .trim()
    .isEmail()
    .withMessage("Formato de email inválido")
    .normalizeEmail(), // Sanitizer
  body("TipoMiembro")
    .trim()
    .notEmpty()
    .withMessage("Tipo de miembro es obligatorio")
    .isIn(["Miembro", "Visitante", "Bautizado"])
    .withMessage("TipoMiembro debe ser Miembro, Visitante o Bautizado"),
  body("EstadoCivil")
    .optional({ checkFalsy: true })
    .trim()
    .isIn(["Soltero", "Casado", "Divorciado", "Viudo", "Union", "Separado"])
    .withMessage("Estado civil inválido"),
  body("Oficio")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Oficio no puede exceder 100 caracteres"),
  // No validar FechaRegistro aquí, debería ser manejado por el servicio/modelo
  handleValidationErrors,
];

const updateMemberValidation = [
  ...idParamValidation("id", "miembro"), // Valida :id
  body("Nombre")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Nombre no puede estar vacío si se provee")
    .isLength({ min: 3, max: 50 })
    .withMessage("Nombre debe tener entre 3 y 50 caracteres"),
  body("Email")
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage("Formato de email inválido")
    .normalizeEmail(),
  body("TipoMiembro")
    .optional()
    .trim()
    .isIn(["Miembro", "Visitante", "Bautizado"])
    .withMessage("TipoMiembro debe ser Miembro, Visitante o Bautizado"),
  body("EstadoCivil")
    .optional({ checkFalsy: true })
    .trim()
    .isIn(["Soltero", "Casado", "Divorciado", "Viudo", "Union", "Separado"])
    .withMessage("Estado civil inválido"),
  body("Oficio")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Oficio no puede exceder 100 caracteres"),
  // Asegurar que al menos un campo válido sea enviado
  body().custom((value, { req }) => {
    const allowedFields = [
      "Nombre",
      "Email",
      "TipoMiembro",
      "EstadoCivil",
      "Oficio",
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

module.exports = {
  createMemberValidation,
  updateMemberValidation,
  memberIdValidation: idParamValidation("id", "miembro"),
};
