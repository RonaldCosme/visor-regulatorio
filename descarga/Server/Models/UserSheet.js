/**
 * @file Server/Models/UserSheet.gs
 * @description Funciones CRUD y de acceso para la hoja de cálculo de Usuarios.
 */

function _openUserSheet() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(USER_SHEET_NAME);
    if (!sheet) {
      logInfo(`La hoja de cálculo "${USER_SHEET_NAME}" no fue encontrada. Creando...`);
      sheet = ss.insertSheet(USER_SHEET_NAME);
      const headers = [
        "userId", "name", "email", "passwordHash", "role",
        "registeredDate", "area", "unidad", "dosie"
      ];
      sheet.appendRow(headers);
      logInfo(`Hoja "${USER_SHEET_NAME}" creada con cabeceras.`);
    }
    return sheet;
  } catch (e) {
    logError('Error al abrir/preparar la hoja de usuarios:', e);
    return null;
  }
}

function generateNumericUserId() {
  const sheet = _openUserSheet();
  if (!sheet) return null;

  const data = sheet.getDataRange().getValues();
  const existingIds = new Set();
  for (let i = 1; i < data.length; i++) { // Empezar desde 1 para omitir cabecera
    if (data[i][USER_COLUMNS.USER_ID]) {
      existingIds.add(String(data[i][USER_COLUMNS.USER_ID]));
    }
  }

  let newId;
  let attempts = 0;
  const MAX_ATTEMPTS = 1000; 

  do {
    newId = String(Math.floor(10000 + Math.random() * 90000)); // 10000 a 99999
    attempts++;
    if (attempts > MAX_ATTEMPTS && existingIds.has(newId)) {
      logError('generateNumericUserId: No se pudo generar un ID único después de ' + MAX_ATTEMPTS + ' intentos.');
      return null; 
    }
  } while (existingIds.has(newId));
  logInfo('Nuevo ID de usuario generado:', newId);
  return newId;
}

function createUser(userData) {
  if (!userData || !userData.email || !userData.passwordHash || !userData.name) {
    logWarning('Intento de crear usuario con datos incompletos en createUser:', userData);
    return null;
  }

  const sheet = _openUserSheet();
  if (!sheet) return null;

  const newUserId = generateNumericUserId();
  if (!newUserId) {
    logError('Fallo al generar ID de usuario numérico en createUser.');
    return null;
  }

  try {
    const newRow = [
      newUserId,
      userData.name,
      userData.email,
      userData.passwordHash,
      DEFAULT_USER_ROLE, 
      new Date(),
      userData.area || '',
      userData.unidad || '',
      userData.dosie || ''
    ];
    sheet.appendRow(newRow);
    logInfo('Usuario creado exitosamente en UserSheet:', { email: userData.email, userId: newUserId, role: DEFAULT_USER_ROLE });
    // Leer la fila recién insertada para obtener los valores formateados, especialmente la fecha.
    const lastRowValues = sheet.getRange(sheet.getLastRow(), 1, 1, sheet.getLastColumn()).getValues()[0];
    return {
      userId: lastRowValues[USER_COLUMNS.USER_ID],
      name: lastRowValues[USER_COLUMNS.NAME],
      email: lastRowValues[USER_COLUMNS.EMAIL],
      role: lastRowValues[USER_COLUMNS.ROLE],
      registeredDate: lastRowValues[USER_COLUMNS.REGISTERED_DATE] instanceof Date ? lastRowValues[USER_COLUMNS.REGISTERED_DATE].toISOString() : lastRowValues[USER_COLUMNS.REGISTERED_DATE],
      area: lastRowValues[USER_COLUMNS.AREA],
      unidad: lastRowValues[USER_COLUMNS.UNIDAD],
      dosie: lastRowValues[USER_COLUMNS.DOSIE]
    };
  } catch (e) {
    logError('Error en createUser (UserSheet):', e, userData);
    return null;
  }
}

