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
    default: 'Username',
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
})

const inputValue = ref(props.modelValue)
const showPassword = ref(false)

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
  if (props.type === 'password') {
    return showPassword.value ? 'text' : 'password'
  }
  return props.type
})

const togglePassword = () => {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <v-text-field
    class="input-field"
    :label="label"
    :type="inputType"
    :rules="computedRules"
    :outlined="outlined"
    :dense="dense"
    :placeholder="placeholder"
    hide-details="auto"
    :append-inner-icon="props.type === 'password' ? (showPassword ? 'mdi-eye-off' : 'mdi-eye') : ''"
    @click:append-inner="props.type === 'password' && togglePassword()"
    :model-value="props.modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>

<style scoped>
.v-field__field {
  height: 40px !important;
}
.input-field {
  background-color: #d30a0a2a;
  width: 100%;
  color: white;
  font-size: 26px !important;
  min-height: 30px;
  --v-field-label-error-color: white;
}

.input-field :deep(input::placeholder) {
  color: white !important;
  opacity: 1 !important;
  font-size: 26px !important;
}

.input-field :deep(.v-field.v-field--error) {
  border-color: white !important;
}

.input-field :deep(.v-messages__message) {
  color: white !important;
}

.v-field__input::placeholder {
  color: white !important;
  font-size: 26px !important;
  opacity: 1;
}

.input-field :deep(.v-field.v-field--error) {
  --v-field-border-color: white !important;
  --v-field-border-opacity: 1 !important;
}

.input-field :deep(.v-field.v-field--error input::placeholder) {
  color: white !important;
  font-size: 26px !important;
  opacity: 1;
}

.input-field :deep(.v-field.v-field--error .v-field__outline) {
  border-color: white !important;
}

.v-field {
  height: 40px !important;
  min-height: 40px !important;
}

:deep(.v-text-field .v-field) {
  min-height: 50px !important;
  height: 50px !important;
  --v-input-control-height: 50px !important;
  --v-input-padding-top: 0px !important;
  --v-input-padding-bottom: 0px !important;
}
</style>
