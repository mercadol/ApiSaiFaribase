// utils/logger.js

const pino = require("pino");

// Configuración básica del logger
const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  // Usar pino-pretty en desarrollo para logs más legibles
  transport:
    process.env.NODE_ENV !== "production"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true, // Colorear salida
            translateTime: "SYS:standard", // Formato de hora legible
            ignore: "pid,hostname", // Ignorar campos menos relevantes
          },
        }
      : undefined, // Usar formato JSON estándar en producción
});

module.exports = logger;
