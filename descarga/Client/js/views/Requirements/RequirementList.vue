<script type="text/x-template" id="RequirementListView">
<div class="requirement-list-view container-fluid py-3 animate__animated animate__fadeIn">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h3 class="text-primary-bbva mb-0"><i class="bi bi-list-task me-2"></i>Listado de Requerimientos</h3>
    <button class="btn btn-primary-bbva rounded-pill" @click="goToCreateRequirement">
      <i class="bi bi-plus-circle-fill me-2"></i>Registrar Nuevo Requerimiento
    </button>
  </div>

  <div class="card shadow-sm mb-4">
    <div class="card-body bg-light-bbva p-3">
      <p class="text-muted mb-0"><i class="bi bi-funnel-fill me-2"></i>Sección de filtros y búsqueda avanzada (Próximamente).</p>
    </div>
  </div>

  <div class="card shadow-sm">
    <div class="card-header bg-primary-bbva text-white">
      <i class="bi bi-table me-2"></i>Requerimientos Registrados
    </div>
    <div class="card-body">
      <p class="text-center text-muted py-5">
        <i class="bi bi-hourglass-split fs-1 mb-3 d-block"></i>
        La carga y visualización de la tabla de requerimientos estará disponible próximamente.
        <br>
        Por ahora, puede proceder a registrar un nuevo requerimiento.
      </p>
      <!--
      <div class="list-group">
        <a href="#" @click.prevent="editRequirement('RQ-EXAMPLE-001')" class="list-group-item list-group-item-action">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">RQ-EXAMPLE-001 - Solicitud de Información X</h5>
            <small>Vence: 2024-12-31</small>
          </div>
          <p class="mb-1">Organismo: SBS - Estado: En Proceso</p>
          <small>Responsable: Juan Pérez</small>
        </a>
      </div>
      -->
    </div>
     <div class="card-footer text-muted small">
        Total de requerimientos: 0 (funcionalidad de listado en desarrollo)
    </div>
  </div>
</div>
</script>
<script>
const RequirementListView = {
  template: '#RequirementListView',
  data() {
    return {
      // Aquí irían los datos de los requerimientos, paginación, etc.
    };
  },
  methods: {
    goToCreateRequirement() {
      // Navegar a la vista del formulario de creación.
      // Si RequirementFormView es una ruta separada:
      this.$root.currentView = 'requirementForm'; 
      // Si es un componente que se muestra/oculta o un modal, manejar su visibilidad.
      // Por ahora, asumimos que 'requirementForm' es una vista que se puede activar.
      // Y que no se está pasando un ID, por lo que el formulario estará en modo "creación".
      this.$root.requirementIdToEdit = null; 
    },
    editRequirement(requirementId) {
      // Navegar al formulario en modo edición
      this.$root.requirementIdToEdit = requirementId;
      this.$root.currentView = 'requirementForm';
    }
    // Métodos para cargar requerimientos, filtrar, paginar, etc.
  },
  mounted() {
    // Cargar requerimientos iniciales si es necesario
  }
};
</script>
<style scoped>
.requirement-list-view h3 {
    font-weight: 600;
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
.bg-light-bbva {
    background-color: #f8f9fa; /* Un gris muy claro */
}
</style>
