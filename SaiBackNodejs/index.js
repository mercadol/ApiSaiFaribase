'use strict'

require('dotenv').config();

var app = require('./app');
var port = process.env.PORT || 3900;

//inicializa el servidor
app.listen(port,() =>{
  console.log('servidor corriendo en http://localhost:'+port);
});

