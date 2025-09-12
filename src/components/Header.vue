<script setup>
import logo from '@/assets/logo.svg'
</script>

<template>
  <header class="header">
    <img :src="logo" alt="Logo" class="logo" />
  </header>
</template>

<style scoped>
header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  padding-top: 1.5rem;
  color: white;
}
</style>
