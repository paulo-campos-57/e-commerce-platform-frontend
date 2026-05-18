<template>
  <header class="main-header">
    <div class="header-container">
      <div class="logo">
        <RouterLink to="/">e-Commerce app</RouterLink>
      </div>

      <nav class="nav-links">
        <RouterLink to="/">Início</RouterLink>
        <RouterLink to="/produtos">Produtos</RouterLink>
        <RouterLink to="/about">Sobre</RouterLink>
      </nav>

      <div class="header-actions">
        <RouterLink to="/login" class="login-link">Entrar</RouterLink>
        <div class="cart-icon">🛍️ <span class="cart-count">0</span></div>
      </div>
    </div>
  </header>
</template>

<style scoped>
@import "../assets/header.css";
</style>
