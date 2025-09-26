<script setup>
import { useAttrs } from 'vue'
import click from '@/assets/music/click.mp3'

const emit = defineEmits(['click'])
const attr = useAttrs()
const props = defineProps({
  variant: {
    type: String,
    default: 'tonal',
  },
  buttonText: {
    type: String,
    default: 'Play Again',
  },
  customClass: {
    type: String,
    default: '',
  },
  prependIcon: {
    type: String,
    default: '',
  },
  appendIcon: {
    type: String,
    default: '',
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

function handleClick(event) {
  const audio = new Audio(click)
  audio.volume = 0.5
  audio.play().catch((err) => {
    console.warn('Click sound could not play:', err)
  })

  emit('click', event)
}
</script>

<template>
  <v-btn
    v-bind="attr"
    :variant="variant"
    :class="['content-btn', customClass]"
    @click="handleClick"
  >
    <v-icon v-if="prependIcon && !isLoading" class="mr-2">{{ prependIcon }}</v-icon>
    <slot>{{ buttonText }}</slot>
    <v-progress-circular v-if="isLoading" indeterminate size="20" color="white" class="ml-2" />
    <v-icon v-if="appendIcon && !isLoading" class="ml-2">{{ appendIcon }}</v-icon>
  </v-btn>
</template>

<style scoped>
.content-btn {
  background-color: rgb(248, 13, 13);
  color: white;
  width: fit-content;
  height: fit-content !important;
  padding: 0.8rem;
  font-size: 1.1rem;
  border-radius: 0.5rem;
  font-weight: 700 !important;
  text-transform: capitalize;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  display: flex;
  align-items: center;
}
</style>
