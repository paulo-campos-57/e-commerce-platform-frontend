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

      <div class="form-group checkbox-group">
        <label for="isAdmin" class="checkbox-label">
          <input
            v-model="formData.isAdmin"
            type="checkbox"
            id="isAdmin"
            @change="handleAdminChange"
          />
          Quero me cadastrar como Administrador
        </label>
      </div>

      <div class="form-group" :class="{ 'disabled-field': formData.isAdmin }">
        <label for="preferences">Preferências de Compra</label>
        <select
          v-model="formData.preferences"
          id="preferences"
          multiple
          :disabled="formData.isAdmin"
          class="select-multiple"
        >
          <option value="tecnologia">Tecnologia</option>
          <option value="moda">Moda</option>
          <option value="casa">Casa & Decoração</option>
          <option value="games">Games</option>
        </select>
        <small class="help-text" v-if="!formData.isAdmin">
          Segure Ctrl (ou Cmd) para selecionar mais de uma opção.
        </small>
        <small class="help-text error" v-else>
          Administradores não possuem preferências de perfil.
        </small>
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
  isAdmin: false,
  preferences: [],
});

const handleAdminChange = () => {
  if (formData.isAdmin) {
    formData.preferences = [];
  }
};

const handleRegister = async () => {
  if (formData.password !== formData.confirmPassword) {
    toast.error("As senhas não coincidem.");
    return;
  }

  isLoading.value = true;

  const payload = {
    name: formData.name,
    email: formData.email,
    password: formData.password,
  };

  if (formData.isAdmin) {
    payload.role = "admin";
  } else {
    payload.role = "user";
    payload.preferences = formData.preferences;
  }

  try {
    const data = await userService.register(payload);

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
