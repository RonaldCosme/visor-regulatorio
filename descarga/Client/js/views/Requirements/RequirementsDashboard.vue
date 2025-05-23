<script type="text/x-template" id="RequirementsDashboardView">
  <div class="container-fluid requirements-dashboard animate__animated animate__fadeIn">
    <div class="row mb-4">
      <div class="col-12">
        <h2 class="page-title"><i class="bi bi-file-earmark-text me-2"></i>Módulo de Requerimientos</h2>
        <p class="text-muted page-subtitle">Gestiona y consulta los requerimientos regulatorios.</p>
      </div>
    </div>

    <div class="row mb-4 g-3">
      <div class="col-md-6 col-lg-3">
        <div class="kpi-card animate__animated animate__fadeInUp" style="animation-delay: 0.1s;">
          <div class="kpi-icon-wrapper bg-primary-bbva">
            <i class="bi bi-journal-check"></i>
          </div>
          <div class="kpi-content">
            <h5 class="kpi-value">152</h5>
            <p class="kpi-label">Requerimientos Activos</p>
          </div>
        </div>
      </div>
      <div class="col-md-6 col-lg-3">
        <div class="kpi-card animate__animated animate__fadeInUp" style="animation-delay: 0.2s;">
          <div class="kpi-icon-wrapper bg-success-bbva">
            <i class="bi bi-check2-circle"></i>
          </div>
          <div class="kpi-content">
            <h5 class="kpi-value">85</h5>
            <p class="kpi-label">Cumplidos a Tiempo</p>
          </div>
        </div>
      </div>
      <div class="col-md-6 col-lg-3">
        <div class="kpi-card animate__animated animate__fadeInUp" style="animation-delay: 0.3s;">
          <div class="kpi-icon-wrapper bg-warning-bbva">
            <i class="bi bi-hourglass-split"></i>
          </div>
          <div class="kpi-content">
            <h5 class="kpi-value">12</h5>
            <p class="kpi-label">Próximos a Vencer</p>
          </div>
        </div>
      </div>
      <div class="col-md-6 col-lg-3">
        <div class="kpi-card animate__animated animate__fadeInUp" style="animation-delay: 0.4s;">
          <div class="kpi-icon-wrapper bg-danger-bbva">
            <i class="bi bi-exclamation-triangle"></i>
          </div>
          <div class="kpi-content">
            <h5 class="kpi-value">5</h5>
            <p class="kpi-label">Vencidos</p>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-md-6">
        <div class="action-card animate__animated animate__zoomIn" style="animation-delay: 0.5s;" @click="navigateTo('requirements.new')">
          <div class="action-icon-wrapper">
            <i class="bi bi-file-earmark-plus-fill"></i>
          </div>
          <div class="action-content">
            <h4 class="action-title">Ingresar Requerimiento</h4>
            <p class="action-description">Registra un nuevo requerimiento regulatorio en el sistema.</p>
          </div>
          <i class="bi bi-chevron-right action-arrow"></i>
        </div>
      </div>
      <div class="col-md-6">
        <div class="action-card animate__animated animate__zoomIn" style="animation-delay: 0.6s;" @click="navigateTo('requirements.list')">
          <div class="action-icon-wrapper">
            <i class="bi bi-search"></i>
          </div>
          <div class="action-content">
            <h4 class="action-title">Consultar Requerimientos</h4>
            <p class="action-description">Busca, visualiza y gestiona los requerimientos existentes.</p>
          </div>
          <i class="bi bi-chevron-right action-arrow"></i>
        </div>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-12">
        <div class="additional-info-card animate__animated animate__fadeInUp" style="animation-delay: 0.7s;">
          <h5 class="card-title-bbva"><i class="bi bi-bar-chart-line-fill me-2"></i>Resumen Adicional</h5>
          <p class="text-muted">Aquí se podrían mostrar gráficos o más datos relevantes sobre los requerimientos.</p>
          <div class="placeholder-chart mt-3 d-flex align-items-center justify-content-center bg-light text-muted">
            <i class="bi bi-graph-up-arrow" style="font-size: 3rem;"></i>
            <span class="ms-2">Gráfico de Tendencias (Próximamente)</span>
          </div>
        </div>
      </div>
    </div>

  </div>
</script>
<script>
  const RequirementsDashboardView = {
    template: '#RequirementsDashboardView',
    data() {
      return {
        // Datos para los KPIs podrían cargarse dinámicamente en el futuro
      };
    },
    methods: {
      navigateTo(viewName) {
        // Por ahora, solo un log. En el futuro, cambiaría la vista o ruta.
        console.log(`Navegar a: ${viewName}`);
        this.$root.showGlobalAlert(`Funcionalidad '${viewName}' aún no implementada.`, 'info');
        // Ejemplo: this.$root.switchView(viewName);
      }
    },
    mounted() {
      // Lógica cuando el componente se monta, si es necesaria
    }
  };
</script>
