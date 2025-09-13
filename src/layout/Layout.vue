<script setup>
import { RouterView } from 'vue-router'
import Header from '../components/Header.vue'
</script>

<template>
  <div class="layout">
    <div class="animation-brightness"></div>
    <div class="layout-wrapper">
      <Header />
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  width: 100vw;
  background: url('@/assets/images/leaderboard.jpg') no-repeat center center / cover;
  position: relative;
  overflow-x: hidden;
}

.layout-wrapper {
  overflow-y: auto;
  position: relative;
  z-index: 2;
}

.animation-brightness {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.1);
  animation: brightnessAnimation 3s infinite alternate;
  z-index: 1;
  pointer-events: none;
}

@keyframes brightnessAnimation {
  0% {
    background: rgba(0, 0, 0, 0.1);
    filter: brightness(0.7);
  }
  50% {
    background: rgba(0, 0, 0, 0.3);
    filter: brightness(0.7);
  }
  100% {
    background: rgba(0, 0, 0, 0.6);
    filter: brightness(1.1);
  }
}
</style>
