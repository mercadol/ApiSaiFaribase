'use strict'
//cargar modulos de node para crear servidor
var express = require('express');
var bodyParser = require('body-parser');

// Ejecutar express (http)
var app = express();

// cargar ficheros rutas
var member_routes = require('./routes/memberRoute');

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

app.use('/api', member_routes);// usar el modulo member para las rutas de la API

// exportar modulo
module.exports =app;
