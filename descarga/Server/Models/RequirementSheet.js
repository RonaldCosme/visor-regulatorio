/**
 * @file Server/Models/RequirementSheet.gs
 * @description Funciones CRUD para la hoja de cálculo de Requerimientos.
 */

function _openRequirementSheet() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(REQUIREMENT_SHEET_NAME);
    if (!sheet) {
      logInfo(`La hoja de cálculo "${REQUIREMENT_SHEET_NAME}" no fue encontrada. Creando...`);
      sheet = ss.insertSheet(REQUIREMENT_SHEET_NAME);
      const headers = Object.keys(REQUIREMENT_COLUMNS);
      sheet.appendRow(headers);
      // Aplicar formato de fecha a columnas específicas
      const dateColumns = [
        REQUIREMENT_COLUMNS.FECHA_REGISTRO + 1,
        REQUIREMENT_COLUMNS.FECHA_NOTIFICACION + 1,
        REQUIREMENT_COLUMNS.FECHA_VENCIMIENTO_INTERNO + 1,
        REQUIREMENT_COLUMNS.FECHA_VENCIMIENTO_REGULADOR + 1,
        REQUIREMENT_COLUMNS.FECHA_PRORROGA + 1,
        REQUIREMENT_COLUMNS.FECHA_ULTIMA_MODIFICACION + 1,
        REQUIREMENT_COLUMNS.FECHA_ENTREGA_BANCO + 1
      ];
      dateColumns.forEach(colNum => {
        // Asegurar que solo se aplica a filas existentes si la hoja ya tiene datos.
        // Para una hoja nueva, esto está bien. Si la hoja puede tener muchas filas vacías, limitar el rango.
        sheet.getRange(1, colNum, sheet.getMaxRows(), 1).setNumberFormat("dd/MM/yyyy HH:mm:ss");
      });
      logInfo(`Hoja "${REQUIREMENT_SHEET_NAME}" creada con cabeceras.`);
    }
    return sheet;
  } catch (e) {
    logError('Error al abrir/preparar la hoja de requerimientos:', e);
    return null;
  }
}

