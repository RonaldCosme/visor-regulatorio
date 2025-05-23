/**
 * @file Server/Controllers/RequirementController.gs
 * @description Lógica de negocio para la gestión de Requerimientos.
 */

// Gestión de Carpetas en Drive
function _crearCarpetaRequerimientoEnDrive(codigoUnico, numeroOficio) {
  try {
    let nombreCarpeta = `REQ_${codigoUnico}`;
    if (numeroOficio && numeroOficio !== 'N/A') {
      nombreCarpeta += `_${numeroOficio.replace(/[^a-zA-Z0-9-_]/g, '')}`;
    }

    let parentFolder;
    if (DRIVE_PARENT_FOLDER_ID_REQUERIMIENTOS) {
      try {
        parentFolder = DriveApp.getFolderById(DRIVE_PARENT_FOLDER_ID_REQUERIMIENTOS);
      } catch (e) {
        logWarning(`No se pudo acceder a la carpeta padre: ${DRIVE_PARENT_FOLDER_ID_REQUERIMIENTOS}. Creando en raíz.`);
        parentFolder = DriveApp.getRootFolder();
      }
    } else {
      parentFolder = DriveApp.getRootFolder();
    }

    const nuevaCarpeta = parentFolder.createFolder(nombreCarpeta);
    logInfo(`Carpeta creada en Drive: ${nuevaCarpeta.getName()}, URL: ${nuevaCarpeta.getUrl()}`);
    return { success: true, carpetaId: nuevaCarpeta.getId(), carpetaUrl: nuevaCarpeta.getUrl() };
  } catch (error) {
    logError('Error al crear carpeta en Drive:', error, { codigoUnico, numeroOficio });
    return { success: false, message: 'Error al crear carpeta: ' + error.message, carpetaUrl: '' };
  }
}

