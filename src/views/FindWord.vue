<script setup>
import { nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { computed, onBeforeUnmount, onMounted, reactive, ref, watchEffect } from 'vue'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { ROUTES } from '@/router'

// API-service
import {
  fetchAllMcqs,
  fetchAllUsers,
  fetchAllValues,
  fetchSessionWord,
  fetchTime,
  fetchUserById,
  updateUserWithSection,
  updateValueItems,
} from '@/utils/api-service'
import { addPlayUser } from '../utils/api-service'

// constant
import { calculateFlame, formatTime, useTimer } from '@/utils/constant'

// pinia store
import { usePlayStore } from '@/store/usePlayStore'
import { useUserStore } from '@/store/useUserStore'

// components
import Loader from '@/components/Loader.vue'
import Button from '@/components/Button.vue'
import Modal from '@/components/Modal.vue'
import { toast } from 'vue-sonner'
import Animation from '@/components/Animation.vue'
import { fetchAllModalConfig } from '@/utils/admin-api-service'

const { token } = useUserStore()
const playStore = usePlayStore()
const router = useRouter()
const route = useRoute()

// states
const playAgainLevel = route.query.playAgain
const animationActive = ref(true)
const isAssigningSection = ref(true)
const shouldRefetchUsers = ref(true)
const controllValues = reactive({ values: [] })
const sessionSubmitted = ref({})
const lastSessionTriggered = ref(false)
const isSectionReady = ref(false)
const saveValue = ref(null)

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
})

const { data: getSessionMcq, isLoading: isMcqLoading } = useQuery({
  queryKey: ['get-session-mcq'],
  queryFn: fetchAllMcqs,
})

// single user
const {
  data: getSingleUser,
  isLoading: isSingleUserLoading,
  refetch: refetchSingleUser,
} = useQuery({
  queryKey: ['get-single-user'],
  queryFn: () => fetchUserById(token?._id),
  enabled: !!token?._id,
})

// update User ++ Assign Array
const { data: allValues, isLoading: isValueLoading } = useQuery({
  queryKey: ['get-values'],
  queryFn: fetchAllValues,
})

const {
  data: allUsers,
  isLoading: isAllUsersLoading,
  refetch: refetchAllUser,
} = useQuery({
  queryKey: ['get-all-register-users'],
  queryFn: fetchAllUsers,
})

// Mutations
const { mutateAsync: addPlayData, isPending: isPlayAddingLoader } = useMutation({
  mutationKey: ['add-play-data'],
  mutationFn: (payload) => addPlayUser(payload),
})

const { mutateAsync: updateUser, isPending: isUserPending } = useMutation({
  mutationKey: ['update-user'],
  mutationFn: (userData) => updateUserWithSection({ userId: token?._id, body: userData }),
})

const { mutateAsync: updateArray, isPending: isValuesPending } = useMutation({
  mutationKey: ['update-value-items'],
  mutationFn: ({ body, itemId }) => updateValueItems({ userId: itemId, body }),
})

const {
  data: getAllModal,
  isLoading: isGettingModalText,
  refetch: refetchAllModal,
} = useQuery({
  queryKey: ['get-all-models'],
  queryFn: fetchAllModalConfig,
})

// computed
const isPageLoading = computed(
  () =>
    isTimeloading.value ||
    isHiddenWordLoading.value ||
    isMcqLoading.value ||
    isAssigningSection.value ||
    isGettingModalText.value ||
    !isSectionReady.value,
)

const paused = computed(() => isPageLoading.value)

// TIMERS
const timerSeconds = useTimer(
  () => getTime?.value?.time?.overAllTime,
  playStore.getCurrentTime,
  playStore.setCurrentTime,
  playStore.clearCurrentTime,
  null,
  true,
  false,
  paused,
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
  paused,
)

const userItems = computed(() => getSingleUser.value?.user?.items ?? [])
const userSection = computed(() => getSingleUser.value?.user?.section ?? null)
const allValuesForUsers = computed(() => allValues.value?.data?.A)
const allRegisterUsers = computed(() => allUsers?.value?.users)

const getHiddenWord = computed(() => ({
  options: getSessionWord?.value?.options,
  hiddenWord: getSessionWord?.value?.hiddenWord,
  question: getSessionMcq?.value?.data?.[0]?.question,
  cycleTime: getSessionWord?.value?.cycleTime,
}))

const totalCount = computed(() => getTime?.value?.time?.overAllTime ?? 0)
const animationTime = computed(() => getTime?.value?.time?.animationTime ?? 30)
const animationStopTime = computed(() => getTime?.value?.time?.animationStopTime ?? 30)
const animationFrequency = computed(() => getTime?.value?.time?.animationFrequency ?? 30)

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

