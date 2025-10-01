<script setup>
import { computed, ref, toRefs, watch } from 'vue'
import Candle from './Flame/Candle.vue'
import FireAudio from './FireAudio.vue'
import Diya from './Flame/Diya.vue'
import Mashaal from './Flame/Mashaal.vue'
import Bunsen from './Flame/Bunsen.vue'
import MatchStick from './Flame/MatchStick.vue'

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
</script>

<template>
  <Candle
    v-if="getLevel === 1"
    :element="props.element"
    :array-values="props.arrayValues"
    :is-timer-end="props.isEnd"
    v-model:values="candleValue"
    v-model:is-candle-on="candleOn"
  />

  <Diya
    v-if="getLevel === 2"
    :element="props.element"
    :array-values="props.arrayValues"
    :is-timer-end="props.isEnd"
    v-model:values="candleValue"
    v-model:is-candle-on="candleOn"
  />

  <Mashaal
    v-if="getLevel === 3"
    :element="props.element"
    :array-values="props.arrayValues"
    :is-timer-end="props.isEnd"
    v-model:values="candleValue"
    v-model:is-candle-on="candleOn"
  />

  <Bunsen
    v-if="getLevel === 4"
    :element="props.element"
    :array-values="props.arrayValues"
    :is-timer-end="props.isEnd"
    v-model:values="candleValue"
    v-model:is-candle-on="candleOn"
  />

  <MatchStick
    v-if="getLevel === 5"
    :element="props.element"
    :array-values="props.arrayValues"
    :is-timer-end="props.isEnd"
    v-model:values="candleValue"
    v-model:is-candle-on="candleOn"
  />

  <Bunsen
    v-if="getLevel === 6"
    :element="props.element"
    :array-values="props.arrayValues"
    :is-timer-end="props.isEnd"
    v-model:values="candleValue"
    v-model:is-candle-on="candleOn"
  />

  <Mashaal
    v-if="getLevel === 7"
    :element="props.element"
    :array-values="props.arrayValues"
    :is-timer-end="props.isEnd"
    v-model:values="candleValue"
    v-model:is-candle-on="candleOn"
  />

  <FireAudio :candle-on="candleOn" :stop-console="props.isEnd" :is-fading="saveValue" />
</template>
