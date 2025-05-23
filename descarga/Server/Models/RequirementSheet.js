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
      // Aplicar formato de fecha a columnas específicas si es necesario
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
        sheet.getRange(1, colNum, sheetgetMaxRows(), 1).setNumberFormat("dd/MM/yyyy HH:mm:ss");
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
    // Mapear reqData a las columnas usando REQUIREMENT_COLUMNS
    // Es importante que el orden en reqData coincida o se mapee explícitamente
    newRow[REQUIREMENT_COLUMNS.FECHA_REGISTRO] = new Date();
    newRow[REQUIREMENT_COLUMNS.CODIGO_UNICO] = reqData.codigo_unico || ''; // Ya generado en el cliente/controller
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

    // Asegurar que el array tenga la longitud correcta según REQUIREMENT_COLUMNS
    const fullRow = [];
    for (let i = 0; i < Object.keys(REQUIREMENT_COLUMNS).length; i++) {
      fullRow[i] = newRow[i] !== undefined ? newRow[i] : ""; // Rellenar con vacío si no está definido
    }

    sheet.appendRow(fullRow);
    logInfo('Requerimiento creado exitosamente en RequirementSheet:', { codigo_unico: reqData.codigo_unico });
    return reqData; // Devolver el objeto original con datos adicionales si se agregaron
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
    const headers = data[0].map(header => header.trim()); // Nombres de columnas como strings

    for (let i = 1; i < data.length; i++) {
      const rowCodigoUnico = String(data[i][REQUIREMENT_COLUMNS.CODIGO_UNICO]).trim();
      if (rowCodigoUnico === String(codigoUnico).trim()) {
        const requirement = {};
        headers.forEach((header, index) => {
          // Buscar la llave en REQUIREMENT_COLUMNS que corresponde al header
          const columnKey = Object.keys(REQUIREMENT_COLUMNS).find(key => REQUIREMENT_COLUMNS[key] === index);
          if (columnKey) {
            // Formatear fechas a ISO string para consistencia
            if (data[i][index] instanceof Date) {
              requirement[columnKey.toLowerCase()] = data[i][index].toISOString();
            } else {
              requirement[columnKey.toLowerCase()] = data[i][index];
            }
          }
        });
        requirement.rowIndex = i + 1; // Guardar el índice de la fila para futuras actualizaciones
        return requirement;
      }
    }
    return null; // No encontrado
  } catch (e) {
    logError('Error en getRequirementByCodigoUnico:', e, { codigoUnico });
    return null;
  }
}

