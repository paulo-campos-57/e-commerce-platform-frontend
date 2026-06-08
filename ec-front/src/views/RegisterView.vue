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
      <div class="form-group">
        <label for="state">Estado</label>
        <div class="select-wrapper">
          <select
            v-model="formData.state"
            id="state"
            name="state"
            class="custom-select"
            required
          >
            <option value="" disabled>Selecione seu estado</option>
            <option v-for="uf in BrazilianStates" :key="uf.sigla" :value="uf.sigla">
              {{ uf.nome }} ({{ uf.sigla }})
            </option>
          </select>
        </div>
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
        <label>Preferências de Compra</label>
        <p class="sub-label-text" v-if="!formData.isAdmin">
          Selecione as categorias que você mais gosta:
        </p>

        <div v-if="!formData.isAdmin" class="categories-tag-grid">
          <button
            v-for="cat in olistCategories"
            :key="cat.dbValue"
            type="button"
            :class="[
              'category-register-tag',
              { active: formData.preferences.includes(cat.dbValue) },
            ]"
            @click="toggleCategory(cat.dbValue)"
          >
            <span class="cat-icon">{{ cat.icon }}</span>
            <span class="cat-name">{{ cat.label }}</span>
          </button>
        </div>

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

const olistCategories = [
  { dbValue: "bed_bath_table", label: "Cama, Mesa & Banho", icon: "🛏️" },
  { dbValue: "health_beauty", label: "Saúde & Beleza", icon: "💄" },
  { dbValue: "sports_leisure", label: "Esporte & Lazer", icon: "⚽" },
  { dbValue: "furniture_decor", label: "Móveis & Decoração", icon: "🏠" },
  { dbValue: "computers_accessories", label: "Informática & Acessórios", icon: "💻" },
  { dbValue: "housewares", label: "Utilidades Domésticas", icon: "🍳" },
  { dbValue: "watches_gifts", label: "Relógios & Presentes", icon: "⌚" },
  { dbValue: "telephony", label: "Telefonia", icon: "📱" },
  { dbValue: "garden_tools", label: "Ferramentas & Jardim", icon: "🏡" },
  { dbValue: "auto", label: "Automotivo", icon: "🚗" },
];

const BrazilianStates = [
  { sigla: "AC", nome: "Acre" },
  { sigla: "AL", nome: "Alagoas" },
  { sigla: "AP", nome: "Amapá" },
  { sigla: "AM", nome: "Amazonas" },
  { sigla: "BA", nome: "Bahia" },
  { sigla: "CE", nome: "Ceará" },
  { sigla: "DF", nome: "Distrito Federal" },
  { sigla: "ES", nome: "Espírito Santo" },
  { sigla: "GO", nome: "Goiás" },
  { sigla: "MA", nome: "Maranhão" },
  { sigla: "MT", nome: "Mato Grosso" },
  { sigla: "MS", nome: "Mato Grosso do Sul" },
  { sigla: "MG", nome: "Minas Gerais" },
  { sigla: "PA", nome: "Pará" },
  { sigla: "PB", nome: "Paraíba" },
  { sigla: "PR", nome: "Paraná" },
  { sigla: "PE", nome: "Pernambuco" },
  { sigla: "PI", nome: "Piauí" },
  { sigla: "RJ", nome: "Rio de Janeiro" },
  { sigla: "RN", nome: "Rio Grande do Norte" },
  { sigla: "RS", nome: "Rio Grande do Sul" },
  { sigla: "RO", nome: "Rondônia" },
  { sigla: "RR", nome: "Roraima" },
  { sigla: "SC", nome: "Santa Catarina" },
  { sigla: "SP", nome: "São Paulo" },
  { sigla: "SE", nome: "Sergipe" },
  { sigla: "TO", nome: "Tocantins" },
];

const formData = reactive({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  state: "",
  isAdmin: false,
  preferences: [],
});

const handleAdminChange = () => {
  if (formData.isAdmin) {
    formData.preferences = [];
  }
};

const toggleCategory = (dbValue) => {
  const index = formData.preferences.indexOf(dbValue);
  if (index === -1) {
    formData.preferences.push(dbValue);
  } else {
    formData.preferences.splice(index, 1);
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
    state: formData.state.toUpperCase().trim(),
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