function createRequirementInSheet(reqData) {
  const sheet = _openRequirementSheet();
  if (!sheet) {
    logError('No se pudo abrir la hoja de requerimientos para crear.', reqData);
    return null;
  }

  try {
    const newRow = [];
    newRow[REQUIREMENT_COLUMNS.FECHA_REGISTRO] = new Date();
    newRow[REQUIREMENT_COLUMNS.CODIGO_UNICO] = reqData.codigo_unico || '';
    newRow[REQUIREMENT_COLUMNS.ESTADO_GENERAL] = reqData.estado_general || DEFAULT_REQUIREMENT_ESTADO;
    newRow[REQUIREMENT_COLUMNS.EMAIL_SOLICITANTE] = reqData.email_solicitante || '';
    newRow[REQUIREMENT_COLUMNS.NRO_OFICIO] = reqData.numero_oficio || '';
    newRow[REQUIREMENT_COLUMNS.RESPONSABLE_ASIGNADO] = reqData.responsable_asignado || '';
    newRow[REQUIREMENT_COLUMNS.AREA_RESPONSABLE] = reqData.area_responsable || '';
    newRow[REQUIREMENT_COLUMNS.UNIDAD_RESPONSABLE] = reqData.unidad_responsable || '';
    newRow[REQUIREMENT_COLUMNS.ORGANISMO_REGULADOR] = reqData.organismo_regulador || '';
    newRow[REQUIREMENT_COLUMNS.FECHA_NOTIFICACION] = reqData.fecha_notificacion ? new Date(reqData.fecha_notificacion) : null;
    newRow[REQUIREMENT_COLUMNS.COPIA_EMAIL] = reqData.copia_email || '';
    newRow[REQUIREMENT_COLUMNS.TIPO_DOCUMENTO] = reqData.tipo_documento || '';
    newRow[REQUIREMENT_COLUMNS.NECESITA_SOPORTE_SISTEMAS] = reqData.necesita_soporte_sistemas || 'POR CONFIRMAR';
    newRow[REQUIREMENT_COLUMNS.ASPECTO_DOCUMENTO] = reqData.aspecto_documento || '';
    newRow[REQUIREMENT_COLUMNS.CATEGORIA] = reqData.categoria || '';
    newRow[REQUIREMENT_COLUMNS.DESGLOSE_DOCUMENTO] = reqData.desglose_documento || '';
    newRow[REQUIREMENT_COLUMNS.DESCRIPCION_DETALLADA] = reqData.descripcion_detallada || '';
    newRow[REQUIREMENT_COLUMNS.URL_CARPETA_ANEXOS] = reqData.url_carpeta_anexos || '';
    newRow[REQUIREMENT_COLUMNS.COMENTARIOS_GENERALES] = reqData.comentarios_generales || '';
    newRow[REQUIREMENT_COLUMNS.TIPO_PEDIDO_SISTEMAS] = reqData.tipo_pedido_sistemas || '';
    newRow[REQUIREMENT_COLUMNS.TICKET_PETICION_SISTEMAS] = reqData.ticket_peticion_sistemas || '';
    newRow[REQUIREMENT_COLUMNS.COMENTARIO_SISTEMAS] = reqData.comentario_sistemas || '';
    newRow[REQUIREMENT_COLUMNS.FECHA_VENCIMIENTO_INTERNO] = reqData.fecha_vencimiento_interno ? new Date(reqData.fecha_vencimiento_interno) : null;
    newRow[REQUIREMENT_COLUMNS.FECHA_VENCIMIENTO_REGULADOR] = reqData.fecha_vencimiento_regulador ? new Date(reqData.fecha_vencimiento_regulador) : null;
    newRow[REQUIREMENT_COLUMNS.FECHA_PRORROGA] = reqData.fecha_prorroga ? new Date(reqData.fecha_prorroga) : null;
    newRow[REQUIREMENT_COLUMNS.FECHA_ULTIMA_MODIFICACION] = new Date();
    newRow[REQUIREMENT_COLUMNS.HISTORIAL_ESTADOS] = `${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss")} (${reqData.usuario_creacion || 'sistema'}): Creado con estado ${reqData.estado_general || DEFAULT_REQUIREMENT_ESTADO}`;
    newRow[REQUIREMENT_COLUMNS.ESTADO_SISTEMAS] = reqData.estado_sistemas || (reqData.necesita_soporte_sistemas === 'SI' ? 'Ingresado' : 'N/A');
    newRow[REQUIREMENT_COLUMNS.NECESITA_PRORROGA] = reqData.necesita_prorroga || 'NO';
    newRow[REQUIREMENT_COLUMNS.MOTIVO_PRORROGA] = reqData.motivo_prorroga || '';
    newRow[REQUIREMENT_COLUMNS.FECHA_ENTREGA_BANCO] = reqData.fecha_entrega_banco ? new Date(reqData.fecha_entrega_banco) : null;
    newRow[REQUIREMENT_COLUMNS.USUARIO_CREACION] = reqData.usuario_creacion || Session.getActiveUser().getEmail();
    newRow[REQUIREMENT_COLUMNS.USUARIO_ULTIMA_MODIFICACION] = reqData.usuario_creacion || Session.getActiveUser().getEmail();

    const fullRow = [];
    for (let i = 0; i < Object.keys(REQUIREMENT_COLUMNS).length; i++) {
      fullRow[i] = newRow[i] !== undefined ? newRow[i] : "";
    }

    sheet.appendRow(fullRow);
    logInfo('Requerimiento creado exitosamente en RequirementSheet:', { codigo_unico: reqData.codigo_unico });
    return reqData; // Retorna el objeto original, no necesariamente el de la hoja.
  } catch (e) {
    logError('Error en createRequirementInSheet (RequirementSheet):', e, reqData);
    return null;
  }
}

