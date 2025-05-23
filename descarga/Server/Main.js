/**
 * @file Server/Main.gs
 * @description Punto de entrada principal para la aplicación web y funciones de utilidad.
 */

/**
 * Sirve la página HTML principal de la aplicación.
 * Esta función se ejecuta cuando un usuario accede a la URL de la aplicación web.
 * @param {object} e El objeto de evento de la solicitud GET.
 * @return {HtmlOutput} El servicio HTML para mostrar la página.
 */
function doGet(e) {
  logInfo('Solicitud doGet recibida:', e);
  // Intentamos cargar el index.html, si falla, mostramos un error amigable.
  try {
    const htmlOutput = HtmlService.createTemplateFromFile('Client/index').evaluate();
    htmlOutput.setTitle('Visor Regulatorio + BBVA Perú');
    // X-Frame-Options para permitir la incrustación si es necesario, aunque para una app standalone no suele serlo.
    // Si se usa IFRAME, puede ser necesario ajustarlo. Por defecto es DENY.
    // htmlOutput.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    return htmlOutput;
  } catch (error) {
    logError('Error crítico al generar HtmlOutput en doGet:', error);
    return HtmlService.createHtmlOutput(
      '<p>Error al cargar la aplicación. Por favor, intente más tarde.</p>' +
      '<p>Detalle: ' + error.message + '</p>'
    );
  }
}

/**
 * Incluye el contenido de un archivo HTML dentro de otro.
 * Útil para modularizar el frontend (CSS, JS, componentes Vue) en Apps Script.
 * Se usa en las plantillas HTML con: <?!= include('Client/css/style'); ?>
 * @param {string} filename La ruta del archivo a incluir (sin la extensión .html).
 * @return {string} El contenido del archivo HTML.
 */
function include(filename) {
  try {
    // Asegurarse de que solo se puedan incluir archivos de la carpeta Client
    if (typeof filename !== 'string' || !filename.startsWith('Client/')) {
      logError('Intento de inclusión de archivo no permitido:', filename);
      throw new Error('Inclusión de archivo no permitida.');
    }
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (error) {
    logError(`Error al incluir el archivo: ${filename}`, error);
    // Devolver un comentario HTML o string vacío en caso de error para no romper el renderizado principal.
    return ``;
  }
}

/**
 * Función de prueba para verificar que google.script.run funciona.
 * Se puede llamar desde la consola del navegador del cliente:
 * google.script.run.withSuccessHandler(console.log).withFailureHandler(console.error).testConnection();
 * @return {string} Un mensaje de confirmación.
 */
function testConnection() {
  const message = 'Conexión con el backend de Apps Script exitosa.';
  logInfo(message);
  return message;
}

