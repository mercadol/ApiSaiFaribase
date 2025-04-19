// app.js
const express = require("express");
const loadRoutes = require("./routes/routerLoader");
const errorHandler = require("./middlewares/errorHandler");
const ApiError = require('./utils/ApiError');
const setupSwagger = require("./swagger");
const logger = require('./utils/logger');
const pinoHttp = require('pino-http');

const app = express();

// MiddLewares
app.use(pinoHttp({ logger }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
//CORS
// Configurar cabeceras y cors
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

//Rutas
app.use("/api", loadRoutes); // todas las rutas inician por API
// Configurar Swagger
setupSwagger(app);
// Middleware para manejar rutas no encontradas (404)
app.use((req, res, next) => {
  // loguear intento de ruta de acceso a ruta no encontrada
  logger.warn(`Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  next(new ApiError(404, `La ruta ${req.originalUrl} no fue encontrada en este servidor.`)); // Lanza un error 404
});
app.use(errorHandler);

// exportar modulo
module.exports = app;
