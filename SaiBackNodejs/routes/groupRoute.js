'use strict';

const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

router.get('/', groupController.getGrupos);
//router.get('/:id', groupController.getGrupo);
//router.post('/', groupController.createGrupo);
// ... otras rutas de grupos

module.exports = router;