// Envío de Correos de Notificación
function _enviarCorreoNotificacionRequerimiento(tipo, formData, estadoAnterior = null) {
  try {
    const currentUser = Session.getActiveUser().getEmail();
    let asunto = '';
    let cuerpoHtml = '';

    const destinatarios = [formData.email_solicitante];
    if (formData.copia_email) {
      const copias = formData.copia_email.split(',').map(e => e.trim()).filter(e => e);
      destinatarios.push(...copias);
    }
    const ccDestinatarios = destinatarios.slice(1).join(',');
    const urlHojaCalculo = SpreadsheetApp.openById(SPREADSHEET_ID).getUrl();

    switch (tipo) {
      case 'NUEVO_REQUERIMIENTO':
        asunto = `Nuevo Requerimiento: ${formData.codigo_unico} - ${formData.aspecto_documento || 'Sin Aspecto'}`;
        cuerpoHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #004481; color: white; padding: 20px; text-align: center;">
              <h2>Nuevo Requerimiento Registrado</h2>
            </div>
            <div style="padding: 20px; background: #f8f9fa;">
              <p>Estimado(a) <strong>${formData.responsable_asignado || 'Usuario'}</strong>,</p>
              <p>Se ha registrado un nuevo requerimiento en el Visor Regulatorio + con los siguientes detalles:</p>
              
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="background: #e9ecef;"><td style="padding: 8px; border: 1px solid #ddd;"><strong>Código:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formData.codigo_unico}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Tipo:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formData.tipo_documento}</td></tr>
                <tr style="background: #e9ecef;"><td style="padding: 8px; border: 1px solid #ddd;"><strong>Organismo:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formData.organismo_regulador}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Aspecto:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formData.aspecto_documento}</td></tr>
                <tr style="background: #e9ecef;"><td style="padding: 8px; border: 1px solid #ddd;"><strong>Vencimiento:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formData.fecha_vencimiento_regulador}</td></tr>
              </table>
              
              ${formData.url_carpeta_anexos ? `<p><a href="${formData.url_carpeta_anexos}" style="color: #004481;">📁 Ver Carpeta de Anexos</a></p>` : ''}
              
              <div style="margin: 20px 0; padding: 15px; background: #d1ecf1; border-left: 4px solid #004481;">
                <strong>Descripción:</strong><br>
                ${formData.descripcion_detallada.substring(0, 300)}${formData.descripcion_detallada.length > 300 ? '...' : ''}
              </div>
              
              <p>Registrado por: <strong>${currentUser}</strong></p>
              <p><a href="${urlHojaCalculo}" style="background: #004481; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">🔗 Acceder al Sistema</a></p>
              
              <hr style="margin: 30px 0;">
              <p style="color: #666; font-size: 12px;">Este es un mensaje automático del Sistema Visor Regulatorio + de BBVA Perú.</p>
            </div>
          </div>
        `;
        break;
        
      case 'ACTUALIZACION_REQUERIMIENTO':
        asunto = `Actualización: ${formData.codigo_unico} - Estado: ${formData.estado_general}`;
        cuerpoHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #004481; color: white; padding: 20px; text-align: center;">
              <h2>Requerimiento Actualizado</h2>
            </div>
            <div style="padding: 20px; background: #f8f9fa;">
              <p>Estimado(a) <strong>${formData.responsable_asignado || 'Usuario'}</strong>,</p>
              <p>El requerimiento <strong>${formData.codigo_unico}</strong> ha sido actualizado:</p>
              
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="background: #e9ecef;"><td style="padding: 8px; border: 1px solid #ddd;"><strong>Código:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formData.codigo_unico}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Estado Anterior:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${estadoAnterior || 'N/A'}</td></tr>
                <tr style="background: #fff3cd;"><td style="padding: 8px; border: 1px solid #ddd;"><strong>Nuevo Estado:</strong></td><td style="padding: 8px; border: 1px solid #ddd;"><strong>${formData.estado_general}</strong></td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Modificado por:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${currentUser}</td></tr>
                <tr style="background: #e9ecef;"><td style="padding: 8px; border: 1px solid #ddd;"><strong>Fecha:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss")}</td></tr>
              </table>
              
              ${formData.comentarios_generales ? `
                <div style="margin: 20px 0; padding: 15px; background: #d1ecf1; border-left: 4px solid #004481;">
                  <strong>Comentarios:</strong><br>${formData.comentarios_generales}
                </div>
              ` : ''}
              
              ${formData.url_carpeta_anexos ? `<p><a href="${formData.url_carpeta_anexos}" style="color: #004481;">📁 Ver Carpeta de Anexos</a></p>` : ''}
              
              <p><a href="${urlHojaCalculo}" style="background: #004481; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">🔗 Acceder al Sistema</a></p>
              
              <hr style="margin: 30px 0;">
              <p style="color: #666; font-size: 12px;">Este es un mensaje automático del Sistema Visor Regulatorio + de BBVA Perú.</p>
            </div>
          </div>
        `;
        break;
        
      default:
        logWarning('Tipo de notificación no reconocido:', tipo);
        return { success: false, message: 'Tipo de notificación no válido.' };
    }
    
    if (destinatarios[0]) {
      MailApp.sendEmail({
        to: destinatarios[0],
        cc: ccDestinatarios,
        subject: asunto,
        htmlBody: cuerpoHtml,
        name: 'Visor Regulatorio + BBVA Perú'
      });
      logInfo(`Correo '${tipo}' enviado para ${formData.codigo_unico} a ${destinatarios.join(', ')}`);
      return { success: true, message: 'Correo enviado correctamente.' };
    } else {
      logWarning(`No hay destinatario principal para ${formData.codigo_unico}`);
      return { success: false, message: 'No hay destinatario para el correo.' };
    }

  } catch (error) {
    logError(`Error enviando correo '${tipo}' para ${formData.codigo_unico}:`, error);
    return { success: false, message: 'Error al enviar correo: ' + error.message };
  }
}

