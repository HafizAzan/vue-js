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
const top = ref(null)
const shadow = ref(null)
const flame = ref(null)

watchEffect(() => {
  candleRef.value = isCandleOn.value
  frequency.value = element.value
  assignSectionArray.value = arrayValues.value
})

const startFlameAnimation = (value) => {
  values.value = value
  emit('update:values', value)

  // console.log(value, 'candle')
  // console.log(flame.value, 'flame')

  if (!flame.value) return

  const safeValue = Math.max(0.4, Math.min(1.2, value))
  flame.value.style.filter = `brightness(${safeValue})`
  top.value.style.filter = `brightness(${safeValue})`
  shadow.value.style.opacity = Math.max(0.5, safeValue)

  const maxHeight = 80
  const minHeight = 60
  const normalized = Math.max(0, Math.min(1, value))
  const computedHeight = minHeight + normalized * (maxHeight - minHeight)

  flame.value.style.height = `${computedHeight}px`
  shadow.value.style.height = `${computedHeight}px`

  const baseTop = -110
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
  startFlameAnimation: (val) => startFlameAnimation(val, flame),
  flame: flame,
})
</script>

<template>
  <div class="candle-container">
    <div class="candle">
      <div class="flame-shadow" ref="shadow" v-if="showFlame"></div>
      <div class="top" ref="top" v-if="showFlame"></div>
      <div class="flame" ref="flame" v-if="showFlame"></div>
      <div class="wick"></div>
      <div class="flame-bottom"></div>
    </div>
  </div>
</template>

<style scoped>
.candle-container {
  width: 60px;
  height: 66vh;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  border-radius: 10px;
  padding: 5px;
}

.candle {
  width: 100%;
  height: 90%;
  background: linear-gradient(to top, #ffde8d 0%, #ffe9a3 30%, #fff4cc 100%);
  border-radius: 10px;
  position: relative;
  box-shadow:
    inset 0 -5px 8px rgba(0, 0, 0, 0.3),
    inset 0 5px 8px rgba(255, 255, 255, 0.4),
    0 4px 8px rgba(0, 0, 0, 0.3);
  transition: all ease 5s;
}

/* Wax drips effect */
.candle::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    to bottom,
    rgba(255, 220, 140, 0.6) 0px,
    rgba(255, 220, 140, 0.6) 8px,
    transparent 8px,
    transparent 16px
  );
  mask-image: radial-gradient(circle, black 60%, transparent 100%);
  mask-repeat: no-repeat;
  mask-size: cover;
  opacity: 0.3;
  pointer-events: none;
}

.flame {
  position: absolute;
  top: -110px;
  width: 20px;
  height: 80px;
  background: white;
  border-radius: 50% 50% 25% 25%;
  transform: translate(50%, 50%);
  left: 28%;
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
  top: -128px;
  width: 20px;
  height: 80px;
  background: white;
  border-radius: 50% 50% 25% 25%;
  transform: translate(50%, 50%);
  left: 9%;
  box-shadow:
    0 0px 0px 3px white,
    0 -20px 1px 4px white,
    0 -10px 2px 4px white,
    0 -5px 3px 3px white;

  /* Smoothly animate height and top */
  transition:
    height 0.5s ease-in-out,
    top 0.5s ease-in-out,
    filter 0.3s ease-in-out,
    background-color 0.3s ease-in-out;
  z-index: 1;
}

/* Wick (black thread inside flame) */
.wick {
  position: absolute;
  top: -25px; /* adjust according to flame size */
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 25px;
  background: linear-gradient(to bottom, #3a3a3a, #000);
  border-radius: 2px;
  z-index: 0;
}

.flame-shadow {
  position: absolute;
  top: -120px;
  width: 20px;
  height: 80px;
  left: 9%;
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

.flame-bottom {
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 92%;
  height: 20px;
  background: radial-gradient(circle at 50% 20%, #fff9d6 40%, #ffe39b 100%);
  border-radius: 50% / 60%;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 -2px 4px rgba(255, 180, 50, 0.4);
  z-index: 2;
}

/* Wax drips below top */
/* .flame-bottom::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 20%;
  width: 12px;
  height: 15px;
  background: #ffe39b;
  border-radius: 50% 50% 50% 50%;
  box-shadow:
    20px 0px 0 0 #ffe39b,
    40px 5px 0 -3px #ffe39b;
} */

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
