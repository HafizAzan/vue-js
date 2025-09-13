<script setup>
import { ref, useAttrs, watch } from 'vue'

const props = defineProps({
  length: {
    type: [Number, String],
    default: 8,
  },
  rounded: {
    type: String,
    default: 'circle',
  },
  totalVisible: {
    type: [Number, String],
    default: 5,
  },
  modelValue: {
    type: Number,
    default: 1,
  },
})

const emit = defineEmits(['update:modelValue'])
const page = ref(props.modelValue)

watch(
  () => props.modelValue,
  (newVal) => {
    page.value = newVal
  },
)

watch(page, (newPage) => {
  emit('update:modelValue', newPage)
})

const attr = useAttrs()

const nextPage = () => {
  if (page.value < props.length) {
    page.value++
    emit('update:modelValue', page.value)
  }
}

const prevPage = () => {
  if (page.value > 1) {
    page.value--
    emit('update:modelValue', page.value)
  }
}
</script>

<template>
  <div class="pagination-container">
    <v-pagination
      v-bind="attr"
      v-model="page"
      :length="length"
      :total-visible="totalVisible"
      show-arrows
      prev-icon="mdi-chevron-left"
      next-icon="mdi-chevron-right"
      @click:prev="prevPage"
      @click:next="nextPage"
    />
  </div>
</template>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

:deep(.v-pagination .v-btn.v-pagination__more) {
  background-color: white !important;
  color: black !important;
  border-radius: 50% !important;
  font-weight: bold;
}

:deep(.v-pagination) {
  --v-theme-primary: #ff6b6b;
}

:deep(.v-pagination .v-btn) {
  border-radius: 50% !important;
  background-color: rgba(248, 13, 13, 0.527);
  color: white;
}

:deep(.v-pagination .v-btn--active) {
  background-color: #ff6b6b !important;
  color: white !important;
}

:deep(.v-pagination .v-btn .v-icon) {
  color: white !important;
}

:deep(.v-pagination .v-btn:hover .v-icon) {
  color: white !important;
}
</style>
