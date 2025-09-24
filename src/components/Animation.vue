<script setup>
import { ref, toRefs, watch, watchEffect } from 'vue'
import Candle from './Flame/Candle.vue'

const props = defineProps({
  level: [String, Number],
  element: [String, Number],
  isCandleOn: Boolean,
  arrayValues: Array,
  values: [String, Number],
})

const { isCandleOn } = toRefs(props)
const candleOn = ref(isCandleOn.value)

watchEffect(() => {
  candleOn.value = isCandleOn.value
  console.log(isCandleOn.value, 'cande')
})
</script>

<template>
  <Candle
    v-if="props.level >= 1 && props.level <= 4"
    :element="props.element"
    :is-candle-on="candleOn"
    :array-values="props.arrayValues"
    :values="props.values"
    v-model="props.isCandleOn"
  />
</template>
