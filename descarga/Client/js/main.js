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
      requirementIdToEdit: null, // ID del requerimiento a editar
      globalSuccessMessage: '', // Para mensajes entre vistas
    };
  },
  computed: {
    isAdmin() {
      return this.loggedInUser && this.loggedInUser.role === USER_ROLES_APP.ADMIN;
    }
  },
  methods: {
    switchView(viewName, params = null) {
      // Control de acceso para gestión de usuarios (solo admin)
      if (viewName === 'userManagement' && !this.isAdmin) {
        this.showGlobalAlert('Acceso denegado. Se requieren privilegios de administrador.', 'danger');
        this.currentView = 'dashboard'; 
        return;
      }
      
      // Verificar autenticación para vistas protegidas
      const authRequiredViews = ['dashboard', 'userManagement', 'requirements', 'requirementForm', 'visits', 'recommendations', 'profile'];
      if (authRequiredViews.includes(viewName) && !this.loggedInUser) {
        this.currentView = 'login';
        this.requirementIdToEdit = null;
        return;
      }
      
      // Manejo especial para formulario de requerimientos
      if (viewName === 'requirementForm') {
        this.requirementIdToEdit = params ? params.id : null;
      } else {
        this.requirementIdToEdit = null; // Limpiar si no es el form
      }

      // Cambiar vista
      this.currentView = viewName;
      this.clearGlobalAlert();
      
      // Log para depuración
      console.log(`Vista cambiada a: ${viewName}`, params ? `con parámetros: ${JSON.stringify(params)}` : '');
    },
    
    // Método específico para editar requerimientos desde la lista
    editRequirement(codigoUnico) {
      if (!codigoUnico) {
        this.showGlobalAlert('Error: Código de requerimiento no válido.', 'danger');
        return;
      }
      this.requirementIdToEdit = codigoUnico;
      this.currentView = 'requirementForm';
      console.log(`Editando requerimiento: ${codigoUnico}`);
    },
    
    // Método para crear nuevo requerimiento
    createNewRequirement() {
      this.requirementIdToEdit = null;
      this.currentView = 'requirementForm';
      console.log('Creando nuevo requerimiento');
    },
    
    handleLoginSuccess(userData) {
      if (!userData) {
        this.showGlobalAlert('Error: Datos de usuario no válidos.', 'danger');
        return;
      }
      
      this.loggedInUser = userData;
      this.currentView = 'dashboard'; 

      // Guardar sesión
      const now = new Date();
      const sessionData = {
        user: userData,
        expiry: now.getTime() + (this.sessionTimeoutMinutes * 60 * 1000)
      };
      localStorage.setItem('visorRegulatorioSession', JSON.stringify(sessionData));
      
      this.showGlobalAlert(`¡Bienvenido, ${userData.name}!`, 'success', 3000);
      console.log('Login exitoso para:', userData.email);
    },
    
    logout() {
      if (this.loggedInUser) {
        console.log('Cerrando sesión para:', this.loggedInUser.email);
      }
      
      this.loggedInUser = null;
      localStorage.removeItem('visorRegulatorioSession');
      this.currentView = 'login';
      this.requirementIdToEdit = null;
      this.clearGlobalAlert();
      
      this.showGlobalAlert('Sesión cerrada correctamente.', 'info', 2000);
    },
    
    checkSession() {
      const storedSession = localStorage.getItem('visorRegulatorioSession');
      if (storedSession) {
        try {
          const sessionData = JSON.parse(storedSession);
          const now = new Date();

          if (now.getTime() < sessionData.expiry) {
            this.loggedInUser = sessionData.user;
            // Si está en vista de login/register, redirigir a dashboard
            if (this.currentView === 'login' || this.currentView === 'register' || !this.currentView) {
              this.currentView = 'dashboard';
            }
            console.log('Sesión restaurada para:', sessionData.user.email);
          } else {
            this.logout(); 
            this.showGlobalAlert('Su sesión ha expirado. Por favor, inicie sesión nuevamente.', 'warning');
          }
        } catch (error) {
          console.error('Error al restaurar sesión:', error);
          this.logout(); 
        }
      } else {
        // Si no hay sesión y la vista requiere autenticación, ir a login
        const authRequiredViews = ['dashboard', 'userManagement', 'requirements', 'requirementForm', 'visits', 'recommendations', 'profile'];
        if (authRequiredViews.includes(this.currentView)) {
          this.currentView = 'login';
        }
        this.requirementIdToEdit = null;
      }
    },
    
    // Renovar sesión automáticamente
    renewSession() {
      if (this.loggedInUser) {
        const now = new Date();
        const sessionData = {
          user: this.loggedInUser,
          expiry: now.getTime() + (this.sessionTimeoutMinutes * 60 * 1000)
        };
        localStorage.setItem('visorRegulatorioSession', JSON.stringify(sessionData));
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
    },
    
    // Manejar errores globales
    handleGlobalError(error, context = '') {
      console.error(`Error global ${context}:`, error);
      this.showGlobalAlert(
        `Error ${context}: ${error.message || 'Error desconocido'}`, 
        'danger', 
        8000
      );
    },
    
    // Verificar conectividad con el backend
    async testBackendConnection() {
      try {
        this.isLoading = true;
        const response = await apiService.callAppsScript('testConnection');
        console.log('Test de conexión:', response);
        return true;
      } catch (error) {
        console.error('Error de conectividad:', error);
        this.showGlobalAlert('Error de conexión con el servidor. Verifique su conexión a internet.', 'danger');
        return false;
      } finally {
        this.isLoading = false;
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
    console.log('Aplicación Vue iniciada');
    
    // Verificar sesión al iniciar
    this.checkSession();
    
    // Limpiar timeout de alertas
    this.alertTimeoutId = null; 
    
    // Renovar sesión cada 10 minutos si está logueado
    setInterval(() => {
      if (this.loggedInUser) {
        this.renewSession();
      }
    }, 10 * 60 * 1000); // 10 minutos
    
    // Manejar eventos de teclado globales
    document.addEventListener('keydown', (event) => {
      // ESC para cerrar alertas
      if (event.key === 'Escape') {
        this.clearGlobalAlert();
      }
    });
    
    // Manejar visibilidad de la página (pausar/reanudar funciones)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.loggedInUser) {
        // Verificar sesión cuando la página vuelve a ser visible
        this.checkSession();
      }
    });
    
    // Test inicial de conectividad (opcional)
    // this.testBackendConnection();
  },
  
  // Limpiar recursos al destruir la app
  beforeUnmount() {
    if (this.alertTimeoutId) {
      clearTimeout(this.alertTimeoutId);
    }
  }
});

// Configuración global de Vue para desarrollo
if (typeof console !== 'undefined') {
  app.config.performance = true;
  
  // Manejar errores no capturados de Vue
  app.config.errorHandler = (err, instance, info) => {
    console.error('Error de Vue:', err, info);
    if (app._instance && app._instance.proxy) {
      app._instance.proxy.handleGlobalError(err, 'en componente Vue');
    }
  };
  
  // Advertencias de Vue (solo en desarrollo)
  app.config.warnHandler = (msg, instance, trace) => {
    console.warn('Advertencia de Vue:', msg, trace);
  };
}

// Montar la aplicación
app.mount('#app');

console.log('Visor Regulatorio + inicializado correctamente');
</script>