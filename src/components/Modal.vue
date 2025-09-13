<script setup>
import { ref, watch } from 'vue'
import Button from './Button.vue'

const emit = defineEmits(['close', 'agree', 'disagree'])

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
    default: 'Agree',
  },
  disagreeText: {
    type: String,
    default: 'Disagree',
  },
  showActions: {
    type: Boolean,
    default: true,
  },
  buttonText: {
    type: String,
    default: 'Open Modal',
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
  <v-dialog v-model="dialog" :max-width="maxWidth" class="main-modal">
    <template v-slot:activator="{ props: activatorProps }">
      <slot name="activator" v-bind="{ activatorProps }">
        <Button :buttonText="buttonText" v-bind="activatorProps" />
      </slot>
    </template>

    <v-card class="modal-card" :title="title" :prepend-icon="prependIcon">
      <v-card-text>
        <slot />
      </v-card-text>

      <v-card-actions class="modal-actions" v-if="showActions">
        <Button @click="handleDisagree" :button-text="disagreeText" class="disagree-btn" />
        <Button @click="handleAgree" :button-text="agreeText" />
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
</style>
