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
    default: 7,
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
  flex-wrap: wrap;
  justify-content: flex-end;
  margin-top: 1rem;
  overflow-x: hidden; /* Prevents horizontal scroll */
}

:deep(.v-pagination .v-btn.v-pagination__more) {
  background-color: white !important;
  color: black !important;
  border-radius: 50% !important;
  font-weight: bold;
}

:deep(.v-pagination) {
  --v-theme-primary: #ff6b6b;
  flex-wrap: wrap !important;
  justify-content: center;
  max-width: 100%;
  overflow-x: hidden;
}

:deep(.v-pagination .v-btn) {
  border-radius: 10% !important;
  background-color: rgba(248, 13, 13, 0.527);
  color: white;
  opacity: 0.8;
  min-width: 36px;
  height: 36px;
  font-size: 14px;
}

:deep(.v-pagination .v-btn--active) {
  background-color: #ff6b6b !important;
  color: white !important;
}

:deep(.v-pagination .v-btn .v-icon),
:deep(.v-pagination .v-btn:hover .v-icon) {
  color: white !important;
}

/* Better mobile responsiveness */
@media (max-width: 500px) {
  .pagination-container {
    justify-content: center;
  }

  :deep(.v-pagination .v-btn) {
    min-width: 30px;
    height: 30px;
    font-size: 12px;
    padding: 0 4px;
  }

  :deep(.v-pagination__list) {
    overflow-y: auto;
  }
}
</style>
