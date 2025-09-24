import { ref, watch, onBeforeUnmount, watchEffect } from 'vue'

const useFlameAnimation = ({
  isCandleOn, // ye ref hai jo Candle.vue se aayega
  element,
  startFlameAnimation = () => {},
  ArrayValues = [],
}) => {
  const index = ref(0)
  const flame = ref(null)
  const updateTimer = ref(null)

  // ✅ yaha direct reactive ref use karo
  const flameOn = ref(false)

  // ✅ watchEffect use karo taake jab bhi isCandleOn change ho, flameOn update ho jaye
  watchEffect(() => {
    flameOn.value = isCandleOn.value
    console.log('🔥 useFlameAnimation watchEffect →', flameOn.value)
  })

  const applyFlameState = (value) => {
    if (!flameOn.value) {
      clearTimeout(updateTimer.value)
      return
    }
    startFlameAnimation(value)
  }

  const updateFlameState = () => {
    if (ArrayValues.length === 0) return

    if (index.value >= ArrayValues.length) {
      clearTimeout(updateTimer.value)
      return
    }

    const start = index.value
    const end = Math.min(start + element.value, ArrayValues.length) // element bhi ref hai

    const slice = ArrayValues.slice(start, end)
    index.value = end

    if (slice.length === 0) {
      clearTimeout(updateTimer.value)
      return
    }

    const avg = slice.reduce((a, b) => a + b, 0) / slice.length
    applyFlameState(avg)

    updateTimer.value = setTimeout(updateFlameState, 1000)
  }

  // ✅ watch karo flameOn ko
  watch(
    flameOn,
    (newVal) => {
      const flameEl = flame.value
      if (!flameEl) return

      console.log('🔥 useFlameAnimation → candleOn changed:', newVal)

      if (newVal) {
        updateFlameState()
        flameEl.style.visibility = 'visible'
        flameEl.style.opacity = 1
        flameEl.classList.add('visible')
        flameEl.classList.remove('hidden')
      } else {
        clearTimeout(updateTimer.value)
        flameEl.style.transition = 'all ease-in 300ms'
        flameEl.style.opacity = 0
        flameEl.style.transform = 'scale(0.5)'
        flameEl.classList.add('hidden')
        flameEl.style.visibility = 'hidden'
      }
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    clearTimeout(updateTimer.value)
  })

  return {
    flame,
  }
}

export default useFlameAnimation
