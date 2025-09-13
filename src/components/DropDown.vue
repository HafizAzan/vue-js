<script setup>
import Button from './Button.vue'

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
  customClass: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['select'])

const handleSelect = (item) => {
  emit('select', item)
}
</script>

<template>
  <div>
    <v-menu :location="defaultLocation">
      <template v-slot:activator="{ props }">
        <Button :buttonText="buttonText" :customClass="customClass" v-bind="props" />
      </template>

      <v-list class="menu-list">
        <v-list-item v-for="(item, index) in items" :key="index" @click="handleSelect(item)">
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<style scoped>
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

.menu-list {
  background-color: rgb(248, 13, 13) !important;
  color: white !important;
}
</style>
