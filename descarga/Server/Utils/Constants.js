/**
 * @file Server/Utils/Constants.gs
 * @description Constantes utilizadas en el backend de la aplicación.
 */

const SPREADSHEET_ID = '1i9EXXGA-5rmb_Gua12KMNJSRlLsLr5dAPKmz4wmY_4A'; // ¡¡¡REEMPLAZA ESTO!!!
const USER_SHEET_NAME = 'Usuarios';
const DATA_AREA_UNIDAD_SHEET_NAME = 'DATA_AREA_UNIDAD';
const REQUIREMENT_SHEET_NAME = 'Requerimientos'; // Nueva hoja para requerimientos

const USER_COLUMNS = {
  USER_ID: 0,
  NAME: 1,
  EMAIL: 2,
  PASSWORD_HASH: 3,
  ROLE: 4,
  REGISTERED_DATE: 5,
  AREA: 6,
  UNIDAD: 7,
  DOSIE: 8
};

const DATA_AREA_UNIDAD_COLUMNS = {
  NOMBRE_CORPORATIVO: 0,
  DOSIER: 1,
  CORREO_E: 2,
  AREA: 3,
  UNIDAD: 4
};

// Columnas para la hoja de Requerimientos
// Basado en la estructura inferida de los ejemplos y campos del formulario
const REQUIREMENT_COLUMNS = {
  FECHA_REGISTRO: 0,          // Timestamp de creación
  CODIGO_UNICO: 1,            // Generado, Ej: RQ-20240521-1234
  ESTADO_GENERAL: 2,          // Ingresado, En proceso, Terminado, etc.
  EMAIL_SOLICITANTE: 3,       // Quien registra o a quien se le asigna inicialmente
  NRO_OFICIO: 4,              // Si Tipo Documento es Oficio
  RESPONSABLE_ASIGNADO: 5,    // Persona/equipo asignado
  AREA_RESPONSABLE: 6,        // Área del responsable
  UNIDAD_RESPONSABLE: 7,      // Unidad del responsable
  ORGANISMO_REGULADOR: 8,     // SBS, BCR, SMV
  FECHA_NOTIFICACION: 9,      // Fecha en que el regulador notificó
  COPIA_EMAIL: 10,            // Emails en copia para notificaciones
  TIPO_DOCUMENTO: 11,         // Oficio, Carta, Correo
  NECESITA_SOPORTE_SISTEMAS: 12, // SI, NO, POR CONFIRMAR
  ASPECTO_DOCUMENTO: 13,      // Breve descripción o título del documento
  CATEGORIA: 14,              // REQUERIMIENTO, INFORMATIVO
  DESGLOSE_DOCUMENTO: 15,     // Mayor detalle del aspecto
  DESCRIPCION_DETALLADA: 16,  // Descripción completa de la solicitud
  URL_CARPETA_ANEXOS: 17,     // Enlace a la carpeta de Drive
  COMENTARIOS_GENERALES: 18,  // Comentarios adicionales del usuario
  TIPO_PEDIDO_SISTEMAS: 19,   // Ticket, Evolutivo, Proyecto (si NECESITA_SOPORTE_SISTEMAS = SI)
  TICKET_PETICION_SISTEMAS: 20,// Código del ticket/JIRA/SDA (si aplica)
  COMENTARIO_SISTEMAS: 21,    // Comentarios para el equipo de sistemas
  FECHA_VENCIMIENTO_INTERNO: 22,
  FECHA_VENCIMIENTO_REGULADOR: 23, // Plazo del regulador
  FECHA_PRORROGA: 24,         // Si aplica
  FECHA_ULTIMA_MODIFICACION: 25,// Timestamp de última edición
  HISTORIAL_ESTADOS: 26,      // Log de cambios de estado
  ESTADO_SISTEMAS: 27,        // Ingresado, En proceso, Terminado (si NECESITA_SOPORTE_SISTEMAS = SI)
  NECESITA_PRORROGA: 28,      // SI, NO
  MOTIVO_PRORROGA: 29,        // Justificación de la prórroga
  FECHA_ENTREGA_BANCO: 30,     // Fecha efectiva de entrega al regulador
  USUARIO_CREACION: 31,       // Email del usuario que creó el registro
  USUARIO_ULTIMA_MODIFICACION: 32 // Email del usuario que modificó por última vez
};
Object.freeze(REQUIREMENT_COLUMNS);

const REQUIREMENT_ESTADOS = {
  INGRESADO: 'Ingresado',
  EN_PROCESO: 'En proceso',
  PRORROGA: 'Prórroga',
  TERMINADO: 'Terminado',
  TERMINADO_CON_PRORROGA: 'Terminado con prórroga',
  OBSERVADO: 'Observado',
  CANCELADO: 'Cancelado'
};
Object.freeze(REQUIREMENT_ESTADOS);

const DEFAULT_REQUIREMENT_ESTADO = REQUIREMENT_ESTADOS.INGRESADO;

const PASSWORD_SALT = "CAMBIA_ESTA_SAL_SECRETA_POR_ALGO_UNICO"; // Asegúrate que esta ya esté definida

const USER_ROLES = {
  ADMIN: 'Administrador',
  USER: 'Usuario'
};
Object.freeze(USER_ROLES);

const DEFAULT_USER_ROLE = USER_ROLES.USER;

// IDs de carpetas de Drive (opcional, si tienes una raíz específica)
const DRIVE_PARENT_FOLDER_ID_REQUERIMIENTOS = '1knIn9vtEo_Ed559aOdKZcI9ThPQHN_sK'; // ¡REEMPLAZA ESTO! O déjalo vacío para crear en la raíz.

