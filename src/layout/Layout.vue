<script setup>
import { RouterView } from 'vue-router'
import Header from '../components/Header.vue'
</script>

<template>
  <div class="layout">
    <div class="animation-brightness"></div>
    <Header />
    <RouterView />
  </div>
</template>

<style scoped>
.layout {
  height: 100vh;
  width: 100vw;
  background: url('@/assets/images/leaderboard.jpg') no-repeat center center / cover;
  position: relative;
  overflow: hidden;
}

.animation-brightness {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.1);
  animation: brightnessAnimation 3s infinite alternate;
  z-index: 1;
}

.layout > *:not(.animation-brightness) {
  position: relative;
  z-index: 2;
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
