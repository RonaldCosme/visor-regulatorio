<script type="text/x-template" id="RequirementListView">
<div class="requirement-list-view container-fluid py-3 animate__animated animate__fadeIn">
  
  <!-- Header con título y botón de nuevo requerimiento -->
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h3 class="text-primary-bbva mb-1"><i class="bi bi-list-task me-2"></i>Listado de Requerimientos</h3>
      <p class="text-muted mb-0">Gestiona y consulta todos los requerimientos regulatorios</p>
    </div>
    <button class="btn btn-primary-bbva rounded-pill" @click="goToCreateRequirement">
      <i class="bi bi-plus-circle-fill me-2"></i>Nuevo Requerimiento
    </button>
  </div>

  <!-- Tarjetas de estadísticas -->
  <div class="row mb-4 g-3" v-if="!isLoadingStats">
    <div class="col-md-6 col-lg-3">
      <div class="kpi-card border-primary-bbva animate__animated animate__fadeInUp" style="animation-delay: 0.1s;">
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
      <div class="kpi-card border-success-bbva animate__animated animate__fadeInUp" style="animation-delay: 0.2s;">
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
      <div class="kpi-card border-warning-bbva animate__animated animate__fadeInUp" style="animation-delay: 0.3s;">
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
      <div class="kpi-card border-danger-bbva animate__animated animate__fadeInUp" style="animation-delay: 0.4s;">
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

  <!-- Panel de filtros -->
  <div class="card shadow-sm mb-4">
    <div class="card-body">
      <div class="row g-3 align-items-end">
        <div class="col-md-3">
          <label class="form-label">Buscar</label>
          <div class="input-group">
            <input type="text" class="form-control" v-model="filters.busqueda" placeholder="Código, aspecto, responsable..." @input="debouncedSearch">
            <button class="btn btn-outline-secondary" type="button" @click="clearSearch">
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
          <input type="text" class="form-control" v-model="filters.responsable" @input="debouncedSearch" placeholder="Nombre del responsable">
        </div>
        <div class="col-md-2">
          <button class="btn btn-outline-secondary w-100" @click="clearAllFilters">
            <i class="bi bi-funnel me-1"></i>Limpiar Filtros
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Tabla de requerimientos -->
  <div class="card shadow-sm">
    <div class="card-header bg-primary-bbva text-white d-flex justify-content-between align-items-center">
      <span><i class="bi bi-table me-2"></i>Requerimientos ({{ filteredRequirements.length }})</span>
      <button class="btn btn-sm btn-outline-light" @click="refreshList" :disabled="isLoading">
        <i class="bi bi-arrow-clockwise me-1" :class="{ 'spin': isLoading }"></i>Actualizar
      </button>
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
        <button class="btn btn-sm btn-outline-danger ms-2" @click="refreshList">Reintentar</button>
      </div>

      <!-- Empty State -->
      <div v-else-if="!isLoading && filteredRequirements.length === 0" class="text-center py-5">
        <i class="bi bi-inbox fs-1 text-muted mb-3 d-block"></i>
        <h5 class="text-muted">No se encontraron requerimientos</h5>
        <p class="text-muted">{{ hasActiveFilters ? 'Intenta ajustar los filtros de búsqueda' : 'Comienza registrando tu primer requerimiento' }}</p>
        <button v-if="!hasActiveFilters" class="btn btn-primary-bbva" @click="goToCreateRequirement">
          <i class="bi bi-plus-circle me-2"></i>Crear Primer Requerimiento
        </button>
      </div>

      <!-- Tabla con datos -->
      <div v-else class="table-responsive">
        <table class="table table-hover table-sm mb-0">
          <thead class="table-light">
            <tr>
              <th style="width: 140px;">Código</th>
              <th>Aspecto / Asunto</th>
              <th style="width: 100px;">Organismo</th>
              <th style="width: 120px;">Estado</th>
              <th style="width: 180px;">Responsable</th>
              <th style="width: 130px;">Vence</th>
              <th style="width: 100px;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="req in paginatedRequirements" :key="req.codigo_unico" 
                class="animate__animated animate__fadeInUp"
                :class="getRowClass(req)">
              <td>
                <code class="small">{{ req.codigo_unico }}</code>
                <div class="small text-muted">{{ formatDate(req.fecha_registro) }}</div>
              </td>
              <td>
                <div class="fw-medium">{{ req.aspecto_documento || 'Sin título' }}</div>
                <div class="small text-muted">
                  {{ req.tipo_documento }}{{ req.numero_oficio ? ' - ' + req.numero_oficio : '' }}
                </div>
              </td>
              <td>
                <span class="badge bg-secondary-bbva small">{{ req.organismo_regulador }}</span>
              </td>
              <td>
                <span :class="getEstadoBadgeClass(req.estado_general)">{{ req.estado_general }}</span>
              </td>
              <td>
                <div class="small">{{ req.responsable_asignado }}</div>
                <div class="small text-muted">{{ req.area_responsable }}</div>
              </td>
              <td>
                <div class="small" :class="getDateClass(req.fecha_vencimiento_regulador)">
                  {{ formatDate(req.fecha_vencimiento_regulador) }}
                </div>
              </td>
              <td>
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-outline-primary btn-sm" @click="editRequirement(req.codigo_unico)" 
                          title="Editar requerimiento">
                    <i class="bi bi-pencil-square"></i>
                  </button>
                  <button class="btn btn-outline-danger btn-sm" @click="confirmDelete(req)" 
                          title="Eliminar requerimiento">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div v-if="totalPages > 1" class="d-flex justify-content-between align-items-center p-3 border-top">
        <div class="small text-muted">
          Mostrando {{ ((currentPage - 1) * itemsPerPage) + 1 }} - {{ Math.min(currentPage * itemsPerPage, filteredRequirements.length) }} 
          de {{ filteredRequirements.length }} requerimientos
        </div>
        <nav>
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">
                <i class="bi bi-chevron-left"></i>
              </button>
            </li>
            <li v-for="page in visiblePages" :key="page" class="page-item" :class="{ active: page === currentPage }">
              <button class="page-link" @click="goToPage(page)">{{ page }}</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">
                <i class="bi bi-chevron-right"></i>
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
          <h5 class="modal-title"><i class="bi bi-exclamation-triangle me-2"></i>Confirmar Eliminación</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro de que deseas eliminar el requerimiento?</p>
          <div v-if="requirementToDelete" class="alert alert-light">
            <strong>Código:</strong> {{ requirementToDelete.codigo_unico }}<br>
            <strong>Aspecto:</strong> {{ requirementToDelete.aspecto_documento }}
          </div>
          <p class="text-danger small"><i class="bi bi-info-circle me-1"></i>Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-danger" @click="deleteRequirement" :disabled="isDeletingReq">
            <span v-if="isDeletingReq" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-trash me-2"></i>Eliminar
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
      isLoading: false,
      isLoadingStats: false,
      isDeletingReq: false,
      errorMessage: '',
      currentPage: 1,
      itemsPerPage: 10,
      requirementToDelete: null,
      searchTimeout: null
    };
  },
  computed: {
    hasActiveFilters() {
      return Object.values(this.filters).some(filter => filter !== '');
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
          this.applyFiltersInternal();
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
    applyFiltersInternal() {
      let filtered = [...this.requirements];
      
      if (this.filters.busqueda) {
        const term = this.filters.busqueda.toLowerCase();
        filtered = filtered.filter(req => 
          req.codigo_unico.toLowerCase().includes(term) ||
          req.aspecto_documento.toLowerCase().includes(term) ||
          req.responsable_asignado.toLowerCase().includes(term) ||
          req.numero_oficio?.toLowerCase().includes(term) ||
          req.area_responsable.toLowerCase().includes(term)
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
      
      this.filteredRequirements = filtered;
      this.currentPage = 1; // Resetear paginación
    },
    applyFilters() {
      this.applyFiltersInternal();
    },
    debouncedSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.applyFiltersInternal();
      }, 300);
    },
    clearSearch() {
      this.filters.busqueda = '';
      this.applyFiltersInternal();
    },
    clearAllFilters() {
      this.filters = { busqueda: '', estado: '', organismo: '', responsable: '' };
      this.applyFiltersInternal();
    },
    async refreshList() {
      await Promise.all([this.loadRequirements(), this.loadStats()]);
    },
    goToCreateRequirement() {
      this.$root.requirementIdToEdit = null;
      this.$root.switchView('requirementForm');
    },
    editRequirement(codigoUnico) {
      this.$root.requirementIdToEdit = codigoUnico;
      this.$root.switchView('requirementForm');
    },
    confirmDelete(requirement) {
      this.requirementToDelete = requirement;
      const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
      modal.show();
    },
    async deleteRequirement() {
      if (!this.requirementToDelete) return;
      
      this.isDeletingReq = true;
      try {
        const response = await apiService.callAppsScript('deleteRequirement_API', this.requirementToDelete.codigo_unico);
        if (response.success) {
          this.$root.showGlobalAlert('Requerimiento eliminado correctamente.', 'success');
          this.refreshList();
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
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-PE', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        });
      } catch {
        return 'N/A';
      }
    },
    getDateClass(dateString) {
      if (!dateString) return '';
      const fecha = new Date(dateString);
      const hoy = new Date();
      const tresDias = new Date(hoy.getTime() + (3 * 24 * 60 * 60 * 1000));
      
      if (fecha < hoy) return 'text-danger fw-bold';
      if (fecha <= tresDias) return 'text-warning fw-bold';
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
      const fecha = new Date(req.fecha_vencimiento_regulador);
      const hoy = new Date();
      if (fecha < hoy && req.estado_general !== 'Terminado' && req.estado_general !== 'Terminado con prórroga') {
        return 'table-danger';
      }
      return '';
    }
  },
  async mounted() {
    await this.refreshList();
  }
};
</script>

<style scoped>
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.table-danger {
  --bs-table-bg: #f8d7da;
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

.text-primary-bbva {
  color: var(--bbva-medium-blue) !important;
}

.bg-primary-bbva {
  background-color: var(--bbva-medium-blue) !important;
}

.bg-secondary-bbva {
  background-color: var(--bbva-grey-400) !important;
}

code {
  font-size: 0.8rem;
  color: var(--bbva-core-dark-blue);
  background-color: var(--bbva-grey-100);
}
</style>