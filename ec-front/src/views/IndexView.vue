<template>
  <div class="index-container">
    <div class="logo-placeholder">e-Commerce app</div>

    <main class="auth-actions">
      <div class="actions-card">
        <h2>Comece por aqui</h2>
        <p class="subtitle">Escolha uma das opções abaixo para acessar a plataforma:</p>

        <div class="button-group">
          <button class="btn-primary" @click="goToLogin">Entrar na minha Conta</button>

          <button class="btn-secondary" @click="goToRegister">Criar nova Conta</button>
        </div>

        <footer class="actions-footer">
          <p>
            Ao continuar, você concorda com os nossos <a href="#">Termos de Serviço</a>.
          </p>
        </footer>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const goToLogin = () => {
  router.push("/login");
};

const goToRegister = () => {
  router.push("/register");
};
</script>

<style>
@import "@/assets/index.css";
@import "@/assets/base.css";
</style>
