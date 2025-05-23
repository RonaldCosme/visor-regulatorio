/**
 * @file Server/Controllers/AuthController.gs
 * @description Lógica de negocio para autenticación. El registro asigna rol por defecto.
 */

function loginUser(credentials) {
  logInfo('Intento de login para:', credentials.email);
  if (!credentials || !credentials.email || !credentials.password) {
    return { success: false, message: 'Email y contraseña son requeridos.' };
  }

  try {
    const user = getUserByEmail(credentials.email);

    if (!user) {
      logWarning('Usuario no encontrado durante login:', credentials.email);
      return { success: false, message: 'Usuario no encontrado o credenciales incorrectas.' };
    }

    const passwordIsValid = verifyPassword(credentials.password, user.passwordHash);

    if (passwordIsValid) {
      logInfo('Login exitoso para:', user.email);
      // Devolver los datos necesarios para el frontend, incluyendo el rol.
      return {
        success: true,
        user: {
          userId: user.userId,
          name: user.name,
          email: user.email,
          role: user.role, // Importante para el control de acceso en el frontend
          area: user.area,
          unidad: user.unidad,
          dosie: user.dosie
        },
        message: 'Login exitoso.'
      };
    } else {
      logWarning('Contraseña incorrecta para:', user.email);
      return { success: false, message: 'Usuario no encontrado o credenciales incorrectas.' };
    }
  } catch (e) {
    logError('Error en loginUser (AuthController):', e, {email: credentials.email});
    return { success: false, message: 'Error interno del servidor durante el login.' };
  }
}

function registerUser(userData) {
  logInfo('Intento de registro para:', userData.email);
  // El campo 'role' ya no se espera del cliente. Se asignará por defecto.
  // Validaciones básicas de campos esperados (sin incluir 'role')
  const requiredFields = ['name', 'email', 'password', 'area', 'unidad']; // 'dosie' es opcional
  for (const field of requiredFields) {
    if (!userData[field]) {
      logWarning(`Campo faltante en registro: ${field}`, userData);
      return { success: false, message: `El campo '${field}' es requerido para el registro.` };
    }
  }
   if (userData.password && userData.password.length < 6) {
    return { success: false, message: 'La contraseña debe tener al menos 6 caracteres.' };
  }
  if (userData.email && !/\S+@\S+\.\S+/.test(userData.email)) { // Simple validación de formato email
     return { success: false, message: 'El formato del email no es válido.' };
  }

  try {
    const existingUser = getUserByEmail(userData.email);
    if (existingUser) {
      logWarning('Intento de registrar email ya existente:', userData.email);
      return { success: false, message: 'Este correo electrónico ya está registrado.' };
    }

    const passwordHash = hashPassword(userData.password);
    if (!passwordHash) {
        logError('Fallo al generar hash de contraseña para registro:', userData.email);
        return { success: false, message: 'Error al procesar la contraseña. Inténtalo de nuevo.' };
    }

    // El ID y el ROL se asignarán dentro de createUser en UserSheet.gs
    const newUserObject = {
      name: userData.name,
      email: userData.email,
      passwordHash: passwordHash,
      area: userData.area,
      unidad: userData.unidad,
      dosie: userData.dosie || ''
    };

    const createdUser = createUser(newUserObject); // createUser ahora maneja ID y rol por defecto

    if (createdUser) {
      logInfo('Usuario registrado exitosamente (AuthController):', { email: createdUser.email, userId: createdUser.userId, role: createdUser.role });
      return {
        success: true,
        user: { // Devolver los datos del usuario creado, incluyendo el rol asignado
          userId: createdUser.userId,
          name: createdUser.name,
          email: createdUser.email,
          role: createdUser.role,
          area: createdUser.area,
          unidad: createdUser.unidad,
          dosie: createdUser.dosie
        },
        message: 'Usuario registrado exitosamente. Ahora puedes iniciar sesión.'
      };
    } else {
      logError('Fallo al crear usuario en AuthController (llamada a createUser falló):', userData.email);
      return { success: false, message: 'Error al guardar el usuario. Inténtalo de nuevo.' };
    }
  } catch (e) {
    logError('Error en registerUser (AuthController):', e, userData);
    return { success: false, message: 'Error interno del servidor durante el registro.' };
  }
}
