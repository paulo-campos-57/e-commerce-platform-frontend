<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="login-title">Bem-vindo de volta!</h1>
      <p class="login-subtitle">Entre com suas credenciais para acessar sua conta.</p>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">E-mail</label>
          <input
            v-model="formData.email"
            type="email"
            id="email"
            name="email"
            placeholder="exemplo@loja.com"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Senha</label>
          <div class="password-wrapper">
            <input
              v-model="formData.password"
              :type="isPasswordVisible ? 'text' : 'password'"
              id="password"
              name="password"
              placeholder="Digite sua senha"
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
          <span v-if="!isLoading">Entrar na Conta</span>
          <span v-else class="loader-text">Autenticando...</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { userService } from "@/services/userService";
import { useToast } from "vue-toastification";

const router = useRouter();
const toast = useToast();

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

    toast.success(data.message || "Login efetuado com sucesso!");

    router.push("/home");
  } catch (error) {
    console.error("Erro na requisição:", error);

    const apiErrorMessage =
      error.response?.data?.message || "Ocorreu um erro ao fazer login.";
    toast.error(apiErrorMessage);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style>
@import "@/assets/login.css";
@import "@/assets/base.css";
</style>
