'use strict';

const groupService = require('../services/groupService'); // Importar el servicio

var groupController = {
  test: (req, res) => {
    return res.status(200).send({
      message: "Soy la accion test de mi controlador",
    });
  },

  // Ruta para obtener grupos con paginación
  getGrupos: async (req, res) => {
    try {

      const pageSize = 10; // Tamaño de la página (puedes hacerlo dinámico si lo necesitas)
      let startAfterDoc = null;

      // Si el cliente envía un "startAfter" (que es el ID del último grupo de la página anterior)
      if (req.query.startAfter) {

        const startAfterId = req.query.startAfter;
        const startAfterSnapshot = await db.collection('Group').doc(startAfterId).get();
        if (!startAfterSnapshot.exists) {
          console.log("No se encontró el documento de inicio:", startAfterId);
        }
        startAfterDoc = startAfterSnapshot.exists ? startAfterSnapshot : null;
      }

      // Obtener la página de grupos correspondiente
      const { groups, lastDoc } = await groupService.getGrupos(startAfterDoc, pageSize);
      console.log("Grupos obtenidos desde el servicio:", groups);  // Verifica los grupos obtenidos

      // Si hay un "lastDoc", significa que hay más grupos, por lo que el cliente puede solicitar la siguiente página.
      const nextStartAfter = lastDoc ? lastDoc.id : null;

      // Enviar los grupos y la información sobre la siguiente página
      res.json({
        groups,
        nextStartAfter
      });
    } catch (error) {
      console.error('Error al obtener grupos:', error);
      res.status(500).send(error.message); // Mostrar el mensaje de error
    }
  },
};
module.exports = groupController;
