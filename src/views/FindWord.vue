<script setup>
import { useRouter } from 'vue-router'
import { computed, onBeforeUnmount, onMounted, ref, watchEffect } from 'vue'
import { useMutation, useQuery } from '@tanstack/vue-query'

// API-service
import {
  fetchAllMcqs,
  fetchAllValues,
  fetchSessionWord,
  fetchTime,
  fetchUserById,
} from '@/utils/api-service'
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
import { ROUTES } from '@/router'

const { token } = useUserStore()
const playStore = usePlayStore()
const router = useRouter()

// states
const animationActive = ref(true)

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

const { data: allValues, isLoading: isValueLoading } = useQuery({
  queryKey: ['get-values'],
  queryFn: fetchAllValues,
})

const { data: getSingleUser, isLoading: isSingleUserLoading } = useQuery({
  queryKey: ['get-single-user'],
  queryFn: () => fetchUserById(token?._id),
  enabled: !!token?._id,
})

// Add Api
const { mutateAsync: addPlayData, isPending: isPlayAddingLoader } = useMutation({
  mutationKey: ['add-play-data'],
  mutationFn: (payload) => addPlayUser(payload),
})

// TIMERS
const timerSeconds = useTimer(
  () => getTime?.value?.time?.overAllTime,
  playStore.getCurrentTime,
  playStore.setCurrentTime,
  playStore.clearCurrentTime,
  null,
  true,
  false,
)

const isEnd = computed(() => timerSeconds.value <= 0)

const timerSessionSeconds = useTimer(
  () => getSessionWord?.value?.cycleTime,
  playStore.getSessionTime,
  playStore.setSessionTime,
  playStore.clearSessionTime,
  null,
  false,
  isEnd,
)

const userItems = computed(() => getSingleUser.value?.user?.items ?? [])
const userSection = computed(() => getSingleUser.value?.user?.section ?? null)
const AllValues = computed(() => allValues?.value?.data?.A ?? null)

const getHiddenWord = computed(() => ({
  options: getSessionWord?.value?.options,
  hiddenWord: getSessionWord?.value?.hiddenWord,
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
  cycleTimeValue: timerSessionSeconds.value,
}))

const totalSession = computed(() => {
  if (!totalCount.value || !getHiddenWord.value?.cycleTime) return null
  return Math.ceil((totalCount.value * 60) / getHiddenWord.value.cycleTime)
})

const expectedLastSession = computed(() => {
  if (!totalSession.value) return false
  return playStore.getSession() === totalSession.value
})

watchEffect(() => {
  if (isSingleUserLoading.value || !userItems.value.length) return

  const parsedItems = userItems.value.map((item) => parseFloat(item))
  console.log('parsedItems:', parsedItems)

  if (userSection.value) {
    playStore.setSection(userSection.value)
  } else {
    playStore.clearSection()
  }
})

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

watchEffect(() => {})

const sessionModal = computed({
  get: () => playStore.getSessionModal(),
  set: (val) => playStore.setSessionModal(val),
})

const lastModal = computed({
  get: () => playStore.getLastModal(),
  set: (val) => playStore.setLastModal(val),
})

const handleCheckBox = (single) => {
  if (playStore.getSelectedOpt() === single) {
    playStore.setSelectedOpt(null)
  } else {
    playStore.setSelectedOpt(single)
  }
}

const leaveHandle = () => {
  router.push(ROUTES.LEADERBOARD)
  playStore.clearSessionModal()
  playStore.clearCompleteTime()
  playStore.clearSessionTime()
  playStore.clearCurrentTime()
  playStore.clearSelectedOpt()
  playStore.clearLastModal()
  playStore.setSession(1)
  playStore.setPlayedSession(0)
  lastModal.value = false
  sessionModal.value = false
}

const handleSubmit = (e) => {
  e.preventDefault()
  const isCorrect = playStore.getSelectedOpt() === getHiddenWord?.value?.hiddenWord

  const cycleDuration = getHiddenWord?.value?.cycleTime * 1000
  const totalCountMs = totalCount.value * 60
  const elapsedTimeMs = timerSeconds.value
  const timePassed = (totalCountMs - elapsedTimeMs) * 1000
  const timeInCycle = timePassed % cycleDuration

  const timeTakenBaseOnDuration =
    timeInCycle <= cycleDuration ? Math.floor(timeInCycle / 1000) : getHiddenWord?.value?.cycleTime

  const previousCompleteTime = playStore.getCompleteTime?.() ?? 0
  const updatedCompleteTime = previousCompleteTime + timeTakenBaseOnDuration
  playStore.setCompleteTime(updatedCompleteTime)

  const sessionObject = {
    session: playStore.getSession(),
    answer: playStore.getSelectedOpt(),
    isCorrect,
    score: 10,
    time: timeTakenBaseOnDuration,
  }

  const body = {
    userId: token?._id,
    level: playStore.getLevel(),
    section: 9000,
    score: 20,
    completeTime: updatedCompleteTime,
    sessions: [sessionObject],
  }

  console.log(body, 'body')
  playStore.incrementPlayedSession()
  playStore.setSelectedOpt(null)
  sessionModal.value = true
}

