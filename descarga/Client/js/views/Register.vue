<template id="register-view-template">
  <div class="animate__animated animate__fadeIn">
    <div class="text-center mb-4">
      <img src="https://www.bbva.pe/content/dam/public-web/peru/images/logos/logo-bbva.png" alt="Logo BBVA" style="max-height: 40px; margin-bottom:15px;">
      <h2>Crear Cuenta</h2>
      <p class="text-muted">Completa tus datos para registrarte.</p>
    </div>

    <form @submit.prevent="handleRegister">
      <div v-if="errorMessage" class="alert alert-danger animate__animated animate__shakeX" role="alert">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="alert alert-success" role="alert">
        {{ successMessage }}
      </div>

      <div class="form-floating mb-3">
        <input type="text" class="form-control" id="registerName" placeholder="Nombre Completo o Corporativo" v-model.trim="form.name" @blur="fetchAutocompleteData" :disabled="isLoading" required>
        <label for="registerName">Nombre Completo o Corporativo</label>
      </div>

      <div class="form-floating mb-3">
        <input type="email" class="form-control" id="registerEmail" placeholder="tu@correo.com" v-model.trim="form.email" :disabled="isLoading || emailLocked" required>
        <label for="registerEmail">Correo Electrónico</label>
      </div>
      
      <div class="row g-2 mb-3">
        <div class="col-md">
          <div class="form-floating">
            <input type="text" class="form-control" id="registerArea" placeholder="Área" v-model.trim="form.area" :disabled="isLoading || areaLocked" required>
            <label for="registerArea">Área</label>
          </div>
        </div>
        <div class="col-md">
          <div class="form-floating">
            <input type="text" class="form-control" id="registerUnidad" placeholder="Unidad" v-model.trim="form.unidad" :disabled="isLoading || unidadLocked" required>
            <label for="registerUnidad">Unidad</label>
          </div>
        </div>
      </div>

      <div class="form-floating mb-3">
        <input type="text" class="form-control" id="registerDosie" placeholder="Dosier (Opcional)" v-model.trim="form.dosie" :disabled="isLoading || dosieLocked">
        <label for="registerDosie">Dosier (Opcional)</label>
      </div>
      
      <div class="form-floating mb-3">
        <input type="password" class="form-control" id="registerPassword" placeholder="Contraseña" v-model="form.password" :disabled="isLoading" required>
        <label for="registerPassword">Contraseña</label>
        <div class="form-text mt-1">Mínimo 6 caracteres.</div>
      </div>

      <div class="form-floating mb-3">
        <input type="password" class="form-control" id="confirmPassword" placeholder="Confirmar Contraseña" v-model="form.confirmPassword" :disabled="isLoading" required>
        <label for="confirmPassword">Confirmar Contraseña</label>
      </div>
      
      <button type="submit" class="btn btn-primary w-100 py-2 mb-3" :disabled="isLoading">
        <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        {{ isLoading ? 'Registrando...' : 'Crear Cuenta' }}
      </button>

      <p class="text-center">
        ¿Ya tienes una cuenta? <button type="button" class="btn btn-link p-0" @click="$root.switchView('login')">Inicia Sesión</button>
      </p>
    </form>
  </div>
</template>

<script>
const RegisterView = {
  template: '#register-view-template',
  data() {
    return {
      form: {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: '', // Aunque no se use para enviar, puede estar si se reutiliza el form
        area: '',
        unidad: '',
        dosie: ''
      },
      isLoading: false,
      errorMessage: '',
      successMessage: '',
      emailLocked: false, // Para bloquear campos si se autocompletan
      areaLocked: false,
      unidadLocked: false,
      dosieLocked: false
    };
  },
  methods: {
    async handleRegister() {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      if (this.form.password !== this.form.confirmPassword) {
        this.errorMessage = 'Las contraseñas no coinciden.';
        this.isLoading = false;
        return;
      }
      if (this.form.password.length < 6) {
        this.errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
        this.isLoading = false;
        return;
      }

      // Preparamos el objeto userData sin el campo 'role' y 'confirmPassword'
      const userData = {
        name: this.form.name,
        email: this.form.email,
        password: this.form.password,
        area: this.form.area,
        unidad: this.form.unidad,
        dosie: this.form.dosie
      };

      try {
        const response = await apiService.callAppsScript('register', userData);
        if (response.success) {
          this.successMessage = response.message + ' Serás redirigido al login.';
          // Limpiar formulario o redirigir
          Object.keys(this.form).forEach(key => this.form[key] = '');
          this.emailLocked = false;
          this.areaLocked = false;
          this.unidadLocked = false;
          this.dosieLocked = false;
          setTimeout(() => {
            this.$root.globalSuccessMessage = '¡Registro exitoso! Por favor, inicia sesión.';
            this.$root.switchView('login');
          }, 3000);
        } else {
          this.errorMessage = response.message || 'Error desconocido durante el registro.';
        }
      } catch (error) {
        this.errorMessage = error.message || 'Error de conexión al intentar registrar.';
      } finally {
        this.isLoading = false;
      }
    },
    async fetchAutocompleteData() {
      if (!this.form.name || this.form.name.length < 5) { // Evitar llamadas con nombres muy cortos
        this.resetAutocompleteFields(false); // No limpiar el nombre
        return;
      }
      this.isLoading = true;
      try {
        const response = await apiService.callAppsScript('getUserDataForAutocomplete', this.form.name);
        if (response.success && response.data) {
          const autocompleteData = response.data;
          this.form.email = autocompleteData.email || '';
          this.form.area = autocompleteData.area || '';
          this.form.unidad = autocompleteData.unidad || '';
          this.form.dosie = autocompleteData.dosier || ''; // 'dosier' en la data, 'dosie' en el form

          // Bloquear campos autocompletados para evitar edición accidental
          this.emailLocked = !!autocompleteData.email;
          this.areaLocked = !!autocompleteData.area;
          this.unidadLocked = !!autocompleteData.unidad;
          this.dosieLocked = !!autocompleteData.dosier;

        } else {
          // Si no hay datos, o error leve, permitir edición manual
          this.resetAutocompleteFields(false); // No limpiar el nombre
        }
      } catch (error) {
        console.warn('Error en autocompletar:', error.message);
        this.resetAutocompleteFields(false); // No limpiar el nombre
      } finally {
        this.isLoading = false;
      }
    },
    resetAutocompleteFields(clearName = true) {
      if (clearName) this.form.name = '';
      this.form.email = '';
      this.form.area = '';
      this.form.unidad = '';
      this.form.dosie = '';
      this.emailLocked = false;
      this.areaLocked = false;
      this.unidadLocked = false;
      this.dosieLocked = false;
    }
  },
  watch: {
    // Si el usuario cambia el nombre después de autocompletar, desbloquear campos
    'form.name'(newName, oldName) {
      if (this.emailLocked || this.areaLocked || this.unidadLocked || this.dosieLocked) {
        // Si el nombre cambia significativamente, podría ser un nuevo intento
        // Esta lógica puede ser más sofisticada si es necesario
        if (newName !== oldName) {
            this.resetAutocompleteFields(false); // Mantiene el nuevo nombre, limpia y desbloquea los demás
        }
      }
    }
  },
   mounted() {
    if (this.$root.globalSuccessMessage) {
        this.successMessage = this.$root.globalSuccessMessage;
        this.$root.globalSuccessMessage = ''; // Limpiar después de mostrar
    }
  }
};
</script>
