<script setup>
import { ref, onMounted, onUnmounted, watch, computed, toRef, reactive } from 'vue'
import { useRoute } from 'vue-router'
import gateAudio from '@/assets/music/music.mp3'
import { ROUTES } from '@/router'

const props = defineProps({
  candleOn: Boolean,
  isSubmiting: Boolean,
  stopConsole: Boolean,
  isFading: [Number, String],
  modelText: [Object, String],
})

const model = toRef(props, 'modelText')

const audioRef = ref(null)
const models = ref(model.value)
const route = useRoute()

const audioKey = reactive({
  high: models.value?.high,
  medium: models.value?.medium,
  low: models.value?.low,
  audioFile: models.value?.audioFile,
})

watch(
  models,
  (val) => {
    audioKey.high = val.high
    audioKey.medium = val.medium
    audioKey.low = val.low
    audioKey.audioFile = val.audioFile
  },
  { immediate: true },
)

onMounted(() => {
  audioKey.high = models.value.high
  audioKey.medium = models.value.medium
  audioKey.low = models.value.low
  audioKey.audioFile = models.value.audioFile
})

const shouldPlay = computed(() => {
  return route.path === ROUTES.FIND_WORD && !props.stopConsole
})

const getVolume = () => {
  const fadeValue = Number(props.isFading).toFixed(2)
  if (!props.candleOn || fadeValue <= 0.2) return audioKey?.low ?? 0.01
  else if (fadeValue <= 0.6) return audioKey?.medium ?? 0.03
  return audioKey?.high ?? 0.05
}

const setupAudio = () => {
  const audio = audioRef.value
  if (!audio) return

  if (shouldPlay.value) {
    audio.src = audioKey?.audioFile ?? gateAudio
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