watchEffect(() => {
  if (timerSessionSeconds.value === 1) {
    if (!expectedLastSession.value) {
      refetchHiddenWord()
      playStore.incrementSession()
      playStore.clearSessionModal()
      sessionModal.value = false
    }
  }
})

watchEffect(() => {
  if (timerSeconds.value === 0 && expectedLastSession.value) {
    sessionModal.value = false
    lastModal.value = true
  }
})

onMounted(() => {
  window.onpopstate = () => {
    router.push(ROUTES.LEADERBOARD)
  }
})

onBeforeUnmount(() => {
  window.onpopstate = null
})
</script>

<template>
  <main class="container">
    <div v-if="isTimeloading || isHiddenWordLoading || isMcqLoading">
      <Loader />
    </div>

    <div v-else class="find-word">
      <v-typography variants="h3" class="text-h3 h3">
        {{ getAllTimeData.overAllTime }}
      </v-typography>

      <v-typography variants="h2" class="text-h2 h2">
        {{ getHiddenWord?.question ?? 'Find The Hidden Word?' }}
      </v-typography>

      <v-typography variants="h6" class="text-subtitle-1 P"> Level 01 of 07 </v-typography>

      <div v-if="!animationActive" class="find-word">
        <v-form fast-fail @submit.prevent="handleSubmit" class="find-word-opt">
          <div v-for="(single, index) in getHiddenWord?.options" :key="single._id || index">
            <v-checkbox
              class="check-box-label"
              :label="single"
              :model-value="playStore.getSelectedOpt() === single"
              @update:model-value="handleCheckBox(single)"
            ></v-checkbox>
          </div>

          <Button type="submit" buttonText="Submit" append-icon="mdi-arrow-right" />
        </v-form>
      </div>

      <div v-else>
        <h1>candle aaye gi</h1>
      </div>

      <!-- session modal -->
      <Modal
        v-model="sessionModal"
        @agree="() => gamePlay('leave')"
        max-width="450"
        :close-on-outside-click="false"
      >
        <template #prependIcon>
          <span class="my-loader"></span>
        </template>

        <template #title>
          <p class="modal-main-title">Wow! That's Great</p>
        </template>

        <p class="modal-main-text text-gray-700 text-center" v-if="expectedLastSession">
          Next Level Start in {{ timerSessionSeconds }} sec
        </p>

        <p class="modal-main-text text-gray-700 text-center" v-else>
          Next Intension Session Start in {{ timerSessionSeconds }} sec
        </p>
      </Modal>

      <!-- level 7 completed (Game Finished) -->
      <Modal
        v-model="lastModal"
        v-if="
          playStore.getPlayedSession() === playStore.getSession() &&
          expectedLastSession &&
          playStore.getLevel() === 7
        "
        @agree="() => gamePlay('leave')"
        max-width="500"
        :close-on-outside-click="false"
      >
        <template #title>
          <p class="modal-main-title">Wow That's Great</p>
        </template>

        <p class="modal-main-text text-gray-700 text-center">
          🎉 Congratulations! You’ve completed the game!
        </p>

        <div class="modal-footer-btn">
          <Button buttonText="Play The Again Level" />
          <Button buttonText="Finish" @click="leaveHandle" />
        </div>
      </Modal>

      <!-- gate completed (not last level) -->
      <Modal
        v-model="lastModal"
        v-if="playStore.getPlayedSession() === playStore.getSession() && expectedLastSession"
        @agree="() => gamePlay('leave')"
        max-width="500"
        :close-on-outside-click="false"
      >
        <template #title>
          <p class="modal-main-title">That's Great</p>
        </template>

        <p class="modal-main-text text-gray-700 text-center">Congratulations! Gate completed.</p>

        <div class="modal-footer-btn">
          <Button buttonText="Play Again" />
          <Button buttonText="Next Level" />
          <Button buttonText="Exit" @click="leaveHandle" />
        </div>
      </Modal>

      <!-- didn't respond -->
      <Modal
        v-model="lastModal"
        v-if="timerSeconds === 0"
        @agree="() => gamePlay('leave')"
        max-width="500"
        :close-on-outside-click="false"
      >
        <template #title>
          <p class="modal-main-title">OOPSY!</p>
        </template>

        <p class="modal-main-text text-gray-700 text-center">
          You didn’t respond or missed one or more secret words.
        </p>

        <div class="modal-footer-btn">
          <Button buttonText="Play Again" />
          <Button buttonText="Exit" @click="leaveHandle" />
        </div>
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
  margin-top: 20px;
}

.modal-footer-btn {
  display: flex;
  justify-content: center;
  gap: 20px;
  align-items: center;
  margin-top: 10px;
}
</style>
