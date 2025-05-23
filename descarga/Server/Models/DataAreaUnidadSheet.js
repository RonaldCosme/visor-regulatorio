/**
 * @file Server/Models/DataAreaUnidadSheet.gs
 * @description Funciones de acceso para la hoja de cálculo DATA_AREA_UNIDAD.
 */

/**
 * Abre la hoja de cálculo DATA_AREA_UNIDAD.
 * @return {GoogleAppsScript.Spreadsheet.Sheet | null}
 */
function _openDataAreaUnidadSheet() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(DATA_AREA_UNIDAD_SHEET_NAME);
    if (!sheet) {
      logError(`La hoja de cálculo "${DATA_AREA_UNIDAD_SHEET_NAME}" no fue encontrada. ID: ${SPREADSHEET_ID}`);
      // Opcionalmente, crearla si no existe con cabeceras esperadas
      // const newSheet = ss.insertSheet(DATA_AREA_UNIDAD_SHEET_NAME);
      // const headers = ["nombre_corporativo", "Dosier", "Correo-e", "Area", "Unidad"];
      // newSheet.appendRow(headers);
      // logInfo(`Hoja "${DATA_AREA_UNIDAD_SHEET_NAME}" creada con cabeceras.`);
      // return newSheet;
      return null;
    }
    return sheet;
  } catch (e) {
    logError('Error al abrir la hoja DATA_AREA_UNIDAD:', e);
    return null;
  }
}

/**
 * Busca datos de usuario en la hoja DATA_AREA_UNIDAD por nombre corporativo.
 * @param {string} nombreCompleto El nombre corporativo a buscar.
 * @return {object|null} Un objeto con los datos del usuario si se encuentra, o null.
 */
function findUserDataByName(nombreCompleto) {
  if (!nombreCompleto || typeof nombreCompleto !== 'string') {
    logWarning('Intento de búsqueda en DATA_AREA_UNIDAD con nombre inválido:', nombreCompleto);
    return null;
  }

  const sheet = _openDataAreaUnidadSheet();
  if (!sheet) return null;

  try {
    const data = sheet.getDataRange().getValues();
    // Empezar desde la segunda fila para omitir encabezados
    for (let i = 1; i < data.length; i++) {
      const nombreCorporativoEnHoja = data[i][DATA_AREA_UNIDAD_COLUMNS.NOMBRE_CORPORATIVO];
      if (nombreCorporativoEnHoja && typeof nombreCorporativoEnHoja === 'string' &&
          nombreCorporativoEnHoja.trim().toLowerCase() === nombreCompleto.trim().toLowerCase()) {
        return {
          nombre_corporativo: nombreCorporativoEnHoja,
          dosier: data[i][DATA_AREA_UNIDAD_COLUMNS.DOSIER],
          email: data[i][DATA_AREA_UNIDAD_COLUMNS.CORREO_E], // Mapea Correo-e a email
          area: data[i][DATA_AREA_UNIDAD_COLUMNS.AREA],
          unidad: data[i][DATA_AREA_UNIDAD_COLUMNS.UNIDAD]
        };
      }
    }
    return null; // Usuario no encontrado
  } catch (e) {
    logError('Error en findUserDataByName:', e, { nombreCompleto });
    return null;
  }
}
