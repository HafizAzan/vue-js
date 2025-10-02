<script setup>
import useFlameAnimation from '@/hooks/useFlameAnimation'
import { computed, ref, toRefs, watchEffect } from 'vue'

const props = defineProps({
  isCandleOn: Boolean,
  element: [String, Number],
  arrayValues: Array,
  values: [String, Number],
  isTimerEnd: Boolean,
})

const emit = defineEmits(['update:values', 'update:isCandleOn'])
const { isCandleOn, element, arrayValues, values } = toRefs(props)

const candleRef = ref(isCandleOn.value)
const frequency = ref(element.value)
const assignSectionArray = ref(arrayValues.value)
const flame = ref(null)

watchEffect(() => {
  candleRef.value = isCandleOn.value
  frequency.value = element.value
  assignSectionArray.value = arrayValues.value
})

const startFlameAnimation = (value) => {
  values.value = value
  emit('update:values', value)

  console.log(value, 'val')

  if (!flame.value) return

  const safeValue = Math.max(0.4, Math.min(1.2, value))
  flame.value.style.filter = `brightness(${safeValue})`

  const maxHeight = 100
  const minHeight = 80
  const normalized = Math.max(0, Math.min(1, value))
  const computedHeight = minHeight + normalized * (maxHeight - minHeight)

  flame.value.style.height = `${computedHeight}px`

  const baseTop = -40
  const topOffset = maxHeight - computedHeight
  const dynamicTop = baseTop + topOffset

  flame.value.style.top = `${dynamicTop}px`
  flame.value.style.backgroundColor = `white`
}

const showFlame = computed(() => candleRef.value && !props.isTimerEnd)

useFlameAnimation({
  isCandleOn: showFlame.value,
  element: frequency,
  ArrayValues: assignSectionArray,
  startFlameAnimation: (val) => startFlameAnimation(val),
  flame: flame,
})
</script>

<template>
  <div class="bonfire">
    <div class="log log3"></div>
    <div class="flame" ref="flame" v-if="showFlame"></div>
  </div>
</template>

<style scoped>
.bonfire {
  position: relative;
  width: 200px;
  height: 300px;
  margin: auto;
}

/* Logs */
.log {
  position: absolute;
  width: 260px;
  height: 30px;
  background: radial-gradient(circle at 20px 50%, #c28b55, #6b3e26);
  border-radius: 50px;
  border: 3px solid #4a2b16;
  top: 60%;
  left: 50%;
  box-shadow: inset -6px 0px 0px rgba(0, 0, 0, 0.2);
  transform: translate(-50%, -50%) rotate(90deg);
}

.flame {
  position: absolute;
  top: -39px;
  width: 25px;
  height: 80px;
  background: white;
  border-radius: 50% 50% 25% 25%;
  transform: translate(50%, 50%);
  left: 37%;
  box-shadow:
    0 0px 0px 3px white,
    0 -20px 1px 4px white,
    0 -25px 2px 3px gold,
    0 -30px 5px 4px #ff6a00,
    0 0px 150px 0px #ff6a00,
    0 -10px 2px 4px white,
    0 -5px 3px 3px white;
  animation: sway 3s infinite ease-in-out;
  transition:
    height 0.5s ease-in-out,
    top 0.5s ease-in-out,
    filter 0.3s ease-in-out,
    background-color 0.3s ease-in-out;
  z-index: 2;
}
</style>
