<script setup>
import { ref, watch } from 'vue'
import Button from './Button.vue'

const emit = defineEmits(['close', 'agree', 'disagree', 'update:modelValue'])

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  text: {
    type: String,
    default: '',
  },
  maxWidth: {
    type: [String, Number],
    default: 400,
  },
  prependIcon: {
    type: String,
    default: '',
  },
  agreeText: {
    type: String,
    default: '',
  },
  disagreeText: {
    type: String,
    default: '',
  },
  showActions: {
    type: Boolean,
    default: true,
  },
  buttonText: {
    type: String,
    default: '',
  },

  closeOnOutsideClick: {
    type: Boolean,
    default: true,
  },
})

const dialog = ref(props.modelValue)

watch(
  () => props.modelValue,
  (val) => (dialog.value = val),
)

watch(dialog, (val) => emit('update:modelValue', val))

const handleAgree = () => {
  emit('agree')
  dialog.value = false
}

const handleDisagree = () => {
  emit('disagree')
  dialog.value = false
}
</script>

<template>
  <v-dialog
    v-model="dialog"
    :max-width="maxWidth"
    class="main-modal"
    :persistent="!closeOnOutsideClick"
  >
    <template v-slot:activator="{ props: activatorProps }">
      <slot name="activator" v-bind="{ activatorProps }">
        <Button v-if="buttonText" :buttonText="buttonText" v-bind="activatorProps" />
      </slot>
    </template>

    <v-card class="modal-card" :title="title" :prepend-icon="prependIcon">
      <template v-if="$slots.prependIcon">
        <slot name="prependIcon" />
      </template>

      <template v-if="$slots.title">
        <slot name="title" />
      </template>

      <v-card-text>
        <slot />
      </v-card-text>

      <v-card-actions class="modal-actions" v-if="showActions">
        <Button
          v-if="disagreeText"
          @click="handleDisagree"
          :button-text="disagreeText"
          class="disagree-btn"
        />
        <Button v-if="agreeText" @click="handleAgree" :button-text="agreeText" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.main-modal .v-overlay__scrim {
  background-color: rgba(0, 0, 0, 0.8) !important;
}

.modal-card {
  background-color: #000000d2;
  color: white;
  border: 1px solid orangered;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-actions {
  display: flex;
  justify-content: center !important;
  gap: 12px;
}

.disagree-btn {
  background-color: transparent !important;
  border: 1px solid white;
}

:deep(.v-card-text) {
  width: 100%;
}
</style>
