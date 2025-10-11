<script setup>
import { RouterView, useRoute } from 'vue-router'
import Header from '@/components/Header.vue'
import { ROUTES } from '@/router'
import { computed, ref, watch, onMounted, onUnmounted, nextTick, reactive } from 'vue'
import doorBg from '@/assets/images/gate.jpg'
import leaderboardBg from '@/assets/images/leaderboard.jpg'
import { usePlayStore } from '@/store/usePlayStore'
import findWordOne from '@/assets/images/level-01.jpg'
import findWordTwo from '@/assets/images/level-02.jpg'
import findWordThree from '@/assets/images/level-03.jpg'
import findWordFour from '@/assets/images/level-04.jpg'
import findWordFive from '@/assets/images/level-05.jpg'
import findWordSix from '@/assets/images/level-06.jpg'
import findWordSeven from '@/assets/images/level-07.jpg'
import music from '@/assets/music/music.mp3'
import { fetchAllBgImg } from '@/utils/admin-api-service'
import { useQuery } from '@tanstack/vue-query'

const route = useRoute()
const playStore = usePlayStore()

const {
  data: getAllImages,
  isLoading: isGettingImages,
  refetch: refetchAllImages,
} = useQuery({
  queryKey: ['fetch-bg-img'],
  queryFn: fetchAllBgImg,
})

const levelBackgrounds = {
  1: findWordOne,
  2: findWordTwo,
  3: findWordThree,
  4: findWordFour,
  5: findWordFive,
  6: findWordSix,
  7: findWordSeven,
}

const defaultImages = reactive({
  home: '',
  register: '',
  login: '',
  answers: '',
  leaderboard: '',
  door: '',
})

const getBgImages = () => {
  const bgImages = getAllImages?.value?.[0]
  if (bgImages) {
    Object.entries(defaultImages).forEach(([key, value]) => {
      defaultImages[key] = bgImages[key]
    })
  }
}

watch(getAllImages, getBgImages)
onMounted(getBgImages)

const layoutStyle = computed(() => {
  const level = playStore.getLevel()
  const levelBg = levelBackgrounds[level] || findWordOne

  let bgImage = defaultImages?.leaderboard || leaderboardBg
  if (route.path === ROUTES.DOOR) bgImage = defaultImages.door || doorBg
  else if (route.path === ROUTES.FIND_WORD) bgImage = levelBg
  else if (route.path === ROUTES.HOME) bgImage = defaultImages?.home || levelBg
  else if (route.path === ROUTES.REGISTER) bgImage = defaultImages?.register || levelBg
  else if (route.path === ROUTES.ANSWERS) bgImage = defaultImages?.answers || levelBg
  else if (route.path === ROUTES.LOGIN) bgImage = defaultImages?.login || levelBg

  return {
    backgroundImage: `url(${bgImage})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    backgroundSize: 'cover',
  }
})

const audioRef = ref(null)

const playMusic = async () => {
  const audio = audioRef.value
  if (!audio) return

  if (route.path !== ROUTES.FIND_WORD) {
    audio.src = music
    audio.loop = true
    audio.volume = 0.1
    audio.muted = true
    try {
      await audio.play()
      await nextTick()
      audio.muted = false
    } catch (err) {
      throw err
    }
  } else {
    if (!audio.paused) {
      audio.pause()
      audio.currentTime = 0
      audio.removeAttribute('src')
    }
  }
}

watch(
  () => route.path,
  () => playMusic(),
  { immediate: true },
)

onMounted(() => playMusic())

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
  <div class="layout" :style="layoutStyle">
    <div class="animation-brightness"></div>
    <div class="layout-wrapper">
      <Header />
      <!-- Page transition wrapper -->
      <transition name="fade" mode="out-in">
        <RouterView />
      </transition>
      <!-- <audio ref="audioRef" /> -->
    </div>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  width: 100%;
  min-width: 100%;
  max-width: 100%;
  position: relative;
  overflow-x: hidden;
}

.layout-wrapper {
  overflow-y: auto;
  position: relative;
  z-index: 2;
  min-height: 100vh;
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

/* Page fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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
