<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header class="app-header">
    <span class="app-title">OpenSteward</span>
    <nav>
      <RouterLink to="/ims">Inventory</RouterLink>
      <RouterLink to="/ams">Assets</RouterLink>
    </nav>
  </header>
  <main>
    <RouterView />
  </main>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 0.75rem 2rem;
  background: var(--color-background-soft);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 10;
}
.app-title {
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: -0.01em;
}
nav { display: flex; gap: 0.25rem; }
nav a {
  text-decoration: none;
  color: var(--color-text);
  padding: 0.3rem 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  opacity: 0.7;
  transition: opacity 0.15s, background 0.15s;
}
nav a:hover { opacity: 1; background: var(--color-background-mute); }
nav a.router-link-active { opacity: 1; background: var(--color-background-mute); font-weight: 600; }
</style>
