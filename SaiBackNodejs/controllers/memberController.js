'use strict';

const memberService = require('../services/memberService'); // Importar el servicio

var memberController = {
  test: (req, res) => {
    return res.status(200).send({
      message: "Soy la accion test de mi controlador",
    });
  },

  // Ruta para obtener miembros con paginación
  getMiembros: async (req, res) => {
    try {
      console.log("Consulta recibida con parámetros:", req.query);  // Verifica qué parámetros está enviando el cliente

      const pageSize = 10; // Tamaño de la página (puedes hacerlo dinámico si lo necesitas)
      let startAfterDoc = null;

      // Si el cliente envía un "startAfter" (que es el ID del último miembro de la página anterior)
      if (req.query.startAfter) {
        console.log("startAfter recibido:", req.query.startAfter);  // Verifica el valor de startAfter

        const startAfterId = req.query.startAfter;
        const startAfterSnapshot = await db.collection('Member').doc(startAfterId).get();
        if (!startAfterSnapshot.exists) {
          console.log("No se encontró el documento de inicio:", startAfterId);
        }
        startAfterDoc = startAfterSnapshot.exists ? startAfterSnapshot : null;
      }

      // Obtener la página de miembros correspondiente
      const { members, lastDoc } = await memberService.getMiembros(startAfterDoc, pageSize);
      console.log("Miembros obtenidos desde el servicio:", members);  // Verifica los miembros obtenidos
    

      // Si hay un "lastDoc", significa que hay más miembros, por lo que el cliente puede solicitar la siguiente página.
      const nextStartAfter = lastDoc ? lastDoc.id : null;

      // Enviar los miembros y la información sobre la siguiente página
      res.json({
        members,
        nextStartAfter
      });
    } catch (error) {
      console.error('Error al obtener miembros:', error);
      res.status(500).send(error.message); // Mostrar el mensaje de error
    }
  },
};
module.exports = memberController;
