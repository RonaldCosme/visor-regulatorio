<script type="text/x-template" id="RequirementListView">
<div class="requirement-list-view container-fluid py-3 animate__animated animate__fadeIn">
  
  <!-- Header con título y acciones -->
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h3 class="text-primary-bbva mb-1">
        <i class="bi bi-list-task me-2"></i>Listado de Requerimientos
      </h3>
      <p class="text-muted mb-0">Gestiona y consulta todos los requerimientos regulatorios</p>
    </div>
    <div class="d-flex gap-2">
      <button class="btn btn-outline-secondary btn-sm" @click="refreshList" :disabled="isLoading" title="Actualizar lista">
        <i class="bi bi-arrow-clockwise me-1" :class="{ 'spin': isLoading }"></i>Actualizar
      </button>
      <button class="btn btn-primary-bbva rounded-pill" @click="goToCreateRequirement">
        <i class="bi bi-plus-circle-fill me-2"></i>Nuevo Requerimiento
      </button>
    </div>
  </div>

  <!-- Tarjetas de estadísticas -->
  <div class="row mb-4 g-3" v-if="!isLoadingStats">
    <div class="col-md-6 col-lg-3">
      <div class="kpi-card border-primary-bbva animate__animated animate__fadeInUp" 
           style="animation-delay: 0.1s;" @click="applyQuickFilter('all')">
        <div class="kpi-icon-wrapper bg-primary-bbva">
          <i class="bi bi-journal-text"></i>
        </div>
        <div class="kpi-content">
          <h5 class="kpi-value">{{ stats.total }}</h5>
          <p class="kpi-label">Total Requerimientos</p>
        </div>
      </div>
    </div>
    <div class="col-md-6 col-lg-3">
      <div class="kpi-card border-success-bbva animate__animated animate__fadeInUp" 
           style="animation-delay: 0.2s;" @click="applyQuickFilter('activos')">
        <div class="kpi-icon-wrapper bg-success-bbva">
          <i class="bi bi-play-circle"></i>
        </div>
        <div class="kpi-content">
          <h5 class="kpi-value">{{ stats.activos }}</h5>
          <p class="kpi-label">Activos</p>
        </div>
      </div>
    </div>
    <div class="col-md-6 col-lg-3">
      <div class="kpi-card border-warning-bbva animate__animated animate__fadeInUp" 
           style="animation-delay: 0.3s;" @click="applyQuickFilter('proximos_vencer')">
        <div class="kpi-icon-wrapper bg-warning-bbva">
          <i class="bi bi-clock-history"></i>
        </div>
        <div class="kpi-content">
          <h5 class="kpi-value">{{ stats.proximos_vencer }}</h5>
          <p class="kpi-label">Próximos a Vencer</p>
        </div>
      </div>
    </div>
    <div class="col-md-6 col-lg-3">
      <div class="kpi-card border-danger-bbva animate__animated animate__fadeInUp" 
           style="animation-delay: 0.4s;" @click="applyQuickFilter('vencidos')">
        <div class="kpi-icon-wrapper bg-danger-bbva">
          <i class="bi bi-exclamation-triangle"></i>
        </div>
        <div class="kpi-content">
          <h5 class="kpi-value">{{ stats.vencidos }}</h5>
          <p class="kpi-label">Vencidos</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Panel de filtros mejorado -->
  <div class="card shadow-sm mb-4">
    <div class="card-header bg-light d-flex justify-content-between align-items-center">
      <span><i class="bi bi-funnel me-2"></i>Filtros de Búsqueda</span>
      <div class="d-flex gap-2">
        <small class="text-muted" v-if="hasActiveFilters">{{ activeFiltersCount }} filtro(s) activo(s)</small>
        <button class="btn btn-outline-secondary btn-sm" @click="clearAllFilters" v-if="hasActiveFilters">
          <i class="bi bi-x-circle me-1"></i>Limpiar
        </button>
      </div>
    </div>
    <div class="card-body">
      <div class="row g-3 align-items-end">
        <div class="col-md-3">
          <label class="form-label">Búsqueda General</label>
          <div class="input-group">
            <input type="text" class="form-control" v-model="filters.busqueda" 
                   placeholder="Código, aspecto, responsable..." @input="debouncedSearch">
            <button class="btn btn-outline-secondary" type="button" @click="clearSearch" 
                    v-if="filters.busqueda" title="Limpiar búsqueda">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </div>
        <div class="col-md-2">
          <label class="form-label">Estado</label>
          <select class="form-select" v-model="filters.estado" @change="applyFilters">
            <option value="">Todos</option>
            <option value="Ingresado">Ingresado</option>
            <option value="En proceso">En proceso</option>
            <option value="Prórroga">Prórroga</option>
            <option value="Terminado">Terminado</option>
            <option value="Terminado con prórroga">Terminado con prórroga</option>
            <option value="Observado">Observado</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label">Organismo</label>
          <select class="form-select" v-model="filters.organismo" @change="applyFilters">
            <option value="">Todos</option>
            <option value="SBS">SBS</option>
            <option value="BCR">BCR</option>
            <option value="SMV">SMV</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label">Responsable</label>
          <input type="text" class="form-control" v-model="filters.responsable" 
                 @input="debouncedSearch" placeholder="Nombre del responsable">
        </div>
        <div class="col-md-2">
          <label class="form-label">Ordenar por</label>
          <select class="form-select" v-model="sortBy" @change="applySorting">
            <option value="fecha_registro_desc">Más Recientes</option>
            <option value="fecha_registro_asc">Más Antiguos</option>
            <option value="vencimiento_asc">Vencen Primero</option>
            <option value="estado_asc">Estado A-Z</option>
            <option value="codigo_asc">Código A-Z</option>
          </select>
        </div>
      </div>
    </div>
  </div>

  <!-- Tabla de requerimientos -->
  <div class="card shadow-sm">
    <div class="card-header bg-primary-bbva text-white d-flex justify-content-between align-items-center">
      <span>
        <i class="bi bi-table me-2"></i>Requerimientos 
        <span class="badge bg-light text-primary ms-2">{{ filteredRequirements.length }}</span>
      </span>
      <div class="d-flex align-items-center gap-2">
        <small class="opacity-75">Última actualización: {{ lastUpdateTime }}</small>
      </div>
    </div>
    <div class="card-body p-0">
      
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-2 text-muted">Cargando requerimientos...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="errorMessage" class="alert alert-danger m-3" role="alert">
        <i class="bi bi-exclamation-triangle me-2"></i>{{ errorMessage }}
        <div class="mt-2">
          <button class="btn btn-sm btn-outline-danger" @click="refreshList">
            <i class="bi bi-arrow-clockwise me-1"></i>Reintentar
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!isLoading && filteredRequirements.length === 0" class="text-center py-5">
        <i class="bi bi-inbox fs-1 text-muted mb-3 d-block"></i>
        <h5 class="text-muted">
          {{ hasActiveFilters ? 'No se encontraron resultados' : 'No hay requerimientos registrados' }}
        </h5>
        <p class="text-muted">
          {{ hasActiveFilters ? 'Intenta ajustar los filtros de búsqueda' : 'Comienza registrando tu primer requerimiento' }}
        </p>
        <div class="mt-3">
          <button v-if="!hasActiveFilters" class="btn btn-primary-bbva me-2" @click="goToCreateRequirement">
            <i class="bi bi-plus-circle me-2"></i>Crear Primer Requerimiento
          </button>
          <button v-if="hasActiveFilters" class="btn btn-outline-secondary" @click="clearAllFilters">
            <i class="bi bi-funnel me-1"></i>Limpiar Filtros
          </button>
        </div>
      </div>

      <!-- Tabla con datos -->
      <div v-else class="table-responsive">
        <table class="table table-hover table-sm mb-0">
          <thead class="table-light">
            <tr>
              <th style="width: 140px;">
                <i class="bi bi-hash me-1"></i>Código
              </th>
              <th>
                <i class="bi bi-file-text me-1"></i>Aspecto / Asunto
              </th>
              <th style="width: 100px;">
                <i class="bi bi-building me-1"></i>Organismo
              </th>
              <th style="width: 120px;">
                <i class="bi bi-flag me-1"></i>Estado
              </th>
              <th style="width: 180px;">
                <i class="bi bi-person me-1"></i>Responsable
              </th>
              <th style="width: 130px;">
                <i class="bi bi-calendar-event me-1"></i>Vencimiento
              </th>
              <th style="width: 100px;" class="text-center">
                <i class="bi bi-gear me-1"></i>Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="req in paginatedRequirements" :key="req.codigo_unico" 
                class="animate__animated animate__fadeInUp"
                :class="getRowClass(req)">
              <td>
                <div class="d-flex flex-column">
                  <code class="small fw-bold">{{ req.codigo_unico }}</code>
                  <small class="text-muted">{{ formatDate(req.fecha_registro, 'short') }}</small>
                </div>
              </td>
              <td>
                <div class="requirement-info">
                  <div class="fw-medium text-truncate" style="max-width: 300px;" 
                       :title="req.aspecto_documento">
                    {{ req.aspecto_documento || 'Sin título' }}
                  </div>
                  <div class="small text-muted">
                    <span class="badge bg-light text-dark me-1">{{ req.tipo_documento }}</span>
                    <span v-if="req.numero_oficio">{{ req.numero_oficio }}</span>
                  </div>
                </div>
              </td>
              <td>
                <span class="badge bg-secondary-bbva small">{{ req.organismo_regulador }}</span>
              </td>
              <td>
                <span :class="getEstadoBadgeClass(req.estado_general)">
                  {{ req.estado_general }}
                </span>
                <div v-if="req.necesita_soporte_sistemas === 'SI'" class="mt-1">
                  <i class="bi bi-hdd text-info" title="Requiere soporte de sistemas"></i>
                </div>
              </td>
              <td>
                <div class="small">
                  <div class="fw-medium">{{ req.responsable_asignado }}</div>
                  <div class="text-muted">{{ req.area_responsable }}</div>
                </div>
              </td>
              <td>
                <div class="d-flex flex-column">
                  <div class="small fw-medium" :class="getDateClass(req.fecha_vencimiento_regulador)">
                    {{ formatDate(req.fecha_vencimiento_regulador, 'short') }}
                  </div>
                  <div class="small text-muted" v-if="getDaysUntilDue(req.fecha_vencimiento_regulador) !== null">
                    {{ getDaysUntilDueText(req.fecha_vencimiento_regulador) }}
                  </div>
                </div>
              </td>
              <td class="text-center">
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-outline-primary btn-sm" 
                          @click="editRequirement(req.codigo_unico)" 
                          title="Editar requerimiento">
                    <i class="bi bi-pencil-square"></i>
                  </button>
                  <button class="btn btn-outline-info btn-sm" 
                          @click="viewRequirementDetails(req)" 
                          title="Ver detalles">
                    <i class="bi bi-eye"></i>
                  </button>
                  <button class="btn btn-outline-danger btn-sm" 
                          @click="confirmDelete(req)" 
                          title="Eliminar requerimiento"
                          :disabled="!canDelete(req)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación mejorada -->
      <div v-if="totalPages > 1" class="d-flex justify-content-between align-items-center p-3 border-top">
        <div class="d-flex align-items-center gap-2">
          <small class="text-muted">
            Mostrando {{ ((currentPage - 1) * itemsPerPage) + 1 }} - 
            {{ Math.min(currentPage * itemsPerPage, filteredRequirements.length) }} 
            de {{ filteredRequirements.length }} requerimientos
          </small>
          <select class="form-select form-select-sm" style="width: auto;" v-model="itemsPerPage" @change="handleItemsPerPageChange">
            <option :value="5">5 por página</option>
            <option :value="10">10 por página</option>
            <option :value="25">25 por página</option>
            <option :value="50">50 por página</option>
          </select>
        </div>
        <nav>
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="goToPage(1)" :disabled="currentPage === 1" title="Primera página">
                <i class="bi bi-chevron-double-left"></i>
              </button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" title="Página anterior">
                <i class="bi bi-chevron-left"></i>
              </button>
            </li>
            <li v-for="page in visiblePages" :key="page" 
                class="page-item" :class="{ active: page === currentPage }">
              <button class="page-link" @click="goToPage(page)">{{ page }}</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" title="Página siguiente">
                <i class="bi bi-chevron-right"></i>
              </button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="goToPage(totalPages)" :disabled="currentPage === totalPages" title="Última página">
                <i class="bi bi-chevron-double-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>

  <!-- Modal de confirmación de eliminación -->
  <div class="modal fade" id="deleteModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header bg-danger text-white">
          <h5 class="modal-title">
            <i class="bi bi-exclamation-triangle me-2"></i>Confirmar Eliminación
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <p><strong>¿Está seguro de que desea eliminar este requerimiento?</strong></p>
          <div v-if="requirementToDelete" class="alert alert-light">
            <table class="table table-sm table-borderless mb-0">
              <tr><td><strong>Código:</strong></td><td>{{ requirementToDelete.codigo_unico }}</td></tr>
              <tr><td><strong>Aspecto:</strong></td><td>{{ requirementToDelete.aspecto_documento }}</td></tr>
              <tr><td><strong>Estado:</strong></td><td>{{ requirementToDelete.estado_general }}</td></tr>
              <tr><td><strong>Responsable:</strong></td><td>{{ requirementToDelete.responsable_asignado }}</td></tr>
            </table>
          </div>
          <div class="alert alert-warning">
            <i class="bi bi-info-circle me-1"></i>
            <strong>Nota:</strong> Esta acción no se puede deshacer. El requerimiento y todos sus datos asociados serán eliminados permanentemente.
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            <i class="bi bi-x-circle me-1"></i>Cancelar
          </button>
          <button type="button" class="btn btn-danger" @click="deleteRequirement" :disabled="isDeletingReq">
            <span v-if="isDeletingReq" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-trash me-2"></i>
            {{ isDeletingReq ? 'Eliminando...' : 'Eliminar Definitivamente' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de detalles del requerimiento -->
  <div class="modal fade" id="detailsModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-primary-bbva text-white">
          <h5 class="modal-title">
            <i class="bi bi-info-circle me-2"></i>Detalles del Requerimiento
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body" v-if="selectedRequirement">
          <div class="row">
            <div class="col-md-8">
              <h6 class="text-primary-bbva">{{ selectedRequirement.aspecto_documento }}</h6>
              <p class="text-muted">{{ selectedRequirement.descripcion_detallada }}</p>
            </div>
            <div class="col-md-4">
              <span :class="getEstadoBadgeClass(selectedRequirement.estado_general)">
                {{ selectedRequirement.estado_general }}
              </span>
            </div>
          </div>
          
          <hr>
          
          <div class="row g-3">
            <div class="col-md-6">
              <table class="table table-sm table-borderless">
                <tr><td><strong>Código:</strong></td><td>{{ selectedRequirement.codigo_unico }}</td></tr>
                <tr><td><strong>Tipo:</strong></td><td>{{ selectedRequirement.tipo_documento }}</td></tr>
                <tr><td><strong>Organismo:</strong></td><td>{{ selectedRequirement.organismo_regulador }}</td></tr>
                <tr><td><strong>Categoría:</strong></td><td>{{ selectedRequirement.categoria }}</td></tr>
              </table>
            </div>
            <div class="col-md-6">
              <table class="table table-sm table-borderless">
                <tr><td><strong>Responsable:</strong></td><td>{{ selectedRequirement.responsable_asignado }}</td></tr>
                <tr><td><strong>Área:</strong></td><td>{{ selectedRequirement.area_responsable }}</td></tr>
                <tr><td><strong>Email:</strong></td><td>{{ selectedRequirement.email_solicitante }}</td></tr>
                <tr><td><strong>Vencimiento:</strong></td><td>{{ formatDate(selectedRequirement.fecha_vencimiento_regulador) }}</td></tr>
              </table>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          <button type="button" class="btn btn-primary-bbva" @click="editRequirementFromModal">
            <i class="bi bi-pencil-square me-1"></i>Editar
          </button>
        </div>
      </div>
    </div>
  </div>

</div>
</script>

<script>
const RequirementListView = {
  template: '#RequirementListView',
  data() {
    return {
      requirements: [],
      filteredRequirements: [],
      stats: { total: 0, activos: 0, terminados: 0, vencidos: 0, proximos_vencer: 0 },
      filters: {
        busqueda: '',
        estado: '',
        organismo: '',
        responsable: ''
      },
      sortBy: 'fecha_registro_desc',
      isLoading: false,
      isLoadingStats: false,
      isDeletingReq: false,
      errorMessage: '',
      currentPage: 1,
      itemsPerPage: 10,
      requirementToDelete: null,
      selectedRequirement: null,
      searchTimeout: null,
      lastUpdateTime: ''
    };
  },
  computed: {
    hasActiveFilters() {
      return Object.values(this.filters).some(filter => filter !== '') || this.sortBy !== 'fecha_registro_desc';
    },
    activeFiltersCount() {
      return Object.values(this.filters).filter(filter => filter !== '').length;
    },
    paginatedRequirements() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredRequirements.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredRequirements.length / this.itemsPerPage);
    },
    visiblePages() {
      const pages = [];
      const total = this.totalPages;
      const current = this.currentPage;
      
      let start = Math.max(1, current - 2);
      let end = Math.min(total, current + 2);
      
      if (end - start < 4 && total > 5) {
        if (start === 1) {
          end = Math.min(total, start + 4);
        } else if (end === total) {
          start = Math.max(1, end - 4);
        }
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    }
  },
  methods: {
    async loadRequirements() {
      this.isLoading = true;
      this.errorMessage = '';
      try {
        const response = await apiService.callAppsScript('getRequirementsList_API', this.filters);
        if (response.success) {
          this.requirements = response.data || [];
          this.applyFiltersAndSorting();
          this.lastUpdateTime = new Date().toLocaleTimeString('es-PE');
        } else {
          this.errorMessage = response.message || 'Error al cargar requerimientos.';
          this.requirements = [];
          this.filteredRequirements = [];
        }
      } catch (error) {
        this.errorMessage = error.message || 'Error de conexión al cargar requerimientos.';
        this.requirements = [];
        this.filteredRequirements = [];
      } finally {
        this.isLoading = false;
      }
    },
    
    async loadStats() {
      this.isLoadingStats = true;
      try {
        const response = await apiService.callAppsScript('getRequirementsStats_API');
        if (response.success) {
          this.stats = response.data;
        }
      } catch (error) {
        console.warn('Error cargando estadísticas:', error);
      } finally {
        this.isLoadingStats = false;
      }
    },
    
    applyFiltersAndSorting() {
      let filtered = [...this.requirements];
      
      // Aplicar filtros
      if (this.filters.busqueda) {
        const term = this.filters.busqueda.toLowerCase();
        filtered = filtered.filter(req => 
          req.codigo_unico.toLowerCase().includes(term) ||
          req.aspecto_documento.toLowerCase().includes(term) ||
          req.responsable_asignado.toLowerCase().includes(term) ||
          req.numero_oficio?.toLowerCase().includes(term) ||
          req.area_responsable.toLowerCase().includes(term) ||
          req.organismo_regulador.toLowerCase().includes(term)
        );
      }
      
      if (this.filters.estado) {
        filtered = filtered.filter(req => req.estado_general === this.filters.estado);
      }
      
      if (this.filters.organismo) {
        filtered = filtered.filter(req => req.organismo_regulador === this.filters.organismo);
      }
      
      if (this.filters.responsable) {
        const term = this.filters.responsable.toLowerCase();
        filtered = filtered.filter(req => 
          req.responsable_asignado.toLowerCase().includes(term)
        );
      }
      
      // Aplicar ordenamiento
      filtered.sort((a, b) => {
        switch (this.sortBy) {
          case 'fecha_registro_desc':
            return new Date(b.fecha_registro) - new Date(a.fecha_registro);
          case 'fecha_registro_asc':
            return new Date(a.fecha_registro) - new Date(b.fecha_registro);
          case 'vencimiento_asc':
            return new Date(a.fecha_vencimiento_regulador) - new Date(b.fecha_vencimiento_regulador);
          case 'estado_asc':
            return a.estado_general.localeCompare(b.estado_general);
          case 'codigo_asc':
            return a.codigo_unico.localeCompare(b.codigo_unico);
          default:
            return 0;
        }
      });
      
      this.filteredRequirements = filtered;
      this.currentPage = 1; // Resetear paginación
    },
    
    applyFilters() {
      this.applyFiltersAndSorting();
    },
    
    applySorting() {
      this.applyFiltersAndSorting();
    },
    
    debouncedSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.applyFiltersAndSorting();
      }, 300);
    },
    
    clearSearch() {
      this.filters.busqueda = '';
      this.applyFiltersAndSorting();
    },
    
    clearAllFilters() {
      this.filters = { busqueda: '', estado: '', organismo: '', responsable: '' };
      this.sortBy = 'fecha_registro_desc';
      this.applyFiltersAndSorting();
    },
    
    applyQuickFilter(type) {
      this.clearAllFilters();
      const today = new Date();
      const threeDays = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000));
      
      switch (type) {
        case 'activos':
          this.filters.estado = 'En proceso';
          break;
        case 'vencidos':
          // Filtrar manualmente los vencidos
          this.filteredRequirements = this.requirements.filter(req => {
            const fechaVenc = new Date(req.fecha_vencimiento_regulador);
            return fechaVenc < today && !['Terminado', 'Terminado con prórroga'].includes(req.estado_general);
          });
          return;
        case 'proximos_vencer':
          // Filtrar manualmente los próximos a vencer
          this.filteredRequirements = this.requirements.filter(req => {
            const fechaVenc = new Date(req.fecha_vencimiento_regulador);
            return fechaVenc >= today && fechaVenc <= threeDays && !['Terminado', 'Terminado con prórroga'].includes(req.estado_general);
          });
          return;
        default:
          // 'all' o cualquier otro
          break;
      }
      this.applyFiltersAndSorting();
    },
    
    async refreshList() {
      await Promise.all([this.loadRequirements(), this.loadStats()]);
    },
    
    goToCreateRequirement() {
      this.$root.createNewRequirement();
    },
    
    editRequirement(codigoUnico) {
      this.$root.editRequirement(codigoUnico);
    },
    
    editRequirementFromModal() {
      if (this.selectedRequirement) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('detailsModal'));
        modal.hide();
        this.editRequirement(this.selectedRequirement.codigo_unico);
      }
    },
    
    viewRequirementDetails(requirement) {
      this.selectedRequirement = requirement;
      const modal = new bootstrap.Modal(document.getElementById('detailsModal'));
      modal.show();
    },
    
    confirmDelete(requirement) {
      if (!this.canDelete(requirement)) {
        this.$root.showGlobalAlert(
          `No se puede eliminar un requerimiento en estado "${requirement.estado_general}". Solo se pueden eliminar requerimientos Ingresados o Cancelados.`,
          'warning',
          6000
        );
        return;
      }
      
      this.requirementToDelete = requirement;
      const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
      modal.show();
    },
    
    canDelete(requirement) {
      const deletableStates = ['Ingresado', 'Cancelado'];
      return deletableStates.includes(requirement.estado_general);
    },
    
    async deleteRequirement() {
      if (!this.requirementToDelete) return;
      
      this.isDeletingReq = true;
      try {
        const response = await apiService.callAppsScript('deleteRequirement_API', this.requirementToDelete.codigo_unico);
        if (response.success) {
          this.$root.showGlobalAlert('Requerimiento eliminado correctamente.', 'success');
          await this.refreshList();
          const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
          modal.hide();
        } else {
          this.$root.showGlobalAlert(response.message || 'Error al eliminar.', 'danger');
        }
      } catch (error) {
        this.$root.showGlobalAlert('Error de conexión al eliminar.', 'danger');
      } finally {
        this.isDeletingReq = false;
        this.requirementToDelete = null;
      }
    },
    
    handleItemsPerPageChange() {
      this.currentPage = 1;
    },
    
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    
    formatDate(dateString, format = 'full') {
      if (!dateString) return 'N/A';
      try {
        const date = new Date(dateString);
        if (format === 'short') {
          return date.toLocaleDateString('es-PE', { 
            day: '2-digit', 
            month: '2-digit'
          });
        }
        return date.toLocaleDateString('es-PE', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        });
      } catch {
        return 'N/A';
      }
    },
    
    getDaysUntilDue(dateString) {
      if (!dateString) return null;
      try {
        const fecha = new Date(dateString);
        const hoy = new Date();
        const diffTime = fecha - hoy;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
      } catch {
        return null;
      }
    },
    
    getDaysUntilDueText(dateString) {
      const days = this.getDaysUntilDue(dateString);
      if (days === null) return '';
      if (days < 0) return `Vencido hace ${Math.abs(days)} día(s)`;
      if (days === 0) return 'Vence hoy';
      if (days === 1) return 'Vence mañana';
      return `${days} día(s)`;
    },
    
    getDateClass(dateString) {
      const days = this.getDaysUntilDue(dateString);
      if (days === null) return '';
      if (days < 0) return 'text-danger fw-bold';
      if (days <= 3) return 'text-warning fw-bold';
      return 'text-success';
    },
    
    getEstadoBadgeClass(estado) {
      const classes = {
        'Ingresado': 'badge bg-info text-dark',
        'En proceso': 'badge bg-primary',
        'Prórroga': 'badge bg-warning text-dark',
        'Terminado': 'badge bg-success',
        'Terminado con prórroga': 'badge bg-success',
        'Observado': 'badge bg-secondary',
        'Cancelado': 'badge bg-danger'
      };
      return classes[estado] || 'badge bg-secondary';
    },
    
    getRowClass(req) {
      const days = this.getDaysUntilDue(req.fecha_vencimiento_regulador);
      if (days !== null && days < 0 && !['Terminado', 'Terminado con prórroga'].includes(req.estado_general)) {
        return 'table-danger';
      }
      return '';
    }
  },
  
  async mounted() {
    console.log('RequirementListView montado');
    await this.refreshList();
    
    // Auto-refresh cada 5 minutos
    setInterval(() => {
      if (!this.isLoading) {
        this.loadStats();
      }
    }, 5 * 60 * 1000);
  },
  
  beforeUnmount() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }
};
</script>