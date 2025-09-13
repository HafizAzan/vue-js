<script setup>
import Button from '@/components/Button.vue'
import { useUserStore } from '@/store/useUserStore'
import { useRouter } from 'vue-router'

const router = useRouter()
const { setIsFirstTime } = useUserStore()

const goToLeaderboard = () => {
  setIsFirstTime(true)
  router.push('/signup')
}
</script>

<template>
  <main class="main-home-content">
    <v-typography variants="h2" class="text-h2 h2">Noetic Adventure</v-typography>
    <Button buttonText="Get Started" @click="goToLeaderboard" appendIcon="mdi-arrow-right" />
  </main>
</template>

<style scoped>
.main-home-content {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-flow: column wrap;
  gap: 20px;
  height: 50vh;
}
</style>