// Validaciones de Datos
function _validateRequirementData(formData, isUpdate = false) {
  const errors = [];
  
  // Validaciones básicas
  if (!formData.codigo_unico && !isUpdate) {
    errors.push('Código único es requerido');
  }
  if (!formData.tipo_documento) {
    errors.push('Tipo de documento es requerido');
  }
  if (!formData.organismo_regulador) {
    errors.push('Organismo regulador es requerido');
  }
  if (!formData.aspecto_documento) {
    errors.push('Aspecto del documento es requerido');
  }
  if (!formData.responsable_asignado) {
    errors.push('Responsable asignado es requerido');
  }
  if (!formData.email_solicitante) {
    errors.push('Email solicitante es requerido');
  }
  if (!formData.area_responsable) {
    errors.push('Área responsable es requerida');
  }
  if (!formData.unidad_responsable) {
    errors.push('Unidad responsable es requerida');
  }
  if (!formData.fecha_notificacion) {
    errors.push('Fecha de notificación es requerida');
  }
  if (!formData.fecha_vencimiento_interno) {
    errors.push('Fecha de vencimiento interno es requerida');
  }
  if (!formData.fecha_vencimiento_regulador) {
    errors.push('Fecha de vencimiento regulador es requerida');
  }
  if (!formData.descripcion_detallada) {
    errors.push('Descripción detallada es requerida');
  }
  
  // Validaciones específicas
  if (formData.tipo_documento === 'Oficio' && !formData.numero_oficio) {
    errors.push('Número de oficio es requerido para documentos tipo Oficio');
  }
  
  // Validar email
  if (formData.email_solicitante && !/\S+@\S+\.\S+/.test(formData.email_solicitante)) {
    errors.push('Formato de email solicitante no válido');
  }
  
  // Validaciones para modo edición
  if (isUpdate) {
    const terminadoStates = ['Terminado', 'Terminado con prórroga'];
    if (terminadoStates.includes(formData.estado_general) && !formData.fecha_entrega_banco) {
      errors.push('Fecha de entrega al regulador es requerida para estados terminados');
    }
    
    if (formData.necesita_prorroga === 'SI') {
      if (!formData.fecha_prorroga) {
        errors.push('Fecha de prórroga es requerida');
      }
      if (!formData.motivo_prorroga) {
        errors.push('Motivo de prórroga es requerido');
      }
    }
  }
  
  return errors;
}

// Funciones Principales del Controlador

function addRequirement(formData) {
  logInfo('Agregando nuevo requerimiento:', formData.codigo_unico);
  const currentUser = Session.getActiveUser().getEmail();
  formData.usuario_creacion = currentUser;

  // Validar datos
  const validationErrors = _validateRequirementData(formData, false);
  if (validationErrors.length > 0) {
    logWarning('Datos inválidos para crear requerimiento:', validationErrors);
    return { success: false, message: 'Errores de validación: ' + validationErrors.join(', ') };
  }

  try {
    // Crear carpeta en Drive
    const resultadoCarpeta = _crearCarpetaRequerimientoEnDrive(formData.codigo_unico, formData.numero_oficio);
    if (resultadoCarpeta.success) {
      formData.url_carpeta_anexos = resultadoCarpeta.carpetaUrl;
    } else {
      logWarning(`Carpeta no creada para ${formData.codigo_unico}: ${resultadoCarpeta.message}`);
      formData.url_carpeta_anexos = '';
    }

    // Guardar en hoja
    const requirementGuardado = createRequirementInSheet(formData);
    if (!requirementGuardado) {
      logError('Error guardando requerimiento en hoja:', formData.codigo_unico);
      return { success: false, message: 'Error al guardar el requerimiento en la base de datos.' };
    }

    // Enviar notificación
    const resultadoEmail = _enviarCorreoNotificacionRequerimiento('NUEVO_REQUERIMIENTO', requirementGuardado);
    if (!resultadoEmail.success) {
      logWarning(`Requerimiento ${formData.codigo_unico} guardado, pero falló correo: ${resultadoEmail.message}`);
    }

    logInfo('Requerimiento agregado exitosamente:', formData.codigo_unico);
    return { 
      success: true, 
      message: 'Requerimiento registrado exitosamente.' + (resultadoCarpeta.success ? ' Carpeta de anexos creada.' : ''), 
      data: requirementGuardado 
    };
    
  } catch (error) {
    logError('Error en addRequirement:', error, formData);
    return { success: false, message: 'Error interno al crear el requerimiento.' };
  }
}

