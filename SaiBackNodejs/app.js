'use strict'
//cargar modulos de node para crear servidor
const express = require('express');
const bodyParser = require('body-parser');
const loadRoutes = require('./routerLoader');

// Ejecutar express (http)
const app = express();

// cargar ficheros rutas

// MiddLewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
//CORS
// Configurar cabeceras y cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});
//Añadir prefijos o rutas

app.use('/api', loadRoutes);// todas las rutas inician por API

// exportar modulo
module.exports =app;
