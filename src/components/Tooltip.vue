<script setup>
const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    default: 'top',
  },
})
</script>

<template>
  <v-tooltip :text="text" :location="location">
    <template #activator="{ props: activatorProps }">
      <span v-bind="activatorProps">
        <slot />
      </span>
    </template>
  </v-tooltip>
</template>