function updateRequirementInSheet(codigoUnico, reqData) {
  const sheet = _openRequirementSheet();
  if (!sheet) {
    logError('No se pudo abrir la hoja de requerimientos para actualizar.', { codigoUnico, reqData });
    return false;
  }

  try {
    const existingRequirement = getRequirementByCodigoUnico(codigoUnico);
    if (!existingRequirement || !existingRequirement.rowIndex) {
      logWarning(`Requerimiento con Código Único ${codigoUnico} no encontrado para actualizar.`);
      return false;
    }
    const rowIndex = existingRequirement.rowIndex;

    // Construir objeto de datos para actualizar, similar a createRequirementInSheet
    // pero solo actualizando los campos proporcionados en reqData
    // y manteniendo los valores existentes para los no proporcionados.

    const currentUserEmail = Session.getActiveUser().getEmail();
    let historialActual = sheet.getRange(rowIndex, REQUIREMENT_COLUMNS.HISTORIAL_ESTADOS + 1).getValue() || "";
    const estadoAnterior = sheet.getRange(rowIndex, REQUIREMENT_COLUMNS.ESTADO_GENERAL + 1).getValue();

    if (reqData.estado_general && estadoAnterior !== reqData.estado_general) {
      const nuevaEntradaHistorial = `${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss")} (${currentUserEmail}): ${estadoAnterior} → ${reqData.estado_general}`;
      historialActual += (historialActual ? "; " : "") + nuevaEntradaHistorial;
      sheet.getRange(rowIndex, REQUIREMENT_COLUMNS.HISTORIAL_ESTADOS + 1).setValue(historialActual);
    }
    
    sheet.getRange(rowIndex, REQUIREMENT_COLUMNS.FECHA_ULTIMA_MODIFICACION + 1).setValue(new Date());
    sheet.getRange(rowIndex, REQUIREMENT_COLUMNS.USUARIO_ULTIMA_MODIFICACION + 1).setValue(currentUserEmail);

    // Mapeo de campos de reqData a columnas
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
      url_carpeta_anexos: REQUIREMENT_COLUMNS.URL_CARPETA_ANEXOS,
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
    };
    
    for (const key in reqData) {
      if (fieldsToUpdate.hasOwnProperty(key) && reqData[key] !== undefined) {
        let valueToSet = reqData[key];
        // Convertir fechas si es necesario
        const dateFields = ['fecha_notificacion', 'fecha_vencimiento_interno', 'fecha_vencimiento_regulador', 'fecha_prorroga', 'fecha_entrega_banco'];
        if (dateFields.includes(key) && valueToSet) {
          valueToSet = new Date(valueToSet);
        }
        sheet.getRange(rowIndex, fieldsToUpdate[key] + 1).setValue(valueToSet);
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
    const uniqueValues = [...new Set(data.map(row => row[0]).filter(value => value !== null && value !== ""))];
    return uniqueValues.sort();
  } catch (e) {
    logError(`Error obteniendo valores únicos para ${fieldName}:`, e);
    return [];
  }
}

// Agregar estas funciones al final de RequirementSheet.js

function getAllRequirementsFromSheet(filters = {}) {
  const sheet = _openRequirementSheet();
  if (!sheet || sheet.getLastRow() <= 1) return [];

  try {
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const requirements = [];

    // Convertir filas a objetos, empezando desde fila 2 (índice 1)
    for (let i = 1; i < data.length; i++) {
      const requirement = {};
      
      // Mapear campos principales para el listado
      requirement.codigo_unico = data[i][REQUIREMENT_COLUMNS.CODIGO_UNICO] || '';
      requirement.estado_general = data[i][REQUIREMENT_COLUMNS.ESTADO_GENERAL] || '';
      requirement.aspecto_documento = data[i][REQUIREMENT_COLUMNS.ASPECTO_DOCUMENTO] || '';
      requirement.organismo_regulador = data[i][REQUIREMENT_COLUMNS.ORGANISMO_REGULADOR] || '';
      requirement.responsable_asignado = data[i][REQUIREMENT_COLUMNS.RESPONSABLE_ASIGNADO] || '';
      requirement.categoria = data[i][REQUIREMENT_COLUMNS.CATEGORIA] || '';
      requirement.tipo_documento = data[i][REQUIREMENT_COLUMNS.TIPO_DOCUMENTO] || '';
      requirement.numero_oficio = data[i][REQUIREMENT_COLUMNS.NRO_OFICIO] || '';
      requirement.area_responsable = data[i][REQUIREMENT_COLUMNS.AREA_RESPONSABLE] || '';
      requirement.necesita_soporte_sistemas = data[i][REQUIREMENT_COLUMNS.NECESITA_SOPORTE_SISTEMAS] || 'NO';
      
      // Formatear fechas
      const fechaRegistro = data[i][REQUIREMENT_COLUMNS.FECHA_REGISTRO];
      requirement.fecha_registro = fechaRegistro instanceof Date ? fechaRegistro.toISOString() : fechaRegistro;
      
      const fechaVencimientoReg = data[i][REQUIREMENT_COLUMNS.FECHA_VENCIMIENTO_REGULADOR];
      requirement.fecha_vencimiento_regulador = fechaVencimientoReg instanceof Date ? fechaVencimientoReg.toISOString() : fechaVencimientoReg;
      
      const fechaVencimientoInt = data[i][REQUIREMENT_COLUMNS.FECHA_VENCIMIENTO_INTERNO];
      requirement.fecha_vencimiento_interno = fechaVencimientoInt instanceof Date ? fechaVencimientoInt.toISOString() : fechaVencimientoInt;

      // Campos adicionales para filtros y acciones
      requirement.email_solicitante = data[i][REQUIREMENT_COLUMNS.EMAIL_SOLICITANTE] || '';
      requirement.usuario_creacion = data[i][REQUIREMENT_COLUMNS.USUARIO_CREACION] || '';
      requirement.fecha_ultima_modificacion = data[i][REQUIREMENT_COLUMNS.FECHA_ULTIMA_MODIFICACION];
      
      // Aplicar filtros si existen
      if (filters.estado && requirement.estado_general !== filters.estado) continue;
      if (filters.organismo && requirement.organismo_regulador !== filters.organismo) continue;
      if (filters.responsable && requirement.responsable_asignado.toLowerCase().indexOf(filters.responsable.toLowerCase()) === -1) continue;
      if (filters.busqueda && !searchInRequirement(requirement, filters.busqueda)) continue;

      requirements.push(requirement);
    }

    // Ordenar por fecha de registro descendente (más recientes primero)
    requirements.sort((a, b) => {
      const dateA = new Date(a.fecha_registro);
      const dateB = new Date(b.fecha_registro);
      return dateB - dateA;
    });

    logInfo(`Se recuperaron ${requirements.length} requerimientos de la hoja.`);
    return requirements;
  } catch (e) {
    logError('Error en getAllRequirementsFromSheet:', e, filters);
    return [];
  }
}

function searchInRequirement(requirement, searchTerm) {
  if (!searchTerm) return true;
  
  const term = searchTerm.toLowerCase();
  const searchableFields = [
    requirement.codigo_unico,
    requirement.aspecto_documento,
    requirement.organismo_regulador,
    requirement.responsable_asignado,
    requirement.numero_oficio,
    requirement.area_responsable
  ];
  
  return searchableFields.some(field => 
    field && field.toString().toLowerCase().indexOf(term) !== -1
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
    const tresDias = new Date(hoy.getTime() + (3 * 24 * 60 * 60 * 1000)); // 3 días desde hoy

    for (let i = 1; i < data.length; i++) {
      const estado = data[i][REQUIREMENT_COLUMNS.ESTADO_GENERAL] || '';
      const fechaVencimiento = data[i][REQUIREMENT_COLUMNS.FECHA_VENCIMIENTO_REGULADOR];
      
      stats.total++;
      
      if (estado === 'Terminado' || estado === 'Terminado con prórroga') {
        stats.terminados++;
      } else {
        stats.activos++;
        
        // Verificar vencimientos
        if (fechaVencimiento instanceof Date) {
          if (fechaVencimiento < hoy) {
            stats.vencidos++;
          } else if (fechaVencimiento <= tresDias) {
            stats.proximos_vencer++;
          }
        }
      }
    }

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
    
    for (let i = 1; i < data.length; i++) {
      const rowCodigoUnico = String(data[i][REQUIREMENT_COLUMNS.CODIGO_UNICO]).trim();
      if (rowCodigoUnico === String(codigoUnico).trim()) {
        sheet.deleteRow(i + 1); // +1 porque getRange usa índices basados en 1
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
