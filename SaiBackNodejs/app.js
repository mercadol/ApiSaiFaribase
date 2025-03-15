"use strict";
const express = require("express");
const loadRoutes = require("./routes/routerLoader");
const errorHandler = require("./middlewares/errorHandler");
const ApiError = require('./utils/ApiError');
const setupSwagger = require("./swagger");

// Ejecutar express (http)
const app = express();

// MiddLewares
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
  next(new ApiError(404, "Route Not Found")); // Lanza un error 404
});
app.use(errorHandler);

// exportar modulo
module.exports = app;
