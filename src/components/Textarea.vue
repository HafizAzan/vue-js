<script setup>
import { ref, watch, computed } from 'vue'

const emit = defineEmits(['update:modelValue'])

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  rules: {
    type: Array,
    default: null,
  },
  outlined: {
    type: Boolean,
    default: false,
  },
  dense: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: '',
  },
  rows: {
    type: String,
    default: '10',
  },
  cols: {
    type: String,
    default: '6',
  },
})

const inputValue = ref(props.modelValue)

watch(
  () => props.modelValue,
  (val) => (inputValue.value = val),
  { immediate: true },
)

watch(inputValue, (val) => {
  emit('update:modelValue', props.type === 'number' ? Number(val) : val)
})

const computedRules = computed(() => {
  if (props.rules) return props.rules
  return []
})

const inputType = computed(() => {
  return props.type
})
</script>

<template>
  <v-textarea
    class="input-textarea"
    :label="label"
    :type="inputType"
    :rules="computedRules"
    :outlined="outlined"
    :dense="dense"
    :placeholder="placeholder"
    hide-details="auto"
    :model-value="props.modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    :auto-grow="true"
    :rows="rows"
    :max-rows="rows"
  />
</template>

<style scoped>
.input-textarea {
  background-color: #d30a0a2a;
  width: 100%;
  color: white;
  font-size: 18px !important;
  --v-field-label-error-color: white;
}

.input-textarea :deep(textarea::placeholder) {
  color: white !important;
  opacity: 1 !important;
  font-size: 18px !important;
}

.input-textarea :deep(.v-field.v-field--error) {
  border-color: white !important;
}

.input-textarea :deep(.v-messages__message) {
  color: white !important;
}

.input-textarea :deep(.v-field.v-field--error .v-field__outline) {
  border-color: white !important;
}

.input-textarea :deep(.v-field.v-field--error textarea::placeholder) {
  color: white !important;
  font-size: 18px !important;
  opacity: 1;
}

:deep(.v-textarea .v-field) {
  --v-input-control-height: auto !important;
  --v-input-padding-top: 10px !important;
  --v-input-padding-bottom: 10px !important;
}
</style>
