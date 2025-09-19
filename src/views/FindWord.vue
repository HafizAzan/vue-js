<script setup>
import { computed, ref, watchEffect } from 'vue'
import { useMutation, useQuery } from '@tanstack/vue-query'

// API-service
import { fetchAllMcqs, fetchSessionWord, fetchTime } from '@/utils/api-service'
import { addPlayUser } from '../utils/api-service'

// constant
import { formatTime, useTimer } from '@/utils/constant'

// pinia store
import { usePlayStore } from '@/store/usePlayStore'
import { useUserStore } from '@/store/useUserStore'

// components
import Loader from '@/components/Loader.vue'
import Button from '@/components/Button.vue'
import Modal from '@/components/Modal.vue'

// stores
const {
  setTime,
  clearTimeForUser,
  setSessionTime,
  clearSessionTimeForUser,
  getTimeForUser,
  getSessionTimeForUser,
  playCard,
  getPlayData,
  incrementLevel,
  incrementSession,
  incrementPlayedSession,
} = usePlayStore()

const playStore = usePlayStore()
const { token } = useUserStore()

// states
const animationActive = ref(true)
const openModal = ref(false)

// API CALLS
const { data: getTime, isLoading: isTimeloading } = useQuery({
  queryKey: ['get-time'],
  queryFn: fetchTime,
})

const {
  data: getSessionWord,
  isLoading: isHiddenWordLoading,
  refetch: refetchHiddenWord,
} = useQuery({
  queryKey: ['get-session-word'],
  queryFn: fetchSessionWord,
  onSuccess(response) {
    if (response.status === 200 && ['Modified', 'OK'].includes(response.statusText)) {
      refetchHiddenWord()
    }
  },
})

const { data: getSessionMcq, isLoading: isMcqLoading } = useQuery({
  queryKey: ['get-session-mcq'],
  queryFn: fetchAllMcqs,
})

// Add Api
const { mutateAsync: addPlayData, isPending: isPlayAddingLoader } = useMutation({
  mutationKey: ['add-play-data'],
  mutationFn: (payload) => addPlayUser(payload),
})

// TIMERS
const timerSeconds = useTimer(
  () => getTime?.value?.time?.overAllTime,
  getTimeForUser,
  setTime,
  clearTimeForUser,
  null,
  true,
  false,
)

const isEnd = computed(() => timerSeconds.value <= 0)

const timerSessionSeconds = useTimer(
  () => getSessionWord?.value?.cycleTime,
  getSessionTimeForUser,
  setSessionTime,
  clearSessionTimeForUser,
  null,
  false,
  isEnd,
)

// Automaticly Change state when data change
const getHiddenWord = computed(() => ({
  options: getSessionWord?.value?.options,
  question: getSessionMcq?.value?.data?.[0]?.question,
  cycleTime: getSessionWord?.value?.cycleTime,
}))

const totalCount = computed(() => getTime?.value?.time?.overAllTime ?? 0)
const animationTime = computed(() => getTime?.value?.time?.animationTime ?? 30)
const animationStopTime = computed(() => getTime?.value?.time?.animationStopTime ?? 30)
const getAllTimeData = computed(() => ({
  overAllTime: formatTime(timerSeconds.value),
  animationStopTime: animationStopTime.value,
  animationStartTime: animationTime.value,
  cycleTime: timerSessionSeconds.value,
}))

// question show logic
watchEffect(() => {
  if (!animationTime.value || !animationStopTime.value) return

  const onDuration = animationTime.value * 1000
  const offDuration = animationStopTime.value * 1000
  const cycleDuration = onDuration + offDuration
  const totalCountMs = totalCount.value * 60
  const elapsedTimeMs = timerSeconds.value
  const timePassed = (totalCountMs - elapsedTimeMs) * 1000
  const timeInCycle = timePassed % cycleDuration

  animationActive.value = timeInCycle < onDuration
})

// functions
const handleCheckBox = (single) => {
  if (playStore.selectedOpt === single) {
    playStore?.setSelectedOpt(null)
  } else {
    playStore?.setSelectedOpt(single)
  }
}

const handleSubmit = (e) => {
  e.preventDefault()
  const playCard = getPlayData(1, 1)

  const sessionObject = {
    session: playCard?.session,
    answer: playStore?.selectedOpt,
    //  isCorrect,
    //  score: points,
    //  time: timeTakenBaseOnDuration,
  }

  const body = {
    userId: token?._id,
    level: playCard?.level,
    // section,
    // score: updatedPoints,
    // completeTime: updatedTime,
    sessions: [sessionObject],
  }

  incrementPlayedSession()
  openModal.value = true
}

watchEffect(() => {
  if (timerSessionSeconds.value === 1) {
    refetchHiddenWord()
    incrementSession()
    playStore?.setSelectedOpt(null)
    openModal.value = false
  }
})
</script>

<template>
  <main class="container">
    <div v-if="isTimeloading || isHiddenWordLoading || isMcqLoading">
      <Loader />
    </div>

    <div v-else class="find-word">
      <v-typography variants="h3" class="text-h3 h3">{{ getAllTimeData.overAllTime }}</v-typography>

      <div v-if="!animationActive" class="find-word">
        <v-typography variants="h2" class="text-h2 h2">{{
          getHiddenWord?.question ?? 'Find The Hidden Word?'
        }}</v-typography>
        <v-typography variants="h6" class="text-subtitle-1 P">Level 01 of 07</v-typography>
        <v-form fast-fail @submit.prevent="handleSubmit" class="find-word-opt">
          <div v-for="(single, index) in getHiddenWord?.options" :key="single._id || index">
            <v-checkbox
              class="check-box-label"
              :label="single"
              :model-value="playStore.selectedOpt === single"
              @update:model-value="handleCheckBox(single)"
            ></v-checkbox>
          </div>

          <Button type="submit" buttonText="Submit" append-icon="mdi-arrow-right" />
        </v-form>
      </div>
      <div v-else>
        <h1>candle aaye gi</h1>
      </div>

      <Modal
        v-model="openModal"
        @agree="() => gamePlay('leave')"
        @disagree="console.log('Disagreed!')"
        max-width="450"
        :close-on-outside-click="false"
      >
        <template #prependIcon>
          <span class="my-loader"></span>
        </template>

        <template #title>
          <p class="modal-main-title">Wow! That's Great</p>
        </template>

        <p class="modal-main-text text-gray-700 text-center">
          Next Intension Session Start in {{ timerSessionSeconds }} sec
        </p>
      </Modal>
    </div>
  </main>
</template>

<style scoped>
.find-word {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.find-word-opt {
  display: flex;
  flex-wrap: wrap;
  column-gap: 50px;
  color: white;
  font-size: 20px;
  max-width: 30%;
}

.find-word-opt > div {
  flex: 0 0 calc(50% - 25px);
  box-sizing: border-box;
}

.check-box-label {
  text-transform: capitalize;
}

.modal-main-text {
  font-size: 20px !important;
}

.modal-main-title {
  font-size: 26px !important;
  font-weight: 800;
}
</style>
