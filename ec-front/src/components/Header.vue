<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "vue-toastification";

const router = useRouter();
const route = useRoute();
const toast = useToast();

const isLoggedIn = ref(false);
const isAdmin = ref(false);
const userName = ref("");

const checkAuthStatus = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (token && user) {
    isLoggedIn.value = true;
    try {
      const userObj = JSON.parse(user);
      isAdmin.value = userObj.role === "admin";
      userName.value = userObj.name || "";
    } catch (e) {
      console.error("Erro ao analisar dados do usuário:", e);
      isAdmin.value = false;
      userName.value = "";
    }
  } else {
    isLoggedIn.value = false;
    isAdmin.value = false;
    userName.value = "";
  }
};

onMounted(() => {
  checkAuthStatus();
});

watch(
  () => route.path,
  () => {
    checkAuthStatus();
  }
);

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  checkAuthStatus();
  toast.info("Você saiu da conta.");
  router.push("/login");
};
</script>

<template>
  <header class="main-header">
    <div class="header-container">
      <div class="logo">
        <RouterLink to="/">e-Commerce app</RouterLink>
      </div>

      <nav class="nav-links">
        <RouterLink to="/">Início</RouterLink>
        <RouterLink v-if="isLoggedIn && !isAdmin" to="/home">Minha Home</RouterLink>
        <RouterLink v-if="isLoggedIn && isAdmin" to="/homeAdmin">Painel Admin</RouterLink>
        <RouterLink to="/produtos">Produtos</RouterLink>
        <RouterLink to="/about">Sobre</RouterLink>
      </nav>

      <div class="header-actions">
        <span v-if="isLoggedIn" class="user-greeting">Olá, {{ userName }}!</span>
        <button v-if="isLoggedIn" @click="handleLogout" class="logout-btn">Sair</button>
        <RouterLink v-else to="/login" class="login-link">Entrar</RouterLink>
        <div class="cart-icon">🛍️ <span class="cart-count">0</span></div>
      </div>
    </div>
  </header>
</template>

<style scoped>
@import "../assets/header.css";

.user-greeting {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  font-weight: 500;
}

.logout-btn {
  background: none;
  border: none;
  color: var(--color-danger, #dc3545);
  font-weight: 600;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  font-size: 1rem;
  transition: opacity var(--transition-fast, 0.2s);
}

.logout-btn:hover {
  opacity: 0.8;
}
</style>