const sessionModal = computed({
  get: () => playStore.getSessionModal(),
  set: (val) => playStore.setSessionModal(val),
})

const lastModal = computed({
  get: () => playStore.getLastModal(),
  set: (val) => playStore.setLastModal(val),
})

const messageText = computed(() => {
  if (expectedLastSession.value) {
    return playAgainLevel
      ? `Level 0${playAgainLevel} is already completed! But you played again Wait ${timerSessionSeconds.value} sec`
      : `Next Level Start in ${timerSessionSeconds.value} sec`
  }
  return ''
})

const defaultModalTexts = reactive({
  sessionText: '',
  timeUpText: '',
  allSessionFinishModalText: '',
  gateCompleteModalText: '',
  wrongCompleteModalText: '',
  lastLevelModalText: '',
  heading: '',
  audioFile: '',
  low: '',
  medium: '',
  high: '',
  opacityLow: '',
  opacityMedium: '',
  opacityHigh: '',
})

const fetchModalData = () => {
  const modalData = getAllModal.value?.[0]
  if (modalData) {
    Object.keys(defaultModalTexts).forEach((key) => {
      defaultModalTexts[key] = modalData[key] ?? ''
    })
  }
}

watch(getAllModal, fetchModalData)
onMounted(fetchModalData)

// Watchers
watch(
  [userItems, userSection, isSingleUserLoading],
  ([items, section, loading]) => {
    if (loading) return

    if (items?.length > 0) {
      controllValues.values = items.map((item) => parseFloat(item))
      playStore.setSection(section)
      isSectionReady.value = true
    } else {
      if (!playStore.getSection()) {
        playStore.clearSection()
        isSectionReady.value = false
      }
    }

    isAssigningSection.value = false
  },
  { immediate: true },
)

watch(
  [userItems, isSingleUserLoading, isValueLoading, isAllUsersLoading],
  async ([items, userLoading, valueLoading, allUsersLoading]) => {
    if (userLoading || valueLoading || allUsersLoading || isAssigningSection.value) {
      return
    }

    if ((items?.length > 0 || playStore.getSection()) && !isAssigningSection.value) {
      isAssigningSection.value = false
      return
    }

    if (shouldRefetchUsers.value) {
      await refetchAllUser()
      shouldRefetchUsers.value = false
    }

    const availableSectionsForUser = (allValuesForUsers.value ?? []).filter(
      (single) =>
        Array.isArray(single?.items) &&
        single.items.length > 0 &&
        !(allRegisterUsers.value ?? [])
          .map((u) => u.section)
          .filter(Boolean)
          .includes(single.section),
    )

    const firstAvailable = availableSectionsForUser[0]

    if (!firstAvailable) {
      isSectionReady.value = false
      return
    }

    isAssigningSection.value = true

    try {
      await updateUser({
        items: firstAvailable.items,
        section: firstAvailable.section,
      })

      playStore.setSection(firstAvailable.section)
      controllValues.values = firstAvailable.items
      isSectionReady.value = true
    } catch (e) {
      throw e
    } finally {
      isAssigningSection.value = false
    }
  },
  { immediate: true },
)

// show opt and candle off logic
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

//Functions
const updateArrayWithEmptyItems = async () => {
  const section = playStore.getSection()
  const findUseSectionEmpty = allValuesForUsers.value?.find(
    (single) => single?.section === section && single?.items?.length > 0,
  )

  await updateUser({ items: [] })
  await refetchSingleUser()
  await updateArray({ itemId: findUseSectionEmpty._id, body: { items: [] } })
}

const resetPlayState = () => {
  playStore.clearSessionModal()
  playStore.clearCompleteTime()
  playStore.clearSessionTime()
  playStore.clearCurrentTime()
  playStore.clearSelectedOpt()
  playStore.clearLastModal()
  playStore.setSession(1)
  playStore.setPlayedSession(0)
  playStore.clearSection()
  lastModal.value = false
  sessionModal.value = false
}

const leaveHandle = (type) => {
  resetPlayState()
  shouldRefetchUsers.value = true

  if (type === 'playAgain') {
    playAgainLevel
      ? router.push(`${ROUTES.DOOR}?playAgain=${playAgainLevel}`)
      : router.push(ROUTES.DOOR)
  } else if (type === 'leave' || type === 'finish') router.push(ROUTES.LEADERBOARD)
  else if (type === 'next') {
    router.push(ROUTES.DOOR)
    playStore.incrementLevel()
  }
}