function getRequirementForEdit(codigoUnico) {
  logInfo('Obteniendo requerimiento para edición:', codigoUnico);
  
  if (!codigoUnico || typeof codigoUnico !== 'string') {
    logWarning('Código único inválido para obtener requerimiento:', codigoUnico);
    return { success: false, message: 'Código único requerido y debe ser válido.' };
  }
  
  try {
    const requirement = getRequirementByCodigoUnico(codigoUnico);
    if (requirement) {
      logInfo(`Requerimiento ${codigoUnico} obtenido para edición exitosamente`);
      return { success: true, data: requirement };
    } else {
      logWarning(`Requerimiento ${codigoUnico} no encontrado`);
      return { success: false, message: `Requerimiento con código ${codigoUnico} no encontrado.` };
    }
  } catch (error) {
    logError('Error en getRequirementForEdit:', error, { codigoUnico });
    return { success: false, message: 'Error interno al obtener el requerimiento.' };
  }
}

function updateExistingRequirement(formData) {
  const codigoUnico = formData.codigo_unico_hidden || formData.codigo_unico;
  logInfo('Actualizando requerimiento:', codigoUnico);

  if (!codigoUnico) {
    logWarning('Código único faltante para actualizar:', formData);
    return { success: false, message: 'Código único requerido para actualizar.' };
  }
  
  // Validar datos
  const validationErrors = _validateRequirementData(formData, true);
  if (validationErrors.length > 0) {
    logWarning('Datos inválidos para actualizar requerimiento:', validationErrors);
    return { success: false, message: 'Errores de validación: ' + validationErrors.join(', ') };
  }
  
  try {
    // Obtener estado anterior para historial
    const requirementOriginal = getRequirementByCodigoUnico(codigoUnico);
    if (!requirementOriginal) {
      return { success: false, message: `Requerimiento ${codigoUnico} no encontrado para actualizar.` };
    }
    
    const estadoAnterior = requirementOriginal.estado_general;
    formData.usuario_ultima_modificacion = Session.getActiveUser().getEmail();

    // Actualizar en hoja
    const exitoUpdate = updateRequirementInSheet(codigoUnico, formData);
    if (!exitoUpdate) {
      logError(`Error actualizando requerimiento ${codigoUnico} en hoja`);
      return { success: false, message: 'Error al actualizar el requerimiento en la base de datos.' };
    }

    // Obtener datos actualizados para correo
    const requirementActualizado = getRequirementByCodigoUnico(codigoUnico);
    
    // Enviar notificación si cambió estado significativamente
    const estadosImportantes = ['Terminado', 'Terminado con prórroga', 'Cancelado', 'Observado'];
    if (requirementActualizado && 
        (estadoAnterior !== requirementActualizado.estado_general && 
         estadosImportantes.includes(requirementActualizado.estado_general))) {
      _enviarCorreoNotificacionRequerimiento('ACTUALIZACION_REQUERIMIENTO', requirementActualizado, estadoAnterior);
    }
    
    logInfo(`Requerimiento ${codigoUnico} actualizado exitosamente`);
    return { 
      success: true, 
      message: 'Requerimiento actualizado correctamente.', 
      data: requirementActualizado 
    };
    
  } catch (error) {
    logError('Error en updateExistingRequirement:', error, { codigoUnico });
    return { success: false, message: 'Error interno al actualizar el requerimiento.' };
  }
}

