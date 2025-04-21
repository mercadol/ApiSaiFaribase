// services/validators/groupValidator.js
const { body, param, validationResult } = require("express-validator");
const ApiError = require("../../utils/ApiError");

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

const idParamValidation = (paramName = "id", entityName = "entidad") => [
  param(paramName)
    .notEmpty()
    .withMessage(`ID de ${entityName} no puede estar vacío`)
    .isAlphanumeric()
    .withMessage(`ID de ${entityName} inválido (alfanumérico esperado)`),
  handleValidationErrors,
];

const createGroupValidation = [
  body("Nombre")
    .trim()
    .notEmpty()
    .withMessage("El campo Nombre es obligatorio")
    .isLength({ min: 3, max: 100 })
    .withMessage("Nombre debe tener entre 3 y 100 caracteres"),
  body("Descripcion")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Descripción no puede exceder 500 caracteres"),
  body("TipoGrupo") // Assuming a field like this exists
    .optional()
    .trim()
    .isIn(["Ministerio", "Celula", "Otro"])
    .withMessage("Tipo de grupo inválido"),
  body("Estado")
    .optional()
    .trim()
    .isIn(["Activo", "Inactivo"])
    .withMessage("Estado debe ser Activo o Inactivo"),
  handleValidationErrors,
];

const updateGroupValidation = [
  ...idParamValidation("id", "grupo"),
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
    .isLength({ max: 500 })
    .withMessage("Descripción no puede exceder 500 caracteres"),
  body("TipoGrupo")
    .optional()
    .trim()
    .isIn(["Ministerio", "Celula", "Otro"])
    .withMessage("Tipo de grupo inválido"),
  body("Estado")
    .optional()
    .trim()
    .isIn(["Activo", "Inactivo"])
    .withMessage("Estado debe ser Activo o Inactivo"),
  body().custom((value, { req }) => {
    const allowedFields = ["Nombre", "Descripcion", "TipoGrupo", "Estado"];
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

const groupMemberValidation = [
  ...idParamValidation("groupId", "grupo"),
  body("memberId")
    .notEmpty()
    .withMessage("ID de miembro es requerido en el body")
    .isAlphanumeric()
    .withMessage("ID de miembro inválido (alfanumérico esperado)"),
  handleValidationErrors,
];

const groupMemberDeleteValidation = [
  ...idParamValidation("groupId", "grupo"),
  ...idParamValidation("memberId", "miembro"),
  handleValidationErrors,
];

const memberGroupsValidation = [
  ...idParamValidation("memberId", "miembro"),
  handleValidationErrors,
];

module.exports = {
  createGroupValidation,
  updateGroupValidation,
  groupIdValidation: idParamValidation("id", "grupo"),
  groupMemberValidation,
  groupMemberDeleteValidation,
  getGroupMembersValidation: idParamValidation("groupId", "grupo"),
  memberGroupsValidation
};
