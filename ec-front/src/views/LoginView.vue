<template>
  <div class="login-container">
    <h1 class="login-title">Bem-vindo de volta!</h1>

    <form class="login-form" @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required />
      </div>

      <div class="form-group">
        <label for="password">Senha:</label>
        <div class="password-wrapper">
          <input
            :type="isPasswordVisible ? 'text' : 'password'"
            id="password"
            name="password"
            required
          />
          <button
            type="button"
            class="toggle-password-btn"
            @click="togglePasswordVisibility"
            :aria-label="isPasswordVisible ? 'Esconder senha' : 'Mostrar senha'"
          >
            {{ isPasswordVisible ? "👁️‍🗨️" : "👁️" }}
          </button>
        </div>
      </div>

      <button class="login-button" type="submit">Entrar</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";

const isPasswordVisible = ref(false);

const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value;
};

const handleSubmit = () => {
  console.log("Formulário enviado!");
};
</script>

<style>
@import "@/assets/login.css";
@import "@/assets/base.css";
</style>
