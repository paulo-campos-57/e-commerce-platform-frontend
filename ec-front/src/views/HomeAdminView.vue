<template>
  <div class="admin-dashboard">
    <div class="dashboard-header animate-fade-in">
      <div class="header-title">
        <h1>Painel de Controle</h1>
        <p>Visão geral da plataforma, inteligência de dados e controle de usuários.</p>
      </div>
      <button @click="refreshAllData" class="btn-refresh" :disabled="isLoading">
        <span v-if="isLoading">Atualizando...</span>
        <span v-else>🔄 Atualizar Dashboard</span>
      </button>
    </div>

    <div class="stats-grid">
      <div class="stat-card animate-slide-up" style="animation-delay: 0.1s">
        <div class="stat-icon">📊</div>
        <div class="stat-info">
          <h3>Total de Categorias</h3>
          <p class="stat-number">{{ kpis.totalCategorias }}</p>
        </div>
      </div>

      <div class="stat-card animate-slide-up" style="animation-delay: 0.2s">
        <div class="stat-icon">💳</div>
        <div class="stat-info">
          <h3>Método Líder</h3>
          <p class="stat-number" style="font-size: 1.25rem; margin-top: 4px">
            {{ kpis.metodoPagamento }}
          </p>
        </div>
      </div>

      <div class="stat-card animate-slide-up" style="animation-delay: 0.3s">
        <div class="stat-icon">📍</div>
        <div class="stat-info">
          <h3>Estado Líder</h3>
          <p class="stat-number">{{ kpis.estadoLider }}</p>
        </div>
      </div>

      <div class="stat-card animate-slide-up" style="animation-delay: 0.4s">
        <div class="stat-icon">⭐</div>
        <div class="stat-info">
          <h3>Avaliação Média</h3>
          <p class="stat-number">{{ kpis.avaliacaoMedia }} ★</p>
        </div>
      </div>
    </div>

    <div class="charts-grid animate-slide-up" style="animation-delay: 0.45s">
      <div class="chart-card">
        <div class="chart-header">
          <span class="chart-title">Distribuição de Preço & Avaliação</span>
          <span class="chart-badge">Módulo 2 e 5</span>
        </div>
        <div class="chart-wrap">
          <div v-if="chartsLoading.preco" class="skeleton-shimmer"></div>
          <canvas ref="chartPrecoCanvas"></canvas>
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <span class="chart-title">Top 10 Categorias por Pedidos</span>
          <span class="chart-badge">Módulo 4</span>
        </div>
        <div class="chart-wrap">
          <div v-if="chartsLoading.cat" class="skeleton-shimmer"></div>
          <canvas ref="chartCatCanvas"></canvas>
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <span class="chart-title">Distribuição Geográfica de Vendas</span>
          <span class="chart-badge">Módulo 4</span>
        </div>
        <div class="chart-wrap">
          <div v-if="chartsLoading.geo" class="skeleton-shimmer"></div>
          <canvas ref="chartGeoCanvas"></canvas>
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <span class="chart-title">Métodos de Pagamento Utilizados</span>
          <span class="chart-badge">Volume Transacional</span>
        </div>
        <div class="chart-wrap">
          <div v-if="chartsLoading.pay" class="skeleton-shimmer"></div>
          <canvas ref="chartPayCanvas"></canvas>
        </div>
      </div>
    </div>

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
        <button @click="fetchUsers" class="btn-primary">Tentar Novamente</button>
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
                  {{ user.role === "admin" ? "🛡️ Admin" : "👤 Cliente" }}
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
import { ref, reactive, computed, onMounted, nextTick } from "vue";
import { userService } from "@/services/userService";
import { dashboardService } from "@/services/dashboardService";
import { useToast } from "vue-toastification";
import Chart from "chart.js/auto";

const toast = useToast();

const users = ref([]);
const isLoading = ref(false);
const error = ref(null);
const searchQuery = ref("");

const chartsLoading = reactive({ preco: true, cat: true, geo: true, pay: true });

const chartPrecoCanvas = ref(null);
const chartCatCanvas = ref(null);
const chartGeoCanvas = ref(null);
const chartPayCanvas = ref(null);

let chartInstances = { preco: null, cat: null, geo: null, pay: null };

const kpis = reactive({
  totalCategorias: "—",
  metodoPagamento: "—",
  estadoLider: "—",
  avaliacaoMedia: "—",
});

const CHART_COLORS = [
  "#6366f1",
  "#10b981",
  "#a855f7",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#ec4899",
];

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: "#94a3b8", font: { family: "Plus Jakarta Sans", size: 11 } },
    },
  },
};

const fetchUsers = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const data = await userService.findAll();
    users.value = data.users || [];
  } catch (err) {
    console.error("Erro ao carregar usuários:", err);
    error.value = "Não foi possível carregar os usuários da plataforma.";
    toast.error(error.value);
  } finally {
    isLoading.value = false;
  }
};

