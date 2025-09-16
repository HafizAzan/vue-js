<script setup>
import Button from '@/components/Button.vue'
import Input from '@/components/Input.vue'
import Loader from '@/components/Loader.vue'
import { ROUTES } from '@/router'
import { useUserStore } from '@/store/useUserStore'
import { fetchQuestions, updatePlayUser } from '@/utils/api-service'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { computed, reactive, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

const { token, setPageName } = useUserStore()
const answers = reactive({})
const router = useRouter()

const { data, isLoading, isPending } = useQuery({
  queryKey: ['get-question'],
  queryFn: fetchQuestions,
})

const { mutateAsync: updateUser, isPending: isUserPending } = useMutation({
  mutationKey: ['updateUser'],
  mutationFn: (payload) => updatePlayUser({ body: payload, userId: token?._id }),
})

const getQuestion = computed(() => data.value?.questions || [])

watchEffect(() => {
  getQuestion.value.forEach((q) => {
    if (!(q._id in answers)) {
      answers[q._id] = ''
    }
  })
})

const handleSubmit = async () => {
  const securityAnswers = getQuestion.value.map((q) => ({
    questionId: q._id,
    answer: answers[q._id]?.trim() || '',
  }))

  const hasEmptyAnswer = securityAnswers.some((ans) => ans.answer === '')

  if (hasEmptyAnswer) {
    toast.error('Please fill out all answers before submitting.')
    return
  }

  const payload = { securityAnswers }

  try {
    const res = await updateUser(payload)
    if (res?.error) {
      toast.error('Something went wrong! Please Try Again')
    } else {
      toast.success('Answers Submitted Successfully!')
      setPageName('')
      getQuestion.value.forEach((q) => {
        answers[q._id] = ''
      })
    }
    router.push(ROUTES?.LEADERBOARD)
  } catch (err) {
    toast.error('Something went wrong!')
  }
}
</script>

<template>
  <v-sheet class="main-form-wrapper" width="700">
    <div v-if="isLoading || isPending">
      <Loader />
    </div>

    <v-form v-else fast-fail @submit.prevent="handleSubmit" class="auth-form">
      <v-typography variants="h3" class="text-h3 h3 form-text">
        Fill out a Questionnaire
      </v-typography>

      <div class="main-input" v-for="(question, index) in getQuestion" :key="question._id || index">
        <Input v-model="answers[question._id]" :label="question.questionText" type="text" />
      </div>

      <Button
        type="submit"
        buttonText="Submit"
        appendIcon="mdi-arrow-right"
        :disabled="isUserPending"
        :isLoading="isUserPending"
      />
    </v-form>
  </v-sheet>
</template>

<style scoped>
.form-text {
  text-align: center;
  margin: 8px 0px;
}

.main-form-wrapper {
  margin: 0 auto;
  margin-top: 20px;
  background-color: transparent;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.main-input {
  height: 30px;
  width: 100%;
  margin-bottom: 25px;
}

.auth-form {
  display: flex;
  justify-content: start;
  align-items: center;
  width: 100%;
  height: 75%;
  background-color: #000000d2;
  padding: 10px;
  display: flex;
  flex-flow: column wrap;
  gap: 20px;
  border-radius: 10px;
  border: 1px solid orange;
}
</style>
