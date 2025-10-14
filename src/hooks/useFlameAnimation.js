import { usePlayStore } from '@/store/usePlayStore'
import { ref, watch, onBeforeUnmount, watchEffect, onMounted, nextTick } from 'vue'

const useFlameAnimation = ({
  isCandleOn,
  element,
  startFlameAnimation = () => {},
  ArrayValues = [],
  flame,
}) => {
  const playStore = usePlayStore()
  const index = ref(playStore.getStartIndex())
  const updateTimer = ref(null)
  const flameOn = ref(false)

  watchEffect(() => {
    flameOn.value = isCandleOn.value
  })

  const applyFlameState = (value) => {
    startFlameAnimation(value)
    if (!flameOn.value) {
      clearTimeout(updateTimer.value)
      return
    }
  }

  const updateFlameState = () => {
    if (ArrayValues.value.length === 0) return

    if (index.value >= ArrayValues.value.length) {
      clearTimeout(updateTimer.value)
      return
    }

    const start = index.value
    playStore.setStartIndex(start)

    const end = Math.min(start + element.value, ArrayValues.value.length)
    const slice = ArrayValues.value.slice(start, end)
    index.value = end

    if (slice.length === 0) {
      clearTimeout(updateTimer.value)
      return
    }

    const avg = slice.reduce((a, b) => a + b, 0) / slice.length
    applyFlameState(avg)
    updateTimer.value = setTimeout(updateFlameState, 1000)
  }

  onMounted(() => {
    watch(
      [flameOn, flame],
      async ([newVal, fire]) => {
        await nextTick()
        const flameEl = fire
        if (!flameEl) return

        updateFlameState()
      },
      { immediate: true },
    )
  })

  onBeforeUnmount(() => {
    clearTimeout(updateTimer.value)
  })
}

export default useFlameAnimation
