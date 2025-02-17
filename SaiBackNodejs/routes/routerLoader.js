'use strict'

const express = require('express');

// cargar ficheros rutas
const memberRoute = require('./memberRoute');
const groupRoute = require('./groupRoute');
const courseRoute = require('./courseRoute');
const eventRoute = require('./eventRoute');
const userRoute = require('./userRoute');
const asyncHandler = require("../middlewares/asyncHandler");


const loadRouter = express.Router();

/**
 * @swagger
 * /test:
 *   get:
 *     summary: Endpoint de prueba
 *     description: Devuelve un mensaje para verificar que la API está activa.
 *     responses:
 *       200:
 *         description: Mensaje de prueba obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
loadRouter.get('/test', (req, res) => {
    return res.status(200).send({
      message: "Soy la accion test de mi controlador",
    });
  });

  /**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: API para la gestión de usuarios y autenticación
 */
loadRouter.use('/auth', asyncHandler(userRoute));

/**
 * @swagger
 * tags:
 *   name: Members
 *   description: The members managing API
 */
loadRouter.use('/members', asyncHandler(memberRoute));

/**
 * @swagger
 * tags:
 *   name: Groups
 *   description: The groups managing API
 */
loadRouter.use('/groups', asyncHandler(groupRoute));

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: The course managing API
 */
loadRouter.use('/courses', asyncHandler(courseRoute));

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: The events managing API
 */
loadRouter.use('/events', asyncHandler(eventRoute));

module.exports = loadRouter;
