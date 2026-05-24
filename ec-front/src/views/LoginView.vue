<template>
  <div class="login-container">
    <h1 class="login-title">Bem-vindo de volta!</h1>

    <form class="login-form" @submit.prevent="handleLogin">
      <p
        v-if="errorMessage"
        style="color: var(--color-danger); text-align: center; margin-bottom: 1rem"
      >
        {{ errorMessage }}
      </p>
      <div class="form-group">
        <label for="email">Email:</label>
        <input v-model="formData.email" type="email" id="email" name="email" required />
      </div>

      <div class="form-group">
        <label for="password">Senha:</label>
        <div class="password-wrapper">
          <input
            v-model="formData.password"
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

      <button class="login-button" type="submit" :disabled="isLoading">
        {{ isLoading ? "Entrando..." : "Entrar" }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { userService } from "@/services/userService";
import api from "@/services/api";

const router = useRouter();
const isPasswordVisible = ref(false);
const isLoading = ref(false);
const errorMessage = ref("");

const formData = reactive({
  email: "",
  password: "",
});

const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value;
};

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const data = await userService.login(formData);

    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));

    console.log("Nest answer:", data);
    alert(data.message);

    router.push("/home");
  } catch (error) {
    console.error("Erro na requisição:", error);
    errorMessage.value =
      error.response?.data?.message || "Ocorreu um erro ao fazer login.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<style>
@import "@/assets/login.css";
@import "@/assets/base.css";
</style>