const handleCheckBox = (single) => {
  playStore.setSelectedOpt(playStore.getSelectedOpt() === single ? null : single)
}

function calculateCompletionData({ isAuto = false }) {
  const selectedOption = playStore.getSelectedOpt?.()
  const hiddenWord = getHiddenWord?.value?.hiddenWord
  const isCorrect = selectedOption === hiddenWord

  const cycleTimeInSeconds = getHiddenWord?.value?.cycleTime ?? 0
  const cycleDuration = cycleTimeInSeconds * 1000

  const totalSecondsPassed = totalCount.value * 60 - timerSeconds.value
  const timePassed = totalSecondsPassed * 1000
  const timeInCycle = timePassed % cycleDuration

  const timeTaken = isAuto
    ? 0
    : timeInCycle <= cycleDuration
      ? Math.floor(timeInCycle / 1000)
      : cycleTimeInSeconds

  const previousCompleteTime = playStore.getCompleteTime?.() ?? 0
  const updatedCompleteTime = previousCompleteTime + timeTaken

  return {
    isCorrect,
    timeTaken,
    updatedCompleteTime,
  }
}

const calculateScoreData = ({ isAuto = false, score = 0 }) => {
  const previousCalculateScore = playStore.getCalculateScore() ?? 0
  const updatedCalculateScore = isAuto ? previousCalculateScore : previousCalculateScore + score

  return {
    updatedCalculateScore,
  }
}

const handleSubmit = async (e) => {
  e?.preventDefault?.()
  await nextTick()

  const { isCorrect, timeTaken, updatedCompleteTime } = calculateCompletionData({ isAuto: false })
  const { points } = calculateFlame(
    controllValues.values,
    animationFrequency.value,
    animationTime.value,
    animationStopTime.value,
    timerSeconds.value,
    totalCount.value * 60,
  )

  const { updatedCalculateScore } = calculateScoreData({ isAuto: false, score: points })

  const body = {
    userId: token?._id,
    level: playAgainLevel ?? playStore.getLevel(),
    section: playStore.getSection(),
    score: updatedCalculateScore,
    completeTime: updatedCompleteTime,
    sessions: [
      {
        session: playStore.getSession(),
        answer: playStore.getSelectedOpt(),
        isCorrect,
        score: points,
        time: timeTaken,
      },
    ],
  }

  const res = await addPlayData(body)
  if (!res?.error) {
    toast.success('Add session SuccessFully!')
    playStore.setCompleteTime(updatedCompleteTime)
    playStore.setCalculateScore(updatedCalculateScore)
    playStore.incrementPlayedSession()
    playStore.setSelectedOpt(null)
    sessionModal.value = true
    sessionSubmitted.value[playStore.getSession()] = true
  }
}

const autoSubmit = async (currentSection = null) => {
  await nextTick()
  const sectionToSend = currentSection || playStore.getSection()
  const { isCorrect, timeTaken, updatedCompleteTime } = calculateCompletionData({ isAuto: true })
  const { points } = calculateFlame(
    controllValues.values,
    animationFrequency.value,
    animationTime.value,
    animationStopTime.value,
    timerSeconds.value,
    totalCount.value * 60,
  )

  const { updatedCalculateScore } = calculateScoreData({ isAuto: true, score: points })

  const body = {
    userId: token?._id,
    level: playAgainLevel ?? playStore.getLevel(),
    section: sectionToSend,
    score: updatedCalculateScore,
    completeTime: updatedCompleteTime,
    sessions: [
      {
        session: playStore.getSession(),
        answer: 'null',
        isCorrect,
        score: points,
        time: timeTaken,
      },
    ],
  }

  const res = await addPlayData(body)
  if (!res?.error) {
    playStore.setCompleteTime(updatedCompleteTime)
    playStore.setCalculateScore(updatedCalculateScore)
    sessionModal.value = false
    sessionSubmitted.value[playStore.getSession()] = false
  }
}

const getBlur = () => {
  const candleOn = computed(() => animationActive.value)
  const isFading = computed(() => saveValue.value)

  if (!candleOn.value) {
    return { filter: `blur(3px)`, opacity: 0, userSelect: 'text' }
  }

  const brightness = typeof isFading.value === 'number' ? isFading.value : 1
  const clamped = Math.max(0, Math.min(1, brightness))

  const baseBlur = 3
  const blurAmount = baseBlur + clamped * 4

  return {
    filter: `blur(${blurAmount.toFixed(2)}px)`,
    opacity: (0.9 - clamped * 0.1).toFixed(2),
    userSelect: 'none',
    pointerEvents: 'none',
  }
}

