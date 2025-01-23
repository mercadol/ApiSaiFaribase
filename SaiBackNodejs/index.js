'use strict'

var app = require('./app');
var port = 3900;

//inicializa el servidor
app.listen(port,() =>{
  console.log('servidor corriendo en http://localhost:'+port);
});

