<template id="user-list-view-template">
  <div class="user-management-container animate__animated animate__fadeIn">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="h3 bbva-title">Gestión de Usuarios</h2>
      <button class="btn btn-sm btn-outline-secondary" @click="fetchUsers" :disabled="isLoading" title="Refrescar lista">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
          <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
        </svg>
        Refrescar
      </button>
    </div>

    <div v-if="isLoading && users.length === 0" class="text-center my-5">
      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Cargando usuarios...</span>
      </div>
      <p class="mt-2">Cargando usuarios...</p>
    </div>

    <div v-if="!isLoading && errorMessage" class="alert alert-danger" role="alert">
      {{ errorMessage }}
    </div>
    <div v-if="!isLoading && successMessage" class="alert alert-success" role="alert">
      {{ successMessage }}
    </div>

    <div v-if="!isLoading && users.length > 0" class="table-responsive bbva-table-container">
      <table class="table table-striped table-hover table-sm align-middle">
        <thead class="table-light">
          <tr>
            <th scope="col">ID Usuario</th>
            <th scope="col">Nombre</th>
            <th scope="col">Email</th>
            <th scope="col">Rol Actual</th>
            <th scope="col">Cambiar Rol</th>
            <th scope="col">Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.userId" class="animate__animated animate__fadeInUp" :style="{'animation-delay': (users.indexOf(user) * 0.05) + 's'}">
            <td>{{ user.userId }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td><span :class="getRoleBadgeClass(user.role)">{{ user.role }}</span></td>
            <td>
              <select class="form-select form-select-sm" v-model="user.selectedRole" :disabled="isLoading || user.userId === $root.loggedInUser.userId" style="min-width: 150px;">
                <option v-for="role in availableRoles" :key="role" :value="role">{{ role }}</option>
              </select>
            </td>
            <td>
              <button class="btn btn-primary btn-sm" @click="updateUserRole(user)" 
                      :disabled="isLoading || user.role === user.selectedRole || user.userId === $root.loggedInUser.userId"
                      title="Guardar cambio de rol">
                <span v-if="isUpdatingRole === user.userId" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16" style="margin-right: 4px;">
                  <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
                </svg>
                Guardar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
     <div v-if="!isLoading && users.length === 0 && !errorMessage" class="text-center my-5">
        <p class="text-muted">No se encontraron usuarios registrados.</p>
    </div>
  </div>
</template>

<script>
const UserListView = {
  template: '#user-list-view-template',
  data() {
    return {
      users: [],
      isLoading: false,
      isUpdatingRole: null, // userId del usuario cuyo rol se está actualizando
      errorMessage: '',
      successMessage: '',
      availableRoles: [] // Se llenará desde $root o constante
    };
  },
  computed: {
     // No es necesario, $root.loggedInUser está disponible directamente en el template
  },
  methods: {
    async fetchUsers() {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';
      try {
        const response = await apiService.callAppsScript('getAllUsers_API');
        if (response.success) {
          this.users = response.users.map(user => ({
            ...user,
            selectedRole: user.role // Inicializar selectedRole con el rol actual
          }));
        } else {
          this.errorMessage = response.message || 'Error al cargar usuarios.';
          this.users = [];
        }
      } catch (error) {
        this.errorMessage = error.message || 'Error de conexión al cargar usuarios.';
        this.users = [];
      } finally {
        this.isLoading = false;
      }
    },
    async updateUserRole(user) {
      if (user.userId === this.$root.loggedInUser.userId) {
        this.errorMessage = 'No puedes cambiar tu propio rol.';
        // Revertir el select si es necesario
        user.selectedRole = user.role;
        return;
      }

      this.isUpdatingRole = user.userId; // Para el spinner individual
      this.errorMessage = '';
      this.successMessage = '';
      try {
        const response = await apiService.callAppsScript('updateUserRole_API', user.userId, user.selectedRole);
        if (response.success) {
          user.role = user.selectedRole; // Actualizar el rol en la UI localmente
          this.successMessage = response.message || `Rol de ${user.name} actualizado a ${user.selectedRole}.`;
        } else {
          this.errorMessage = response.message || 'Error al actualizar el rol.';
          user.selectedRole = user.role; // Revertir el cambio en el select
        }
      } catch (error) {
        this.errorMessage = error.message || 'Error de conexión al actualizar el rol.';
        user.selectedRole = user.role; // Revertir
      } finally {
        this.isUpdatingRole = null;
      }
    },
    getRoleBadgeClass(role) {
      if (role === 'Administrador') {
        return 'badge bg-primary-subtle text-primary-emphasis rounded-pill';
      }
      return 'badge bg-secondary-subtle text-secondary-emphasis rounded-pill';
    }
  },
  created() {
    // Obtener roles disponibles (podría ser desde $root si se define allí globalmente)
    this.availableRoles = Object.values(this.$root.USER_ROLES_APP); // Asumiendo que USER_ROLES_APP está en $root
    this.fetchUsers();
  }
};
</script>

<style>
.user-management-container {
  background-color: var(--bbva-blanco);
  padding: 25px;
  border-radius: var(--bbva-radio-borde);
  box-shadow: var(--bbva-sombra-media);
  width: 100%;
  max-width: 960px; /* O el ancho que prefieras */
  margin: 20px auto;
}

.bbva-title {
  color: var(--bbva-azul-principal);
  font-weight: 600;
}

.bbva-table-container {
  border: 1px solid var(--bbva-gris-medio-bordes);
  border-radius: var(--bbva-radio-borde);
  overflow: hidden; /* Para que el radio de borde afecte a la tabla */
}

.table th {
  background-color: var(--bbva-gris-claro-fondo); /* Un fondo sutil para las cabeceras */
  color: var(--bbva-azul-principal);
  font-weight: 600;
  border-bottom-width: 2px; /* Borde inferior más pronunciado para cabeceras */
}
.table td, .table th {
   vertical-align: middle;
}

/* Estilo para los badges de rol */
.badge.bg-primary-subtle {
    font-size: 0.8rem;
    padding: 0.4em 0.7em;
}
.badge.bg-secondary-subtle {
    font-size: 0.8rem;
    padding: 0.4em 0.7em;
}
</style>
