/**
 * @file Server/Controllers/UserController.gs
 * @description Lógica de negocio para la gestión de usuarios por parte de administradores.
 */

/**
 * Verifica si el usuario que realiza la llamada es un administrador.
 * Utiliza el email del usuario activo en la sesión de Apps Script.
 * @return {boolean} True si es administrador, false en caso contrario.
 */
function _isCurrentUserAdmin() {
  try {
    const currentUserEmail = Session.getActiveUser().getEmail();
    if (!currentUserEmail) {
      // Esto puede ocurrir si el script es ejecutado en un contexto sin usuario (ej. trigger anónimo)
      // o si hay problemas para obtener el email. Para una app web, debería haber un usuario.
      logWarning('_isCurrentUserAdmin: No se pudo obtener el email del usuario activo de la sesión.');
      return false;
    }
    const userRecord = getUserByEmail(currentUserEmail); // getUserByEmail está en UserSheet.gs
    if (userRecord && userRecord.role === USER_ROLES.ADMIN) { // USER_ROLES de Constants.gs
      return true;
    }
    logWarning('_isCurrentUserAdmin: El usuario no es administrador o no se encontró.', { email: currentUserEmail, role: userRecord ? userRecord.role : 'no encontrado' });
    return false;
  } catch (e) {
    logError('Error en _isCurrentUserAdmin:', e);
    return false;
  }
}


/**
 * Obtiene todos los usuarios para el panel de administración.
 * Solo accesible por administradores.
 * @return {object} Objeto con { success: boolean, users?: array, message?: string }.
 */
function getUsersForAdmin() {
  logInfo('Intento de obtener todos los usuarios (admin).');
  if (!_isCurrentUserAdmin()) {
    return { success: false, message: 'Acceso denegado. Se requieren privilegios de administrador.' };
  }

  try {
    const users = getAllUsers(); // getAllUsers de UserSheet.gs
    logInfo(`Se recuperaron ${users.length} usuarios para el panel de admin.`);
    return { success: true, users: users };
  } catch (e) {
    logError('Error en getUsersForAdmin (UserController):', e);
    return { success: false, message: 'Error interno al obtener la lista de usuarios.' };
  }
}

/**
 * Cambia el rol de un usuario específico.
 * Solo accesible por administradores.
 * @param {string} userId El ID del usuario a modificar.
 * @param {string} newRole El nuevo rol a asignar (debe ser uno de USER_ROLES).
 * @return {object} Objeto con { success: boolean, message?: string }.
 */
function changeUserRoleAdmin(userId, newRole) {
  logInfo(`Intento de cambiar rol para usuario ${userId} a ${newRole} (admin).`);
  if (!_isCurrentUserAdmin()) {
    return { success: false, message: 'Acceso denegado. Se requieren privilegios de administrador.' };
  }

  if (!userId || !newRole) {
    return { success: false, message: 'Se requiere ID de usuario y nuevo rol.' };
  }

  if (!Object.values(USER_ROLES).includes(newRole)) {
    logWarning('changeUserRoleAdmin: Intento de asignar un rol no válido.', { userId, newRole, validRoles: USER_ROLES });
    return { success: false, message: 'El rol especificado no es válido.' };
  }

  try {
    const success = updateUserRole(userId, newRole); // updateUserRole de UserSheet.gs
    if (success) {
      logInfo(`Rol para usuario ${userId} cambiado a ${newRole} exitosamente.`);
      return { success: true, message: 'Rol de usuario actualizado correctamente.' };
    } else {
      logWarning(`Fallo al cambiar rol para usuario ${userId} en UserController (updateUserRole devolvió false).`);
      return { success: false, message: 'No se pudo actualizar el rol del usuario. Verifique el ID del usuario.' };
    }
  } catch (e) {
    logError('Error en changeUserRoleAdmin (UserController):', e, { userId, newRole });
    return { success: false, message: 'Error interno al cambiar el rol del usuario.' };
  }
}
