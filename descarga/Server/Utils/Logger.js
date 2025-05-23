/**
 * @file Server/Utils/Logger.gs
 * @description Utilidades para el registro de eventos y errores.
 */

function logInfo(message, data = '') {
  console.log(`INFO: ${message}`, data);
}

function logError(message, error = '', data = '') {
  console.error(`ERROR: ${message}`, error, data);
  // En un futuro, podrías enviar estos errores a un sistema de monitoreo
  // o a una hoja de cálculo de logs.
}

function logWarning(message, data = '') {
  console.warn(`WARNING: ${message}`, data);
}

