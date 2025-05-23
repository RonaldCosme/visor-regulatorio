<script type="text/x-template" id="LoginView">
  <div class="login-view animate__animated animate__fadeIn">
    <div class="text-center mb-4">
      <img src="https://www.bbva.pe/content/dam/public-web/peru/images/logos/logo-bbva.png" alt="Logo BBVA" style="max-height: 45px; margin-bottom:15px;">
      <h2>Visor Regulatorio +</h2>
      <p class="text-muted">Bienvenido. Ingresa tus credenciales.</p>
    </div>

    <form @submit.prevent="handleLogin" novalidate>
      <div v-if="loginError" class="alert alert-danger animate__animated animate__shakeX" role="alert">
        {{ loginError }}
      </div>
       <div v-if="globalSuccessMessage" class="alert alert-success" role="alert">
        {{ globalSuccessMessage }}
      </div>

      <div class="form-floating mb-3">
        <input type="email" class="form-control" id="email" placeholder="name@example.com" v-model.trim="credentials.email" :class="{ 'is-invalid': submitted && !credentials.email }" autocomplete="email">
        <label for="email">Correo Electrónico</label>
        <div v-if="submitted && !credentials.email" class="invalid-feedback">
          El correo electrónico es requerido.
        </div>
      </div>

      <div class="form-floating mb-3">
        <input type="password" class="form-control" id="password" placeholder="Password" v-model="credentials.password" :class="{ 'is-invalid': submitted && !credentials.password }" autocomplete="current-password">
        <label for="password">Contraseña</label>
        <div v-if="submitted && !credentials.password" class="invalid-feedback">
          La contraseña es requerida.
        </div>
      </div>

      <div class="d-grid gap-2">
        <button type="submit" class="btn btn-primary btn-lg" :disabled="isLoginLoading">
          <span v-if="isLoginLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          <span v-if="isLoginLoading" class="ms-1">Ingresando...</span>
          <span v-else>Ingresar</span>
        </button>
      </div>
    </form>

    <div class="text-center mt-4">
      <p class="text-muted">¿No tienes una cuenta?
        <button type="button" class="btn btn-link" @click="$root.switchView('register')">Regístrate aquí</button>
      </p>
    </div>
  </div>
</script>

<script>
/* Client/js/views/Login.vue.html */
const LoginView = {
  template: '#LoginView',
  data() {
    return {
      credentials: {
        email: '',
        password: ''
      },
      loginError: '',
      submitted: false,
      isLoginLoading: false, // Estado para el spinner del botón de login
      globalSuccessMessage: '' // Para mostrar mensajes de éxito (ej. después de registrar)
    };
  },
  watch: {
    '$root.currentView'(newView) {
      if (newView === 'login') {
        this.loginError = '';
        this.submitted = false;
        this.credentials.email = '';
        this.credentials.password = '';
        this.isLoginLoading = false;
        // Verificar si hay un mensaje global de éxito para mostrar (ej. desde registro)
        if (this.$root.globalSuccessMessage) {
            this.globalSuccessMessage = this.$root.globalSuccessMessage;
            this.$root.globalSuccessMessage = ''; // Limpiar después de mostrar
        } else {
            this.globalSuccessMessage = '';
        }
      }
    }
  },
  methods: {
    async handleLogin() {
      this.submitted = true;
      this.loginError = '';
      this.globalSuccessMessage = ''; // Limpiar mensajes de éxito al intentar loguear

      if (!this.credentials.email || !this.credentials.password) {
        this.loginError = 'Por favor, completa todos los campos.';
        return;
      }

      this.isLoginLoading = true; // Activar spinner del botón
      // Asegurarse de que el spinner global no esté activo
      if (this.$root.isLoading) {
        this.$root.isLoading = false;
      }

      try {
        const response = await apiService.callAppsScript('login', this.credentials);

        if (response && response.success) {
          this.$root.handleLoginSuccess(response.user);
        } else {
          this.loginError = response.message || 'Error desconocido al iniciar sesión.';
        }
      } catch (error) {
        console.error('Error en handleLogin:', error);
        this.loginError = error.message || 'Ocurrió un error al intentar iniciar sesión. Inténtalo de nuevo.';
      } finally {
        this.isLoginLoading = false; // Desactivar spinner del botón
      }
    }
  },
  mounted() {
    // Si se llega a la vista de login y hay un mensaje global de éxito (ej. desde registro)
    if (this.$root.globalSuccessMessage && this.$root.currentView === 'login') {
        this.globalSuccessMessage = this.$root.globalSuccessMessage;
        this.$root.globalSuccessMessage = ''; // Limpiar después de mostrar
    }
  }
};
</script>
