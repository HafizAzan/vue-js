<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: String,
  config: Object,
})

const emit = defineEmits(['update:modelValue'])

const editorRef = ref(null)
let joditInstance = null

onMounted(async () => {
  const module = await import('jodit')
  const Jodit = module.Jodit

  joditInstance = new Jodit(editorRef.value, {
    height: 400,
    width: '100%',
    color: 'black',
    ...props.config,
    style: {
      color: 'black',
    },
  })

  joditInstance.value = props.modelValue

  joditInstance.events.on('change', () => {
    emit('update:modelValue', joditInstance.value)
  })
})

onBeforeUnmount(() => {
  if (joditInstance) joditInstance.destruct()
})
</script>

<template>
  <div ref="editorRef" :style="{ color: 'black' }"></div>
</template>

<style scoped></style>
