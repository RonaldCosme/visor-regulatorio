<script type="text/x-template" id="app-navbar-template">
  <nav class="navbar navbar-expand-lg app-navbar fixed-top" :class="{ 'navbar-scrolled': isScrolled }">
    <div class="container-fluid">
      <a class="navbar-brand d-flex align-items-center" href="#" @click.prevent="navigate('dashboard')">
        <img :src="logoUrl" alt="Logo BBVA" class="navbar-logo me-2">
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
        <i class="bi bi-list"></i>
      </button>
      <div class="collapse navbar-collapse" id="navbarNavDropdown">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <a class="nav-link" :class="{ active: currentView === 'dashboard' }" href="#" @click.prevent="navigate('dashboard')">
              <i class="bi bi-house-door-fill"></i> Dashboard
            </a>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="modulosDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-grid-1x2-fill"></i> Módulos
            </a>
            <ul class="dropdown-menu animate__animated animate__fadeIn animate__faster" aria-labelledby="modulosDropdown">
              <li><a class="dropdown-item" href="#" @click.prevent="navigate('requirements')"><i class="bi bi-file-earmark-text"></i> Requerimientos</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="navigate('visits')"><i class="bi bi-building"></i> Visitas</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="navigate('recommendations')"><i class="bi bi-lightbulb"></i> Recomendaciones</a></li>
              <li v-if="isAdmin"><hr class="dropdown-divider"></li>
              <li v-if="isAdmin">
                <a class="dropdown-item" href="#" @click.prevent="navigate('userManagement')">
                  <i class="bi bi-people-fill"></i> Gestión Usuarios
                </a>
              </li>
            </ul>
          </li>
        </ul>

        <form class="d-flex search-form mx-lg-auto" role="search" @submit.prevent>
          <input class="form-control search-input" type="search" placeholder="Buscar..." aria-label="Buscar">
          <button class="btn search-button" type="submit"><i class="bi bi-search"></i></button>
        </form>

        <ul class="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="perfilDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-person-circle me-2 user-icon"></i>
              <span class="d-none d-lg-inline">{{ user && user.name ? user.name.split(' ')[0] : 'Usuario' }}</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end animate__animated animate__fadeIn animate__faster" aria-labelledby="perfilDropdown">
              <li class="user-info-dropdown px-3 py-2">
                  <strong class="d-block">{{ user ? user.name : 'Nombre Apellido' }}</strong>
                  <small class="d-block text-muted">{{ user ? user.email : 'usuario@example.com' }}</small>
                  <span :class="['badge mt-1', isAdmin ? 'bg-primary-bbva text-white' : 'bg-secondary-bbva']">{{ user ? user.role : 'Rol' }}</span>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item" href="#" @click.prevent="navigate('profile')"><i class="bi bi-person-badge"></i> Mi Perfil</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="logout"><i class="bi bi-box-arrow-right text-danger"></i> Cerrar Sesión</a></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</script>

<script>
  /* Client/js/components/AppNavbar.vue.html */
  const AppNavbar = {
    template: '#app-navbar-template',
    props: {
      user: Object,
      currentView: String,
      isAdmin: Boolean,
      logoUrl: {
        type: String,
        default: 'https://www.bbva.pe/content/dam/public-web/peru/images/logos/logo-bbva.png' // Un logo BBVA por defecto
      }
    },
    data() {
      return {
        isScrolled: false // Para efectos visuales al hacer scroll, si se desea
      };
    },
    methods: {
      navigate(viewName) {
        this.$emit('navigate', viewName);
        // Cerrar el menú desplegable de Bootstrap en móviles después de la navegación
        const navbarToggler = document.querySelector('.navbar-toggler');
        const navbarCollapse = document.querySelector('#navbarNavDropdown');
        if (navbarCollapse && navbarCollapse.classList.contains('show') && navbarToggler && getComputedStyle(navbarToggler).display !== 'none') {
          var bsCollapse = new bootstrap.Collapse(navbarCollapse, {
            toggle: false // Asegurarse de que no se vuelva a abrir/cerrar
          });
          bsCollapse.hide();
        }
      },
      logout() {
        this.$emit('logout');
      },
      handleScroll() {
        this.isScrolled = window.scrollY > 10;
      }
    },
    mounted() {
      // Para la funcionalidad de "mostrar dropdown en hover" en desktop,
      // Bootstrap 5 por defecto es click. Si se mantiene el CSS para hover,
      // puede haber conflictos. Es más robusto usar el click o implementar hover con JS/Vue.
      // Por ahora, nos basamos en el click de Bootstrap.
      // La lógica para cerrar el menú móvil se ha añadido en navigate().
      window.addEventListener('scroll', this.handleScroll);
    },
    beforeUnmount() {
      window.removeEventListener('scroll', this.handleScroll);
    }
  };
</script>
