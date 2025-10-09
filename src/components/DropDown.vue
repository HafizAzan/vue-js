<script setup>
import Button from './Button.vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  buttonText: {
    type: String,
    default: null,
  },
  defaultLocation: {
    type: String,
    default: 'bottom',
  },
  customClass: {
    type: String,
    default: '',
  },
  prependIcon: {
    type: String,
    default: '',
  },
  selected: {
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
  <div :class="prependIcon ? 'content-btn-none-wrapper' : ''">
    <v-menu :location="defaultLocation">
      <template v-slot:activator="{ props: menuProps }">
        <Button
          v-if="buttonText"
          :buttonText="buttonText"
          :customClass="prependIcon ? 'content-btn-none' : 'customClass'"
          v-bind="menuProps"
        >
          <template v-if="prependIcon" #default>
            <v-icon size="30">{{ prependIcon }}</v-icon>
          </template>
        </Button>
      </template>
      <v-list class="menu-list">
        <v-list-item v-for="(item, index) in items" :key="index" @click="handleSelect(item)">
          <div class="one-row">
            <v-list-item-title>{{ item.title }}</v-list-item-title>
            <v-icon v-if="item.isSelected">mdi-check-circle-outline</v-icon>
          </div>
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

.content-btn-none {
  background-color: transparent;
  display: block;
  padding: 0px;
}

.content-btn-none-wrapper {
  width: 50px !important;
}

.content-btn-none :deep(.v-btn__underlay) {
  background-color: transparent !important ;
}

.content-btn-none :deep(.v-btn__content) {
  background-color: transparent !important ;
  display: block;
}

.menu-list {
  background-color: rgb(248, 13, 13) !important;
  color: white !important;
  height: 400px !important;
}

.one-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

:deep(.v-menu > .v-overlay__content) {
  min-height: 500px !important;
  max-height: 500px !important;
}
</style>
