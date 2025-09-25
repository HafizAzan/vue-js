<script setup>
import { ref, toRefs, watch } from 'vue'
import Candle from './Flame/Candle.vue'

const props = defineProps({
  level: [String, Number],
  element: [String, Number],
  isCandleOn: Boolean,
  isEnd: Boolean,
  arrayValues: Array,
  saveValue: [String, Number],
})

const emit = defineEmits(['update:saveValue', 'update:isCandleOn'])

const { isCandleOn, saveValue } = toRefs(props)

const candleOn = ref(isCandleOn.value)
const candleValue = ref(saveValue.value)

watch(isCandleOn, (newVal) => (candleOn.value = newVal))
watch(saveValue, (newVal) => (candleValue.value = newVal))

watch(candleValue, (newVal) => {
  emit('update:saveValue', newVal)
})
</script>

<template>
  <Candle
    v-if="props.level >= 1 && props.level <= 7"
    :element="props.element"
    :array-values="props.arrayValues"
    :is-timer-end="props.isEnd"
    v-model:values="candleValue"
    v-model:is-candle-on="candleOn"
  />
</template>
