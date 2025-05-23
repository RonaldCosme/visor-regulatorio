/**
 * @file Server/API_Endpoints.gs
 * @description Funciones globales expuestas a google.script.run para ser llamadas desde el cliente.
 */

function login(credentials) {
  if (!credentials || typeof credentials.email !== 'string' || typeof credentials.password !== 'string') {
    return { success: false, message: 'Formato de credenciales inválido.' };
  }
  return loginUser(credentials);
}

function register(userData) {
  if (!userData || typeof userData.name !== 'string' ||
      typeof userData.email !== 'string' || typeof userData.password !== 'string') {
    logWarning('Intento de registro con datos de usuario malformados o faltantes en API_Endpoints:', userData);
    return { success: false, message: 'Formato de datos de usuario inválido para registro.' };
  }
  return registerUser(userData);
}

function getUserDataForAutocomplete(nombreCompleto) {
  if (!nombreCompleto || typeof nombreCompleto !== 'string' || nombreCompleto.trim() === '') {
    return { success: false, message: 'Nombre para autocompletar no puede estar vacío.' };
  }
  try {
    const userData = findUserDataByName(nombreCompleto);
    if (userData) {
      return { success: true, data: userData };
    } else {
      return { success: false, message: 'No se encontraron datos para el nombre proporcionado.' };
    }
  } catch (error) {
    logError('Error en API getUserDataForAutocomplete:', error, { nombreCompleto });
    return { success: false, message: 'Error interno al buscar datos para autocompletar.' };
  }
}

// --- Endpoints para Gestión de Usuarios (Admin) ---
function getAllUsers_API() {
  try {
    const result = getUsersForAdmin();
    if (result === null || typeof result === 'undefined') {
        logError('getAllUsers_API: getUsersForAdmin devolvió null o undefined inesperadamente.');
        return { success: false, message: 'Error inesperado del servidor al procesar la solicitud de usuarios.', users: [] };
    }
    return result;
  } catch (e) {
    logError('Error crítico no manejado en getAllUsers_API:', e);
    return { success: false, message: 'Error crítico en el servidor al obtener usuarios. Revise los logs del servidor de Apps Script.', users: [] };
  }
}

function updateUserRole_API(userId, newRole) {
  try {
    const result = changeUserRoleAdmin(userId, newRole);
     if (result === null || typeof result === 'undefined') {
        logError('updateUserRole_API: changeUserRoleAdmin devolvió null o undefined inesperadamente.');
        return { success: false, message: 'Error inesperado del servidor al actualizar el rol.' };
    }
    return result;
  } catch (e) {
    logError('Error crítico no manejado en updateUserRole_API:', e, {userId, newRole});
    return { success: false, message: 'Error crítico en el servidor al actualizar el rol. Revise los logs del servidor de Apps Script.' };
  }
}


// --- Endpoints para Módulo de Requerimientos ---

function createRequirement_API(formData) {
  try {
    logInfo("API_Endpoints: createRequirement_API llamada con:", formData);
    const result = addRequirement(formData); 
    if (typeof result === 'undefined') {
        logError('createRequirement_API: addRequirement devolvió undefined inesperadamente.');
        return { success: false, message: 'Error inesperado del servidor al crear el requerimiento.' };
    }
    return result;
  } catch (e) {
    logError('Error crítico en createRequirement_API:', e, formData);
    return { success: false, message: 'Error crítico en el servidor al crear el requerimiento.' };
  }
}

function getRequirementById_API(codigoUnico) {
  try {
    logInfo("API_Endpoints: getRequirementById_API llamada con:", codigoUnico);
    const result = getRequirementForEdit(codigoUnico); 
    if (typeof result === 'undefined') {
        logError('getRequirementById_API: getRequirementForEdit devolvió undefined inesperadamente.');
        return { success: false, message: 'Error inesperado del servidor al obtener el requerimiento.' };
    }
    return result;
  } catch (e) {
    logError('Error crítico en getRequirementById_API:', e, { codigoUnico });
    return { success: false, message: 'Error crítico en el servidor al obtener el requerimiento.' };
  }
}

