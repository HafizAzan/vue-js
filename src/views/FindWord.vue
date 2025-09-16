<script setup>
import { useQuery } from '@tanstack/vue-query'
import { fetchAllMcqs, fetchSessionWord, fetchTime } from '@/utils/api-service'
import Loader from '@/components/Loader.vue'
import { computed, ref, watch, onUnmounted } from 'vue'
import { formatTime, useTimer } from '@/utils/constant'
import { usePlayStore } from '@/store/usePlayStore'
import Button from '@/components/Button.vue'

const {
  getTimeForUser,
  setTime,
  clearTimeForUser,
  setSessionTime,
  getSessionTimeForUser,
  clearSessionTimeForUser,
} = usePlayStore()

const selectedOpt = ref(null)

const { data: getTime, isLoading: isTimeloading } = useQuery({
  queryKey: ['get-time'],
  queryFn: fetchTime,
})

const { data: getSessionWord, isLoading: isHiddenWordLoading } = useQuery({
  queryKey: ['get-session-word'],
  queryFn: fetchSessionWord,
})

const { data: getSessionMcq, isLoading: isMcqLoading } = useQuery({
  queryKey: ['get-session-mcq'],
  queryFn: fetchAllMcqs,
})

const getHiddenWord = computed(() => {
  return {
    options: getSessionWord?.value?.options,
    question: getSessionMcq?.value?.data?.[0]?.question,
    cycleTime: getSessionWord?.value?.cycleTime,
  }
})

const getAllTimeData = computed(() => {
  return {
    overAllTime: formatTime(timerSeconds.value),
    animationStopTime: getTime?.value?.time?.animationStopTime,
    animationStartTime: getTime?.value?.time?.animationTime,
  }
})

const timerSeconds = useTimer(
  () => getTime?.value?.time?.overAllTime,
  getTimeForUser,
  setTime,
  clearTimeForUser,
  null,
  true,
)

const timerSessionSeconds = useTimer(
  () => getSessionWord?.value?.cycleTime,
  getSessionTimeForUser,
  setSessionTime,
  clearSessionTimeForUser,
  (val) => console.log('Cycle Timer Left:', formatTime(val)),
  false,
)
</script>

<template>
  <main class="container">
    <div v-if="isTimeloading || isHiddenWordLoading || isMcqLoading">
      <Loader />
    </div>

    <div v-else class="find-word">
      <v-typography variants="h3" class="text-h3 h3">{{ getAllTimeData.overAllTime }}</v-typography>
      <v-typography variants="h2" class="text-h2 h2">{{
        getHiddenWord?.question ?? 'Find The Hidden Word?'
      }}</v-typography>

      <v-typography variants="h6" class="text-subtitle-1 P">Level 01 of 07</v-typography>

      <v-form fast-fail @submit.prevent class="find-word-opt">
        <div v-for="(single, index) in getHiddenWord?.options" :key="single._id || index">
          <v-checkbox
            :label="single"
            :model-value="selectedOpt === single"
            @update:model-value="
              () => {
                if (selectedOpt === single) selectedOpt = null
                else selectedOpt = single
              }
            "
          ></v-checkbox>
        </div>

        <Button type="submit" buttonText="Submit" append-icon="mdi-arrow-right" />
      </v-form>
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
</style>
