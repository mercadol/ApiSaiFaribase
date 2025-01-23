'use strict'

const express = require('express');
const memberController =require('../controllers/memberController');
const router = express.Router();

// Todas las rutas a continuacion
router.get('/test', memberController.test);
router.get('/members/:last?', memberController.getMiembros);



module.exports = router;
