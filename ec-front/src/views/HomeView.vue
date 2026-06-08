<template>
  <div class="home-wrapper">
    <!-- Welcome Header Card -->
    <header class="welcome-card animate-fade-in">
      <div class="profile-header">
        <div class="user-avatar-lg">
          {{ userName.charAt(0).toUpperCase() }}
        </div>
        <div class="welcome-text">
          <span class="greeting-subtitle">Painel do Cliente</span>
          <h1>Olá, {{ userName }}!</h1>
          <p>Gerencie suas preferências de compra e veja suas ofertas personalizadas.</p>
        </div>
      </div>
    </header>

    <div class="dashboard-grid">
      <!-- Preferences Form Card -->
      <section
        class="dashboard-card preferences-card animate-slide-up"
        style="animation-delay: 0.1s"
      >
        <div class="card-header">
          <span class="card-icon">🎯</span>
          <div class="card-title-group">
            <h2>Preferências de Compra</h2>
            <p>
              Selecione seus interesses para nos ajudar a personalizar sua experiência.
            </p>
          </div>
        </div>

        <div class="card-body">
          <!-- Categories Selection -->
          <div class="form-section">
            <label class="section-label">Categorias de Interesse</label>
            <div class="categories-grid">
              <button
                v-for="cat in availableCategories"
                :key="cat.id"
                type="button"
                :class="['category-tag', { active: selectedCategories.includes(cat.id) }]"
                @click="toggleCategory(cat.id)"
              >
                <span class="cat-icon">{{ cat.icon }}</span>
                <span class="cat-name">{{ cat.name }}</span>
              </button>
            </div>
          </div>

          <!-- Notification Toggles -->
          <div class="form-section">
            <label class="section-label">Notificações e Novidades</label>
            <div class="toggle-group">
              <label class="toggle-switch">
                <input type="checkbox" v-model="receivePromoEmails" />
                <span class="slider"></span>
              </label>
              <div class="toggle-text">
                <span class="toggle-title">Receber ofertas por e-mail</span>
                <p>Enviaremos promoções baseadas nos seus interesses selecionados.</p>
              </div>
            </div>
          </div>

          <!-- Preferred Payment Method -->
          <div class="form-section">
            <label for="payment-method" class="section-label"
              >Método de Pagamento Preferido</label
            >
            <div class="select-wrapper">
              <select
                id="payment-method"
                v-model="preferredPayment"
                class="custom-select"
              >
                <option value="" disabled>Selecione uma opção</option>
                <option value="pix">⚡ Pix (Desconto de 5%)</option>
                <option value="credit_card">💳 Cartão de Crédito</option>
                <option value="boleto">📄 Boleto Bancário</option>
                <option value="paypal">🅿️ PayPal</option>
              </select>
            </div>
          </div>
        </div>

        <div class="card-footer">
          <button @click="savePreferences" class="btn-save" :disabled="isSaving">
            <span v-if="isSaving" class="loader-spinner"></span>
            <span v-else>💾 Salvar Preferências</span>
          </button>
        </div>
      </section>

      <section
        class="dashboard-card recommendations-card animate-slide-up"
        style="animation-delay: 0.2s"
      >
        <div class="card-header">
          <span class="card-icon">✨</span>
          <div class="card-title-group">
            <h2>Recomendações para Você</h2>
            <p>Com base nos seus interesses, nossa IA selecionará as melhores ofertas.</p>
          </div>
        </div>

        <div class="card-body recommendations-body">
          <div v-if="isLoadingRecommendations" class="skeletons-container">
            <div v-for="n in 3" :key="n" class="skeleton-card">
              <div class="skeleton-image-wrapper">
                <div class="skeleton-image shimmer"></div>
                <div class="skeleton-badge shimmer"></div>
              </div>
              <div class="skeleton-info">
                <div class="skeleton-title shimmer"></div>
                <div class="skeleton-price-row">
                  <div class="skeleton-price shimmer"></div>
                  <div class="skeleton-button shimmer"></div>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="recommendations.length === 0" class="coming-soon-banner">
            <div class="coming-soon-badge">Aviso</div>
            <h3>Nenhuma recomendação no momento</h3>
            <p>
              Escolha e salve novas preferências de categorias acima para forçar o motor
              de recomendação a gerar ofertas para o seu perfil.
            </p>
          </div>

          <div v-else class="products-container">
            <div v-for="prod in recommendations" :key="prod.id" class="product-item-card">
              <div class="product-avatar-box">🛍️</div>
              <div class="product-details">
                <h4>{{ prod.name }}</h4>
                <div class="product-meta-row">
                  <span class="product-id-tag">ID: {{ prod.id.substring(0, 8) }}...</span>
                  <span v-if="prod.price > 0" class="product-price-tag">
                    R$ {{ prod.price.toFixed(2).replace(".", ",") }}
                  </span>
                </div>
              </div>
              <button class="btn-view-product" @click="goToProduct(prod.id)">
                Ver Oferta
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { userService } from "@/services/userService";
import { recommendationService } from "@/services/recommendationService"; // <-- Importado o novo serviço
import { useToast } from "vue-toastification";