function getUserByEmail(email) {
  if (!email || typeof email !== 'string') {
    return null;
  }
  const sheet = _openUserSheet();
  if (!sheet) return null;

  try {
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][USER_COLUMNS.EMAIL] && data[i][USER_COLUMNS.EMAIL].toString().toLowerCase() === email.toLowerCase()) {
        const registeredDateValue = data[i][USER_COLUMNS.REGISTERED_DATE];
        return {
          userId: data[i][USER_COLUMNS.USER_ID],
          name: data[i][USER_COLUMNS.NAME],
          email: data[i][USER_COLUMNS.EMAIL],
          passwordHash: data[i][USER_COLUMNS.PASSWORD_HASH],
          role: data[i][USER_COLUMNS.ROLE],
          registeredDate: registeredDateValue instanceof Date ? registeredDateValue.toISOString() : registeredDateValue,
          area: data[i][USER_COLUMNS.AREA],
          unidad: data[i][USER_COLUMNS.UNIDAD],
          dosie: data[i][USER_COLUMNS.DOSIE],
          rowIndex: i + 1
        };
      }
    }
    return null;
  } catch (e) {
    logError('Error en getUserByEmail:', e, { email });
    return null;
  }
}

function getUserById(userId) {
  if (!userId) return null;
  const sheet = _openUserSheet();
  if (!sheet) return null;

  try {
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][USER_COLUMNS.USER_ID]) === String(userId)) {
        const registeredDateValue = data[i][USER_COLUMNS.REGISTERED_DATE];
        return {
          userId: data[i][USER_COLUMNS.USER_ID],
          name: data[i][USER_COLUMNS.NAME],
          email: data[i][USER_COLUMNS.EMAIL],
          passwordHash: data[i][USER_COLUMNS.PASSWORD_HASH],
          role: data[i][USER_COLUMNS.ROLE],
          registeredDate: registeredDateValue instanceof Date ? registeredDateValue.toISOString() : registeredDateValue,
          area: data[i][USER_COLUMNS.AREA],
          unidad: data[i][USER_COLUMNS.UNIDAD],
          dosie: data[i][USER_COLUMNS.DOSIE],
          rowIndex: i + 1
        };
      }
    }
    return null;
  } catch (e) {
    logError('Error en getUserById:', e, { userId });
    return null;
  }
}


function getAllUsers() {
  const sheet = _openUserSheet();
  if (!sheet) return [];

  try {
    const data = sheet.getDataRange().getValues(); // Obtiene todos los valores
    const users = [];
    // Empezar desde la segunda fila (índice 1) para omitir encabezados
    for (let i = 1; i < data.length; i++) {
      if (data[i][USER_COLUMNS.USER_ID]) { // Asegurarse de que la fila tiene un ID
        const registeredDateValue = data[i][USER_COLUMNS.REGISTERED_DATE];
        users.push({
          userId: data[i][USER_COLUMNS.USER_ID],
          name: data[i][USER_COLUMNS.NAME],
          email: data[i][USER_COLUMNS.EMAIL],
          role: data[i][USER_COLUMNS.ROLE],
          // MODIFICACIÓN CLAVE: Convertir Date a ISOString para serialización segura
          registeredDate: registeredDateValue instanceof Date ? registeredDateValue.toISOString() : registeredDateValue,
          area: data[i][USER_COLUMNS.AREA],
          unidad: data[i][USER_COLUMNS.UNIDAD],
          dosie: data[i][USER_COLUMNS.DOSIE]
        });
      }
    }
    return users;
  } catch (e) {
    logError('Error en getAllUsers:', e);
    return []; // Devuelve un array vacío en caso de error para consistencia
  }
}

function updateUserRole(userId, newRole) {
  if (!userId || !newRole) {
    logWarning('updateUserRole: userId o newRole no proporcionados.');
    return false;
  }

  if (!Object.values(USER_ROLES).includes(newRole)) {
    logWarning('updateUserRole: Rol no válido proporcionado.', { userId, newRole });
    return false;
  }

  const sheet = _openUserSheet();
  if (!sheet) return false;

  try {
    const user = getUserById(userId); 
    if (user && user.rowIndex) {
      sheet.getRange(user.rowIndex, USER_COLUMNS.ROLE + 1).setValue(newRole);
      logInfo(`Rol actualizado para usuario ${userId} a ${newRole}`);
      return true;
    } else {
      logWarning(`updateUserRole: Usuario con ID ${userId} no encontrado.`);
      return false;
    }
  } catch (e) {
    logError('Error en updateUserRole:', e, { userId, newRole });
    return false;
  }
}
