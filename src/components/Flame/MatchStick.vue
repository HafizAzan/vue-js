<script setup>
import useFlameAnimation from '@/hooks/useFlameAnimation'
import { computed, ref, toRefs, watchEffect } from 'vue'
import MatchStick from '@/assets/Flame/5.png'

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
const top = ref(null)
const flame = ref(null)

watchEffect(() => {
  candleRef.value = isCandleOn.value
  frequency.value = element.value
  assignSectionArray.value = arrayValues.value
})

const startFlameAnimation = (value) => {
  values.value = value
  emit('update:values', value)

  if (!flame.value) return

  const safeValue = Math.max(0.4, Math.min(1.2, value))
  flame.value.style.filter = `brightness(${safeValue})`
  top.value.style.filter = `brightness(${safeValue})`

  const maxHeight = 60
  const minHeight = 40
  const normalized = Math.max(0, Math.min(1, value))
  const computedHeight = minHeight + normalized * (maxHeight - minHeight)

  flame.value.style.height = `${computedHeight}px`

  const baseTop = 60
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
  <div class="holder">
    <div class="flame-shadow" v-if="showFlame"></div>
    <div class="top" ref="top" v-if="showFlame"></div>
    <div class="flame" ref="flame" v-if="showFlame"></div>
    <img :src="MatchStick" alt="img" class="match-stick" />
  </div>
</template>

<style scoped>
.holder {
  margin: 0 auto;
  width: 20rem;
  height: 100%;
  position: relative;
  display: flex;
  align-items: end;
}

.flame {
  position: absolute;
  top: 60px;
  width: 20px;
  height: 40px;
  background: white;
  border-radius: 50% 50% 25% 25%;
  transform: translate(50%, 50%);
  left: 48%;
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

.top {
  position: absolute;
  top: 65px;
  width: 20px;
  height: 40px;
  background: white;
  border-radius: 50% 50% 25% 25%;
  transform: translate(50%, 50%);
  left: 45%;
  box-shadow:
    0 0px 0px 3px white,
    0 -20px 1px 4px white,
    0 -10px 2px 4px white,
    0 -5px 3px 3px white;

  transition:
    height 0.5s ease-in-out,
    top 0.5s ease-in-out,
    filter 0.3s ease-in-out,
    background-color 0.3s ease-in-out;
  z-index: 1;
}

.flame-shadow {
  position: absolute;
  top: 60px;
  width: 20px;
  height: 40px;
  left: 45%;
  transform: translate(50%, 50%);
  border-radius: 50% 50% 25% 25%;
  background: transparent;
  box-shadow:
    0 0 30px 15px rgba(255, 106, 0, 0.6),
    0 0 50px 25px rgba(255, 200, 50, 0.3);
  z-index: 0;
  transition:
    height 0.5s ease-in-out,
    top 0.5s ease-in-out,
    opacity 0.3s ease-in-out;
}

.match-stick {
  width: 100%;
  height: 425px;
}

.flame.visible {
  opacity: 1;
}

@keyframes sway {
  0% {
    transform: skewX(2deg) skewY(5deg);
  }

  25% {
    transform: skewX(-1deg) skewY(3deg);
  }

  50% {
    transform: skewX(1.5deg) skewY(-1deg);
  }

  75% {
    transform: skewX(-2deg) skewY(1deg);
  }

  100% {
    transform: skewX(2deg) skewY(5deg);
  }
}
</style>
