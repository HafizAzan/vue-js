<script setup>
const props = defineProps({
  size: {
    type: [Number, String],
    default: 50,
  },
  color: {
    type: String,
    default: 'white',
  },
  overlay: {
    type: Boolean,
    default: true,
  },
})
</script>

<template>
  <div v-if="overlay" class="loader-overlay">
    <v-progress-circular indeterminate :size="size" :color="color" />
  </div>

  <v-progress-circular v-else indeterminate :size="size" :color="color" />
</template>

<style scoped>
.loader-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
}
</style>
