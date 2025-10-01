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
  emit('update:isCandleOn', candleRef.value)
})

const startFlameAnimation = (value) => {
  values.value = value
  emit('update:values', value)

  if (!flame.value) return

  const safeValue = Math.max(0.4, Math.min(1.2, value))
  flame.value.style.filter = `brightness(${safeValue})`
}

const showFlame = computed(() => candleRef.value && !props.isTimerEnd)

useFlameAnimation({
  isCandleOn: showFlame.value,
  element: frequency,
  ArrayValues: assignSectionArray,
  startFlameAnimation: (val) => startFlameAnimation(val, flame),
  flame: flame,
})
</script>

<template>
  <div class="holder">
    <div class="diya">
      <div class="bowl"></div>
      <div class="thread2"></div>
      <div class="flame" ref="flame" v-if="showFlame"></div>
    </div>
  </div>
</template>

<style scoped>
.holder {
  margin: 0 auto;
  width: 20rem;
  height: 300px;
  position: relative;
}

.diya {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20rem;
  height: 8rem;
}

.bowl {
  margin: auto;
  width: 20rem;
  height: 8rem;
  background: linear-gradient(#e48825, #e78e0e, #833c03, #4c1a03 50%, #1c0900);
  border-radius: 0.2rem 0.2rem 7rem 7rem;
  border-bottom: 0.3rem solid #1c0900;
  position: relative;
}
.bowl:after {
  content: '';
  background: #f11e28;
  position: absolute;
  width: 100%;
  height: 0.3rem;
  top: 0.2rem;
  left: 0;
  border-radius: 50%;
}

.thread2 {
  position: absolute;
  width: 6px;
  height: 36px;
  top: -36px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 40% 40% 0 0;
  background: linear-gradient(#d6994a, #4b232c, #121212, black, #e8bb31 90%);
}

.flame {
  width: 30px;
  height: 50px;
  position: absolute;
  top: -60px;
  left: 45%;
  transform: translateX(-50%) skewX(2deg);
  border-radius: 50% 50% 40% 40%;
  background: radial-gradient(
    ellipse at center,
    #fffbd5 0%,
    #ffb347 40%,
    #ff7f00 60%,
    transparent 90%
  );
  opacity: 1;
  box-shadow:
    0 0 10px 4px rgba(255, 200, 0, 0.6),
    0 -10px 20px 6px rgba(255, 165, 0, 0.5),
    0 0 30px 10px rgba(255, 140, 0, 0.3),
    0 0 60px 20px rgba(255, 214, 0, 0.3);

  transition:
    transform 0.5s ease,
    opacity 0.5s ease;
  animation: sway 3s infinite ease-in-out;
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
