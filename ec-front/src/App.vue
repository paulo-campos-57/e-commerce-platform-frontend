<script setup>
import { RouterView } from "vue-router";
import Header from "@/components/Header.vue";
</script>

<template>
  <Header />

  <main class="page-content">
    <RouterView />
  </main>
</template>

<style>
.page-content {
  min-height: calc(100vh - 70px);
  padding: 2rem 0;
}
</style>
