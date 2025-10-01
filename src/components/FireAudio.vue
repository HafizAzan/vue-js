<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import gateAudio from '@/assets/music/music.mp3'
import { ROUTES } from '@/router'

const props = defineProps({
  candleOn: Boolean,
  isSubmiting: Boolean,
  stopConsole: Boolean,
  isFading: [Number, String],
})

const audioRef = ref(null)
const route = useRoute()

const shouldPlay = computed(() => {
  return route.path === ROUTES.FIND_WORD && !props.stopConsole
})

const getVolume = () => {
  const fadeValue = Number(props.isFading).toFixed(2)
  if (!props.candleOn || fadeValue <= 0.2) return 0.01
  else if (fadeValue <= 0.6) return 0.03
  return 0.05
}

const setupAudio = () => {
  const audio = audioRef.value
  if (!audio) return

  if (shouldPlay.value) {
    audio.src = gateAudio
    audio.loop = true
    audio.volume = getVolume()

    audio.play().catch(() => {
      const handler = () => {
        audio.play()
        document.removeEventListener('click', handler)
      }
      document.addEventListener('click', handler, { once: true })
    })
  } else {
    if (!audio.paused) {
      audio.pause()
      audio.currentTime = 0
      audio.removeAttribute('src')
    }
  }
}

watch(
  () => [route.path, props.stopConsole],
  () => setupAudio(),
  { immediate: true },
)

watch(
  () => [props.isFading, props.candleOn],
  () => {
    const audio = audioRef.value
    if (audio) audio.volume = getVolume()
  },
)

onMounted(() => {
  setupAudio()
})

onUnmounted(() => {
  const audio = audioRef.value
  if (audio) {
    audio.pause()
    audio.currentTime = 0
    audio.removeAttribute('src')
  }
})
</script>

<template>
  <audio ref="audioRef" loop />
</template>
