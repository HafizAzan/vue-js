import { ref, watch, onUnmounted, unref } from 'vue'

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

export const userListHeaders = [
  {
    align: 'start',
    key: '_id',
    sortable: false,
    title: 'User Id',
  },
  { key: 'userName', sortable: false, title: 'Username' },
  { key: 'createdAt', align: 'start', sortable: false, title: 'Joining Date' },
  { key: 'actions', align: 'end', sortable: false, title: 'Action' },
]

export const formatTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function useTimer(
  initialTimeFn,
  getSavedTimeFn,
  setFn,
  clearFn,
  onTick,
  isMinutes = false,
  endTimeRef = null,
  pausedRef = null,
) {
  const timeLeft = ref(0)
  const intervalId = ref(null)

  const startTimer = () => {
    if (intervalId.value) clearInterval(intervalId.value)
    if (pausedRef && unref(pausedRef)) return

    intervalId.value = setInterval(() => {
      if (pausedRef && unref(pausedRef)) return

      if (unref(endTimeRef)) {
        clearInterval(intervalId.value)
        timeLeft.value = 0
        setFn(timeLeft.value)
        clearFn()
        return
      }

      if (timeLeft.value > 1) {
        timeLeft.value--
        setFn(timeLeft.value)
        onTick?.(timeLeft.value)
      } else {
        clearInterval(intervalId.value)

        if (isMinutes) {
          timeLeft.value = 0
          setFn(timeLeft.value)
          clearFn()
        } else {
          const restartVal = initialTimeFn()
          timeLeft.value = restartVal
          setFn(timeLeft.value)
          onTick?.(timeLeft.value)
          startTimer()
        }
      }
    }, 1000)
  }

  watch(
    initialTimeFn,
    (newVal) => {
      if (!newVal) return
      const savedTime = getSavedTimeFn()
      timeLeft.value = savedTime !== null ? savedTime : isMinutes ? newVal * 60 : newVal
      setFn(timeLeft.value)
      startTimer()
    },
    { immediate: true },
  )

  if (pausedRef) {
    watch(
      pausedRef,
      (isPaused) => {
        if (isPaused) {
          if (intervalId.value) clearInterval(intervalId.value)
        } else {
          startTimer()
        }
      },
      { immediate: true },
    )
  }

  onUnmounted(() => {
    if (intervalId.value) clearInterval(intervalId.value)
  })

  return timeLeft
}

export const calculateFlame = (
  arrayValues,
  frequency,
  flameOn,
  flameOff,
  elapsedTime,
  totalDuration,
) => {
  const controlData = arrayValues

  const flameOnLength = Math.floor(frequency * flameOn)
  const flameOffLength = Math.floor(frequency * flameOff)
  const totalWindow = flameOnLength + flameOffLength

  const sessionLength = flameOn + flameOff

  const timePassed = totalDuration - elapsedTime
  const currentSessionIndex = Math.floor(timePassed / sessionLength)

  const startIndex = currentSessionIndex * totalWindow
  const endIndex = startIndex + totalWindow

  const flameOnSlice = controlData.slice(startIndex, startIndex + flameOnLength)
  const flameOffSlice = controlData.slice(startIndex + flameOnLength, endIndex)

  const sum = (arr) => arr.reduce((acc, val) => acc + Number(val || 0), 0)

  const flameOnSum = sum(flameOnSlice)
  const flameOffSum = sum(flameOffSlice)
  const result = flameOnSum - flameOffSum

  return {
    points: result,
  }
}

export function formatDateTimeUTC(isoString) {
  if (!isoString) return ''

  const date = new Date(isoString)

  const day = date.getUTCDate()
  const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
  const year = date.getUTCFullYear()

  let hours = date.getUTCHours()
  const minutes = date.getUTCMinutes().toString().padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'

  hours = hours % 12 || 12

  return `${day}-${month}-${year}: ${hours}:${minutes}${ampm}`
}
