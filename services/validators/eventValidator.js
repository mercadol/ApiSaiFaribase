// services/validators/eventValidator.js
const { body, param, validationResult } = require('express-validator');
const ApiError = require('../../utils/ApiError');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => `${err.msg} (param: ${err.path})`).join(', ');
    return next(new ApiError(400, `Error de validación: ${formattedErrors}`));
  }
  next();
};

const idParamValidation = (paramName = 'id', entityName = 'entidad') => [
  param(paramName)
    .notEmpty().withMessage(`ID de ${entityName} no puede estar vacío`)
    .isAlphanumeric().withMessage(`ID de ${entityName} inválido (alfanumérico esperado)`),
  handleValidationErrors
];

const createEventValidation = [
  body('Nombre')
    .trim()
    .notEmpty().withMessage('El campo Nombre es obligatorio')
    .isLength({ min: 3, max: 150 }).withMessage('Nombre debe tener entre 3 y 150 caracteres'),
  body('Descripcion')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Descripción no puede exceder 1000 caracteres'),
  body('FechaEvento')
    .notEmpty().withMessage('Fecha del evento es obligatoria')
    .isISO8601().withMessage('Fecha del evento debe ser una fecha válida (YYYY-MM-DD o formato ISO)')
    .toDate(),
  body('Lugar')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Lugar no puede exceder 200 caracteres'),
  body('Estado')
    .optional()
    .trim()
    .isIn(['Programado', 'Realizado', 'Cancelado']).withMessage('Estado debe ser Programado, Realizado o Cancelado'),
  handleValidationErrors
];

const updateEventValidation = [
  ...idParamValidation('id', 'evento'),
  body('Nombre')
    .optional()
    .trim()
    .notEmpty().withMessage('Nombre no puede estar vacío si se provee')
    .isLength({ min: 3, max: 150 }).withMessage('Nombre debe tener entre 3 y 150 caracteres'),
  body('Descripcion')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Descripción no puede exceder 1000 caracteres'),
  body('FechaEvento')
    .optional()
    .isISO8601().withMessage('Fecha del evento debe ser una fecha válida (YYYY-MM-DD o formato ISO)')
    .toDate(),
  body('Lugar')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Lugar no puede exceder 200 caracteres'),
  body('Estado')
    .optional()
    .trim()
    .isIn(['Programado', 'Realizado', 'Cancelado']).withMessage('Estado debe ser Programado, Realizado o Cancelado'),
  body().custom((value, { req }) => {
        const allowedFields = ['Nombre', 'Descripcion', 'FechaEvento', 'Lugar', 'Estado'];
        const hasUpdateData = Object.keys(req.body).some(key => allowedFields.includes(key));
        if (!hasUpdateData) {
          throw new Error('No se proporcionaron datos válidos para actualizar');
        }
        return true;
      }),
  handleValidationErrors
];

// Example validation for potential relationship routes (adjust as needed)
const eventMemberValidation = [
    ...idParamValidation('eventId', 'evento'),
    body('memberId')
      .notEmpty().withMessage('ID de miembro es requerido en el body')
      .isAlphanumeric().withMessage('ID de miembro inválido (alfanumérico esperado)'),
    handleValidationErrors
];

const eventMemberDeleteValidation = [
    ...idParamValidation('eventId', 'evento'),
    ...idParamValidation('memberId', 'miembro'),
    handleValidationErrors
];

const memberEventsValidation = [
  ...idParamValidation("memberId", "miembro"),
  handleValidationErrors,
];


module.exports = {
  createEventValidation,
  updateEventValidation,
  eventIdValidation: idParamValidation('id', 'evento'),
  eventMemberValidation,
  eventMemberDeleteValidation,
  getEventMembersValidation: idParamValidation('eventId', 'evento'),
  memberEventsValidation,
};