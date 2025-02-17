'use strict';

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middleware/authenticate');


/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error interno del servidor
 */
router.post('/signup', userController.createUser);

/**
 * @swagger
 * /auth/signin:
 *   post:
 *     summary: Iniciar sesión con email y contraseña
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error interno del servidor
 */
router.post('/signin', userController.signIn);

/**
 * @swagger
 * /auth/signin/google:
 *   post:
 *     summary: Iniciar sesión con Google
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Inicio de sesión con Google exitoso
 *       500:
 *         description: Error interno del servidor
 */
router.post('/signin/google', userController.signInWithGoogle);

/**
 * @swagger
 * /auth/signin/anonymous:
 *   post:
 *     summary: Iniciar sesión de forma anónima
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Inicio de sesión anónimo exitoso
 *       500:
 *         description: Error interno del servidor
 */
router.post('/signin/anonymous', userController.signInAnonymously);

/**
 * @swagger
 * /auth/signout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Authentication]
 *     responses:
 *       204:
 *         description: Cierre de sesión exitoso
 *       500:
 *         description: Error interno del servidor
 */
router.post('/signout', userController.signOut);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obtener información del usuario actual (protegido)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: [] # Indica que se requiere token Bearer
 *     responses:
 *       200:
 *         description: Información del usuario obtenida exitosamente
 *       401:
 *         description: No autorizado (token inválido o faltante)
 *       500:
 *         description: Error interno del servidor
 */
router.get('/me', authenticate, userController.getCurrentUser);


module.exports = router;