const toast = useToast();

const userName = ref("");
const userId = ref("");
const isSaving = ref(false);

// Recommendations states
const recommendations = ref([]);
const isLoadingRecommendations = ref(true);

// Preferences states
const selectedCategories = ref([]);
const receivePromoEmails = ref(true);
const preferredPayment = ref("pix");

const availableCategories = [
  { id: "electronics", name: "Eletrônicos", icon: "💻" },
  { id: "fashion", name: "Moda & Estilo", icon: "👕" },
  { id: "books", name: "Livros & Cultura", icon: "📚" },
  { id: "sports", name: "Esporte & Saúde", icon: "⚽" },
  { id: "home", name: "Casa & Design", icon: "🏠" },
  { id: "beauty", name: "Beleza & Cuidado", icon: "💄" },
  { id: "games", name: "Games & Geek", icon: "🎮" },
];

const toggleCategory = (catId) => {
  const index = selectedCategories.value.indexOf(catId);
  if (index === -1) {
    selectedCategories.value.push(catId);
  } else {
    selectedCategories.value.splice(index, 1);
  }
};

// Nova função assíncrona para buscar as recomendações do back-end
const fetchRecommendations = async () => {
  if (!userId.value) return;

  isLoadingRecommendations.value = true;
  try {
    const data = await recommendationService.getMyRecommendations(userId.value);
    recommendations.value = data;
  } catch (error) {
    console.error("Falha ao buscar recomendações da IA:", error);
  } finally {
    isLoadingRecommendations.value = false;
  }
};

const loadUserData = async () => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      const userObj = JSON.parse(storedUser);
      userId.value = userObj.id || "";
      userName.value = userObj.name || "Cliente";

      if (userObj.preferences && Array.isArray(userObj.preferences)) {
        selectedCategories.value = userObj.preferences.filter((pref) =>
          availableCategories.some((cat) => cat.id === pref)
        );

        receivePromoEmails.value = !userObj.preferences.includes("optout_newsletter");

        const paymentPref = userObj.preferences.find((p) => p.startsWith("pay_"));
        if (paymentPref) {
          preferredPayment.value = paymentPref.replace("pay_", "");
        }
      }

      // IMPORTANTE: Busca as recomendações da IA logo após identificar o ID do usuário logado
      await fetchRecommendations();
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      isLoadingRecommendations.value = false;
    }
  } else {
    isLoadingRecommendations.value = false;
  }
};

const savePreferences = async () => {
  isSaving.value = true;
  try {
    const prefArray = [...selectedCategories.value];

    if (!receivePromoEmails.value) {
      prefArray.push("optout_newsletter");
    }

    if (preferredPayment.value) {
      prefArray.push(`pay_${preferredPayment.value}`);
    }

    const response = await userService.updateMe({
      preferences: prefArray,
    });

    if (response.user) {
      localStorage.setItem("user", JSON.stringify(response.user));
      toast.success("Suas preferências foram salvas com sucesso!");

      // Atualiza as recomendações em tempo real após o usuário mudar os gostos
      await fetchRecommendations();
    } else {
      toast.success("Preferências salvas localmente!");
    }
  } catch (error) {
    console.error("Erro ao salvar preferências:", error);
    toast.error(
      error.response?.data?.message || "Não foi possível salvar as preferências."
    );
  } finally {
    isSaving.value = false;
  }
};

const goToProduct = (prodId) => {
  toast.info(`Navegando para o produto: ${prodId}`);
  // Aqui você colocaria a navegação do vue-router (ex: router.push(`/product/${prodId}`))
};

onMounted(() => {
  loadUserData();
});
</script>

<style scoped>
.home-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  font-family: "Plus Jakarta Sans", sans-serif;
}

/* Welcome Card */
.welcome-card {
  background: linear-gradient(135deg, var(--color-primary), #6366f1);
  border-radius: var(--radius-lg);
  padding: 2.5rem;
  color: white;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.welcome-card::before {
  content: "";
  position: absolute;
  top: -50px;
  right: -50px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  pointer-events: none;
}

.welcome-card::after {
  content: "";
  position: absolute;
  bottom: -30px;
  left: 20%;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  pointer-events: none;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.75rem;
}

.user-avatar-lg {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 3px solid rgba(255, 255, 255, 0.4);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 2.25rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.welcome-text h1 {
  font-size: 2.25rem;
  color: white;
  margin-bottom: 0.25rem;
  font-weight: 800;
}

.greeting-subtitle {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.8);
  display: block;
  margin-bottom: 0.25rem;
}

.welcome-text p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 992px) {
  .dashboard-grid {
    grid-template-columns: 1.1fr 0.9fr;
  }
}

/* General Dashboard Cards */
.dashboard-card {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  transition: box-shadow var(--transition-normal);
}

.dashboard-card:hover {
  box-shadow: var(--shadow-md);
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 1.25rem;
}

.card-icon {
  font-size: 2rem;
  line-height: 1;
  background: var(--color-background-mute);
  padding: 0.5rem;
  border-radius: var(--radius-md);
}

.card-title-group h2 {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--color-heading);
  margin-bottom: 0.25rem;
}

