<script setup>
const props = defineProps({
  items: {
    type: Array,
    default: [],
  },
  divider: {
    type: String,
    default: '>',
  },
})
</script>

<template>
  <div>
    <v-breadcrumbs :items="items" :divider="divider"></v-breadcrumbs>
  </div>
</template>

<style scoped></style>
