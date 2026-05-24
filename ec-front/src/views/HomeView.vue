<template>
  <div class="home-container">
    <h1>Bem-vindo, {{ userName }}!</h1>
    <p>Este é o conteúdo da página inicial.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const userName = ref("");

onMounted(() => {
  const storedUser = localStorage.getItem("user");
  console.log("Dados do usuário armazenados:", storedUser);

  if (storedUser) {
    try {
      const userObj = JSON.parse(storedUser);

      userName.value = userObj.name;
    } catch (error) {
      console.error("Erro ao converter os dados do usuário:", error);
    }
  }
});
</script>

<style scoped>
@import "../assets/home.css";
</style>
