'use strict'

const express = require('express');

// cargar ficheros rutas
const memberRoute = require('./routes/memberRoute');
const groupRoute = require('./routes/groupRoute');
const courseRoute = require('./routes/courseRoute');


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


loadRouter.use('/members', memberRoute);

loadRouter.use('/groups', groupRoute);

loadRouter.use('/courses', courseRoute);

module.exports = loadRouter;
