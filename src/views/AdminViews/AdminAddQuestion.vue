<script setup>
import BreadCrumb from '@/components/BreadCrumb.vue'
import Button from '@/components/Button.vue'
import Input from '@/components/Input.vue'
import Loader from '@/components/Loader.vue'
import Modal from '@/components/Modal.vue'
import Navigator from '@/components/Navigator.vue'
import { ROUTES } from '@/router'
import {
  adminAddQuestion,
  deleteQuestionById,
  fetchQuestion,
  updateAdminQuestion,
} from '@/utils/admin-api-service'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { computed, reactive, ref, watch } from 'vue'
import { toast } from 'vue-sonner'

const { mutateAsync: AddQuestion, isPending: isAddingQuestion } = useMutation({
  mutationKey: ['admin-add-question'],
  mutationFn: (body) => adminAddQuestion(body),
})

const { mutateAsync: updateQuestion, isPending: isUpdatingQuestion } = useMutation({
  mutationKey: ['admin-update-question'],
  mutationFn: ({ questionId, body }) => updateAdminQuestion({ questionId, body }),
})

const {
  data: fetchAllQuestion,
  isLoading: isGettingQuestion,
  refetch: refetchAllQuestion,
} = useQuery({
  queryKey: ['get-question'],
  queryFn: () => fetchQuestion(),
})

const { mutateAsync: deleteQuestion, isPending: isDeletingQuestion } = useMutation({
  mutationKey: ['delete-question'],
  mutationFn: (questionId) => deleteQuestionById(questionId),
})

const deleteModalOpen = ref(null)
const form = reactive({
  question: '',
  id: '',
})

const adminGetQuestion = computed(() => ({
  queston: fetchAllQuestion?.value?.questions || '',
}))

const editPencil = (data) => {
  form.question = data?.questionText
  form.id = data?._id
}

const openDeleteModal = (data) => {
  deleteModalOpen.value = data?._id
}

const handleSubmit = async () => {
  const body = { questionText: form.question.trim() }
  if (!body.questionText) return toast.error('Please enter a question')
  let res
  if (form.id) {
    res = await updateQuestion({ questionId: form.id, body })
    if (!res?.error) {
      toast.success('Update Question SuccessFully!')
      await refetchAllQuestion()
    } else {
      toast.error('Failed To Add Question')
    }
  } else {
    res = await AddQuestion(body)
    if (!res?.error) {
      toast.success('Add Question SuccessFully!')
      await refetchAllQuestion()
    } else {
      toast.error('Failed To Add Question')
    }
  }

  form.question = ''
}

const deleteQuestionHandler = async () => {
  const res = await deleteQuestion(deleteModalOpen.value)
  if (!res?.error) {
    toast.success('Question Deleted SuccessFully!')
    cancle()
    await refetchAllQuestion()
  } else {
    toast.error('Something Went Wrong!')
  }
}

const cancle = () => {
  form.id = null
  form.question = null
}
</script>

<template>
  <main class="container pb-5">
    <div class="content">
      <v-typography variants="h3" class="text-h3 h3"
        >Admin {{ form.id ? 'Update' : 'Add' }} Question</v-typography
      >
      <Navigator />
    </div>

    <BreadCrumb />

    <main class="main-form-wrapper">
      <h2>Enter Question</h2>
      <v-form fast-fail @submit.prevent="handleSubmit" class="auth-form">
        <div class="main-input">
          <Input
            v-model="form.question"
            :label="form.id ? 'Update Question' : 'Add Question'"
            type="text"
          />
        </div>

        <div class="btns">
          <Button
            type="submit"
            :buttonText="form.id ? 'Update Question' : 'Add Question'"
            appendIcon="mdi-arrow-right"
            :is-loading="isAddingQuestion || isUpdatingQuestion"
            :disabled="isAddingQuestion || isUpdatingQuestion"
          />

          <Button
            v-if="form.id"
            @click="cancle"
            type="button"
            buttonText="Cancel"
            appendIcon="mdi-arrow-right"
          />
        </div>
      </v-form>

      <Loader v-if="isGettingQuestion || isDeletingQuestion" />

      <main v-else class="main-wrapper-text">
        <div
          class="wrapper-text"
          v-for="(single, idx) in adminGetQuestion.queston"
          :key="idx || single?._id"
        >
          <span>Question {{ idx + 1 }}</span>
          <div class="readonly-text">
            <p>{{ single?.questionText }}</p>
            <span class="icons">
              <v-icon @click="editPencil(single)">mdi-pencil</v-icon>
              <v-icon @click="openDeleteModal(single)">mdi-trash-can-outline</v-icon>
            </span>
          </div>
        </div>
      </main>

      <Modal
        v-model="deleteModalOpen"
        v-if="deleteModalOpen !== null"
        title="Confirm Delete"
        prepend-icon="mdi-alert-circle"
        agree-text="Yes"
        disagree-text="No"
        @agree="() => deleteQuestionHandler()"
        max-width="450"
      >
        <p class="text-gray-700 text-center">Are you sure you want to delete this question?</p>
      </Modal>
    </main>
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

.main-form-wrapper,
.main-form-wrapper form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.main-form-wrapper h2 {
  font-size: 1.8rem;
  color: white;
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
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
}

.wrapper-text span {
  color: white;
  font-weight: 700;
  font-size: 1.4rem;
}

.wrapper-text .icons {
  color: white;
  font-weight: 600;
  font-size: 1rem;
  display: inline-flex;
  gap: 10px;
  cursor: pointer;
}

.wrapper-text {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-right: 20px;
}

.main-wrapper-text {
  display: flex;
  flex-direction: column;
  min-height: 400px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 20px;
  margin-top: 20px;
}

.btns {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}
</style>
