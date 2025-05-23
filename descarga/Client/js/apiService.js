<script>
/* Client/js/apiService.js.html */

const apiService = {
  /**
   * Llama a una función del backend de Google Apps Script.
   * @param {string} functionName El nombre de la función en API_Endpoints.gs.
   * @param {Array<any>} args Argumentos para pasar a la función del backend.
   * @returns {Promise<any>} Una promesa que se resuelve con la respuesta del backend o se rechaza con un error.
   */
  callAppsScript: function(functionName, ...args) {
    return new Promise((resolve, reject) => {
      google.script.run
        .withSuccessHandler(response => {
          // console.log(`Respuesta de ${functionName}:`, response);

          // Manejo mejorado de respuestas nulas o indefinidas
          if (response === null || typeof response === 'undefined') {
            const errorMsg = `Error: La función del servidor '${functionName}' devolvió una respuesta nula o indefinida.`;
            console.error(errorMsg, { functionName, args });
            reject(new Error(`Respuesta inesperada del servidor al llamar a '${functionName}'. Verifique los logs del servidor.`));
            return;
          }

          // Si el backend devuelve un error controlado (success: false), lo pasamos como parte de la resolución
          // para que el componente Vue pueda manejarlo.
          // Si se prefiere que estos sean errores que activen el .catch() en el componente,
          // se podría usar reject(new Error(response.message)) aquí.
          if (response.success === false && typeof response.message !== 'undefined') {
            // console.warn(`Llamada a ${functionName} no exitosa (controlado por backend):`, response.message);
            resolve(response);
          } else {
            // Para respuestas exitosas (response.success === true o estructuras diferentes que no usan 'success')
            resolve(response);
          }
        })
        .withFailureHandler(error => {
          console.error(`Error en la llamada a google.script.run para ${functionName}:`, error);
          let errorMessage = `Ocurrió un error de comunicación con el servidor al llamar a '${functionName}'.`;
          // El objeto 'error' de withFailureHandler a menudo es genérico.
          // El mensaje real del error de Apps Script suele estar en los logs del servidor.
          reject(new Error(errorMessage));
        })
        [functionName](...args);
    });
  }
};

// Para probar la conexión con el backend desde la consola del navegador:
// apiService.callAppsScript('testConnection').then(console.log).catch(console.error);

</script>
