<template>
  <div class="admin-dashboard">
    <div class="dashboard-header animate-fade-in">
      <div class="header-title">
        <h1>Painel de Controle</h1>
        <p>Visão geral da plataforma e controle de usuários.</p>
      </div>
      <button @click="fetchData" class="btn-refresh" :disabled="isLoading">
        <span v-if="isLoading">Atualizando...</span>
        <span v-else>🔄 Atualizar Dados</span>
      </button>
    </div>

    <!-- Statistics Section -->
    <div class="stats-grid">
      <div class="stat-card total-users animate-slide-up" style="animation-delay: 0.1s">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <h3>Total de Usuários</h3>
          <p class="stat-number">{{ stats.total }}</p>
        </div>
      </div>

      <div class="stat-card admin-users animate-slide-up" style="animation-delay: 0.2s">
        <div class="stat-icon">🛡️</div>
        <div class="stat-info">
          <h3>Administradores</h3>
          <p class="stat-number">{{ stats.admins }}</p>
        </div>
      </div>

      <div class="stat-card client-users animate-slide-up" style="animation-delay: 0.3s">
        <div class="stat-icon">🛍️</div>
        <div class="stat-info">
          <h3>Clientes</h3>
          <p class="stat-number">{{ stats.clients }}</p>
        </div>
      </div>

      <div class="stat-card db-status animate-slide-up" style="animation-delay: 0.4s">
        <div class="stat-icon">⚡</div>
        <div class="stat-info">
          <h3>Status do Servidor</h3>
          <p class="stat-badge success">Online</p>
        </div>
      </div>
    </div>

    <!-- Main Content Section: Users Table -->
    <div class="content-card animate-slide-up" style="animation-delay: 0.5s">
      <div class="content-header">
        <h2>Gerenciamento de Usuários</h2>
        <div class="search-wrapper">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            class="search-input"
          />
          <span class="search-icon">🔍</span>
        </div>
      </div>

      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Carregando dados dos usuários...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <p class="error-message">⚠️ {{ error }}</p>
        <button @click="fetchData" class="btn-primary">Tentar Novamente</button>
      </div>

      <div v-else class="table-wrapper">
        <table class="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Função / Role</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id" class="table-row">
              <td class="user-id">#{{ user.id.substring(0, 8) || user.id }}</td>
              <td class="user-name">
                <div class="avatar">{{ user.name.charAt(0).toUpperCase() }}</div>
                <span>{{ user.name }}</span>
              </td>
              <td class="user-email">{{ user.email }}</td>
              <td>
                <span :class="['role-badge', user.role]">
                  {{ user.role === 'admin' ? '🛡️ Admin' : '👤 Cliente' }}
                </span>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="4" class="empty-state">
                Nenhum usuário correspondente à pesquisa foi encontrado.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { userService } from "@/services/userService";
import { useToast } from "vue-toastification";

const toast = useToast();

const users = ref([]);
const isLoading = ref(false);
const error = ref(null);
const searchQuery = ref("");

const stats = reactive({
  total: 0,
  admins: 0,
  clients: 0
});

const fetchData = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const data = await userService.findAll();
    
    // The controller returns: { message: string, users: Array }
    users.value = data.users || [];
    
    // Calculate stats
    stats.total = users.value.length;
    stats.admins = users.value.filter(u => u.role === "admin").length;
    stats.clients = stats.total - stats.admins;
  } catch (err) {
    console.error("Erro ao carregar usuários:", err);
    error.value = "Não foi possível carregar os usuários da plataforma.";
    toast.error(error.value);
  } finally {
    isLoading.value = false;
  }
};

const filteredUsers = computed(() => {
  if (!searchQuery.value.trim()) {
    return users.value;
  }
  const query = searchQuery.value.toLowerCase();
  return users.value.filter(
    user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
  );
});

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.admin-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

/* Header styling */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-title h1 {
  font-size: 2.25rem;
  background: linear-gradient(135deg, var(--color-primary), #a855f7);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.25rem;
}

.header-title p {
  font-size: 0.95rem;
  color: var(--color-text-muted);
}

.btn-refresh {
  background-color: var(--color-background-soft);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: 0.6rem 1.2rem;
  font-weight: 600;
  border-radius: var(--radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all var(--transition-fast);
}

.btn-refresh:hover:not(:disabled) {
  background-color: var(--color-background-mute);
  transform: translateY(-1px);
}

/* Statistics Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary);
}

.stat-icon {
  font-size: 2.25rem;
  padding: 0.5rem;
  background: var(--color-background-mute);
  border-radius: var(--radius-md);
  line-height: 1;
}

.stat-info h3 {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.stat-number {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--color-heading);
}

.stat-badge {
  display: inline-block;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  text-transform: uppercase;
}

.stat-badge.success {
  background-color: rgba(16, 185, 129, 0.15);
  color: var(--color-success);
}

/* Content Card & Table */
.content-card {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-wrapper {
  position: relative;
  width: 100%;
  max-width: 320px;
}

.search-input {
  width: 100%;
  padding: 0.6rem 1rem 0.6rem 2.5rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text);
  font-size: 0.9rem;
  outline: none;
  transition: border-color var(--transition-fast);
}

.search-input:focus {
  border-color: var(--color-primary);
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.9rem;
  pointer-events: none;
  opacity: 0.7;
}

.table-wrapper {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.users-table th {
  padding: 1rem;
  border-bottom: 2px solid var(--color-border);
  color: var(--color-text-muted);
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.users-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

.table-row {
  transition: background-color var(--transition-fast);
}

.table-row:hover {
  background-color: var(--color-background-mute);
}

.user-id {
  font-family: monospace;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.user-name {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  color: var(--color-heading);
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), #818cf8);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
}

.user-email {
  color: var(--color-text-muted);
}

.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.6rem;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 700;
}

.role-badge.admin {
  background-color: rgba(99, 102, 241, 0.15);
  color: var(--color-primary);
}

.role-badge.client {
  background-color: var(--color-background-mute);
  color: var(--color-text-muted);
}

/* Dynamic States */
.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
  color: var(--color-text-muted);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

.error-message {
  color: var(--color-danger);
  font-weight: 600;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