function getRequirementByCodigoUnico(codigoUnico) {
  if (!codigoUnico) return null;
  const sheet = _openRequirementSheet();
  if (!sheet) return null;

  try {
    const data = sheet.getDataRange().getValues();
    const parseDateSafe = (dateValue) => {
      if (dateValue instanceof Date && !isNaN(dateValue)) {
        return dateValue.toISOString();
      }
      if (typeof dateValue === 'string' || typeof dateValue === 'number') {
        const parsedDate = new Date(dateValue);
        if (!isNaN(parsedDate)) {
          return parsedDate.toISOString();
        }
      }
      return null;
    };
    
    for (let i = 1; i < data.length; i++) { // Empezar desde 1 para omitir cabecera
      const rowCodigoUnico = String(data[i][REQUIREMENT_COLUMNS.CODIGO_UNICO]).trim();
      if (rowCodigoUnico === String(codigoUnico).trim()) {
        const requirement = {};
        
        Object.keys(REQUIREMENT_COLUMNS).forEach(key => {
          const columnIndex = REQUIREMENT_COLUMNS[key];
          const value = data[i][columnIndex];
          const lowerKey = key.toLowerCase();

          // Lista de campos que son fechas
          const dateFields = [
            'fecha_registro', 'fecha_notificacion', 'fecha_vencimiento_interno', 
            'fecha_vencimiento_regulador', 'fecha_prorroga', 'fecha_ultima_modificacion', 
            'fecha_entrega_banco'
          ];

          if (dateFields.includes(lowerKey)) {
            requirement[lowerKey] = parseDateSafe(value);
          } else {
            requirement[lowerKey] = value !== undefined && value !== null ? value : '';
          }
        });
        
        requirement.rowIndex = i + 1; 
        return requirement;
      }
    }
    return null;
  } catch (e) {
    logError('Error en getRequirementByCodigoUnico:', e, { codigoUnico });
    return null;
  }
}

function updateRequirementInSheet(codigoUnico, reqData) {
  const sheet = _openRequirementSheet();
  if (!sheet) {
    logError('No se pudo abrir la hoja de requerimientos para actualizar.', { codigoUnico });
    return false;
  }

  try {
    const existingRequirement = getRequirementByCodigoUnico(codigoUnico); // Ya devuelve fechas en ISO
    if (!existingRequirement || !existingRequirement.rowIndex) {
      logWarning(`Requerimiento con Código Único ${codigoUnico} no encontrado para actualizar.`);
      return false;
    }
    
    const rowIndex = existingRequirement.rowIndex;
    const currentUserEmail = Session.getActiveUser().getEmail();
    
    let historialActual = sheet.getRange(rowIndex, REQUIREMENT_COLUMNS.HISTORIAL_ESTADOS + 1).getValue() || "";
    const estadoAnteriorEnHoja = sheet.getRange(rowIndex, REQUIREMENT_COLUMNS.ESTADO_GENERAL + 1).getValue();

    if (reqData.estado_general && estadoAnteriorEnHoja !== reqData.estado_general) {
      const nuevaEntrada = `${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss")} (${currentUserEmail}): ${estadoAnteriorEnHoja} → ${reqData.estado_general}`;
      historialActual += (historialActual ? "; " : "") + nuevaEntrada;
      sheet.getRange(rowIndex, REQUIREMENT_COLUMNS.HISTORIAL_ESTADOS + 1).setValue(historialActual);
    }
    
    sheet.getRange(rowIndex, REQUIREMENT_COLUMNS.FECHA_ULTIMA_MODIFICACION + 1).setValue(new Date());
    sheet.getRange(rowIndex, REQUIREMENT_COLUMNS.USUARIO_ULTIMA_MODIFICACION + 1).setValue(currentUserEmail);

    const fieldsToUpdate = {
      estado_general: REQUIREMENT_COLUMNS.ESTADO_GENERAL,
      email_solicitante: REQUIREMENT_COLUMNS.EMAIL_SOLICITANTE,
      numero_oficio: REQUIREMENT_COLUMNS.NRO_OFICIO,
      responsable_asignado: REQUIREMENT_COLUMNS.RESPONSABLE_ASIGNADO,
      area_responsable: REQUIREMENT_COLUMNS.AREA_RESPONSABLE,
      unidad_responsable: REQUIREMENT_COLUMNS.UNIDAD_RESPONSABLE,
      organismo_regulador: REQUIREMENT_COLUMNS.ORGANISMO_REGULADOR,
      fecha_notificacion: REQUIREMENT_COLUMNS.FECHA_NOTIFICACION,
      copia_email: REQUIREMENT_COLUMNS.COPIA_EMAIL,
      tipo_documento: REQUIREMENT_COLUMNS.TIPO_DOCUMENTO,
      necesita_soporte_sistemas: REQUIREMENT_COLUMNS.NECESITA_SOPORTE_SISTEMAS,
      aspecto_documento: REQUIREMENT_COLUMNS.ASPECTO_DOCUMENTO,
      categoria: REQUIREMENT_COLUMNS.CATEGORIA,
      desglose_documento: REQUIREMENT_COLUMNS.DESGLOSE_DOCUMENTO,
      descripcion_detallada: REQUIREMENT_COLUMNS.DESCRIPCION_DETALLADA,
      comentarios_generales: REQUIREMENT_COLUMNS.COMENTARIOS_GENERALES,
      tipo_pedido_sistemas: REQUIREMENT_COLUMNS.TIPO_PEDIDO_SISTEMAS,
      ticket_peticion_sistemas: REQUIREMENT_COLUMNS.TICKET_PETICION_SISTEMAS,
      comentario_sistemas: REQUIREMENT_COLUMNS.COMENTARIO_SISTEMAS,
      fecha_vencimiento_interno: REQUIREMENT_COLUMNS.FECHA_VENCIMIENTO_INTERNO,
      fecha_vencimiento_regulador: REQUIREMENT_COLUMNS.FECHA_VENCIMIENTO_REGULADOR,
      fecha_prorroga: REQUIREMENT_COLUMNS.FECHA_PRORROGA,
      estado_sistemas: REQUIREMENT_COLUMNS.ESTADO_SISTEMAS,
      necesita_prorroga: REQUIREMENT_COLUMNS.NECESITA_PRORROGA,
      motivo_prorroga: REQUIREMENT_COLUMNS.MOTIVO_PRORROGA,
      fecha_entrega_banco: REQUIREMENT_COLUMNS.FECHA_ENTREGA_BANCO
      // No actualizamos URL_CARPETA_ANEXOS, USUARIO_CREACION, CODIGO_UNICO, FECHA_REGISTRO aquí
    };
    
    for (const key in reqData) {
      if (fieldsToUpdate.hasOwnProperty(key) && reqData[key] !== undefined) {
        let valueToSet = reqData[key];
        const dateFields = ['fecha_notificacion', 'fecha_vencimiento_interno', 'fecha_vencimiento_regulador', 'fecha_prorroga', 'fecha_entrega_banco'];
        if (dateFields.includes(key) && valueToSet) {
          valueToSet = new Date(valueToSet); // El valor en reqData ya debería ser ISOString o compatible
        }
        sheet.getRange(rowIndex, fieldsToUpdate[key] + 1).setValue(valueToSet === null ? "" : valueToSet);
      }
    }

    logInfo(`Requerimiento ${codigoUnico} actualizado exitosamente.`);
    return true;
  } catch (e) {
    logError('Error en updateRequirementInSheet:', e, { codigoUnico, reqData });
    return false;
  }
}

