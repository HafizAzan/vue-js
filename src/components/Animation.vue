<script setup>
import { computed, ref, toRefs, watch } from 'vue'
import Candle from './Flame/Candle.vue'
import FireAudio from './FireAudio.vue'
import Diya from './Flame/Diya.vue'

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
const getLevel = computed(() => Number(props.level))

watch(isCandleOn, (newVal) => (candleOn.value = newVal))
watch(saveValue, (newVal) => (candleValue.value = newVal))

watch(candleValue, (newVal) => {
  emit('update:saveValue', newVal)
})

console.log(getLevel, 'getLevel')
</script>

<template>
  <Candle
    v-if="getLevel === 2"
    :element="props.element"
    :array-values="props.arrayValues"
    :is-timer-end="props.isEnd"
    v-model:values="candleValue"
    v-model:is-candle-on="candleOn"
  />

  <Diya
    v-if="getLevel === 1"
    :element="props.element"
    :array-values="props.arrayValues"
    :is-timer-end="props.isEnd"
    v-model:values="candleValue"
    v-model:is-candle-on="candleOn"
  />

  <FireAudio :candle-on="candleOn" :stop-console="props.isEnd" :is-fading="saveValue" />
</template>
