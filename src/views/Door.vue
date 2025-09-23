<script setup>
import Button from '@/components/Button.vue'
import { ROUTES } from '@/router'
import { usePlayStore } from '@/store/usePlayStore'
import { useRouter } from 'vue-router'

const router = useRouter()
const playStore = usePlayStore()

const navigate = () => router.push(ROUTES.FIND_WORD)
</script>

<template>
  <main class="main-door container">
    <v-typography variants="h2" class="text-h2 h2"
      >Each Flame Holds a Clue <br />
      Enter Level 0{{ playStore.getLevel() }}</v-typography
    >
    <Button
      :buttonText="`Enter Level 0${playStore.getLevel()}`"
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
</style>
