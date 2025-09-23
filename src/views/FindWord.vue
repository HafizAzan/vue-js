<script setup>
import { nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
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
import { formatTime, useTimer } from '@/utils/constant'

// pinia store
import { usePlayStore } from '@/store/usePlayStore'
import { useUserStore } from '@/store/useUserStore'

// components
import Loader from '@/components/Loader.vue'
import Button from '@/components/Button.vue'
import Modal from '@/components/Modal.vue'
import { toast } from 'vue-sonner'

const { token } = useUserStore()
const playStore = usePlayStore()
const router = useRouter()

// states
const animationActive = ref(true)
const isAssigningSection = ref(true)
const shouldRefetchUsers = ref(true)
const controllValues = reactive({ values: [] })

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

// computed
const isPageLoading = computed(
  () =>
    isTimeloading.value ||
    isHiddenWordLoading.value ||
    isMcqLoading.value ||
    isAssigningSection.value,
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

// Watchers
watch(
  [userItems, userSection, isSingleUserLoading],
  ([items, section, loading]) => {
    if (loading) return

    if (items.length) {
      playStore.setSection(section)
      controllValues.values = items.map((item) => parseFloat(item))
      if (section) playStore.setSection(section)
      else playStore.clearSection()
      isAssigningSection.value = false
    }
  },
  { immediate: true },
)

watch(
  [userItems, isSingleUserLoading, isValueLoading, isAllUsersLoading],
  async ([items, userLoading, valueLoading, allUsersLoading]) => {
    if (userLoading || valueLoading || allUsersLoading) return

    if (shouldRefetchUsers.value) {
      await refetchAllUser()
    }

    if (items?.length > 0 || playStore.getSection()) {
      isAssigningSection.value = false
      return
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

    const FindOneSectionWithItems = availableSectionsForUser[0]

    if (FindOneSectionWithItems) {
      isAssigningSection.value = true
      try {
        await updateUser({
          items: FindOneSectionWithItems.items,
          section: FindOneSectionWithItems.section,
        })

        shouldRefetchUsers.value = false
        playStore.setSection(FindOneSectionWithItems.section)
        controllValues.values = FindOneSectionWithItems.items
      } finally {
        isAssigningSection.value = false
      }
    } else {
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

  if (findUseSectionEmpty?._id) {
    await updateArray({ itemId: findUseSectionEmpty._id, body: { items: [] } })
  }

  if (Array.isArray(userItems.value) && userItems.value.length > 0 && userSection.value) {
    await updateUser({ items: [] })
    await refetchSingleUser()
  }
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
  if (type === 'playAgain') {
    router.push(ROUTES.DOOR)
  } else if (type === 'leave') router.push(ROUTES.LEADERBOARD)
  else if (type === 'next') {
    router.push(ROUTES.DOOR)
    playStore.incrementLevel()
  }
}

const handleCheckBox = (single) => {
  playStore.setSelectedOpt(playStore.getSelectedOpt() === single ? null : single)
}

const handleSubmit = async (e, isAuto = false) => {
  e?.preventDefault?.()
  await nextTick()

  const isCorrect = playStore.getSelectedOpt() === getHiddenWord?.value?.hiddenWord

  const cycleDuration = getHiddenWord?.value?.cycleTime * 1000
  const timePassed = (totalCount.value * 60 - timerSeconds.value) * 1000
  const timeInCycle = timePassed % cycleDuration
  const timeTaken = isAuto
    ? 0
    : timeInCycle <= cycleDuration
      ? Math.floor(timeInCycle / 1000)
      : getHiddenWord?.value?.cycleTime

  const updatedCompleteTime = (playStore.getCompleteTime?.() ?? 0) + (isAuto ? 0 : timeTaken)

  const body = {
    userId: token?._id,
    level: playStore.getLevel(),
    section: playStore.getSection(),
    score: 20,
    completeTime: updatedCompleteTime,
    sessions: [
      {
        session: isAuto ? playStore.getSession() - 1 : playStore.getSession(),
        answer: playStore.getSelectedOpt() ?? 'null',
        isCorrect: isCorrect ?? false,
        score: 10,
        time: timeTaken,
      },
    ],
  }

  const res = await addPlayData(body)
  if (!res?.error) {
    toast.success('Add session SuccessFully!')
    playStore.setCompleteTime(updatedCompleteTime)
    isAuto ? 0 : playStore.incrementPlayedSession()
    playStore.setSelectedOpt(null)
    isAuto ? (sessionModal.value = false) : (sessionModal.value = true)
  }
}

watchEffect(() => {
  if (timerSessionSeconds.value === 1 && !expectedLastSession.value) {
    ;(async () => {
      handleSubmit(null, true)
      refetchHiddenWord()
      playStore.incrementSession()
      playStore.clearSessionModal()
      sessionModal.value = false
    })()
  }
})

watchEffect(() => {
  if (timerSeconds.value === 0 && expectedLastSession.value) {
    sessionModal.value = false
    lastModal.value = true
    updateArrayWithEmptyItems()
    playStore.clearSection()
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

const sandRef = ref(null)

// watch(timerSessionSeconds, (newVal) => {
//   if (!sandRef.value) return

//   const percentage =
//     ((getHiddenWord.value?.cycleTime - newVal) / getHiddenWord.value?.cycleTime) * 360
//   const topSand = sandRef.value.querySelector('::before')
//   const bottomSand = sandRef.value.querySelector('::after')
//   const bg = `linear-gradient(#ff3d00 ${percentage}, transparent 0)`
//   sandRef.value.style.background = bg
//   sandRef.value.style.setProperty('--sand-progress', percentage)
// })
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

      <v-typography variants="h2" class="text-h2 h2">
        {{ getHiddenWord?.question ?? 'Find The Hidden Word?' }}
      </v-typography>

      <v-typography variants="h6" class="text-subtitle-1 P">
        Level 0{{ playStore.getLevel() }} of 07
      </v-typography>

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
          <span ref="sandRef" class="my-loader" aria-hidden="true"></span>
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
          <Button buttonText="Finish" @click="leaveHandle('leave')" />
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
          <Button buttonText="Next Level" @click="leaveHandle('next')" />
          <Button buttonText="Exit" @click="leaveHandle('leave')" />
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
          You didn’t respond or missed one or more secret words.
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