//watcher
watchEffect(() => {
  if (timerSessionSeconds.value === 1 && !expectedLastSession.value) {
    const currentSession = playStore.getSession()
    const sectionToSend = playStore.getSection()

    if (!sessionSubmitted.value[currentSession]) {
      ;(async () => {
        await autoSubmit(sectionToSend)
        await refetchHiddenWord()
        playStore.incrementSession()
        playStore.clearSessionModal()
        sessionModal.value = false
      })()
    } else {
      sessionSubmitted.value[currentSession] = false
      refetchHiddenWord()
      playStore.incrementSession()
      playStore.clearSessionModal()
      sessionModal.value = false
    }
  }
})

watchEffect(() => {
  if (timerSeconds.value === 0 && expectedLastSession.value && !lastSessionTriggered.value) {
    lastSessionTriggered.value = true

    const currentSession = playStore.getSession()
    const sectionToSend = playStore.getSection()

    ;(async () => {
      if (!sessionSubmitted.value[currentSession]) {
        await autoSubmit(sectionToSend)
      }

      sessionModal.value = false
      lastModal.value = true

      setTimeout(() => {
        updateArrayWithEmptyItems().then(() => {
          shouldRefetchUsers.value = true
          playStore.clearSection()
          isSectionReady.value = true
        })
      }, 500)
    })()
  }
})

onMounted(() => {
  window.onpopstate = () => {
    router.push(ROUTES.LEADERBOARD)
    if (expectedLastSession.value && playStore.getPlayedSession() === playStore.getSession()) {
      resetPlayState()
    }
  }
})

onBeforeUnmount(() => {
  window.onpopstate = null
})

const level = playAgainLevel ?? playStore.getLevel()
</script>

<template>
  <main class="container">
    <div v-if="isPageLoading">
      <Loader />
    </div>

    <div v-else class="find-word">
      <v-typography variants="h3" class="text-h3 h3">
        {{ getAllTimeData.overAllTime }}
      </v-typography>

      <v-typography variants="h2" class="text-h4 text-sm-h2 h2">
        {{ getHiddenWord?.question ?? 'Find The Hidden Word?' }}
      </v-typography>

      <v-typography variants="h6" class="text-subtitle-1 P">
        Level 0{{ playStore.getLevel() }} of 07
      </v-typography>

      <div class="one-row-with-animation">
        <div class="find-word-form">
          <v-form
            fast-fail
            @submit.prevent="handleSubmit"
            class="find-word-opt"
            v-if="!animationActive"
          >
            <div v-for="(single, index) in getHiddenWord?.options" :key="single._id || index">
              <v-checkbox
                class="check-box-label"
                :label="single"
                :model-value="playStore.getSelectedOpt() === single"
                @update:model-value="handleCheckBox(single)"
              ></v-checkbox>
            </div>

            <Button
              type="submit"
              buttonText="Submit"
              append-icon="mdi-arrow-right"
              v-if="playStore.getSelectedOpt()"
              :disabled="isPlayAddingLoader"
              :isLoading="isPlayAddingLoader"
            />
          </v-form>
        </div>

        <div
          class="main-animation-container"
          :style="{
            height: (Number(playAgainLevel) || playStore.getLevel()) === 3 ? '380px' : '',
          }"
        >
          <Animation
            :level="level"
            :element="animationFrequency"
            :is-candle-on="animationActive"
            :array-values="controllValues.values"
            v-model:saveValue="saveValue"
            :is-end="isEnd"
          />

          <p
            :class="
              (Number(playAgainLevel) || playStore.getLevel()) === 2
                ? 'hidden-word-two-level'
                : (Number(playAgainLevel) || playStore.getLevel()) === 5
                  ? 'hidden-word-five'
                  : 'hidden-word'
            "
            :style="getBlur()"
            v-if="!isEnd"
          >
            {{ getHiddenWord.hiddenWord }}
          </p>
        </div>
      </div>

      <!-- session modal -->
      <Modal
        v-model="sessionModal"
        @agree="() => gamePlay('leave')"
        max-width="450"
        :close-on-outside-click="false"
      >
        <template #prependIcon>
          <span class="my-loader mt-10" aria-hidden="true"></span>
        </template>

        <template #title>
          <p class="modal-main-title">Wow! That's Great</p>
        </template>

        <div
          class="modal-main-text text-gray-700 text-center"
          v-if="
            expectedLastSession &&
            defaultModalTexts?.allSessionFinishModalText &&
            !defaultModalTexts?.sessionText
          "
        >
          <p v-if="defaultModalTexts?.allSessionFinishModalText">
            {{ defaultModalTexts?.allSessionFinishModalText }}
          </p>
          <p v-if="defaultModalTexts?.allSessionFinishModalText">
            {{ messageText }}
          </p>
        </div>

        <div class="modal-main-text text-gray-700 text-center" v-else>
          <p v-if="defaultModalTexts?.sessionText">{{ defaultModalTexts?.sessionText }}</p>
          <div v-if="defaultModalTexts?.sessionText">{{ timerSessionSeconds }} Seconds</div>

          <span v-else>Next Intension Session Start in {{ timerSessionSeconds }} sec</span>
        </div>
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
          {{
            defaultModalTexts?.gateCompleteModalText ??
            '🎉 Congratulations! You’ve completed the game!'
          }}
        </p>

        <div class="modal-footer-btn">
          <Button buttonText="Play The Again Level" />
          <Button buttonText="Finish" @click="leaveHandle('leave')" />
        </div>
      </Modal>

      <!-- gate completed (not last level) -->
      <Modal
        v-model="lastModal"
        v-if="
          playStore.getPlayedSession() === playStore.getSession() &&
          expectedLastSession &&
          playStore.getLevel() !== 7
        "
        @agree="() => gamePlay('leave')"
        max-width="500"
        :close-on-outside-click="false"
      >
        <template #title>
          <p class="modal-main-title">That's Great</p>
        </template>

        <p class="modal-main-text text-gray-700 text-center">
          {{ defaultModalTexts?.lastLevelModalText ?? 'Congratulations! Level completed.' }}
        </p>

        <div class="modal-footer-btn" v-if="!playAgainLevel">
          <Button buttonText="Play Again" @click="leaveHandle('playAgain')" />
          <Button buttonText="Next Level" @click="leaveHandle('next')" />
          <Button buttonText="Exit" @click="leaveHandle('leave')" />
        </div>
        <div class="modal-footer-btn" v-else>
          <Button buttonText="Play The Again Level" @click="leaveHandle('playAgain')" />
          <Button buttonText="Finish" @click="leaveHandle('finish')" />
        </div>
      </Modal>

      <!-- didn't respond -->
      <Modal
        v-model="lastModal"
        v-if="
          timerSeconds === 0 &&
          expectedLastSession &&
          playStore.getPlayedSession() !== playStore.getSession()
        "
        @agree="() => gamePlay('leave')"
        max-width="500"
        :close-on-outside-click="false"
      >
        <template #title>
          <p class="modal-main-title">OOPSY!</p>
        </template>

        <p class="modal-main-text text-gray-700 text-center">
          {{
            defaultModalTexts?.wrongCompleteModalText ??
            'You didn’t respond or missed one or more secret words.'
          }}
        </p>

        <div class="modal-footer-btn">
          <Button buttonText="Play Again" @click="leaveHandle('playAgain')" />
          <Button buttonText="Exit" @click="leaveHandle('leave')" />
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
  width: 100%;
}

