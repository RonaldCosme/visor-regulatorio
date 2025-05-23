/**
 * @file Server/Controllers/RequirementController.gs
 * @description Lógica de negocio para la gestión de Requerimientos.
 */

// --- Gestión de Carpetas en Drive ---
function _crearCarpetaRequerimientoEnDrive(codigoUnico, numeroOficio) {
  try {
    let nombreCarpeta = `REQ_${codigoUnico}`;
    if (numeroOficio && numeroOficio !== 'N/A') {
      nombreCarpeta += `_${numeroOficio.replace(/[^a-zA-Z0-9-_]/g, '')}`; // Sanitizar nombre de oficio
    }

    let parentFolder;
    if (DRIVE_PARENT_FOLDER_ID_REQUERIMIENTOS) {
      try {
        parentFolder = DriveApp.getFolderById(DRIVE_PARENT_FOLDER_ID_REQUERIMIENTOS);
      } catch (e) {
        logWarning(`No se pudo acceder a la carpeta padre con ID: ${DRIVE_PARENT_FOLDER_ID_REQUERIMIENTOS}. Se creará en la raíz. Error: ${e.message}`);
        parentFolder = DriveApp.getRootFolder();
      }
    } else {
      parentFolder = DriveApp.getRootFolder();
    }

    const nuevaCarpeta = parentFolder.createFolder(nombreCarpeta);
    // Opcional: Configurar permisos si es necesario (ej. hacerlo público o compartir con usuarios específicos)
    // nuevaCarpeta.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT); 
    logInfo(`Carpeta creada en Drive: ${nuevaCarpeta.getName()}, URL: ${nuevaCarpeta.getUrl()}`);
    return { success: true, carpetaId: nuevaCarpeta.getId(), carpetaUrl: nuevaCarpeta.getUrl() };
  } catch (error) {
    logError('Error al crear carpeta en Drive para requerimiento:', error, { codigoUnico, numeroOficio });
    return { success: false, message: 'Error al crear carpeta: ' + error.message, carpetaUrl: '' };
  }
}

// --- Lógica de Correo (Simplificada, adaptar según EmailService.gs si existe) ---
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
    const ccDestinatarios = destinatarios.slice(1).join(','); // El primero es el TO

    const urlHojaCalculo = SpreadsheetApp.openById(SPREADSHEET_ID).getUrl();


    switch (tipo) {
      case 'NUEVO_REQUERIMIENTO':
        asunto = `Nuevo Requerimiento Registrado: ${formData.codigo_unico} - ${formData.aspecto_documento || 'Sin Aspecto'}`;
        cuerpoHtml = `
          <p>Estimado(a) ${formData.responsable_asignado || 'Usuario'},</p>
          <p>Se ha registrado un nuevo requerimiento en el Visor Regulatorio + con los siguientes detalles:</p>
          <ul>
            <li><strong>Código Único:</strong> ${formData.codigo_unico}</li>
            <li><strong>Tipo Documento:</strong> ${formData.tipo_documento}</li>
            <li><strong>Número Oficio:</strong> ${formData.numero_oficio || 'N/A'}</li>
            <li><strong>Organismo Regulador:</strong> ${formData.organismo_regulador}</li>
            <li><strong>Aspecto:</strong> ${formData.aspecto_documento}</li>
            <li><strong>Descripción:</strong> ${formData.descripcion_detallada.substring(0,200)}...</li>
            <li><strong>Fecha Notificación Regulador:</strong> ${formData.fecha_notificacion}</li>
            <li><strong>Fecha Vencimiento Interno:</strong> ${formData.fecha_vencimiento_interno}</li>
            <li><strong>Fecha Vencimiento Regulador:</strong> ${formData.fecha_vencimiento_regulador}</li>
            <li><strong>Registrado por:</strong> ${currentUser}</li>
          </ul>
          ${formData.url_carpeta_anexos ? `<p>Puede acceder a la carpeta de anexos aquí: <a href="${formData.url_carpeta_anexos}">Ver Carpeta</a></p>` : ''}
          <p>Puede revisar el detalle completo en el <a href="${urlHojaCalculo}">Visor Regulatorio +</a>.</p>
          <p>Saludos,<br>Sistema Visor Regulatorio +</p>
        `;
        break;
      case 'ACTUALIZACION_REQUERIMIENTO':
        asunto = `Actualización de Requerimiento: ${formData.codigo_unico} - Estado: ${formData.estado_general}`;
         cuerpoHtml = `
          <p>Estimado(a) ${formData.responsable_asignado || 'Usuario'},</p>
          <p>El requerimiento <strong>${formData.codigo_unico}</strong> (${formData.aspecto_documento || 'Sin Aspecto'}) ha sido actualizado:</p>
          <ul>
            <li><strong>Código Único:</strong> ${formData.codigo_unico}</li>
            <li><strong>Estado Anterior:</strong> ${estadoAnterior || 'N/A'}</li>
            <li><strong>Nuevo Estado:</strong> ${formData.estado_general}</li>
            <li><strong>Modificado por:</strong> ${currentUser}</li>
            <li><strong>Fecha de Modificación:</strong> ${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss")}</li>
          </ul>
          <p><strong>Comentarios Adicionales (si aplica):</strong> ${formData.comentarios_generales || 'Ninguno'}</p>
          ${formData.url_carpeta_anexos ? `<p>Puede acceder a la carpeta de anexos aquí: <a href="${formData.url_carpeta_anexos}">Ver Carpeta</a></p>` : ''}
          <p>Puede revisar el detalle completo en el <a href="${urlHojaCalculo}">Visor Regulatorio +</a>.</p>
          <p>Saludos,<br>Sistema Visor Regulatorio +</p>
        `;
        break;
      default:
        logWarning('Tipo de notificación no reconocido:', tipo);
        return { success: false, message: 'Tipo de notificación no válido.' };
    }
    
    if (destinatarios[0]) { // Solo enviar si hay un destinatario principal
        MailApp.sendEmail({
            to: destinatarios[0],
            cc: ccDestinatarios,
            subject: asunto,
            htmlBody: cuerpoHtml,
            name: 'Visor Regulatorio + BBVA Perú'
        });
        logInfo(`Correo de notificación '${tipo}' enviado para ${formData.codigo_unico} a ${destinatarios.join(', ')}`);
        return { success: true, message: 'Correo enviado.' };
    } else {
        logWarning(`No se pudo enviar correo para ${formData.codigo_unico}, no hay destinatario principal.`);
        return { success: false, message: 'No hay destinatario principal para el correo.' };
    }

  } catch (error) {
    logError(`Error al enviar correo de notificación tipo '${tipo}' para ${formData.codigo_unico}:`, error);
    return { success: false, message: 'Error al enviar correo: ' + error.message };
  }
}


