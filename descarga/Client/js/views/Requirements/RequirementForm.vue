<script type="text/x-template" id="RequirementFormView">
<div class="requirement-form-view container py-4 animate__animated animate__fadeIn">
  <div class="card shadow-lg border-0">
    <div class="card-header bg-primary-bbva text-white d-flex align-items-center justify-content-between">
      <div class="d-flex align-items-center">
        <i class="bi bi-file-earmark-text-fill me-2 fs-5"></i>
        <h4 class="mb-0">{{ isEditMode ? 'Editar Requerimiento' : 'Registrar Nuevo Requerimiento' }}</h4>
      </div>
      <button type="button" class="btn btn-outline-light btn-sm" @click="cancelForm">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>
    
    <div class="card-body p-4 p-md-5">
      <!-- Información de modo edición -->
      <div v-if="isEditMode" class="alert alert-info animate__animated animate__fadeIn mb-4">
        <i class="bi bi-info-circle me-2"></i>
        <strong>Modo Edición:</strong> Modificando requerimiento {{ form.codigo_unico }}
        <div class="mt-1">
          <small>Creado: {{ formatDate(form.fecha_registro) }} | Última modificación: {{ formatDate(form.fecha_ultima_modificacion) }}</small>
        </div>
      </div>

      <form @submit.prevent="submitForm" novalidate ref="requirementForm">
        <!-- Información Principal -->
        <fieldset class="mb-4">
          <legend class="fs-5 fw-semibold text-primary-bbva mb-3 pb-2 border-bottom">
            <i class="bi bi-info-circle-fill me-2"></i>Información Principal
          </legend>
          <div class="row g-3">
            <div class="col-md-4">
              <label for="codigo-unico" class="form-label">Código Único</label>
              <input type="text" class="form-control form-control-sm bg-light" id="codigo-unico" 
                     v-model="form.codigo_unico" readonly>
            </div>
            <div class="col-md-4">
              <label for="tipo-documento" class="form-label">Tipo Documento <span class="text-danger">*</span></label>
              <select class="form-select form-select-sm" id="tipo-documento" 
                      v-model="form.tipo_documento" @change="handleTipoDocumentoChange" required>
                <option value="" disabled>Seleccione...</option>
                <option value="Oficio">OFICIO</option>
                <option value="Carta">CARTA</option>
                <option value="Correo">CORREO</option>
              </select>
              <div class="invalid-feedback">Este campo es requerido.</div>
            </div>
            <div class="col-md-4" v-if="form.tipo_documento === 'Oficio'">
              <label for="numero-oficio" class="form-label">Número de Oficio <span class="text-danger">*</span></label>
              <input type="text" class="form-control form-control-sm" id="numero-oficio" 
                     v-model="form.numero_oficio" placeholder="Ej: OFS-001-2024" 
                     :required="form.tipo_documento === 'Oficio'">
              <div class="invalid-feedback">Este campo es requerido para oficios.</div>
            </div>
            <div class="col-md-4">
              <label for="organismo-regulador" class="form-label">Ente Regulatorio <span class="text-danger">*</span></label>
              <select class="form-select form-select-sm" id="organismo-regulador" 
                      v-model="form.organismo_regulador" required>
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
              <select class="form-select form-select-sm" id="necesita-soporte-sistemas" 
                      v-model="form.necesita_soporte_sistemas" @change="handleNecesitaSoporteChange" required>
                <option value="POR CONFIRMAR">POR CONFIRMAR</option>
                <option value="SI">SÍ</option>
                <option value="NO">NO</option>
              </select>
            </div>
            <div class="col-md-6">
              <label for="aspecto-documento" class="form-label">Asunto / Aspecto Principal <span class="text-danger">*</span></label>
              <input type="text" class="form-control form-control-sm" id="aspecto-documento" 
                     v-model="form.aspecto_documento" placeholder="Ej: Solicitud de información sobre cartera crediticia" required>
              <div class="invalid-feedback">Este campo es requerido.</div>
            </div>
            <div class="col-md-6">
              <label for="desglose-documento" class="form-label">Desglose del Documento</label>
              <input type="text" class="form-control form-control-sm" id="desglose-documento" 
                     v-model="form.desglose_documento" placeholder="Ej: Anexo A, Sección III">
            </div>
          </div>
        </fieldset>

        <!-- Equipo Asignado -->
        <fieldset class="mb-4">
          <legend class="fs-5 fw-semibold text-primary-bbva mb-3 pb-2 border-bottom">
            <i class="bi bi-people-fill me-2"></i>Equipo Asignado y Notificación
          </legend>
          <div class="row g-3">
            <div class="col-md-4">
              <label for="responsable-asignado" class="form-label">Responsable Asignado <span class="text-danger">*</span></label>
              <input type="text" class="form-control form-control-sm" id="responsable-asignado" 
                     v-model="form.responsable_asignado" list="lista-asignables-req" 
                     placeholder="Nombre del responsable" required>
              <datalist id="lista-asignables-req">
                <option v-for="asignable in asignables" :key="asignable" :value="asignable"></option>
              </datalist>
              <div class="invalid-feedback">Este campo es requerido.</div>
            </div>
            <div class="col-md-4">
              <label for="email-solicitante" class="form-label">Email Solicitante/Responsable <span class="text-danger">*</span></label>
              <input type="email" class="form-control form-control-sm" id="email-solicitante" 
                     v-model="form.email_solicitante" placeholder="correo@bbva.com" required>
              <div class="invalid-feedback">Ingrese un email válido.</div>
            </div>
            <div class="col-md-4">
              <label for="copia-email" class="form-label">Emails en Copia (CC)</label>
              <input type="text" class="form-control form-control-sm" id="copia-email" 
                     v-model="form.copia_email" placeholder="separados por coma">
            </div>
            <div class="col-md-6">
              <label for="area-responsable" class="form-label">Área Responsable <span class="text-danger">*</span></label>
              <input type="text" class="form-control form-control-sm" id="area-responsable" 
                     v-model="form.area_responsable" required>
              <div class="invalid-feedback">Este campo es requerido.</div>
            </div>
            <div class="col-md-6">
              <label for="unidad-responsable" class="form-label">Unidad Responsable <span class="text-danger">*</span></label>
              <input type="text" class="form-control form-control-sm" id="unidad-responsable" 
                     v-model="form.unidad_responsable" required>
              <div class="invalid-feedback">Este campo es requerido.</div>
            </div>
          </div>
        </fieldset>

        <!-- Fechas Clave -->
        <fieldset class="mb-4">
          <legend class="fs-5 fw-semibold text-primary-bbva mb-3 pb-2 border-bottom">
            <i class="bi bi-calendar-check-fill me-2"></i>Fechas Clave
          </legend>
          <div class="row g-3">
            <div class="col-md-4">
              <label for="fecha-notificacion" class="form-label">Fecha Notificación Regulador <span class="text-danger">*</span></label>
              <input type="date" class="form-control form-control-sm" id="fecha-notificacion" 
                     v-model="form.fecha_notificacion" required>
              <div class="invalid-feedback">Este campo es requerido.</div>
            </div>
            <div class="col-md-4">
              <label for="fecha-vencimiento-interno" class="form-label">Fecha Vencimiento Interno <span class="text-danger">*</span></label>
              <input type="date" class="form-control form-control-sm" id="fecha-vencimiento-interno" 
                     v-model="form.fecha_vencimiento_interno" required>
              <div class="invalid-feedback">Este campo es requerido.</div>
            </div>
            <div class="col-md-4">
              <label for="fecha-vencimiento-regulador" class="form-label">Fecha Vencimiento Regulador <span class="text-danger">*</span></label>
              <input type="date" class="form-control form-control-sm" id="fecha-vencimiento-regulador" 
                     v-model="form.fecha_vencimiento_regulador" required>
              <div class="invalid-feedback">Este campo es requerido.</div>
            </div>
          </div>
        </fieldset>

        <!-- Descripción -->
        <fieldset class="mb-4">
          <legend class="fs-5 fw-semibold text-primary-bbva mb-3 pb-2 border-bottom">
            <i class="bi bi-body-text me-2"></i>Descripción Detallada
          </legend>
          <div class="row">
            <div class="col-12">
              <label for="descripcion-detallada" class="form-label">Descripción Completa del Requerimiento <span class="text-danger">*</span></label>
              <textarea class="form-control form-control-sm" id="descripcion-detallada" 
                        v-model="form.descripcion_detallada" rows="4" 
                        placeholder="Detalle aquí el requerimiento..." required></textarea>
              <div class="invalid-feedback">Este campo es requerido.</div>
            </div>
          </div>
        </fieldset>

        <!-- Soporte de Sistemas -->
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
                <input type="text" class="form-control form-control-sm" id="ticket-peticion-sistemas" 
                       v-model="form.ticket_peticion_sistemas" placeholder="INC001, JIRA-123">
              </div>
              <div class="col-12">
                <label for="comentario-sistemas" class="form-label">Comentarios para Sistemas</label>
                <textarea class="form-control form-control-sm" id="comentario-sistemas" 
                          v-model="form.comentario_sistemas" rows="2"></textarea>
              </div>
            </div>
          </div>
        </fieldset>
        
        <!-- Gestión de Prórroga (solo en edición) -->
        <fieldset class="mb-4" v-if="isEditMode">
          <legend class="fs-5 fw-semibold text-primary-bbva mb-3 pb-2 border-bottom">
            <i class="bi bi-calendar-plus-fill me-2"></i>Gestión de Prórroga y Estado
          </legend>
          <div class="row g-3">
            <div class="col-md-3">
              <label for="estado-general" class="form-label">Estado General <span class="text-danger">*</span></label>
              <select class="form-select form-select-sm" id="estado-general" 
                      v-model="form.estado_general" required @change="handleEstadoGeneralChange">
                <option value="Ingresado">Ingresado</option>
                <option value="En proceso">En proceso</option>
                <option value="Prórroga">Prórroga</option>
                <option value="Terminado">Terminado</option>
                <option value="Terminado con prórroga">Terminado con prórroga</option>
                <option value="Observado">Observado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
            <div class="col-md-3">
              <label for="necesita-prorroga" class="form-label">¿Necesita Prórroga?</label>
              <select class="form-select form-select-sm" id="necesita-prorroga" 
                      v-model="form.necesita_prorroga" @change="handleNecesitaProrrogaChange">
                <option value="NO">NO</option>
                <option value="SI">SÍ</option>
              </select>
            </div>
            <div class="col-md-3" v-if="form.necesita_prorroga === 'SI'">
              <label for="fecha-prorroga" class="form-label">Fecha Prórroga</label>
              <input type="date" class="form-control form-control-sm" id="fecha-prorroga" 
                     v-model="form.fecha_prorroga">
            </div>
            <div class="col-md-3" v-if="form.necesita_prorroga === 'SI'">
              <label for="motivo-prorroga" class="form-label">Motivo Prórroga</label>
              <input type="text" class="form-control form-control-sm" id="motivo-prorroga" 
                     v-model="form.motivo_prorroga" placeholder="Justificación">
            </div>
            <div class="col-md-4">
              <label for="fecha-entrega-banco" class="form-label">
                Fecha Entrega a Regulador
                <span v-if="isTerminadoState" class="text-danger">*</span>
              </label>
              <input type="date" class="form-control form-control-sm" id="fecha-entrega-banco" 
                     v-model="form.fecha_entrega_banco" :required="isTerminadoState">
              <div class="form-text text-danger small mt-1" v-if="isTerminadoState && !form.fecha_entrega_banco">
                Requerido si estado es Terminado.
              </div>
            </div>
          </div>
        </fieldset>

        <!-- Comentarios -->
        <fieldset class="mb-4">
          <legend class="fs-5 fw-semibold text-primary-bbva mb-3 pb-2 border-bottom">
            <i class="bi bi-chat-left-text-fill me-2"></i>Comentarios Adicionales
          </legend>
          <div class="col-12">
            <label for="comentarios-generales" class="form-label">Comentarios Generales</label>
            <textarea class="form-control form-control-sm" id="comentarios-generales" 
                      v-model="form.comentarios_generales" rows="3" 
                      placeholder="Observaciones, notas adicionales..."></textarea>
          </div>
        </fieldset>

        <!-- Botones de acción -->
        <div class="d-flex justify-content-between align-items-center mt-5 border-top pt-4">
          <div>
            <button type="button" class="btn btn-outline-secondary rounded-pill px-4" @click="cancelForm">
              <i class="bi bi-x-circle me-2"></i>Cancelar
            </button>
          </div>
          <div class="d-flex gap-2">
            <button v-if="isEditMode && hasChanges" type="button" class="btn btn-outline-warning rounded-pill px-3" 
                    @click="resetForm" title="Deshacer cambios">
              <i class="bi bi-arrow-counterclockwise me-1"></i>Deshacer
            </button>
            <button type="submit" class="btn btn-primary-bbva rounded-pill px-4" :disabled="isLoading">
              <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              <i v-else :class="isEditMode ? 'bi bi-save-fill me-2' : 'bi bi-plus-circle-fill me-2'"></i>
              {{ isEditMode ? 'Guardar Cambios' : 'Registrar Requerimiento' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</div>
</script>

<script>
const RequirementFormView = {
  template: '#RequirementFormView',
  props: ['requirementIdToEdit'],
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
        estado_sistemas: 'N/A',
        tipo_pedido_sistemas: '',
        ticket_peticion_sistemas: '',
        comentario_sistemas: '',
        estado_general: 'Ingresado',
        necesita_prorroga: 'NO',
        fecha_prorroga: '',
        motivo_prorroga: '',
        fecha_entrega_banco: '',
        comentarios_generales: '',
        url_carpeta_anexos: '',
        fecha_registro: '',
        fecha_ultima_modificacion: ''
      },
      isLoading: false,
      isEditMode: false,
      asignables: [],
      initialFormState: null,
      formErrors: {}
    };
  },
  computed: {
    isTerminadoState() {
      return this.form.estado_general === 'Terminado' || this.form.estado_general === 'Terminado con prórroga';
    },
    hasChanges() {
      if (!this.isEditMode || !this.initialFormState) return false;
      return JSON.stringify(this.form) !== JSON.stringify(this.initialFormState);
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
        this.form.estado_sistemas = 'Ingresado';
      }
    },
    
    handleNecesitaProrrogaChange() {
      if (this.form.necesita_prorroga === 'NO') {
        this.form.fecha_prorroga = '';
        this.form.motivo_prorroga = '';
      }
      
      if (this.form.necesita_prorroga === 'SI' && 
          !(this.form.estado_general === 'Prórroga' || this.form.estado_general === 'Terminado con prórroga')) {
        if (confirm('Ha indicado que necesita prórroga. ¿Desea cambiar el estado general a "Prórroga"?')) {
          this.form.estado_general = 'Prórroga';
        } else {
          this.form.necesita_prorroga = 'NO';
        }
      }
    },
    
    handleEstadoGeneralChange() {
      if (this.form.estado_general === 'Prórroga' || this.form.estado_general === 'Terminado con prórroga') {
        if (this.form.necesita_prorroga !== 'SI') {
          this.form.necesita_prorroga = 'SI';
        }
      } else {
        if (this.form.necesita_prorroga === 'SI') {
          if (confirm('El estado general ya no es de prórroga. ¿Desea quitar la marca de "Necesita prórroga"?')) {
            this.form.necesita_prorroga = 'NO';
            this.form.fecha_prorroga = '';
            this.form.motivo_prorroga = '';
          }
        }
      }
      
      if (this.isTerminadoState && this.form.necesita_soporte_sistemas === 'SI' && 
          this.form.estado_sistemas !== 'Terminado') {
        this.$root.showGlobalAlert(
          'Si el estado general es Terminado y requiere soporte de sistemas, el estado de sistemas también debe ser Terminado.', 
          'warning', 7000
        );
      }
    },
    
    validateForm() {
      const form = this.$refs.requirementForm;
      form.classList.add('was-validated');
      
      // Validaciones específicas
      let isValid = form.checkValidity();
      
      if (this.isEditMode && this.isTerminadoState && !this.form.fecha_entrega_banco) {
        this.$root.showGlobalAlert(
          'La "Fecha Entrega a Regulador" es obligatoria si el estado es Terminado.', 
          'warning', 7000
        );
        document.getElementById('fecha-entrega-banco')?.focus();
        return false;
      }
      
      if (this.isEditMode && this.form.necesita_prorroga === 'SI' && 
          (!this.form.fecha_prorroga || !this.form.motivo_prorroga)) {
        this.$root.showGlobalAlert(
          'Si necesita prórroga, la fecha y el motivo son obligatorios.', 
          'warning', 7000
        );
        if (!this.form.fecha_prorroga) {
          document.getElementById('fecha-prorroga')?.focus();
        } else {
          document.getElementById('motivo-prorroga')?.focus();
        }
        return false;
      }
      
      return isValid;
    },
    
    async submitForm() {
      if (!this.validateForm()) {
        this.$root.showGlobalAlert('Por favor, corrija los errores en el formulario.', 'warning');
        return;
      }

      this.isLoading = true;
      this.$root.isLoading = true;

      try {
        let response;
        const payload = { ...this.form };

        if (this.isEditMode) {
          payload.codigo_unico_hidden = this.form.codigo_unico;
          response = await apiService.callAppsScript('updateRequirement_API', payload);
        } else {
          response = await apiService.callAppsScript('createRequirement_API', payload);
        }

        if (response.success) {
          this.$root.showGlobalAlert(
            response.message || (this.isEditMode ? 'Requerimiento actualizado correctamente.' : 'Requerimiento registrado correctamente.'), 
            'success'
          );
          this.$root.switchView('requirements');
        } else {
          this.$root.showGlobalAlert(response.message || 'Ocurrió un error al procesar el requerimiento.', 'danger');
        }
      } catch (error) {
        console.error('Error al enviar formulario:', error);
        this.$root.showGlobalAlert('Error de conexión: ' + error.message, 'danger');
      } finally {
        this.isLoading = false;
        this.$root.isLoading = false;
      }
    },
    
    cancelForm() {
      if (this.hasChanges && 
          !confirm('¿Está seguro de que desea cancelar? Se perderán los cambios no guardados.')) {
        return;
      }
      this.$root.switchView('requirements');
    },
    
    resetForm() {
      if (this.initialFormState) {
        Object.assign(this.form, JSON.parse(JSON.stringify(this.initialFormState)));
        // Limpiar validación
        const form = this.$refs.requirementForm;
        if (form) {
          form.classList.remove('was-validated');
        }
      }
    },
    
    async loadRequirementForEdit(id) {
      this.isLoading = true;
      this.$root.isLoading = true;
      
      try {
        const response = await apiService.callAppsScript('getRequirementById_API', id);
        if (response.success && response.data) {
          // Mapear datos y convertir fechas
          Object.keys(this.form).forEach(key => {
            if (response.data.hasOwnProperty(key)) {
              if (key.startsWith('fecha_') && response.data[key]) {
                try {
                  this.form[key] = new Date(response.data[key]).toISOString().split('T')[0];
                } catch (e) {
                  console.warn(`Error al parsear fecha ${key}: ${response.data[key]}`);
                  this.form[key] = '';
                }
              } else {
                this.form[key] = response.data[key] || '';
              }
            }
          });
          
          this.isEditMode = true;
          // Guardar estado inicial para detectar cambios
          this.initialFormState = JSON.parse(JSON.stringify(this.form));
        } else {
          this.$root.showGlobalAlert(response.message || 'No se pudo cargar el requerimiento.', 'danger');
          this.$root.switchView('requirements');
        }
      } catch (error) {
        console.error('Error cargando requerimiento:', error);
        this.$root.showGlobalAlert('Error al cargar datos: ' + error.message, 'danger');
        this.$root.switchView('requirements');
      } finally {
        this.isLoading = false;
        this.$root.isLoading = false;
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      try {
        return new Date(dateString).toLocaleDateString('es-PE', {
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return 'N/A';
      }
    },
    
    resetToNewMode() {
      this.isEditMode = false;
      this.initialFormState = null;
      
      // Resetear formulario
      Object.keys(this.form).forEach(key => {
        if (typeof this.form[key] === 'string') {
          this.form[key] = '';
        }
      });
      
      // Valores por defecto
      this.form.codigo_unico = this.generateCodigoUnico();
      this.form.estado_general = 'Ingresado';
      this.form.necesita_soporte_sistemas = 'POR CONFIRMAR';
      this.form.necesita_prorroga = 'NO';
      this.form.estado_sistemas = 'N/A';
      
      // Limpiar validación
      const form = this.$refs.requirementForm;
      if (form) {
        form.classList.remove('was-validated');
      }
    }
  },
  
  created() {
    this.fetchAssignableUsers();
    
    if (this.requirementIdToEdit) {
      this.loadRequirementForEdit(this.requirementIdToEdit);
    } else {
      this.resetToNewMode();
    }
  },
  
  watch: {
    requirementIdToEdit(newId, oldId) {
      if (newId && newId !== oldId) {
        this.loadRequirementForEdit(newId);
      } else if (!newId) {
        this.resetToNewMode();
      }
    }
  }
};
</script>