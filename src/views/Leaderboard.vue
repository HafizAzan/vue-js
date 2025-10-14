<script setup>
// components
import Button from '@/components/Button.vue'
import DropDownVue from '@/components/DropDown.vue'
import Loader from '@/components/Loader.vue'
import Pagination from '@/components/Pagination.vue'
import Table from '@/components/Table.vue'
import Modal from '@/components/Modal.vue'

// api-service
import {
  fetchAllPlayLevels,
  fetchLeaderBoardData,
  fetchLeaderBoardDataByLevel,
  fetchSessionWord,
  fetchTime,
} from '@/utils/api-service'

//constant
import { headers } from '@/utils/constant'

// default + library
import { ref, computed, watch, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'

// store + routes
import { useUserStore } from '../store/useUserStore'
import { ROUTES } from '../router'
import { usePlayStore } from '@/store/usePlayStore'
import Tooltip from '@/components/Tooltip.vue'
import { fetchAllModalConfig } from '@/utils/admin-api-service'

const { resetToken, token } = useUserStore()
const playStore = usePlayStore()
const router = useRouter()

const currentPage = ref(1)
const levelPage = ref(1)
const selectedLevel = ref(null)
const isLevelFiltered = ref(false)
const open = ref(false)
const isCompleteSession = ref(null)

const { data, isLoading, isFetching } = useQuery({
  queryKey: ['leaderboard', currentPage],
  queryFn: () => fetchLeaderBoardData({ page: currentPage.value, userId: token?._id }),
})

const {
  data: LeaderboardPlayDataById,
  isLoading: isLevelLoading,
  isFetching: isFetchingLevel,
} = useQuery({
  queryKey: ['leaderboard-play-level', levelPage, selectedLevel],
  enabled: computed(() => isLevelFiltered.value && selectedLevel.value !== null),
  queryFn: () =>
    fetchLeaderBoardDataByLevel({
      page: levelPage.value,
      level: selectedLevel.value,
    }),
})

const { data: getTime } = useQuery({
  queryKey: ['get-time'],
  queryFn: fetchTime,
})

const { data: getSessionWord } = useQuery({
  queryKey: ['get-session-word'],
  queryFn: fetchSessionWord,
})

const { data: allPlayLevel } = useQuery({
  queryKey: ['filter-all-play-level'],
  queryFn: fetchAllPlayLevels,
})

const page = computed({
  get: () => (isLevelFiltered.value ? levelPage.value : currentPage.value),
  set: (val) => {
    if (isLevelFiltered.value) levelPage.value = val
    else currentPage.value = val
  },
})

const findMinimumOnePlay = data.value?.loggedInUser?.userId === token?._id
const totalCount = computed(() => getTime?.value?.time?.overAllTime)
const sessionTime = computed(() => getSessionWord?.value?.cycleTime)

const totalPages = computed(() =>
  isLevelFiltered.value
    ? LeaderboardPlayDataById.value?.totalPages || 1
    : data.value?.totalPages || 1,
)

const leaderboardItems = computed(() =>
  isLevelFiltered.value ? LeaderboardPlayDataById.value?.data : data.value?.data,
)

const getScore = (item) => {
  if (item.totalScore != null) return Math.trunc(item.totalScore * 10) / 10
  if (item.score != null) return Math.trunc(item.score * 10) / 10
  return 0
}

const FilteredLevels = computed(() => {
  const levels = allPlayLevel.value?.levels || []

  return [
    { Level: 'All', title: 'Show All Levels' },
    ...[...levels]
      .sort((a, b) => Number(a) - Number(b))
      .map((level) => ({
        Level: level,
        title: `Level 0${level}`,
      })),
  ]
})

const playAgainLevels = computed(() => {
  return Array.from({ length: playStore.getLevel() - 1 }).map((_, index) => ({
    level: `Level ${index + 1}`,
    title: `Level 0${index + 1}`,
  }))
})

const handleSelect = (item) => {
  if (item.Level === 'All') {
    isLevelFiltered.value = false
    selectedLevel.value = null
    currentPage.value = 1
  } else {
    isLevelFiltered.value = true
    selectedLevel.value = item.Level
    levelPage.value = 1
  }
}

const handleSelectPlayAgainLevel = (item) => {
  const level = String(item?.level)?.replace('Level', '').trim()
  router.push(`${ROUTES.DOOR}?playAgain=${level}`)
}

const dropdownLabel = computed(() => {
  if (!isLevelFiltered.value || selectedLevel.value === null) {
    return 'Filter Levels'
  }
  return `Level 0${selectedLevel.value}`
})

const gamePlay = async (action) => {
  if (action === 'leave') {
    resetToken()
    playStore.resetAll()
    await router.push(ROUTES.LOGIN)
    toast.success('You Logout Successfully!')
  } else if (['play-next', 'play', 'resume'].includes(action)) {
    try {
      await router.push(ROUTES.DOOR)
    } catch (err) {
      toast.error(`Navigation error: ${err}`)
    }
  }
}

const currentLevelData = computed(() => {
  const playDataLevel = data.value?.loggedInUser?.plays
  if (playDataLevel && typeof playDataLevel === 'object') {
    const keys = Object.keys(playDataLevel)
    const lastKey = keys[keys.length - 1]
    return playDataLevel[lastKey]
  }
  return null
})

watch(
  [data, totalCount, sessionTime, token],
  () => {
    const levelData = currentLevelData.value
    if (!levelData) return

    const durationRaw = totalCount.value * 60
    const cycleTime = sessionTime.value

    const expectedSessions =
      durationRaw && cycleTime ? Math.ceil(Number(durationRaw) / Number(cycleTime)) : 10

    const sessions = levelData?.sessions || []

    const allAnswered = sessions.every(
      (item) =>
        item?.answer !== null &&
        item?.answer !== undefined &&
        item?.answer !== 'null' &&
        item?.answer !== '',
    )

    isCompleteSession.value = sessions.length === expectedSessions && allAnswered

    const isLatestLevel = parseInt(levelData?.level)

    if (allAnswered && sessions.length === expectedSessions) {
      playStore.setLevel(isLatestLevel + 1)
    } else {
      playStore.setLevel(isLatestLevel)
    }
  },
  { immediate: true },
)

const ButtonText = () => {
  const currentLevel = playStore.getLevel()
  const isLastLevel = currentLevel > 7
  const isComplete = isCompleteSession.value
  if (isComplete && isLastLevel) return 'Finish'
  if (!findMinimumOnePlay) return 'Play'
  if (isComplete) return 'Play Next'
  return 'Resume'
}
</script>

<template>
  <main class="container">
    <div class="content">
      <v-typography variants="h3" class="text-h3 h3">Leaderboard</v-typography>

      <main class="content-btns">
        <Tooltip :text="ButtonText()">
          <Button
            :buttonText="ButtonText()"
            @click="() => gamePlay('play-next')"
            :disabled="playStore.getLevel() > 7"
          />
        </Tooltip>

        <DropDownVue
          v-if="playStore.getLevel() > 1"
          :items="playAgainLevels"
          buttonText="Play Again"
          tooltipText="Play Again"
          defaultLocation="bottom"
          @select="handleSelectPlayAgainLevel"
        />

        <Modal
          v-model="open"
          title="Are You Sure? You Want To Logout!"
          prepend-icon="mdi-alert-circle"
          agree-text="Yes"
          disagree-text="No"
          @agree="() => gamePlay('leave')"
          tooltip-text="leave"
          button-text="Leave"
          max-width="450"
        >
          <p class="text-gray-700 text-center">
            Logging out will end your current session and you may lose unsaved progress. Do you
            still want to log out?
          </p>
        </Modal>

        <DropDownVue
          :items="FilteredLevels"
          tooltipText="Levels"
          :buttonText="dropdownLabel"
          defaultLocation="bottom"
          @select="handleSelect"
        />
      </main>
    </div>

    <Loader v-if="isLoading || isFetching || isLevelLoading || isFetchingLevel" color="white" />

    <div v-else class="main-content-table">
      <Table :headers="headers" :items="leaderboardItems">
        <template #item.userName="{ item }">
          <div class="ellipsis">
            <span>
              {{ item.userId === token?._id ? 'You' : item.userName }}
            </span>
          </div>
        </template>

        <template #item.levelsCompleted="{ item }">
          <div>
            <span>
              0{{ item.levelsCompleted?.[item.levelsCompleted.length - 1] ?? item.level ?? '-' }}
            </span>
          </div>
        </template>

        <template #item.totalScore="{ item }">
          <div>
            <span>
              {{ getScore(item) }}
            </span>
          </div>
        </template>
      </Table>

      <Pagination v-model="page" :length="totalPages" :total-visible="3" rounded="circle" />
    </div>
  </main>
</template>

<style scoped>
.content {
  padding-top: 6rem;
  display: flex;
  align-items: start;
  justify-content: space-between;
  color: white;
  flex-wrap: wrap;
  gap: 20px;
}

.content-btns {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1rem;
}

.main-content-table {
  padding-top: 20px;
  padding-bottom: 10px;
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  text-transform: capitalize;
}

/* Media Query */
@media (max-width: 400px) {
  .content,
  .content-btns {
    align-items: center;
    justify-content: center;
  }
}

@media (max-width: 785px) {
  .content {
    flex-direction: column !important;
  }
}
</style>