function getUniqueValuesForFieldFromRequirements(fieldName) {
  const sheet = _openRequirementSheet();
  if (!sheet || sheet.getLastRow() <= 1) return [];

  const columnIndex = REQUIREMENT_COLUMNS[fieldName.toUpperCase()];
  if (columnIndex === undefined) {
    logWarning(`Campo "${fieldName}" no encontrado en REQUIREMENT_COLUMNS.`);
    return [];
  }

  try {
    const data = sheet.getRange(2, columnIndex + 1, sheet.getLastRow() - 1, 1).getValues();
    const uniqueValues = [...new Set(data.map(row => row[0]).filter(value => value !== null && value !== "" && String(value).trim() !== ""))];
    return uniqueValues.sort();
  } catch (e) {
    logError(`Error obteniendo valores únicos para ${fieldName}:`, e);
    return [];
  }
}

function getAllRequirementsFromSheet(filters = {}) {
  const sheet = _openRequirementSheet();
  if (!sheet || sheet.getLastRow() <= 1) { // Si no hay hoja o solo cabeceras
    logInfo('No hay requerimientos en la hoja o la hoja no existe.');
    return [];
  }

  try {
    const data = sheet.getDataRange().getValues();
    const requirements = [];

    const parseDateSafe = (dateValue) => {
      if (dateValue instanceof Date && !isNaN(dateValue)) {
        return dateValue.toISOString();
      }
      if (typeof dateValue === 'string' || typeof dateValue === 'number') {
        // Intentar parsear si es un string o número que podría ser una fecha
        const parsedDate = new Date(dateValue);
        if (!isNaN(parsedDate)) {
          return parsedDate.toISOString();
        }
      }
      return null; // O un string vacío '' si se prefiere para fechas inválidas/ausentes
    };

    for (let i = 1; i < data.length; i++) { // Empezar desde 1 para omitir cabecera
      const rowData = data[i];
      // Verificar si la fila está vacía o tiene un código único vacío para evitar procesar filas basura
      if (!rowData || !rowData[REQUIREMENT_COLUMNS.CODIGO_UNICO]) {
        continue; 
      }

      const requirement = {};
      
      requirement.codigo_unico = String(rowData[REQUIREMENT_COLUMNS.CODIGO_UNICO] || '').trim();
      requirement.estado_general = rowData[REQUIREMENT_COLUMNS.ESTADO_GENERAL] || '';
      requirement.aspecto_documento = rowData[REQUIREMENT_COLUMNS.ASPECTO_DOCUMENTO] || '';
      requirement.organismo_regulador = rowData[REQUIREMENT_COLUMNS.ORGANISMO_REGULADOR] || '';
      requirement.responsable_asignado = rowData[REQUIREMENT_COLUMNS.RESPONSABLE_ASIGNADO] || '';
      requirement.categoria = rowData[REQUIREMENT_COLUMNS.CATEGORIA] || '';
      requirement.tipo_documento = rowData[REQUIREMENT_COLUMNS.TIPO_DOCUMENTO] || '';
      requirement.numero_oficio = rowData[REQUIREMENT_COLUMNS.NRO_OFICIO] || '';
      requirement.area_responsable = rowData[REQUIREMENT_COLUMNS.AREA_RESPONSABLE] || '';
      requirement.necesita_soporte_sistemas = rowData[REQUIREMENT_COLUMNS.NECESITA_SOPORTE_SISTEMAS] || 'NO';
      
      requirement.fecha_registro = parseDateSafe(rowData[REQUIREMENT_COLUMNS.FECHA_REGISTRO]);
      requirement.fecha_vencimiento_regulador = parseDateSafe(rowData[REQUIREMENT_COLUMNS.FECHA_VENCIMIENTO_REGULADOR]);
      requirement.fecha_vencimiento_interno = parseDateSafe(rowData[REQUIREMENT_COLUMNS.FECHA_VENCIMIENTO_INTERNO]);
      requirement.fecha_ultima_modificacion = parseDateSafe(rowData[REQUIREMENT_COLUMNS.FECHA_ULTIMA_MODIFICACION]);

      requirement.email_solicitante = rowData[REQUIREMENT_COLUMNS.EMAIL_SOLICITANTE] || '';
      requirement.usuario_creacion = rowData[REQUIREMENT_COLUMNS.USUARIO_CREACION] || '';
      
      // Aplicar filtros
      let passesFilter = true;
      if (filters) {
        if (filters.estado && requirement.estado_general !== filters.estado) passesFilter = false;
        if (passesFilter && filters.organismo && requirement.organismo_regulador !== filters.organismo) passesFilter = false;
        if (passesFilter && filters.responsable && requirement.responsable_asignado.toLowerCase().indexOf(filters.responsable.toLowerCase()) === -1) passesFilter = false;
        if (passesFilter && filters.busqueda && !searchInRequirement(requirement, filters.busqueda)) passesFilter = false;
      }

      if (passesFilter) {
        requirements.push(requirement);
      }
    }

    requirements.sort((a, b) => {
      try {
        const dateA = a.fecha_registro ? new Date(a.fecha_registro) : null;
        const dateB = b.fecha_registro ? new Date(b.fecha_registro) : null;

        if (dateA instanceof Date && !isNaN(dateA) && dateB instanceof Date && !isNaN(dateB)) {
          return dateB.getTime() - dateA.getTime(); // Descendente
        } else if (dateB instanceof Date && !isNaN(dateB)) {
          return 1; // b tiene fecha, a no, b va antes (o después si se quiere nulos al final)
        } else if (dateA instanceof Date && !isNaN(dateA)) {
          return -1; // a tiene fecha, b no, a va antes
        }
        return 0;
      } catch (sortError) {
        logError('Error durante el ordenamiento de requerimientos:', sortError, {a_fecha: a.fecha_registro, b_fecha: b.fecha_registro});
        return 0;
      }
    });

    logInfo(`Se recuperaron ${requirements.length} requerimientos de la hoja que cumplen con los filtros.`);
    return requirements; // Siempre retorna un array
  } catch (e) {
    logError('Error crítico en getAllRequirementsFromSheet:', e, filters);
    return []; // En caso de error, retorna un array vacío
  }
}

