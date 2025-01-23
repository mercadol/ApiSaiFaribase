'use strict'

const express = require('express');

// cargar ficheros rutas
const memberRoute = require('./routes/memberRoute');
const groupRoute = require('./routes/groupRoute');
const courseRoute = require('./routes/courseRoute');


const loadRouter = express.Router();

loadRouter.use('/members', memberRoute);
loadRouter.use('/groups', groupRoute);
loadRouter.use('/courses', courseRoute);

module.exports = loadRouter;