.card-title-group p {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.card-body {
  flex-grow: 1;
}

/* Form Styles */
.form-section {
  margin-bottom: 1.75rem;
}

.section-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-heading);
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

/* Categories Grid styling */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 0.75rem;
}

.category-tag {
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.75rem 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.category-tag:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  background-color: var(--color-background-mute);
}

.category-tag.active {
  background-color: rgba(99, 102, 241, 0.08);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary);
}

.category-tag .cat-icon {
  font-size: 1.5rem;
}

.category-tag .cat-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text);
  text-align: center;
}

.category-tag.active .cat-name {
  color: var(--color-primary);
}

/* Custom Switch Styles */
.toggle-group {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background-color: var(--color-background);
  padding: 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-border-hover);
  transition: 0.3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--color-primary);
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.toggle-text {
  display: flex;
  flex-direction: column;
}

.toggle-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-heading);
}

.toggle-text p {
  font-size: 0.8rem;
  margin-top: 0.15rem;
}

/* Custom Select styling */
.select-wrapper {
  position: relative;
}

.custom-select {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  color: var(--color-text);
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  outline: none;
  cursor: pointer;
  appearance: none;
  font-family: inherit;
  transition: border-color var(--transition-fast);
}

.custom-select:focus {
  border-color: var(--color-primary);
}

.select-wrapper::after {
  content: "▼";
  font-size: 0.7rem;
  color: var(--color-text-muted);
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

/* Save button styling */
.card-footer {
  margin-top: 2rem;
  border-top: 1px solid var(--color-border);
  padding-top: 1.5rem;
}

.btn-save {
  width: 100%;
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 0.9rem 1.5rem;
  font-size: 1rem;
  font-weight: 700;
  border-radius: var(--radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color var(--transition-fast), transform 0.1s ease;
  box-shadow: var(--shadow-sm);
}

.btn-save:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.btn-save:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-save:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loader-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Recommendations Card styles */
.recommendations-card {
  position: relative;
  overflow: hidden;
}

.recommendations-body {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.coming-soon-banner {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(168, 85, 247, 0.05));
  border: 1px dashed rgba(99, 102, 241, 0.3);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  text-align: center;
  position: relative;
}

.coming-soon-badge {
  background: linear-gradient(135deg, #a855f7, #6366f1);
  color: white;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.25rem 0.6rem;
  border-radius: 50px;
  display: inline-block;
  margin-bottom: 0.75rem;
  letter-spacing: 0.05em;
  box-shadow: 0 2px 4px rgba(168, 85, 247, 0.2);
}

.coming-soon-banner h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-heading);
  margin-bottom: 0.5rem;
}

.coming-soon-banner p {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  line-height: 1.4;
}

/* Recommendations Skeletons */
.skeletons-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-card {
  display: flex;
  gap: 1rem;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  pointer-events: none;
}

.skeleton-image-wrapper {
  position: relative;
  width: 70px;
  height: 70px;
  flex-shrink: 0;
}

.skeleton-image {
  width: 100%;
  height: 100%;
  background-color: var(--color-background-mute);
  border-radius: var(--radius-sm);
}

.skeleton-badge {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 25px;
  height: 10px;
  background-color: var(--color-border);
  border-radius: 2px;
}

.skeleton-info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-grow: 1;
}

.skeleton-title {
  height: 14px;
  width: 80%;
  background-color: var(--color-background-mute);
  border-radius: 3px;
  margin-top: 4px;
}

.skeleton-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skeleton-price {
  height: 14px;
  width: 35%;
  background-color: var(--color-background-mute);
  border-radius: 3px;
}

.skeleton-button {
  height: 20px;
  width: 50px;
  background-color: var(--color-background-mute);
  border-radius: 4px;
}

/* Shimmer Animation Effect */
.shimmer {
  background: linear-gradient(
    90deg,
    var(--color-background-mute) 25%,
    var(--color-border) 37%,
    var(--color-background-mute) 63%
  );
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Entry Animations */
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* CSS Adicional para renderizar os produtos reais da IA de forma elegante */
.products-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.product-item-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1rem;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.product-item-card:hover {
  transform: translateX(4px);
  border-color: var(--color-primary);
}

.product-avatar-box {
  width: 50px;
  height: 50px;
  background-color: var(--color-background-mute);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.product-details {
  flex-grow: 1;
}

.product-details h4 {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-heading);
  margin-bottom: 0.15rem;
}

.product-id-tag {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-family: monospace;
  background-color: var(--color-background-mute);
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
}

.btn-view-product {
  background-color: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  font-weight: 700;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-view-product:hover {
  background-color: var(--color-primary);
  color: white;
}
</style>
