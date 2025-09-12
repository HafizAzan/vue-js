<script setup>
import { ref } from 'vue'
import DropDownVue from '@/components/DropDown.vue'
const items = [{ title: 'Profile' }, { title: 'Settings' }, { title: 'Logout' }]
const handleSelect = (item) => {
  console.log('Selected item:', item)
}
</script>

<template>
  <main class="container">
    <div class="content">
      <v-typography variants="h3" class="text-h3 h3">Leaderboard</v-typography>

      <main class="content-btns">
        <v-btn variant="tonal" class="content-btn"> Play Next </v-btn>
        <DropDownVue
          :items="items"
          buttonText="Play Again"
          defaultLocation="bottom"
          @select="handleSelect"
        />
        <v-btn variant="tonal" class="content-btn"> Leave </v-btn>
      </main>
    </div>
  </main>
</template>

<style scoped>
.content {
  padding-top: 6rem;
  display: flex;
  align-items: start;
  justify-content: space-between;
  color: white;
}

.content-btns {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  margin-top: 2rem;
}

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
}
</style>