// --- Funciones Principales del Controlador ---

function addRequirement(formData) {
  logInfo('Intentando agregar nuevo requerimiento:', formData);
  const currentUser = Session.getActiveUser().getEmail();
  formData.usuario_creacion = currentUser;

  // Validaciones básicas (se pueden expandir)
  if (!formData.codigo_unico || !formData.tipo_documento || !formData.organismo_regulador || !formData.fecha_notificacion || !formData.responsable_asignado || !formData.email_solicitante) {
    logWarning('Datos incompletos para crear requerimiento:', formData);
    return { success: false, message: 'Faltan campos obligatorios para crear el requerimiento.' };
  }

  // 1. Crear carpeta en Drive
  const resultadoCarpeta = _crearCarpetaRequerimientoEnDrive(formData.codigo_unico, formData.numero_oficio);
  if (resultadoCarpeta.success) {
    formData.url_carpeta_anexos = resultadoCarpeta.carpetaUrl;
  } else {
    // Decidir si continuar sin carpeta o devolver error. Por ahora, continuamos y logueamos.
    logWarning(`No se pudo crear la carpeta en Drive para ${formData.codigo_unico}. Mensaje: ${resultadoCarpeta.message}`);
    formData.url_carpeta_anexos = ''; // Opcional: registrar el error en la hoja
  }

  // 2. Guardar en Google Sheet
  const requirementGuardado = createRequirementInSheet(formData);
  if (!requirementGuardado) {
    logError('Fallo al guardar el requerimiento en la hoja de cálculo.', formData);
    // Opcional: intentar eliminar la carpeta si se creó y el guardado en hoja falló.
    return { success: false, message: 'Error al guardar el requerimiento en la base de datos.' };
  }

  // 3. Enviar correo de notificación
  const resultadoEmail = _enviarCorreoNotificacionRequerimiento('NUEVO_REQUERIMIENTO', requirementGuardado);
  if (!resultadoEmail.success) {
    // Loguear advertencia pero no fallar la operación completa por el correo
    logWarning(`Requerimiento ${formData.codigo_unico} guardado, pero falló el envío de correo: ${resultadoEmail.message}`);
  }
  
  // 4. Registrar datos para autocompletado (si es necesario)
  // registrarDatosFormularioParaAutocompletado(formData); // Descomentar y adaptar si se usa la función del ejemplo

  logInfo('Requerimiento agregado exitosamente:', formData.codigo_unico);
  return { success: true, message: 'Requerimiento registrado exitosamente.', data: requirementGuardado };
}

function getRequirementForEdit(codigoUnico) {
  logInfo('Obteniendo datos del requerimiento para edición:', codigoUnico);
  if (!codigoUnico) {
    return { success: false, message: 'Se requiere Código Único para obtener el requerimiento.' };
  }
  const requirement = getRequirementByCodigoUnico(codigoUnico);
  if (requirement) {
    return { success: true, data: requirement };
  } else {
    return { success: false, message: `Requerimiento con Código Único ${codigoUnico} no encontrado.` };
  }
}