.find-word-form {
  width: 560px;
}

.find-word-opt {
  display: flex;
  flex-wrap: wrap;
  column-gap: 50px;
  color: white;
  font-size: 20px;
  max-width: 100%;
}

.find-word-opt > div {
  flex: 0 0 calc(50% - 25px);
  box-sizing: border-box;
}

.check-box-label {
  text-transform: capitalize;
}

.modal-main-text {
  font-size: 20px;
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
  flex-wrap: wrap;
}

.one-row-with-animation {
  display: flex;
  justify-content: space-between;
  width: 90%;
  flex-wrap: wrap;
}

.main-animation-container {
  position: relative;
}

.hidden-word {
  font-size: 22px;
  color: white;
  font-weight: 700;
  position: absolute;
  top: 0px;
  left: 65px;
  text-transform: capitalize;
  transition: all ease 200ms;
}

.hidden-word-two-level {
  font-size: 22px;
  color: white;
  font-weight: 700;
  position: absolute;
  top: 105px;
  left: 200px;
  text-transform: capitalize;
  transition: all ease 200ms;
}

.hidden-word-five {
  font-size: 22px;
  color: white;
  font-weight: 700;
  position: absolute;
  top: 80px;
  left: 190px;
  text-transform: capitalize;
  transition: all ease 200ms;
}

@media (max-width: 765px) {
  .one-row-with-animation {
    justify-content: center;
    align-items: start;
    width: 100%;
  }

  .find-word {
    padding-top: 30px;
  }

  .hidden-word {
    left: -60px;
    top: 160px;
  }

  .candle {
    height: 70%;
  }
}

@media (max-width: 462px) {
  .modal-main-text {
    font-size: 15px !important;
  }

  .modal-main-title {
    font-size: 20px !important;
  }
}
</style>
