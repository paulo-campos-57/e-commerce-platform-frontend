<template>
  <div class="register-container">
    <h1 class="register-title">Que bom ter você aqui!</h1>
    <p class="register-description">
      Por favor, preencha os campos abaixo para criar sua conta.
    </p>
    <form class="register-form" @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="name">Nome</label>
        <input
          v-model="formData.name"
          type="text"
          id="name"
          name="name"
          placeholder="Digite seu nome"
          required
        />
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input
          v-model="formData.email"
          type="email"
          id="email"
          name="email"
          placeholder="Digite seu email"
          required
        />
      </div>
      <div class="form-group">
        <label for="password">Senha</label>
        <input
          v-model="formData.password"
          type="password"
          id="password"
          name="password"
          placeholder="Defina sua senha"
          required
        />
      </div>
      <div class="form-group">
        <label for="confirmPassword">Confirme sua senha</label>
        <input
          v-model="formData.confirmPassword"
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          placeholder="Confirme sua senha"
          required
        />
      </div>
      <button type="submit" class="register-button" :disabled="isLoading">
        <span v-if="!isLoading">Criar Conta</span>
        <span v-else>Cadastrando...</span>
      </button>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { userService } from "@/services/userService";
import { useToast } from "vue-toastification";

const router = useRouter();
const toast = useToast();
const isLoading = ref(false);

const formData = reactive({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const handleRegister = async () => {
  if (formData.password !== formData.confirmPassword) {
    toast.error("As senhas não coincidem.");
    return;
  }

  isLoading.value = true;

  try {
    const data = await userService.register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });

    toast.success(data.message || "Registro efetuado com sucesso!");
    router.push("/login");
  } catch (error) {
    console.error("Erro no cadastro:", error);

    const apiMessage = error.response?.data?.message;

    if (Array.isArray(apiMessage)) {
      apiMessage.forEach((msg) => toast.error(msg));
    } else {
      toast.error(apiMessage || "Erro ao criar conta.");
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style>
@import "@/assets/register.css";
@import "@/assets/base.css";
</style>