const loadPrecoAvaliacao = async () => {
  try {
    chartsLoading.preco = true;
    const data = await dashboardService.getPrecoAvaliacao();

    const totalProd = data.total_produtos.reduce((a, b) => a + b, 0);
    const avgGlobal =
      data.avaliacao_media.reduce((acc, v, i) => acc + v * data.total_produtos[i], 0) /
      totalProd;
    kpis.avaliacaoMedia = avgGlobal.toFixed(2);

    await nextTick();
    if (chartInstances.preco) chartInstances.preco.destroy();

    chartInstances.preco = new Chart(chartPrecoCanvas.value, {
      type: "bar",
      data: {
        labels: data.faixas,
        datasets: [
          {
            label: "Qtd Produtos",
            data: data.total_produtos,
            backgroundColor: "rgba(99, 102, 241, 0.7)",
            borderRadius: 4,
            yAxisID: "y",
          },
          {
            label: "Avaliação Média",
            data: data.avaliacao_media,
            type: "line",
            borderColor: "#10b981",
            tension: 0.4,
            pointRadius: 4,
            yAxisID: "y2",
          },
        ],
      },
      options: {
        ...chartDefaults,
        scales: {
          y: {
            position: "left",
            grid: { color: "rgba(255,255,255,0.05)" },
            ticks: { color: "#94a3b8" },
          },
          y2: {
            position: "right",
            min: 0,
            max: 5,
            grid: { drawOnChartArea: false },
            ticks: { color: "#94a3b8" },
          },
          x: { grid: { display: false }, ticks: { color: "#94a3b8" } },
        },
      },
    });
  } catch (err) {
    console.error(err);
    toast.error("Erro ao carregar gráfico de Preço e Avaliação.");
  } finally {
    chartsLoading.preco = false;
  }
};

const loadTopCategorias = async () => {
  try {
    chartsLoading.cat = true;
    const data = await dashboardService.getTopCategorias();

    kpis.totalCategorias = data.categorias.length;

    await nextTick();
    if (chartInstances.cat) chartInstances.cat.destroy();

    chartInstances.cat = new Chart(chartCatCanvas.value, {
      type: "bar",
      data: {
        labels: data.categorias,
        datasets: [
          {
            label: "Pedidos",
            data: data.total_pedidos,
            backgroundColor: CHART_COLORS,
            borderRadius: 4,
          },
        ],
      },
      options: {
        ...chartDefaults,
        indexAxis: "y",
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#94a3b8" } },
          y: {
            grid: { display: false },
            ticks: { color: "#94a3b8", font: { size: 10 } },
          },
        },
      },
    });
  } catch (err) {
    console.error(err);
    toast.error("Erro ao carregar top categorias.");
  } finally {
    chartsLoading.cat = false;
  }
};

const loadGeo = async () => {
  try {
    chartsLoading.geo = true;
    const data = await dashboardService.getDistribuicaoGeografica();

    kpis.estadoLider = data.estados[0] || "—";

    await nextTick();
    if (chartInstances.geo) chartInstances.geo.destroy();

    chartInstances.geo = new Chart(chartGeoCanvas.value, {
      type: "bar",
      data: {
        labels: data.estados,
        datasets: [
          {
            label: "Pedidos por Estado",
            data: data.total_pedidos,
            backgroundColor: "rgba(168, 85, 247, 0.7)",
            borderRadius: 4,
          },
        ],
      },
      options: {
        ...chartDefaults,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#94a3b8" } },
          x: { grid: { display: false }, ticks: { color: "#94a3b8" } },
        },
      },
    });
  } catch (err) {
    console.error(err);
    toast.error("Erro ao carregar distribuição geográfica.");
  } finally {
    chartsLoading.geo = false;
  }
};

const loadPayments = async () => {
  try {
    chartsLoading.pay = true;
    const data = await dashboardService.getMetodosPagamento();

    kpis.metodoPagamento = data.metodos[0] || "—";

    await nextTick();
    if (chartInstances.pay) chartInstances.pay.destroy();

    chartInstances.pay = new Chart(chartPayCanvas.value, {
      type: "doughnut",
      data: {
        labels: data.metodos,
        datasets: [
          {
            data: data.total_transacoes,
            backgroundColor: CHART_COLORS,
            borderColor: "var(--color-background-soft)",
            borderWidth: 2,
          },
        ],
      },
      options: {
        ...chartDefaults,
        cutout: "65%",
        plugins: {
          ...chartDefaults.plugins,
          legend: { position: "bottom", labels: { padding: 10, color: "#94a3b8" } },
        },
      },
    });
  } catch (err) {
    console.error(err);
    toast.error("Erro ao carregar métodos de pagamento.");
  } finally {
    chartsLoading.pay = false;
  }
};

const refreshAllData = () => {
  fetchUsers();
  loadPrecoAvaliacao();
  loadTopCategorias();
  loadGeo();
  loadPayments();
};

const filteredUsers = computed(() => {
  if (!searchQuery.value.trim()) return users.value;
  const query = searchQuery.value.toLowerCase();
  return users.value.filter(
    (user) =>
      user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
  );
});

onMounted(() => {
  refreshAllData();
});
</script>

<style>
@import "@/assets/admin.css";
</style>