function updateExistingRequirement(formData) {
  logInfo('Intentando actualizar requerimiento:', formData.codigo_unico_hidden || formData.codigo_unico); // Ajustar según cómo se envíe el ID
  const codigoUnico = formData.codigo_unico_hidden || formData.codigo_unico; // El ID no debería cambiar

  if (!codigoUnico) {
    logWarning('Falta Código Único para actualizar requerimiento.', formData);
    return { success: false, message: 'Falta el Código Único para actualizar.' };
  }
  
  const requirementOriginal = getRequirementByCodigoUnico(codigoUnico);
   if (!requirementOriginal) {
    return { success: false, message: `Requerimiento con Código Único ${codigoUnico} no encontrado para actualizar.` };
  }
  const estadoAnterior = requirementOriginal.estado_general;


  // Actualizar en Google Sheet
  const exitoUpdate = updateRequirementInSheet(codigoUnico, formData);
  if (!exitoUpdate) {
    logError(`Fallo al actualizar el requerimiento ${codigoUnico} en la hoja.`);
    return { success: false, message: 'Error al actualizar el requerimiento en la base de datos.' };
  }

  // Enviar correo de notificación si el estado cambió o si se considera necesario
  // Para el correo, necesitamos el objeto completo actualizado.
  const requirementActualizado = getRequirementByCodigoUnico(codigoUnico); // Obtener datos actualizados
  if (requirementActualizado && (estadoAnterior !== requirementActualizado.estado_general || formData.enviarNotificacionManual)) { // formData.enviarNotificacionManual es un ejemplo
     _enviarCorreoNotificacionRequerimiento('ACTUALIZACION_REQUERIMIENTO', requirementActualizado, estadoAnterior);
  }
  
  logInfo(`Requerimiento ${codigoUnico} actualizado exitosamente.`);
  return { success: true, message: 'Requerimiento actualizado exitosamente.', data: requirementActualizado };
}


function getAssignableUsersForRequirements() {
  // Esta función debería obtener una lista de usuarios/nombres que pueden ser asignados a requerimientos.
  // Podría venir de UserSheet.gs o de DataAreaUnidadSheet.gs, o de la misma RequirementSheet.gs (valores únicos)
  try {
    // Ejemplo: obtener de UserSheet.gs (todos los usuarios)
    // const users = getAllUsers(); // Asumiendo que getAllUsers() existe y devuelve { name: '...', email: '...' }
    // return { success: true, data: users.map(u => u.name) };

    // Ejemplo: obtener valores únicos del campo RESPONSABLE_ASIGNADO de RequirementSheet
    const asignados = getUniqueValuesForFieldFromRequirements('RESPONSABLE_ASIGNADO');
    return { success: true, data: asignados };

  } catch (error) {
    logError('Error al obtener usuarios asignables para requerimientos:', error);
    return { success: false, message: 'Error al obtener lista de asignables.', data: [] };
  }
}

// Agregar estas funciones al final de RequirementController.js

function getAllRequirementsForList(filters = {}) {
  logInfo('Obteniendo todos los requerimientos para listado:', filters);
  try {
    const requirements = getAllRequirementsFromSheet(filters);
    if (requirements) {
      return { 
        success: true, 
        data: requirements,
        total: requirements.length,
        message: `Se encontraron ${requirements.length} requerimientos.`
      };
    } else {
      return { success: false, message: 'Error al obtener los requerimientos.', data: [] };
    }
  } catch (error) {
    logError('Error en getAllRequirementsForList:', error, filters);
    return { success: false, message: 'Error interno al obtener requerimientos.', data: [] };
  }
}

function getRequirementsSummaryStats() {
  logInfo('Obteniendo estadísticas resumen de requerimientos');
  try {
    const stats = calculateRequirementStats();
    return { success: true, data: stats };
  } catch (error) {
    logError('Error en getRequirementsSummaryStats:', error);
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
  
  if (!codigoUnico) {
    return { success: false, message: 'Se requiere Código Único para eliminar.' };
  }

  try {
    const requirement = getRequirementByCodigoUnico(codigoUnico);
    if (!requirement) {
      return { success: false, message: `Requerimiento ${codigoUnico} no encontrado.` };
    }

    const deleteResult = deleteRequirementFromSheet(codigoUnico);
    if (deleteResult) {
      logInfo(`Requerimiento ${codigoUnico} eliminado por ${currentUser}`);
      return { success: true, message: 'Requerimiento eliminado exitosamente.' };
    } else {
      return { success: false, message: 'Error al eliminar el requerimiento.' };
    }
  } catch (error) {
    logError('Error en deleteRequirement:', error, { codigoUnico });
    return { success: false, message: 'Error interno al eliminar requerimiento.' };
  }
}
