import { ref, watch, onUnmounted } from 'vue'

export const headers = [
  {
    align: 'start',
    key: 'rank',
    sortable: false,
    title: 'Rank',
  },
  { key: 'userId', sortable: false, title: 'User Id' },
  { key: 'userName', sortable: false, title: 'Username' },
  { key: 'levelsCompleted', align: 'start', sortable: false, title: 'Levels' },
  { key: 'totalScore', align: 'end', sortable: false, title: 'Score' },
]

export const formatTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function useTimer(initialTimeFn, getSavedTimeFn, setFn, clearFn, onTick, isMinutes = false) {
  const timeLeft = ref(0)
  const intervalId = ref(null)

  watch(
    initialTimeFn,
    (newVal) => {
      if (!newVal) return

      const savedTime = getSavedTimeFn()
      timeLeft.value = savedTime !== null ? savedTime : isMinutes ? newVal * 60 : newVal
      setFn(timeLeft.value)

      if (intervalId.value) clearInterval(intervalId.value)

      intervalId.value = setInterval(() => {
        if (timeLeft.value > 0) {
          timeLeft.value--
          setFn(timeLeft.value)
          if (onTick) onTick(timeLeft.value)
        } else {
          clearInterval(intervalId.value)
          clearFn()
        }
      }, 1000)
    },
    { immediate: true },
  )

  onUnmounted(() => {
    if (intervalId.value) clearInterval(intervalId.value)
  })

  return timeLeft
}
