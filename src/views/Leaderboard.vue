<script setup>
import Button from '@/components/Button.vue'
import DropDownVue from '@/components/DropDown.vue'
import Loader from '@/components/Loader.vue'
import Pagination from '@/components/Pagination.vue'
import Table from '@/components/Table.vue'
import Modal from '@/components/Modal.vue'
import { fetchLeaderBoardData, fetchLeaderBoardDataByLevel } from '@/utils/api-service'
import { headers } from '@/utils/constant'
import { ref, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useUserStore } from '../store/useUserStore'
import { useRouter } from 'vue-router'
import { ROUTES } from '../router'
import { toast } from 'vue-sonner'

const { resetToken, token } = useUserStore()
const router = useRouter()

const currentPage = ref(1)
const levelPage = ref(1)
const selectedLevel = ref(null)
const isLevelFiltered = ref(false)
const open = ref(false)

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

const page = computed({
  get: () => (isLevelFiltered.value ? levelPage.value : currentPage.value),
  set: (val) => {
    if (isLevelFiltered.value) levelPage.value = val
    else currentPage.value = val
  },
})

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
  const levels = new Set(
    data.value?.data?.flatMap((user) => user?.levelsCompleted || []).filter(Boolean),
  )
  return [
    { Level: 'All', title: 'Show All Levels' },
    ...Array.from(levels)
      .sort((a, b) => a - b)
      .map((level) => ({
        Level: level,
        title: `Level 0${level}`,
      })),
  ]
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

const dropdownLabel = computed(() => {
  if (!isLevelFiltered.value || selectedLevel.value === null) {
    return 'Filter Levels'
  }
  return `Level 0${selectedLevel.value}`
})

const gamePlay = async (action) => {
  if (action === 'leave') {
    resetToken()
    await router.push(ROUTES.LOGIN)
    toast.success('You Logout Successfully!')
  } else if (['play-next', 'play', 'resume'].includes(action)) {
    try {
      await router.push(ROUTES.DOOR)
    } catch (err) {
      console.error('Navigation error:', err)
    }
  }
}
</script>

<template>
  <main class="container">
    <div class="content">
      <v-typography variants="h3" class="text-h3 h3">Leaderboard</v-typography>

      <main class="content-btns">
        <Button buttonText="Play" @click="() => gamePlay('play-next')" />
        <Modal
          v-model="open"
          title="Are You Sure? You Want To Logout!"
          prepend-icon="mdi-alert-circle"
          agree-text="Yes"
          disagree-text="No"
          @agree="() => gamePlay('leave')"
          @disagree="console.log('Disagreed!')"
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
          :buttonText="dropdownLabel"
          defaultLocation="bottom"
          @select="handleSelect"
        />
      </main>
    </div>

    <Loader v-if="isLoading || isFetching || isLevelLoading || isFetchingLevel" color="white" />

    <div v-else class="main-content-table">
      <Table :headers="headers" :items="leaderboardItems">
        <template #item.levelsCompleted="{ item }">
          <div>
            <span>
              {{ item.levelsCompleted?.[item.levelsCompleted.length - 1] }}
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

      <Pagination v-model="page" :length="totalPages" :total-visible="5" rounded="circle" />
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
}

.content-btns {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  margin-top: 2rem;
}

.main-content-table {
  padding-top: 20px;
  padding-bottom: 10px;
}
</style>
