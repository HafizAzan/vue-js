<script setup>
import Button from '@/components/Button.vue'
import DropDownVue from '@/components/DropDown.vue'
import Loader from '@/components/Loader.vue'
import Pagination from '@/components/Pagination.vue'
import Table from '@/components/Table.vue'
import { fetchLeaderBoardData } from '@/utils/api-service'
import { headers } from '@/utils/constant'
import { ref, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import Modal from '@/components/Modal.vue'
import { useUserStore } from '../store/useUserStore'
import { useRouter } from 'vue-router'
import { ROUTES } from '../router'
import { toast } from 'vue-sonner'

const items = [
  { level: 1, title: 'Level 1' },
  { level: 2, title: 'Level 2' },
  { level: 3, title: 'Level 3' },
  { level: 4, title: 'Level 4' },
  { level: 5, title: 'Level 5' },
  { level: 6, title: 'Level 6' },
  { level: 7, title: 'Level 7' },
]

const currentPage = ref(1)
const { resetToken } = useUserStore()
const router = useRouter()

const { data, isLoading, isFetching } = useQuery({
  queryKey: ['leaderboard', currentPage],
  queryFn: () => fetchLeaderBoardData({ page: currentPage.value }),
})

const totalPages = computed(() => data.value?.totalPages || 1)

const leaderboardItems = computed(() => data.value?.data)
const getScore = (item) => {
  if (item.totalScore !== undefined && item.totalScore !== null) {
    return Math.trunc(item.totalScore * 10) / 10
  } else if (item.score !== undefined && item.score !== null) {
    return Math.trunc(item.score * 10) / 10
  } else {
    return 0
  }
}

const handleSelect = (item) => {
  console.log('Selected item:', item)
}

const gamePlay = (action) => {
  if (action === 'leave') {
    resetToken()
    router.push(ROUTES.LOGIN)
    toast.success('You Logout Successfully!')
  }
  console.log('click play next', action)
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
          :items="items"
          buttonText="Filter Levels"
          defaultLocation="bottom"
          @select="handleSelect"
        />
      </main>
    </div>

    <Loader v-if="isLoading || isFetching" color="white" />

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
          <span>
            {{ getScore(item) }}
          </span>
        </template>
      </Table>

      <Pagination
        v-model="currentPage"
        :length="totalPages"
        :total-visible="5"
        rounded="circle"
        modelValue="currentPage"
      />
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
