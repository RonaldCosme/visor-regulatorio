/**
 * @file Server/Services/PasswordService.gs
 * @description Manejo de contraseñas (hashing y verificación).
 */

function hashPassword(password) {
  if (!password || typeof password !== 'string' || password.length === 0) {
    logWarning('PasswordService.hashPassword: Intento de hashear contraseña vacía o inválida.');
    return null;
  }
  try {
    const saltedPassword = password + PASSWORD_SALT; // PASSWORD_SALT debe estar definido globalmente o en Constants.gs
    const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, saltedPassword, Utilities.Charset.UTF_8);
    let hexString = '';
    for (let i = 0; i < digest.length; i++) {
      let byte = digest[i];
      if (byte < 0) {
        byte += 256;
      }
      const hex = byte.toString(16);
      hexString += (hex.length === 1 ? '0' : '') + hex;
    }
    return hexString;
  } catch (e) {
    logError('Error en PasswordService.hashPassword:', e, { password_length: password.length });
    return null;
  }
}

function verifyPassword(plainPassword, storedHash) {
  if (!plainPassword || typeof plainPassword !== 'string' || !storedHash || typeof storedHash !== 'string') {
    logWarning('PasswordService.verifyPassword: Contraseña o hash inválido.');
    return false;
  }
  const hashOfInput = hashPassword(plainPassword);
  return hashOfInput === storedHash;
}

// generateUserId() ha sido movido a UserSheet.gs como generateNumericUserId()
// para centralizar la lógica de ID y asegurar unicidad numérica.
