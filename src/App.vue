<script setup>
import { RouterView } from 'vue-router'
import { Toaster } from 'vue-sonner'
</script>

<template>
  <RouterView />
  <Toaster richColors position="top-center" duration="1000" />
</template>
