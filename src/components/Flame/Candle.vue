<script setup>
import useFlameAnimation from '@/hooks/useFlameAnimation'
import { computed, ref, toRefs, watch, watchEffect } from 'vue'

const props = defineProps({
  isCandleOn: Boolean,
  element: [String, Number],
  arrayValues: Array,
  values: [String, Number],
})

const emit = defineEmits(['update:values'])

const { isCandleOn, element, arrayValues, values } = toRefs(props)

const candleRef = ref(isCandleOn.value)

watchEffect(() => {
  candleRef.value = isCandleOn.value
})

const startFlameAnimation = (val) => {
  emit('update:values', val)
  console.log('🔥 Candle Flame Value:', val)
}

const { flame } = useFlameAnimation({
  isCandleOn: candleRef,
  element,
  ArrayValues: arrayValues,
  startFlameAnimation,
})
</script>

<template>
  <div class="candle-container">
    <div class="candle">
      <div class="flame" ref="flame"></div>
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
  background: linear-gradient(to top, #fffde4, #fff59d, #fff176);
  border-radius: 5px;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.3);
  transition: height 0.8s ease-out;
  z-index: 1;
  position: relative;
}

.flame {
  position: absolute;
  top: -123px;
  width: 20px;
  height: 80px;
  background: white;
  border-radius: 50% 50% 25% 25%;
  transform: translate(50%, 50%);
  left: 9%;
  box-shadow:
    0 0px 0px 3px white,
    0 -20px 1px 4px white,
    0 -25px 2px 3px gold,
    0 -30px 5px 4px #ff6a00,
    0 0px 150px 0px #ff6a00,
    0 -10px 2px 4px white,
    0 -5px 3px 3px white;
}

.hidden {
  display: none;
}

.visible {
  display: block;
}

@keyframes sway {
  0% {
    transform: skewX(2deg) skewY(5deg) rotate(-1deg);
  }

  25% {
    transform: skewX(-1deg) skewY(3deg) rotate(1deg);
  }

  50% {
    transform: skewX(1.5deg) skewY(-1deg) rotate(-0.5deg);
  }

  75% {
    transform: skewX(-2deg) skewY(1deg) rotate(0.5deg);
  }

  100% {
    transform: skewX(2deg) skewY(5deg) rotate(-1deg);
  }
}

@keyframes flicker {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.95;
  }
}

@keyframes flame-grow {
  50% {
    box-shadow:
      0 0px 0px 3px white,
      0 -38px 1px 2px white,
      0 -41px 2px 3px gold,
      0 -50px 5px 4px var(--orange),
      0 0px 150px 10px var(--orange),
      0 -10px 2px 4px white,
      0 -5px 3px 3px white;
  }
}

@keyframes blink {
  50% {
    opacity: 0.95;
  }
}
</style>