function searchInRequirement(requirement, searchTerm) {
  if (!searchTerm) return true;
  const term = String(searchTerm).toLowerCase();
  const searchableFields = [
    requirement.codigo_unico,
    requirement.aspecto_documento,
    requirement.organismo_regulador,
    requirement.responsable_asignado,
    requirement.numero_oficio,
    requirement.area_responsable,
    requirement.email_solicitante,
    requirement.categoria,
    requirement.tipo_documento
  ];
  
  return searchableFields.some(field => 
    field && String(field).toLowerCase().includes(term)
  );
}

function calculateRequirementStats() {
  const sheet = _openRequirementSheet();
  if (!sheet || sheet.getLastRow() <= 1) {
    return { total: 0, activos: 0, terminados: 0, vencidos: 0, proximos_vencer: 0 };
  }

  try {
    const data = sheet.getDataRange().getValues();
    const stats = { total: 0, activos: 0, terminados: 0, vencidos: 0, proximos_vencer: 0 };
    const hoy = new Date();
    hoy.setHours(0,0,0,0); // Para comparar solo fechas
    const tresDiasMs = 3 * 24 * 60 * 60 * 1000;


    for (let i = 1; i < data.length; i++) {
       if (!data[i] || !data[i][REQUIREMENT_COLUMNS.CODIGO_UNICO]) { // Omitir filas vacías
        continue;
      }
      stats.total++;
      const estado = data[i][REQUIREMENT_COLUMNS.ESTADO_GENERAL] || '';
      const fechaVencimientoRegRaw = data[i][REQUIREMENT_COLUMNS.FECHA_VENCIMIENTO_REGULADOR];
      let fechaVencimientoReg = null;
      if (fechaVencimientoRegRaw instanceof Date && !isNaN(fechaVencimientoRegRaw)) {
        fechaVencimientoReg = new Date(fechaVencimientoRegRaw);
        fechaVencimientoReg.setHours(0,0,0,0);
      } else if (typeof fechaVencimientoRegRaw === 'string' || typeof fechaVencimientoRegRaw === 'number') {
        const parsed = new Date(fechaVencimientoRegRaw);
        if(!isNaN(parsed)) {
          fechaVencimientoReg = parsed;
          fechaVencimientoReg.setHours(0,0,0,0);
        }
      }
      
      if (estado === REQUIREMENT_ESTADOS.TERMINADO || estado === REQUIREMENT_ESTADOS.TERMINADO_CON_PRORROGA) {
        stats.terminados++;
      } else if (estado !== REQUIREMENT_ESTADOS.CANCELADO) { // Considerar activos todos los no terminados y no cancelados
        stats.activos++;
        if (fechaVencimientoReg) {
          if (fechaVencimientoReg < hoy) {
            stats.vencidos++;
          } else if (fechaVencimientoReg.getTime() >= hoy.getTime() && fechaVencimientoReg.getTime() <= (hoy.getTime() + tresDiasMs) ) {
            stats.proximos_vencer++;
          }
        }
      }
    }
    logInfo('Estadísticas de requerimientos calculadas:', stats);
    return stats;
  } catch (e) {
    logError('Error en calculateRequirementStats:', e);
    return { total: 0, activos: 0, terminados: 0, vencidos: 0, proximos_vencer: 0 };
  }
}

function deleteRequirementFromSheet(codigoUnico) {
  const sheet = _openRequirementSheet();
  if (!sheet) return false;

  try {
    const data = sheet.getDataRange().getValues();
    for (let i = data.length - 1; i >= 1; i--) { // Iterar hacia atrás para evitar problemas con índices al eliminar
      const rowCodigoUnico = String(data[i][REQUIREMENT_COLUMNS.CODIGO_UNICO]).trim();
      if (rowCodigoUnico === String(codigoUnico).trim()) {
        sheet.deleteRow(i + 1);
        logInfo(`Fila ${i + 1} eliminada para requerimiento ${codigoUnico}`);
        return true;
      }
    }
    logWarning(`Requerimiento ${codigoUnico} no encontrado para eliminar.`);
    return false;
  } catch (e) {
    logError('Error en deleteRequirementFromSheet:', e, { codigoUnico });
    return false;
  }
}
