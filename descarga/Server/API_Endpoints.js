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
        return { success: false, message: 'Error inesperado del servidor al procesar la solicitud de usuarios.' };
    }
    return result;
  } catch (e) {
    logError('Error crítico no manejado en getAllUsers_API:', e);
    return { success: false, message: 'Error crítico en el servidor al obtener usuarios. Revise los logs del servidor de Apps Script.' };
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

/**
 * API para crear un nuevo requerimiento.
 * @param {object} formData Datos del formulario del requerimiento.
 * @return {object} Resultado de la operación.
 */
function createRequirement_API(formData) {
  try {
    // Aquí se podrían añadir validaciones de permisos si es necesario,
    // aunque la lógica de negocio principal está en RequirementController.
    logInfo("API_Endpoints: createRequirement_API llamada con:", formData);
    const result = addRequirement(formData); // Llama a la función en RequirementController.gs
    return result;
  } catch (e) {
    logError('Error crítico en createRequirement_API:', e, formData);
    return { success: false, message: 'Error crítico en el servidor al crear el requerimiento.' };
  }
}

/**
 * API para obtener los detalles de un requerimiento para edición.
 * @param {string} codigoUnico El código único del requerimiento.
 * @return {object} Detalles del requerimiento o un objeto de error.
 */
function getRequirementById_API(codigoUnico) {
  try {
    logInfo("API_Endpoints: getRequirementById_API llamada con:", codigoUnico);
    const result = getRequirementForEdit(codigoUnico); // Llama a la función en RequirementController.gs
    return result;
  } catch (e) {
    logError('Error crítico en getRequirementById_API:', e, { codigoUnico });
    return { success: false, message: 'Error crítico en el servidor al obtener el requerimiento.' };
  }
}

/**
 * API para actualizar un requerimiento existente.
 * @param {object} formData Datos del formulario del requerimiento, debe incluir el identificador (ej. codigo_unico).
 * @return {object} Resultado de la operación.
 */
function updateRequirement_API(formData) {
  try {
    logInfo("API_Endpoints: updateRequirement_API llamada con:", formData);
    const result = updateExistingRequirement(formData); // Llama a la función en RequirementController.gs
    return result;
  } catch (e) {
    logError('Error crítico en updateRequirement_API:', e, formData);
    return { success: false, message: 'Error crítico en el servidor al actualizar el requerimiento.' };
  }
}

/**
 * API para obtener la lista de usuarios/nombres asignables a requerimientos.
 * @return {object} Lista de asignables o un objeto de error.
 */
function getAssignableUsers_API() {
    try {
        logInfo("API_Endpoints: getAssignableUsers_API llamada.");
        return getAssignableUsersForRequirements(); // Llama a la función en RequirementController.gs
    } catch (e) {
        logError('Error crítico en getAssignableUsers_API:', e);
        return { success: false, message: 'Error crítico en el servidor al obtener asignables.', data: [] };
    }
}

// Aquí se añadirían más funciones para otros módulos (Visitas, Recomendaciones, etc.)
// Agregar estos endpoints al final de API_Endpoints.js

/**
 * API para obtener listado de requerimientos con filtros opcionales.
 * @param {object} filters Filtros opcionales para la búsqueda.
 * @return {object} Lista de requerimientos o un objeto de error.
 */
function getRequirementsList_API(filters = {}) {
  try {
    logInfo("API_Endpoints: getRequirementsList_API llamada con filtros:", filters);
    const result = getAllRequirementsForList(filters);
    return result;
  } catch (e) {
    logError('Error crítico en getRequirementsList_API:', e, filters);
    return { success: false, message: 'Error crítico en el servidor al obtener la lista de requerimientos.', data: [] };
  }
}

/**
 * API para obtener estadísticas resumen de requerimientos.
 * @return {object} Estadísticas de requerimientos.
 */
function getRequirementsStats_API() {
  try {
    logInfo("API_Endpoints: getRequirementsStats_API llamada.");
    const result = getRequirementsSummaryStats();
    return result;
  } catch (e) {
    logError('Error crítico en getRequirementsStats_API:', e);
    return { success: false, message: 'Error crítico en el servidor al obtener estadísticas.', data: {} };
  }
}

/**
 * API para eliminar un requerimiento.
 * @param {string} codigoUnico El código único del requerimiento a eliminar.
 * @return {object} Resultado de la operación de eliminación.
 */
function deleteRequirement_API(codigoUnico) {
  try {
    logInfo("API_Endpoints: deleteRequirement_API llamada con:", codigoUnico);
    const result = deleteRequirement(codigoUnico);
    return result;
  } catch (e) {
    logError('Error crítico en deleteRequirement_API:', e, { codigoUnico });
    return { success: false, message: 'Error crítico en el servidor al eliminar el requerimiento.' };
  }
}
