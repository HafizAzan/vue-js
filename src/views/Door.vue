<script setup>
import Button from '@/components/Button.vue'
import { ROUTES } from '@/router'
import { usePlayStore } from '@/store/usePlayStore'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const playStore = usePlayStore()
const level = route.query.playAgain

const navigate = () => {
  if (level) {
    router.push(`${ROUTES.FIND_WORD}?playAgain=${level}`)
    playStore.setLevel(level)
  } else {
    router.push(ROUTES.FIND_WORD)
  }
}
</script>

<template>
  <main class="main-door container">
    <v-typography variants="h2" class="text-h4 text-center text-sm-h2 text-sm-start h2"
      >Each Flame Holds a Clue <br />
      Enter Level 0{{ level ?? playStore.getLevel() }}</v-typography
    >
    <Button
      :buttonText="`Enter Level 0${level ?? playStore.getLevel()}`"
      appendIcon="mdi-arrow-right"
      @click="() => navigate()"
    />
  </main>
</template>

<style>
.main-door {
  display: flex;
  align-items: start;
  justify-content: center;
  flex-direction: column;
  gap: 30px;
  height: 70vh;
}

/* media query */
@media (max-width: 600px) {
  .main-door {
    align-items: center;
    justify-content: center;
  }
}
</style>
