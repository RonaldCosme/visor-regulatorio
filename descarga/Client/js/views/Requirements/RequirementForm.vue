<script type="text/x-template" id="RequirementFormView">
<div class="requirement-form-view container py-4 animate__animated animate__fadeIn">
  <div class="card shadow-lg border-0">
    <div class="card-header bg-primary-bbva text-white d-flex align-items-center">
      <i class="bi bi-file-earmark-text-fill me-2 fs-5"></i>
      <h4 class="mb-0">{{ isEditMode ? 'Editar Requerimiento' : 'Registrar Nuevo Requerimiento' }}</h4>
    </div>
    <div class="card-body p-4 p-md-5">
      <form @submit.prevent="submitForm" novalidate>
        <fieldset class="mb-4">
          <legend class="fs-5 fw-semibold text-primary-bbva mb-3 pb-2 border-bottom">
            <i class="bi bi-info-circle-fill me-2"></i>Información Principal
          </legend>
          <div class="row g-3">
            <div class="col-md-4">
              <label for="codigo-unico" class="form-label">Código Único</label>
              <input type="text" class="form-control form-control-sm bg-light" id="codigo-unico" v-model="form.codigo_unico" readonly>
            </div>
            <div class="col-md-4">
              <label for="tipo-documento" class="form-label">Tipo Documento <span class="text-danger">*</span></label>
              <select class="form-select form-select-sm" id="tipo-documento" v-model="form.tipo_documento" @change="handleTipoDocumentoChange" required>
                <option value="" disabled>Seleccione...</option>
                <option value="Oficio">OFICIO</option>
                <option value="Carta">CARTA</option>
                <option value="Correo">CORREO</option>
              </select>
              <div class="invalid-feedback">Este campo es requerido.</div>
            </div>
            <div class="col-md-4" v-if="form.tipo_documento === 'Oficio'">
              <label for="numero-oficio" class="form-label">Número de Oficio <span class="text-danger">*</span></label>
              <input type="text" class="form-control form-control-sm" id="numero-oficio" v-model="form.numero_oficio" placeholder="Ej: OFS-001-2024" :required="form.tipo_documento === 'Oficio'">
              <div class="invalid-feedback">Este campo es requerido para oficios.</div>
            </div>
             <div class="col-md-4">
              <label for="organismo-regulador" class="form-label">Ente Regulatorio <span class="text-danger">*</span></label>
              <select class="form-select form-select-sm" id="organismo-regulador" v-model="form.organismo_regulador" required>
                <option value="" disabled>Seleccione...</option>
                <option value="SBS">SBS</option>
                <option value="BCR">BCR</option>
                <option value="SMV">SMV</option>
                <option value="Otro">Otro</option>
              </select>
              <div class="invalid-feedback">Este campo es requerido.</div>
            </div>
            <div class="col-md-4">
              <label for="categoria" class="form-label">Categoría <span class="text-danger">*</span></label>
              <select class="form-select form-select-sm" id="categoria" v-model="form.categoria" required>
                <option value="" disabled>Seleccione...</option>
                <option value="REQUERIMIENTO">REQUERIMIENTO</option>
                <option value="INFORMATIVO">INFORMATIVO</option>
              </select>
              <div class="invalid-feedback">Este campo es requerido.</div>
            </div>
            <div class="col-md-4">
              <label for="necesita-soporte-sistemas" class="form-label">¿Necesita Soporte de Sistemas? <span class="text-danger">*</span></label>
              <select class="form-select form-select-sm" id="necesita-soporte-sistemas" v-model="form.necesita_soporte_sistemas" @change="handleNecesitaSoporteChange" required>
                <option value="POR CONFIRMAR">POR CONFIRMAR</option>
                <option value="SI">SÍ</option>
                <option value="NO">NO</option>
              </select>
            </div>
            <div class="col-md-6">
              <label for="aspecto-documento" class="form-label">Asunto / Aspecto Principal <span class="text-danger">*</span></label>
              <input type="text" class="form-control form-control-sm" id="aspecto-documento" v-model="form.aspecto_documento" placeholder="Ej: Solicitud de información sobre cartera crediticia" required>
              <div class="invalid-feedback">Este campo es requerido.</div>
            </div>
            <div class="col-md-6">
              <label for="desglose-documento" class="form-label">Desglose del Documento</label>
              <input type="text" class="form-control form-control-sm" id="desglose-documento" v-model="form.desglose_documento" placeholder="Ej: Anexo A, Sección III">
            </div>
          </div>
        </fieldset>

        <fieldset class="mb-4">
          <legend class="fs-5 fw-semibold text-primary-bbva mb-3 pb-2 border-bottom">
            <i class="bi bi-people-fill me-2"></i>Equipo Asignado y Notificación
          </legend>
          <div class="row g-3">
            <div class="col-md-4">
              <label for="responsable-asignado" class="form-label">Responsable Asignado <span class="text-danger">*</span></label>
              <input type="text" class="form-control form-control-sm" id="responsable-asignado" v-model="form.responsable_asignado" list="lista-asignables-req" placeholder="Nombre del responsable" required>
              <datalist id="lista-asignables-req">
                <option v-for="asignable in asignables" :key="asignable" :value="asignable"></option>
              </datalist>
              <div class="invalid-feedback">Este campo es requerido.</div>
            </div>
            <div class="col-md-4">
              <label for="email-solicitante" class="form-label">Email Solicitante/Responsable <span class="text-danger">*</span></label>
              <input type="email" class="form-control form-control-sm" id="email-solicitante" v-model="form.email_solicitante" placeholder="correo@bbva.com" required>
              <div class="invalid-feedback">Ingrese un email válido.</div>
            </div>
            <div class="col-md-4">
              <label for="copia-email" class="form-label">Emails en Copia (CC)</label>
              <input type="text" class="form-control form-control-sm" id="copia-email" v-model="form.copia_email" placeholder="separados por coma">
            </div>
            <div class="col-md-6">
              <label for="area-responsable" class="form-label">Área Responsable <span class="text-danger">*</span></label>
              <input type="text" class="form-control form-control-sm" id="area-responsable" v-model="form.area_responsable" required>
              <div class="invalid-feedback">Este campo es requerido.</div>
            </div>
            <div class="col-md-6">
              <label for="unidad-responsable" class="form-label">Unidad Responsable <span class="text-danger">*</span></label>
              <input type="text" class="form-control form-control-sm" id="unidad-responsable" v-model="form.unidad_responsable" required>
              <div class="invalid-feedback">Este campo es requerido.</div>
            </div>
          </div>
        </fieldset>

        <fieldset class="mb-4">
          <legend class="fs-5 fw-semibold text-primary-bbva mb-3 pb-2 border-bottom">
            <i class="bi bi-calendar-check-fill me-2"></i>Fechas Clave
          </legend>
          <div class="row g-3">
            <div class="col-md-4">
              <label for="fecha-notificacion" class="form-label">Fecha Notificación Regulador <span class="text-danger">*</span></label>
              <input type="date" class="form-control form-control-sm" id="fecha-notificacion" v-model="form.fecha_notificacion" required>
              <div class="invalid-feedback">Este campo es requerido.</div>
            </div>
            <div class="col-md-4">
              <label for="fecha-vencimiento-interno" class="form-label">Fecha Vencimiento Interno <span class="text-danger">*</span></label>
              <input type="date" class="form-control form-control-sm" id="fecha-vencimiento-interno" v-model="form.fecha_vencimiento_interno" required>
              <div class="invalid-feedback">Este campo es requerido.</div>
            </div>
            <div class="col-md-4">
              <label for="fecha-vencimiento-regulador" class="form-label">Fecha Vencimiento Regulador <span class="text-danger">*</span></label>
              <input type="date" class="form-control form-control-sm" id="fecha-vencimiento-regulador" v-model="form.fecha_vencimiento_regulador" required>
              <div class="invalid-feedback">Este campo es requerido.</div>
            </div>
          </div>
        </fieldset>

        <fieldset class="mb-4">
          <legend class="fs-5 fw-semibold text-primary-bbva mb-3 pb-2 border-bottom">
            <i class="bi bi-body-text me-2"></i>Descripción Detallada
          </legend>
          <div class="row">
            <div class="col-12">
              <label for="descripcion-detallada" class="form-label">Descripción Completa del Requerimiento <span class="text-danger">*</span></label>
              <textarea class="form-control form-control-sm" id="descripcion-detallada" v-model="form.descripcion_detallada" rows="4" placeholder="Detalle aquí el requerimiento..." required></textarea>
              <div class="invalid-feedback">Este campo es requerido.</div>
            </div>
          </div>
        </fieldset>

        <fieldset class="mb-4" v-if="form.necesita_soporte_sistemas === 'SI'">
          <legend class="fs-5 fw-semibold text-primary-bbva mb-3 pb-2 border-bottom">
            <i class="bi bi-hdd-stack-fill me-2"></i>Información de Soporte de Sistemas
          </legend>
          <div class="p-3 bg-light-bbva rounded border-start border-primary-bbva border-4">
            <div class="row g-3">
              <div class="col-md-4">
                <label for="estado-sistemas" class="form-label">Estado de Sistemas</label>
                <select class="form-select form-select-sm" id="estado-sistemas" v-model="form.estado_sistemas">
                  <option value="Ingresado">Ingresado</option>
                  <option value="En proceso">En proceso</option>
                  <option value="Terminado">Terminado</option>
                  <option value="N/A">N/A</option>
                </select>
              </div>
              <div class="col-md-4">
                <label for="tipo-pedido-sistemas" class="form-label">Tipo de Pedido a Sistemas</label>
                <select class="form-select form-select-sm" id="tipo-pedido-sistemas" v-model="form.tipo_pedido_sistemas">
                  <option value="">Seleccione...</option>
                  <option value="Ticket">Ticket</option>
                  <option value="Evolutivo menor">Evolutivo menor</option>
                  <option value="Proyecto">Proyecto</option>
                </select>
              </div>
              <div class="col-md-4">
                <label for="ticket-peticion-sistemas" class="form-label">Ticket/Código Petición</label>
                <input type="text" class="form-control form-control-sm" id="ticket-peticion-sistemas" v-model="form.ticket_peticion_sistemas" placeholder="INC001, JIRA-123">
              </div>
              <div class="col-12">
                <label for="comentario-sistemas" class="form-label">Comentarios para Sistemas</label>
                <textarea class="form-control form-control-sm" id="comentario-sistemas" v-model="form.comentario_sistemas" rows="2"></textarea>
              </div>
            </div>
          </div>
        </fieldset>
        
        <fieldset class="mb-4" v-if="isEditMode">
          <legend class="fs-5 fw-semibold text-primary-bbva mb-3 pb-2 border-bottom">
            <i class="bi bi-calendar-plus-fill me-2"></i>Gestión de Prórroga y Entrega
          </legend>
          <div class="row g-3">
            <div class="col-md-3">
                <label for="necesita-prorroga" class="form-label">¿Necesita Prórroga?</label>
                <select class="form-select form-select-sm" id="necesita-prorroga" v-model="form.necesita_prorroga" @change="handleNecesitaProrrogaChange">
                    <option value="NO">NO</option>
                    <option value="SI">SÍ</option>
                </select>
            </div>
            <div class="col-md-3" v-if="form.necesita_prorroga === 'SI'">
                <label for="fecha-prorroga" class="form-label">Fecha Prórroga</label>
                <input type="date" class="form-control form-select-sm" id="fecha-prorroga" v-model="form.fecha_prorroga">
            </div>
            <div class="col-md-6" v-if="form.necesita_prorroga === 'SI'">
                <label for="motivo-prorroga" class="form-label">Motivo Prórroga</label>
                <input type="text" class="form-control form-control-sm" id="motivo-prorroga" v-model="form.motivo_prorroga">
            </div>
            <div class="col-md-4">
                <label for="fecha-entrega-banco" class="form-label">Fecha Entrega a Regulador</label>
                <input type="date" class="form-control form-control-sm" id="fecha-entrega-banco" v-model="form.fecha_entrega_banco">
                 <div class="form-text text-danger small mt-1" v-if="isTerminadoState && !form.fecha_entrega_banco">Requerido si estado es Terminado.</div>
            </div>
             <div class="col-md-4">
                <label for="estado-general" class="form-label">Estado General <span class="text-danger">*</span></label>
                <select class="form-select form-select-sm" id="estado-general" v-model="form.estado_general" required @change="handleEstadoGeneralChange">
                    <option value="Ingresado">Ingresado</option>
                    <option value="En proceso">En proceso</option>
                    <option value="Prórroga">Prórroga</option>
                    <option value="Terminado">Terminado</option>
                    <option value="Terminado con prórroga">Terminado con prórroga</option>
                    <option value="Observado">Observado</option>
                    <option value="Cancelado">Cancelado</option>
                </select>
            </div>
          </div>
        </fieldset>

        <fieldset class="mb-4">
            <legend class="fs-5 fw-semibold text-primary-bbva mb-3 pb-2 border-bottom">
                <i class="bi bi-chat-left-text-fill me-2"></i>Comentarios Adicionales
            </legend>
            <div class="col-12">
                <label for="comentarios-generales" class="form-label">Comentarios Generales</label>
                <textarea class="form-control form-control-sm" id="comentarios-generales" v-model="form.comentarios_generales" rows="3"></textarea>
            </div>
        </fieldset>


        <div class="d-flex justify-content-end gap-2 mt-5 border-top pt-4">
          <button type="button" class="btn btn-outline-secondary rounded-pill px-4" @click="cancelForm">
            <i class="bi bi-x-circle me-2"></i>Cancelar
          </button>
          <button type="submit" class="btn btn-primary-bbva rounded-pill px-4" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            <i v-else :class="isEditMode ? 'bi bi-save-fill me-2' : 'bi bi-plus-circle-fill me-2'"></i>
            {{ isEditMode ? 'Guardar Cambios' : 'Registrar Requerimiento' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
</script>
<script>
const RequirementFormView = {
  template: '#RequirementFormView',
  props: ['requirementIdToEdit'], // Se pasará como prop si estamos editando
  data() {
    return {
      form: {
        codigo_unico: '',
        tipo_documento: '',
        numero_oficio: '',
        organismo_regulador: '',
        categoria: '',
        necesita_soporte_sistemas: 'POR CONFIRMAR',
        aspecto_documento: '',
        desglose_documento: '',
        responsable_asignado: '',
        email_solicitante: '',
        copia_email: '',
        area_responsable: '',
        unidad_responsable: '',
        fecha_notificacion: '',
        fecha_vencimiento_interno: '',
        fecha_vencimiento_regulador: '',
        descripcion_detallada: '',
        // Campos de sistemas
        estado_sistemas: 'N/A',
        tipo_pedido_sistemas: '',
        ticket_peticion_sistemas: '',
        comentario_sistemas: '',
        // Campos de edición
        estado_general: 'Ingresado',
        necesita_prorroga: 'NO',
        fecha_prorroga: '',
        motivo_prorroga: '',
        fecha_entrega_banco: '',
        comentarios_generales: '',
        url_carpeta_anexos: '', // Se llenará al guardar si es nuevo
      },
      isLoading: false,
      isEditMode: false,
      asignables: [], // Para el datalist de responsables
      initialStateSnapshot: null, // Para detectar cambios en edición
    };
  },
  computed: {
      isTerminadoState() {
          return this.form.estado_general === 'Terminado' || this.form.estado_general === 'Terminado con prórroga';
      }
  },
  methods: {
    generateCodigoUnico() {
      const now = new Date();
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      return `RQ-${year}${month}${day}-${random}`;
    },
    async fetchAssignableUsers() {
        try {
            const response = await apiService.callAppsScript('getAssignableUsers_API');
            if (response.success && Array.isArray(response.data)) {
                this.asignables = response.data;
            } else {
                console.warn('No se pudieron cargar los usuarios asignables:', response.message);
                this.asignables = [];
            }
        } catch (error) {
            console.error('Error cargando usuarios asignables:', error);
            this.$root.showGlobalAlert('Error al cargar lista de asignables.', 'danger');
            this.asignables = [];
        }
    },
    handleTipoDocumentoChange() {
      if (this.form.tipo_documento !== 'Oficio') {
        this.form.numero_oficio = '';
      }
    },
    handleNecesitaSoporteChange() {
      if (this.form.necesita_soporte_sistemas !== 'SI') {
        this.form.estado_sistemas = 'N/A';
        this.form.tipo_pedido_sistemas = '';
        this.form.ticket_peticion_sistemas = '';
        this.form.comentario_sistemas = '';
      } else {
        this.form.estado_sistemas = 'Ingresado'; // Valor por defecto si es SI
      }
    },
    handleNecesitaProrrogaChange() {
        if (this.form.necesita_prorroga === 'NO') {
            this.form.fecha_prorroga = '';
            this.form.motivo_prorroga = '';
        }
        // Validar coherencia con estado_general
        if (this.form.necesita_prorroga === 'SI' && !(this.form.estado_general === 'Prórroga' || this.form.estado_general === 'Terminado con prórroga')) {
             if (confirm('Ha indicado que necesita prórroga. ¿Desea cambiar el estado general a "Prórroga"?')) {
                this.form.estado_general = 'Prórroga';
            } else {
                this.form.necesita_prorroga = 'NO'; // Revertir si el usuario no confirma
            }
        }
    },
    handleEstadoGeneralChange() {
        if (this.form.estado_general === 'Prórroga' || this.form.estado_general === 'Terminado con prórroga') {
            if (this.form.necesita_prorroga !== 'SI') {
                this.form.necesita_prorroga = 'SI';
                // No limpiar fecha y motivo aquí, permitir al usuario llenarlos.
            }
        } else { // Si el estado NO es de prórroga
            if (this.form.necesita_prorroga === 'SI') {
                 if (confirm('El estado general ya no es de prórroga. ¿Desea quitar la marca de "Necesita prórroga" y limpiar los campos relacionados?')) {
                    this.form.necesita_prorroga = 'NO';
                    this.form.fecha_prorroga = '';
                    this.form.motivo_prorroga = '';
                } else {
                    // Revertir el cambio de estado si el usuario cancela
                    // Esto es más complejo, necesitaríamos el estado anterior.
                    // Por ahora, se deja como está y el usuario debe ser consistente.
                }
            }
        }
        // Validar con estado de sistemas si es Terminado
        if (this.isTerminadoState && this.form.necesita_soporte_sistemas === 'SI' && this.form.estado_sistemas !== 'Terminado') {
            this.$root.showGlobalAlert('Si el estado general es Terminado y requiere soporte de sistemas, el estado de sistemas también debe ser Terminado.', 'warning', 7000);
            // Opcional: this.form.estado_sistemas = 'Terminado';
        }
    },
    validateForm(formElement) {
        formElement.classList.add('was-validated');
        return formElement.checkValidity();
    },
    async submitForm() {
      const formElement = this.$el.querySelector('form');
      if (!this.validateForm(formElement)) {
        this.$root.showGlobalAlert('Por favor, corrija los errores en el formulario.', 'warning');
        return;
      }

      // Validación específica para Fecha Entrega Banco si estado es Terminado
      if (this.isEditMode && this.isTerminadoState && !this.form.fecha_entrega_banco) {
          this.$root.showGlobalAlert('La "Fecha Entrega a Regulador" es obligatoria si el estado es Terminado o Terminado con prórroga.', 'warning', 7000);
          document.getElementById('fecha-entrega-banco')?.focus();
          return;
      }
      // Validación específica para Prórroga
      if (this.isEditMode && this.form.necesita_prorroga === 'SI' && (!this.form.fecha_prorroga || !this.form.motivo_prorroga)) {
          this.$root.showGlobalAlert('Si necesita prórroga, la fecha y el motivo son obligatorios.', 'warning', 7000);
          if(!this.form.fecha_prorroga) document.getElementById('fecha-prorroga')?.focus();
          else document.getElementById('motivo-prorroga')?.focus();
          return;
      }


      this.isLoading = true;
      this.$root.isLoading = true; // Activar spinner global

      try {
        let response;
        const payload = { ...this.form };

        if (this.isEditMode) {
          payload.codigo_unico_hidden = this.form.codigo_unico; // Asegurar que el ID original se envíe para la actualización
          response = await apiService.callAppsScript('updateRequirement_API', payload);
        } else {
          response = await apiService.callAppsScript('createRequirement_API', payload);
        }

        if (response.success) {
          this.$root.showGlobalAlert(response.message || (this.isEditMode ? 'Requerimiento actualizado.' : 'Requerimiento registrado.'), 'success');
          this.$root.switchView('requirements'); // O a la vista de lista/dashboard
        } else {
          this.$root.showGlobalAlert(response.message || 'Ocurrió un error.', 'danger');
        }
      } catch (error) {
        console.error('Error al enviar formulario:', error);
        this.$root.showGlobalAlert('Error de conexión o del servidor: ' + error.message, 'danger');
      } finally {
        this.isLoading = false;
        this.$root.isLoading = false;
      }
    },
    cancelForm() {
      // Podríamos preguntar si desea descartar cambios si hay algo escrito
      this.$root.switchView('requirements'); // O a la vista de lista/dashboard
    },
    async loadRequirementForEdit(id) {
        this.isLoading = true;
        this.$root.isLoading = true;
        try {
            const response = await apiService.callAppsScript('getRequirementById_API', id);
            if (response.success && response.data) {
                // Mapear los datos recibidos al formulario
                // Los nombres de campo en response.data son en minúsculas (ej. codigo_unico)
                // y coinciden con this.form
                Object.keys(this.form).forEach(key => {
                    if (response.data.hasOwnProperty(key)) {
                        // Convertir fechas de ISO string a formato YYYY-MM-DD para input type="date"
                        if (key.startsWith('fecha_') && response.data[key]) {
                            try {
                                this.form[key] = new Date(response.data[key]).toISOString().split('T')[0];
                            } catch (e) {
                                console.warn(`Error al parsear fecha ${key}: ${response.data[key]}`);
                                this.form[key] = '';
                            }
                        } else {
                            this.form[key] = response.data[key];
                        }
                    }
                });
                this.isEditMode = true;
                this.initialStateSnapshot = JSON.stringify(this.form);
            } else {
                this.$root.showGlobalAlert(response.message || 'No se pudo cargar el requerimiento para editar.', 'danger');
                this.$root.switchView('requirements'); // Volver a la lista
            }
        } catch (error) {
            console.error('Error cargando requerimiento para editar:', error);
            this.$root.showGlobalAlert('Error al cargar datos para edición: ' + error.message, 'danger');
            this.$root.switchView('requirements');
        } finally {
            this.isLoading = false;
            this.$root.isLoading = false;
        }
    }
  },
  created() {
    this.fetchAssignableUsers();
    if (this.requirementIdToEdit) {
        this.isEditMode = true;
        this.loadRequirementForEdit(this.requirementIdToEdit);
    } else {
        this.isEditMode = false;
        this.form.codigo_unico = this.generateCodigoUnico();
        this.form.estado_general = 'Ingresado'; // Estado por defecto para nuevos
         // Establecer fechas por defecto o dejarlas vacías según la lógica de negocio
        const today = new Date().toISOString().split('T')[0];
        // this.form.fecha_notificacion = today; // Ejemplo
    }
  },
  watch: {
    requirementIdToEdit(newId, oldId) {
        if (newId && newId !== oldId) {
            this.loadRequirementForEdit(newId);
        } else if (!newId) {
            this.isEditMode = false;
            // Resetear formulario para nuevo ingreso
            Object.keys(this.form).forEach(key => {
                if (typeof this.form[key] === 'string') this.form[key] = '';
                // Ajustar valores por defecto para nuevo
            });
            this.form.codigo_unico = this.generateCodigoUnico();
            this.form.estado_general = 'Ingresado';
            this.form.necesita_soporte_sistemas = 'POR CONFIRMAR';
            this.form.necesita_prorroga = 'NO';
            this.form.estado_sistemas = 'N/A';
        }
    }
  }
};
</script>
<style scoped>
.requirement-form-view .card {
  border-radius: var(--border-radius-base);
}
.requirement-form-view .card-header {
  border-top-left-radius: var(--border-radius-base);
  border-top-right-radius: var(--border-radius-base);
}
.form-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--bbva-grey-600);
}
.form-control-sm, .form-select-sm {
    font-size: 0.8rem; /* Reducir tamaño de fuente de inputs */
    padding: 0.35rem 0.6rem; /* Ajustar padding */
}
legend {
    font-size: 1.1rem !important; /* Ajustar tamaño de leyendas */
}
.bg-light-bbva {
    background-color: #f8f9fa; /* Un gris muy claro, ajustar si tienes un color específico BBVA */
}
.border-primary-bbva {
    border-color: var(--bbva-medium-blue) !important;
}
.text-primary-bbva {
    color: var(--bbva-medium-blue) !important;
}
.btn-primary-bbva {
  background-color: var(--bbva-medium-blue);
  border-color: var(--bbva-medium-blue);
  color: var(--bbva-white);
}
.btn-primary-bbva:hover {
  background-color: var(--bbva-core-dark-blue);
  border-color: var(--bbva-core-dark-blue);
}
.was-validated .form-control:invalid, .form-control.is-invalid {
    border-color: var(--bbva-red-dark);
}
.was-validated .form-control:invalid:focus, .form-control.is-invalid:focus {
    box-shadow: 0 0 0 0.2rem rgba(185, 42, 69, 0.25); /* Sombra roja BBVA */
}
.invalid-feedback {
    color: var(--bbva-red-dark);
    font-size: 0.75rem;
}
</style>
