<script setup>
import Accordion from '@/components/Accordion.vue'
import Input from '@/components/Input.vue'
import Loader from '@/components/Loader.vue'
import Navigator from '@/components/Navigator.vue'
import { fetchUserId } from '@/utils/admin-api-service'
import { formatDateTimeUTC } from '@/utils/constant'
import { useQuery } from '@tanstack/vue-query'
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const userId = route.params.userId

const { data: singleUser, isLoading: isSingleUserLoading } = useQuery({
  queryKey: ['user-detail', userId],
  queryFn: () => fetchUserId(userId),
  enabled: !!userId,
})

const user = computed(() => singleUser.value.user || null)
const playData = computed(() => singleUser.value?.playData || null)

const itemList = computed(() => {
  const items = [
    {
      title: 'User Id',
      value: user.value?._id,
    },
    {
      title: 'Username',
      value: user.value?.userName,
    },
    {
      title: 'Joining Date',
      value: formatDateTimeUTC(user.value?.createdAt),
    },
    {
      title: 'New Assign Section',
      value: user.value?.section,
    },
  ]

  if (user.value?.email) {
    items.push({
      title: 'Email',
      value: user.value.email,
    })
  }

  return items
})

const playDataItems = computed(() => {
  if (!playData.value) return []

  const items = playData.value.map((item) => {
    const totalScore = item.sessions?.reduce((acc, val) => acc + (val.score || 0), 0) || 0

    return {
      title: `Level ${item.level}` || 'No Title',
      details: [
        { label: 'Level Id', value: item?._id || '-' },
        { label: 'Total Score', value: totalScore },
        { label: 'Section', value: item.section || '-' },
        { label: 'Complete Time (secs)', value: item.completeTime ?? '-' },
        { label: 'Playing Date', value: formatDateTimeUTC(item.createdAt) },
      ],
      epochs:
        item.sessions?.map((session) => ({
          label: session.session,
          value: [
            { label: 'Id', value: session?._id ?? '-' },
            { label: 'Score', value: session.score ?? '-' },
            { label: 'Answer', value: session.answer ?? 'NA' },
            { label: 'Time (secs)', value: session.time ?? '0' },
            { label: 'Answer is Right?', value: session.isCorrect ?? 'false' },
          ],
        })) || [],
    }
  })

  return items
})
</script>

<template>
  <main class="container">
    <div class="content">
      <v-typography variants="h3" class="text-h3 h3">User Details</v-typography>
      <Navigator />
    </div>

    <Loader v-if="isSingleUserLoading" />

    <div v-else class="disabled-form">
      <div v-for="(item, index) in itemList" :key="index" class="disabled-form-row">
        <strong class="user-title">{{ item.title }}</strong>
        <div class="main-input">
          <div class="readonly-text">{{ item.value || '-' }}</div>
        </div>
      </div>

      <div v-if="playData?.length" class="disabled-form-row">
        <Accordion :items="playDataItems" />
      </div>
    </div>
  </main>
</template>

<style scoped>
.content {
  padding-top: 6rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  flex-wrap: wrap;
  gap: 20px;
  padding-bottom: 1rem;
}

.disabled-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 100%;
  background-color: #1e1e2f;
  border-radius: 10px;
  padding: 20px 10px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.6);
  margin-bottom: 1rem;
}

.disabled-form-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  padding: 12px 15px;
  background-color: #2a2a3d;
  border-radius: 8px;
  box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.3);
  transition: background-color 0.3s ease;
}

.readonly-text {
  background-color: #12121f;
  border: 1px solid #555a7b;
  border-radius: 8px;
  color: white;
  padding: 8px 15px;
  font-size: 16px;
  letter-spacing: 0.03em;
  min-height: 38px;
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: text;
}

.disabled-form-row:hover {
  background-color: #3b3b58;
}

.user-title {
  font-size: 20px;
  font-weight: 700;
  color: #dcdde1;
  min-width: 140px;
}

.main-input {
  flex: 1;
}

.main-input input {
  background-color: #12121f !important;
  border: 1px solid #555a7b;
  border-radius: 8px;
  color: white !important;
  padding: 8px 15px;
  font-size: 16px;
  letter-spacing: 0.03em;
  cursor: not-allowed;
  box-shadow: none !important;
  transition: border-color 0.25s ease;
}

.main-input input:focus {
  outline: none;
  border-color: #6c5ce7;
  box-shadow: 0 0 8px #6c5ce7;
}

@media (max-width: 600px) {
  .disabled-form,
  .disabled-form-row {
    padding: 10px;
    flex-wrap: wrap;
    gap: 5px;
  }

  .user-title {
    font-size: 16px;
  }

  :deep(.v-expansion-panel-text__wrapper) {
    padding: 5px 20px;
  }
}

@media (max-width: 410px) {
  .text-h3 {
    font-size: 1.5rem !important;
  }
}
</style>