function updateRequirement_API(formData) {
  try {
    logInfo("API_Endpoints: updateRequirement_API llamada con:", formData);
    const result = updateExistingRequirement(formData); 
    if (typeof result === 'undefined') {
        logError('updateRequirement_API: updateExistingRequirement devolvió undefined inesperadamente.');
        return { success: false, message: 'Error inesperado del servidor al actualizar el requerimiento.' };
    }
    return result;
  } catch (e) {
    logError('Error crítico en updateRequirement_API:', e, formData);
    return { success: false, message: 'Error crítico en el servidor al actualizar el requerimiento.' };
  }
}

function getAssignableUsers_API() {
    try {
        logInfo("API_Endpoints: getAssignableUsers_API llamada.");
        const result = getAssignableUsersForRequirements();
        if (typeof result === 'undefined') {
            logError('getAssignableUsers_API: getAssignableUsersForRequirements devolvió undefined inesperadamente.');
            return { success: false, message: 'Error inesperado del servidor al obtener asignables.', data: [] };
        }
        return result;
    } catch (e) {
        logError('Error crítico en getAssignableUsers_API:', e);
        return { success: false, message: 'Error crítico en el servidor al obtener asignables.', data: [] };
    }
}

function getRequirementsList_API(filters = {}) {
  try {
    logInfo("API_Endpoints: getRequirementsList_API llamada con filtros:", filters);
    const result = getAllRequirementsForList(filters); // Esto debe devolver {success, data, message, total}
    
    // Verificación adicional para asegurar que el resultado no sea undefined
    if (typeof result === 'undefined') {
        logError('getRequirementsList_API: getAllRequirementsForList devolvió undefined inesperadamente.');
        return { success: false, message: 'Error inesperado del servidor al procesar la solicitud de lista de requerimientos.', data: [], total: 0 };
    }
    // Asegurar que data siempre sea un array
    if (result && typeof result.data === 'undefined') {
        logWarning('getRequirementsList_API: El resultado de getAllRequirementsForList no contenía una propiedad data. Inicializando a array vacío.', result);
        result.data = [];
    }
     if (result && typeof result.total === 'undefined') {
        result.total = result.data ? result.data.length : 0;
    }

    return result;
  } catch (e) {
    logError('Error crítico en getRequirementsList_API:', e, filters);
    return { success: false, message: 'Error crítico en el servidor al obtener la lista de requerimientos.', data: [], total:0 };
  }
}

function getRequirementsStats_API() {
  try {
    logInfo("API_Endpoints: getRequirementsStats_API llamada.");
    const result = getRequirementsSummaryStats();
    if (typeof result === 'undefined') {
        logError('getRequirementsStats_API: getRequirementsSummaryStats devolvió undefined inesperadamente.');
        return { success: false, message: 'Error inesperado del servidor al obtener estadísticas.', data: {} };
    }
    return result;
  } catch (e) {
    logError('Error crítico en getRequirementsStats_API:', e);
    return { success: false, message: 'Error crítico en el servidor al obtener estadísticas.', data: {} };
  }
}

function deleteRequirement_API(codigoUnico) {
  try {
    logInfo("API_Endpoints: deleteRequirement_API llamada con:", codigoUnico);
    const result = deleteRequirement(codigoUnico);
    if (typeof result === 'undefined') {
        logError('deleteRequirement_API: deleteRequirement devolvió undefined inesperadamente.');
        return { success: false, message: 'Error inesperado del servidor al eliminar el requerimiento.' };
    }
    return result;
  } catch (e) {
    logError('Error crítico en deleteRequirement_API:', e, { codigoUnico });
    return { success: false, message: 'Error crítico en el servidor al eliminar el requerimiento.' };
  }
}
