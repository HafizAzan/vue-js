<script setup>
import { ref } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  buttonText: {
    type: String,
    default: 'Dropdown',
  },
  defaultLocation: {
    type: String,
    default: 'bottom',
  },
})

const emit = defineEmits(['select'])

const location = ref(props.defaultLocation)

const handleSelect = (item) => {
  emit('select', item)
}
</script>

<template>
  <div>
    <v-menu :location="location">
      <template v-slot:activator="{ props }">
        <v-btn color="primary" v-bind="props">{{ buttonText }}</v-btn>
      </template>

      <v-list>
        <v-list-item v-for="(item, index) in items" :key="index" @click="handleSelect(item)">
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>
