<script>
/* Client/js/utils/validators.js.html */
/* Utilidades de validación para el frontend */

const Validators = {
  
  // Validaciones de email
  email: {
    isValid(email) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
    },
    
    isCorporateEmail(email) {
      const corporateDomains = ['bbva.com', 'bbva.pe', 'bbva.es'];
      const domain = email.split('@')[1]?.toLowerCase();
      return corporateDomains.includes(domain);
    },
    
    sanitize(email) {
      return email.trim().toLowerCase();
    }
  },

  // Validaciones de formulario de requerimientos
  requirement: {
    
    validateCodigoUnico(codigo) {
      if (!codigo) return { valid: false, message: 'Código único es requerido' };
      
      const regex = /^RQ-\d{8}-\d{4}$/;
      if (!regex.test(codigo)) {
        return { valid: false, message: 'Formato de código único inválido (RQ-YYYYMMDD-NNNN)' };
      }
      
      return { valid: true, message: '' };
    },
    
    validateNumeroOficio(numero, tipoDocumento) {
      if (tipoDocumento === 'Oficio' && !numero) {
        return { valid: false, message: 'Número de oficio es requerido para documentos tipo Oficio' };
      }
      
      if (numero && numero.length > 50) {
        return { valid: false, message: 'Número de oficio no puede exceder 50 caracteres' };
      }
      
      return { valid: true, message: '' };
    },
    
    validateFechas(fechaNotificacion, fechaVencimientoInterno, fechaVencimientoRegulador) {
      const errors = [];
      
      if (!fechaNotificacion) {
        errors.push('Fecha de notificación es requerida');
      }
      
      if (!fechaVencimientoInterno) {
        errors.push('Fecha de vencimiento interno es requerida');
      }
      
      if (!fechaVencimientoRegulador) {
        errors.push('Fecha de vencimiento regulador es requerida');
      }
      
      if (fechaNotificacion && fechaVencimientoInterno && fechaVencimientoRegulador) {
        const notif = new Date(fechaNotificacion);
        const interno = new Date(fechaVencimientoInterno);
        const regulador = new Date(fechaVencimientoRegulador);
        
        if (interno <= notif) {
          errors.push('La fecha de vencimiento interno debe ser posterior a la fecha de notificación');
        }
        
        if (regulador <= interno) {
          errors.push('La fecha de vencimiento regulador debe ser posterior a la fecha de vencimiento interno');
        }
        
        // Verificar que no sean fechas muy lejanas en el futuro (más de 2 años)
        const dosAnios = new Date();
        dosAnios.setFullYear(dosAnios.getFullYear() + 2);
        
        if (regulador > dosAnios) {
          errors.push('La fecha de vencimiento regulador no puede ser mayor a 2 años en el futuro');
        }
      }
      
      return {
        valid: errors.length === 0,
        message: errors.join('; ')
      };
    },
    
    validateProrroga(necesitaProrroga, fechaProrroga, motivoProrroga, estadoGeneral) {
      const errors = [];
      
      if (necesitaProrroga === 'SI') {
        if (!fechaProrroga) {
          errors.push('Fecha de prórroga es requerida');
        }
        
        if (!motivoProrroga || motivoProrroga.trim().length < 10) {
          errors.push('Motivo de prórroga debe tener al menos 10 caracteres');
        }
        
        // Verificar coherencia con estado
        const estadosProrroga = ['Prórroga', 'Terminado con prórroga'];
        if (!estadosProrroga.includes(estadoGeneral)) {
          errors.push('El estado debe ser "Prórroga" o "Terminado con prórroga" si necesita prórroga');
        }
      }
      
      return {
        valid: errors.length === 0,
        message: errors.join('; ')
      };
    },
    
    validateEstadoSistemas(necesitaSoporte, estadoSistemas, estadoGeneral) {
      const errors = [];
      
      if (necesitaSoporte === 'SI') {
        if (!estadoSistemas || estadoSistemas === 'N/A') {
          errors.push('Estado de sistemas debe ser especificado si requiere soporte');
        }
        
        // Si el requerimiento está terminado, sistemas también debería estarlo
        const terminadoStates = ['Terminado', 'Terminado con prórroga'];
        if (terminadoStates.includes(estadoGeneral) && estadoSistemas !== 'Terminado') {
          errors.push('Si el requerimiento está terminado, el estado de sistemas también debe ser "Terminado"');
        }
      }
      
      return {
        valid: errors.length === 0,
        message: errors.join('; ')
      };
    },
    
    validateDescripcion(descripcion) {
      if (!descripcion || descripcion.trim().length === 0) {
        return { valid: false, message: 'Descripción detallada es requerida' };
      }
      
      if (descripcion.trim().length < 20) {
        return { valid: false, message: 'La descripción debe tener al menos 20 caracteres' };
      }
      
      if (descripcion.length > 2000) {
        return { valid: false, message: 'La descripción no puede exceder 2000 caracteres' };
      }
      
      return { valid: true, message: '' };
    },
    
    // Validación completa del formulario
    validateFullForm(formData, isEditMode = false) {
      const errors = [];
      
      // Validaciones básicas
      if (!formData.tipo_documento) errors.push('Tipo de documento es requerido');
      if (!formData.organismo_regulador) errors.push('Organismo regulador es requerido');
      if (!formData.categoria) errors.push('Categoría es requerida');
      if (!formData.aspecto_documento?.trim()) errors.push('Aspecto del documento es requerido');
      if (!formData.responsable_asignado?.trim()) errors.push('Responsable asignado es requerido');
      if (!formData.area_responsable?.trim()) errors.push('Área responsable es requerida');
      if (!formData.unidad_responsable?.trim()) errors.push('Unidad responsable es requerida');
      
      // Validación de email
      if (!formData.email_solicitante) {
        errors.push('Email solicitante es requerido');
      } else if (!Validators.email.isValid(formData.email_solicitante)) {
        errors.push('Formato de email solicitante inválido');
      }
      
      // Validación de número de oficio
      const oficioCeck = Validators.requirement.validateNumeroOficio(
        formData.numero_oficio, 
        formData.tipo_documento
      );
      if (!oficioCeck.valid) errors.push(oficioCeck.message);
      
      // Validación de fechas
      const fechasCheck = Validators.requirement.validateFechas(
        formData.fecha_notificacion,
        formData.fecha_vencimiento_interno,
        formData.fecha_vencimiento_regulador
      );
      if (!fechasCheck.valid) errors.push(fechasCheck.message);
      
      // Validación de descripción
      const descripcionCheck = Validators.requirement.validateDescripcion(formData.descripcion_detallada);
      if (!descripcionCheck.valid) errors.push(descripcionCheck.message);
      
      // Validaciones específicas para modo edición
      if (isEditMode) {
        // Validar prórroga
        const prorrogaCheck = Validators.requirement.validateProrroga(
          formData.necesita_prorroga,
          formData.fecha_prorroga,
          formData.motivo_prorroga,
          formData.estado_general
        );
        if (!prorrogaCheck.valid) errors.push(prorrogaCheck.message);
        
        // Validar sistemas
        const sistemasCheck = Validators.requirement.validateEstadoSistemas(
          formData.necesita_soporte_sistemas,
          formData.estado_sistemas,
          formData.estado_general
        );
        if (!sistemasCheck.valid) errors.push(sistemasCheck.message);
        
        // Validar fecha de entrega si está terminado
        const terminadoStates = ['Terminado', 'Terminado con prórroga'];
        if (terminadoStates.includes(formData.estado_general) && !formData.fecha_entrega_banco) {
          errors.push('Fecha de entrega al regulador es requerida para estados terminados');
        }
      }
      
      return {
        valid: errors.length === 0,
        errors: errors,
        message: errors.join('\n')
      };
    }
  },

  // Validaciones de texto general
  text: {
    
    hasMinLength(text, minLength = 1) {
      return text && text.trim().length >= minLength;
    },
    
    hasMaxLength(text, maxLength = 255) {
      return !text || text.length <= maxLength;
    },
    
    isAlphanumeric(text) {
      const regex = /^[a-zA-Z0-9\s]+$/;
      return regex.test(text);
    },
    
    containsOnlyValidChars(text) {
      // Permite letras, números, espacios y caracteres comunes de puntuación
      const regex = /^[a-zA-Z0-9\sáéíóúñüÁÉÍÓÚÑÜ.,;:()\-_\/\[\]{}]+$/;
      return regex.test(text);
    },
    
    sanitizeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },
    
    removeExtraSpaces(text) {
      return text.replace(/\s+/g, ' ').trim();
    }
  },

  // Validaciones de fechas
  date: {
    
    isValidDate(dateString) {
      const date = new Date(dateString);
      return date instanceof Date && !isNaN(date);
    },
    
    isInFuture(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      return date > now;
    },
    
    isInPast(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      return date < now;
    },
    
    daysBetween(date1, date2) {
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      const diffTime = Math.abs(d2 - d1);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },
    
    addDays(dateString, days) {
      const date = new Date(dateString);
      date.setDate(date.getDate() + days);
      return date.toISOString().split('T')[0];
    },
    
    formatForInput(dateString) {
      // Convierte fechas a formato YYYY-MM-DD para inputs tipo date
      try {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      } catch {
        return '';
      }
    },
    
    formatForDisplay(dateString, locale = 'es-PE') {
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString(locale, {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      } catch {
        return 'Fecha inválida';
      }
    }
  },

  // Utilidades generales
  utils: {
    
    isEmpty(value) {
      return value === null || value === undefined || value === '' || 
             (Array.isArray(value) && value.length === 0) ||
             (typeof value === 'object' && Object.keys(value).length === 0);
    },
    
    isNumber(value) {
      return !isNaN(value) && !isNaN(parseFloat(value));
    },
    
    isPositiveInteger(value) {
      return Number.isInteger(Number(value)) && Number(value) > 0;
    },
    
    formatCurrency(amount, currency = 'PEN') {
      try {
        return new Intl.NumberFormat('es-PE', {
          style: 'currency',
          currency: currency
        }).format(amount);
      } catch {
        return `${currency} ${amount}`;
      }
    },
    
    // Validar múltiples emails separados por coma
    validateEmailList(emailList) {
      if (!emailList || emailList.trim() === '') {
        return { valid: true, emails: [] };
      }
      
      const emails = emailList.split(',').map(email => email.trim()).filter(email => email !== '');
      const invalidEmails = emails.filter(email => !Validators.email.isValid(email));
      
      return {
        valid: invalidEmails.length === 0,
        emails: emails,
        invalidEmails: invalidEmails,
        message: invalidEmails.length > 0 ? `Emails inválidos: ${invalidEmails.join(', ')}` : ''
      };
    },
    
    // Generar código único para requerimientos
    generateRequirementCode() {
      const now = new Date();
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      return `RQ-${year}${month}${day}-${random}`;
    },
    
    // Limpiar objeto de propiedades vacías
    cleanObject(obj) {
      const cleaned = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key) && !Validators.utils.isEmpty(obj[key])) {
          cleaned[key] = obj[key];
        }
      }
      return cleaned;
    }
  }
};

// Hacer disponible globalmente si es necesario
if (typeof window !== 'undefined') {
  window.Validators = Validators;
}

// Para uso en módulos (si se implementa)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Validators;
}
</script>