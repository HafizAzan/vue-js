<script setup>
import BreadCrumb from '@/components/BreadCrumb.vue'
import Button from '@/components/Button.vue'
import Input from '@/components/Input.vue'
import Loader from '@/components/Loader.vue'
import Modal from '@/components/Modal.vue'
import Navigator from '@/components/Navigator.vue'
import Textarea from '@/components/Textarea.vue'
import { ROUTES } from '@/router'
import {
  adminAddJumbleWord,
  adminUpdateJumbleWord,
  deleteWordById,
  fetchAllJumbleOpt,
} from '@/utils/admin-api-service'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { toast } from 'vue-sonner'

const {
  data: fetchAllWords,
  isLoading: isFetchingWords,
  refetch: refetchAllWords,
} = useQuery({
  queryKey: ['get-jumble-words'],
  queryFn: () => fetchAllJumbleOpt(),
})

const { mutateAsync: deleteThisQuestion, isPending: isDeletingJumbleWords } = useMutation({
  mutationKey: ['delete-jumble-words'],
  mutationFn: (jubmleId) => deleteWordById(jubmleId),
})

const { mutateAsync: addJumbleWords, isPending: isAddingLoader } = useMutation({
  mutationKey: ['add-jumble-words'],
  mutationFn: (body) => adminAddJumbleWord(body),
})

const { mutateAsync: updateJumbleWords, isPending: isUpdatingLoader } = useMutation({
  mutationKey: ['update-jumble-words'],
  mutationFn: ({ id, body }) => adminUpdateJumbleWord({ id, body }),
})

const form = reactive({
  question: '',
  jumbleWords: '',
  id: '',
})
const deleteModalOpen = ref(null)
const editId = ref(null)

const getAllOptions = computed(() => {
  return fetchAllWords?.value?.data?.map((item) => ({
    ...item,
    words: item.words
      .map((word) => word.trim())
      .filter(Boolean)
      .join(', '),
    question: item.question,
  }))
})

onMounted(async () => {
  await refetchAllWords()
  if (getAllOptions.value?.length) {
    form.question = getAllOptions.value[0].question
    form.jumbleWords = getAllOptions.value[0].words
    form.id = getAllOptions.value[0]._id
  }
})

watch(getAllOptions, (newVal) => {
  if (newVal) {
    return newVal.map((single) => {
      form.jumbleWords = single?.words || ''
      form.question = single?.question || ''
      form.id = single?._id || ''
    })
  }
})

const openModal = async () => {
  deleteModalOpen.value = form.id
}

const editable = async () => {
  editId.value = form.id
}

const deleteQuestionHandler = async () => {
  const res = await deleteThisQuestion(deleteModalOpen.value)
  if (res?.error) {
    toast.error(res?.error?.message || res?.error?.data?.message || 'Failed To Deleting')
  } else {
    toast.success('Jumble Word And Question Deleted SuccessFully!')
    deleteModalOpen.value = null
    form.jumbleWords = ''
    form.question = ''
    await refetchAllWords()
  }
}

const handleSubmit = async () => {
  const { jumbleWords, question } = form
  const rawOpt = jumbleWords.trim()

  const wordItems = rawOpt
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  const body = {
    words: wordItems || 'N/A',
    question: question || 'N/A',
  }

  let res

  if (editId.value) {
    res = await updateJumbleWords({ id: editId.value, body })
    if (!res?.error) {
      toast.success('Updated SuccessFully!')
      await refetchAllWords()
      editId.value = null
    } else {
      toast.error('Please Try Again')
    }
  } else {
    res = await addJumbleWords(body)
    if (!res?.error) {
      toast.success('Added SuccessFully!')
      await refetchAllWords()
    } else {
      toast.error('Please Try Again')
    }
  }
}

const breadcrumbItems = [
  {
    title: 'User List',
    disabled: false,
    to: ROUTES.USER_LIST,
  },
  {
    title: 'Admin Jumble Word',
    disabled: true,
    to: ROUTES.ADMIN_ADD_JUMBLE_WORD,
  },
]
</script>

<template>
  <section class="container">
    <div class="content">
      <v-typography variants="h3" class="text-h3 h3">Admin Jumble Word</v-typography>
      <Navigator />
    </div>

    <BreadCrumb :items="breadcrumbItems" />

    <Loader v-if="isFetchingWords || isDeletingJumbleWords" />

    <main class="card-box">
      <v-form fast-fail @submit.prevent="handleSubmit" class="auth-form">
        <div class="label-name">
          <h2>{{ editId ? 'Update' : 'Add' }} Question</h2>
          <span class="icons">
            <v-icon @click="editable">mdi-pencil</v-icon>
            <v-icon @click="openModal">mdi-trash-can-outline</v-icon>
          </span>
        </div>

        <div class="main-input">
          <Input
            v-model="form.question"
            label="Add Question"
            type="text"
            :readonly="form.id && !editId"
          />
        </div>

        <div class="label-name">
          <h2>{{ editId ? 'Update' : 'Add' }} Jumble Words</h2>
        </div>

        <Textarea
          v-model="form.jumbleWords"
          label="Add Jumble Words"
          type="text"
          :readonly="form.id && !editId"
        />

        <div class="btn-control">
          <Button
            type="submit"
            :buttonText="editId ? 'Update' : 'Save'"
            appendIcon="mdi-arrow-right"
            :is-loading="isAddingLoader || isUpdatingLoader"
            :disabled="isAddingLoader || isUpdatingLoader || (form.id && !editId)"
          />
        </div>
      </v-form>

      <Modal
        v-model="deleteModalOpen"
        title="Confirm Delete"
        prepend-icon="mdi-alert-circle"
        agree-text="Yes"
        disagree-text="No"
        max-width="450"
        @agree="() => deleteQuestionHandler()"
      >
        <p class="text-gray-700 text-center">
          Are you sure you want to delete this Question and Jumble Words?
        </p>
      </Modal>
    </main>
  </section>
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

.auth-form {
  height: 100%;
  padding: 10px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.btn-control {
  display: flex;
  align-items: center;
  justify-content: end;
}

.card-box {
  background-color: #1e1e2f;
  width: 100%;
  /* height: 500px; */
  border-radius: 10px;
}

.main-input {
  height: 30px;
  width: 100%;
  margin-bottom: 25px;
}

.icons {
  color: white;
  font-weight: 600;
  font-size: 1rem;
  display: inline-flex;
  gap: 10px;
  cursor: pointer;
}

.label-name {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label-name h2 {
  font-size: 1.7rem;
}
</style>
