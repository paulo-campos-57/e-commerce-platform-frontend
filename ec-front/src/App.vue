<script setup>
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <header>
    <nav>
      <RouterLink to="/">Início</RouterLink> |
      <RouterLink to="/about">Sobre</RouterLink>
    </nav>
  </header>

  <main>
    <RouterView />
  </main>
</template>

<style scoped>
nav {
  padding: 1rem;
  background-color: #f4f4f4;
  margin-bottom: 2rem;
}
nav a {
  text-decoration: none;
  color: #333;
  font-weight: bold;
}
nav a.router-link-exact-active {
  color: #42b983;
}
</style>
