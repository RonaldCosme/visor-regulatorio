<script>
/* Client/js/main.js.html */

const USER_ROLES_APP = { 
  ADMIN: 'Administrador',
  USER: 'Usuario'
};
Object.freeze(USER_ROLES_APP);

const app = Vue.createApp({
  data() {
    return {
      currentView: 'login', 
      isLoading: false,
      loggedInUser: null,
      globalAlert: { message: '', type: 'info' }, 
      sessionTimeoutMinutes: 60, 
      USER_ROLES_APP: USER_ROLES_APP,
      requirementIdToEdit: null, // Para pasar el ID al formulario de edición
    };
  },
  computed: {
    isAdmin() {
      return this.loggedInUser && this.loggedInUser.role === USER_ROLES_APP.ADMIN;
    }
  },
  methods: {
    switchView(viewName, params = null) {
      if (viewName === 'userManagement' && !this.isAdmin) {
        this.showGlobalAlert('Acceso denegado. Se requieren privilegios de administrador.', 'danger');
        this.currentView = 'dashboard'; 
        return;
      }
      
      const authRequiredViews = ['dashboard', 'userManagement', 'requirements', 'requirementForm', 'visits', 'recommendations', 'profile'];
      if (authRequiredViews.includes(viewName) && !this.loggedInUser) {
          this.currentView = 'login';
          this.requirementIdToEdit = null;
          return;
      }
      
      if (viewName === 'requirementForm') {
          this.requirementIdToEdit = params ? params.id : null;
      } else {
          this.requirementIdToEdit = null; // Limpiar si no es el form de edición
      }


      this.currentView = viewName;
      this.clearGlobalAlert();
    },
    handleLoginSuccess(userData) {
      this.loggedInUser = userData;
      this.currentView = 'dashboard'; 

      const now = new Date();
      const sessionData = {
        user: userData,
        expiry: now.getTime() + (this.sessionTimeoutMinutes * 60 * 1000)
      };
      localStorage.setItem('visorRegulatorioSession', JSON.stringify(sessionData));
    },
    logout() {
      this.loggedInUser = null;
      localStorage.removeItem('visorRegulatorioSession');
      this.currentView = 'login';
      this.requirementIdToEdit = null;
      this.clearGlobalAlert();
    },
    checkSession() {
      const storedSession = localStorage.getItem('visorRegulatorioSession');
      if (storedSession) {
        try {
          const sessionData = JSON.parse(storedSession);
          const now = new Date();

          if (now.getTime() < sessionData.expiry) {
            this.loggedInUser = sessionData.user;
            // Si está logueado y la vista actual es login/register, o no hay vista (inicial), ir a dashboard
            if (this.currentView === 'login' || this.currentView === 'register' || !this.currentView) {
                 this.currentView = 'dashboard';
            }
          } else {
            this.logout(); 
          }
        } catch (error) {
          this.logout(); 
        }
      } else {
        // Si no hay sesión y la vista actual requiere autenticación, redirigir a login
        const authRequiredViews = ['dashboard', 'userManagement', 'requirements', 'requirementForm', 'visits', 'recommendations', 'profile'];
        if (authRequiredViews.includes(this.currentView)) {
            this.currentView = 'login';
        }
         this.requirementIdToEdit = null;
      }
    },
    showGlobalAlert(message, type = 'info', duration = 5000) {
      this.globalAlert = { message, type };
      if (this.alertTimeoutId) {
        clearTimeout(this.alertTimeoutId);
      }
      this.alertTimeoutId = setTimeout(() => {
        this.clearGlobalAlert();
      }, duration);
    },
    clearGlobalAlert() {
      this.globalAlert = { message: '', type: 'info' };
       if (this.alertTimeoutId) {
        clearTimeout(this.alertTimeoutId);
        this.alertTimeoutId = null;
      }
    }
  },
  components: {
    'app-navbar': AppNavbar,
    'app-footer': AppFooter,
    'login-view': LoginView,
    'register-view': RegisterView,
    'user-list-view': UserListView,
    'requirement-list-view': RequirementListView, 
    'requirement-form-view': RequirementFormView
  },
  mounted() {
    this.checkSession();
    this.alertTimeoutId = null; 
  }
});

app.mount('#app');
</script>
