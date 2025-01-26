'use strict';

const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

router.get('/', courseController.getCursos);
router.get('/:id', courseController.getCursoById);
router.post('/', courseController.createCurso);
router.put('/:id', courseController.updateCurso);
router.delete('/:id', courseController.deleteCurso);

module.exports = router;