function getAssignableUsersForRequirements() {
  try {
    logInfo('Obteniendo usuarios asignables para requerimientos');
    
    // Obtener valores únicos del campo RESPONSABLE_ASIGNADO
    const asignados = getUniqueValuesForFieldFromRequirements('RESPONSABLE_ASIGNADO');
    
    // Agregar algunos valores por defecto si la lista está vacía
    if (asignados.length === 0) {
      const defaultAssignables = [
        'Analista Regulatorio',
        'Especialista Senior',
        'Coordinador de Área',
        'Jefe de Área'
      ];
      asignados.push(...defaultAssignables);
    }
    
    logInfo(`Se obtuvieron ${asignados.length} usuarios asignables`);
    return { success: true, data: asignados };

  } catch (error) {
    logError('Error obteniendo usuarios asignables:', error);
    return { success: false, message: 'Error al obtener lista de asignables.', data: [] };
  }
}

function getAllRequirementsForList(filters = {}) {
  logInfo('Obteniendo listado de requerimientos con filtros:', filters);
  
  try {
    const requirements = getAllRequirementsFromSheet(filters);
    if (requirements !== null) {
      logInfo(`Se encontraron ${requirements.length} requerimientos`);
      return { 
        success: true, 
        data: requirements,
        total: requirements.length,
        message: `Se encontraron ${requirements.length} requerimientos.`
      };
    } else {
      logError('Error obteniendo requerimientos de la hoja');
      return { success: false, message: 'Error al obtener los requerimientos.', data: [] };
    }
  } catch (error) {
    logError('Error en getAllRequirementsForList:', error, filters);
    return { success: false, message: 'Error interno al obtener requerimientos.', data: [] };
  }
}

function getRequirementsSummaryStats() {
  logInfo('Calculando estadísticas de requerimientos');
  
  try {
    const stats = calculateRequirementStats();
    logInfo('Estadísticas calculadas:', stats);
    return { success: true, data: stats };
  } catch (error) {
    logError('Error calculando estadísticas:', error);
    return { 
      success: false, 
      message: 'Error al calcular estadísticas.',
      data: { total: 0, activos: 0, terminados: 0, vencidos: 0, proximos_vencer: 0 }
    };
  }
}

function deleteRequirement(codigoUnico) {
  logInfo('Intentando eliminar requerimiento:', codigoUnico);
  const currentUser = Session.getActiveUser().getEmail();
  
  if (!codigoUnico || typeof codigoUnico !== 'string') {
    return { success: false, message: 'Código único requerido y debe ser válido.' };
  }

  try {
    // Verificar que existe
    const requirement = getRequirementByCodigoUnico(codigoUnico);
    if (!requirement) {
      return { success: false, message: `Requerimiento ${codigoUnico} no encontrado.` };
    }

    // Solo permitir eliminar requerimientos en estados específicos
    const estadosEliminables = ['Ingresado', 'Cancelado'];
    if (!estadosEliminables.includes(requirement.estado_general)) {
      return { 
        success: false, 
        message: `No se puede eliminar. Estado actual: ${requirement.estado_general}. Solo se pueden eliminar requerimientos en estado Ingresado o Cancelado.` 
      };
    }

    const deleteResult = deleteRequirementFromSheet(codigoUnico);
    if (deleteResult) {
      logInfo(`Requerimiento ${codigoUnico} eliminado por ${currentUser}`);
      return { success: true, message: 'Requerimiento eliminado correctamente.' };
    } else {
      return { success: false, message: 'Error al eliminar el requerimiento de la base de datos.' };
    }
  } catch (error) {
    logError('Error en deleteRequirement:', error, { codigoUnico });
    return { success: false, message: 'Error interno al eliminar requerimiento.' };
  }
}