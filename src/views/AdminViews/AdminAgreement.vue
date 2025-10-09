<script setup>
import Navigator from '@/components/Navigator.vue'
import JoditEditor from '@/components/JoditEditor.vue'
import { onMounted, ref, watch } from 'vue'
import Button from '@/components/Button.vue'
import Tooltip from '@/components/Tooltip.vue'
import { useMutation, useQuery } from '@tanstack/vue-query'
import {
  adminAddAgreement,
  adminUpdateAgreement,
  deleteAgreementById,
  fetchAllAgreement,
} from '@/utils/admin-api-service'
import Loader from '@/components/Loader.vue'
import { toast } from 'vue-sonner'
import Modal from '@/components/Modal.vue'

const agreement = ref('')
const agreementId = ref(null)
const previewModal = ref(false)
const deleteModal = ref(false)
const joditKey = ref(Date.now())

const {
  data: getAgreement,
  isLoading: isLoadAgreement,
  refetch: refetchGetAgreement,
} = useQuery({
  queryKey: ['get-agreement'],
  queryFn: fetchAllAgreement,
})

const { mutateAsync: addAgreementText, isPending: isAddingText } = useMutation({
  mutationKey: ['add-agreement'],
  mutationFn: (body) => adminAddAgreement(body),
})

const { mutateAsync: updateAgreementText, isPending: isUpdatingText } = useMutation({
  mutationKey: ['update-agreement'],
  mutationFn: ({ id, body }) => adminUpdateAgreement({ id, body }),
})

const { mutateAsync: deleteAgreementText, isPending: isDeletingText } = useMutation({
  mutationKey: ['delete-agreement'],
  mutationFn: (id) => deleteAgreementById(id),
})

const handleSubmit = async () => {
  const response = await addAgreementText({ agreementText: agreement.value })
  if (response?.error) {
    toast.error(response?.error?.message || 'Failed To Submit Please Try Again!')
  } else {
    toast.success(response?.data?.message || 'Agreement Added SuccessFully!')
    await refetchGetAgreement()
  }
}

const deleteAgreement = async () => {
  const res = await deleteAgreementText(agreementId.value)
  if (res?.error) {
    toast.error(res?.error?.message || 'Failed To Delete Please Try Again!')
  } else {
    toast.success(res?.data?.message || 'Agreement Deleted SuccessFully!')
    agreement.value = ''
    agreementId.value = null
    joditKey.value = Date.now()
    await refetchGetAgreement()
  }
}

const updateAgreementHandler = async () => {
  const res = await updateAgreementText({
    id: agreementId.value,
    body: { agreementText: agreement.value },
  })

  if (res?.error) {
    toast.error(res?.error?.message || 'Failed To Update Please Try Again!')
  } else {
    toast.success(res?.data?.message || 'Agreement Updated SuccessFully!')
    await refetchGetAgreement()
  }
}

const updateAgreementState = () => {
  const data = getAgreement?.value?.[0]
  if (data) {
    agreement.value = data.agreementText
    agreementId.value = data._id
  } else {
    agreement.value = ''
    agreementId.value = null
  }
}

watch(getAgreement, updateAgreementState)
onMounted(updateAgreementState)

const previewModalHandler = () => (previewModal.value = true)

const modalStyle = {
  padding: '15px',
  background: 'rgba(255, 255, 255, 0.82)',
  borderRadius: '8px',
  color: 'black',
  minHeight: '500px',
  overflowY: 'auto',
}
</script>
<template>
  <section class="container">
    <div class="content">
      <v-typography variants="h3" class="text-h3 h3">Admin Agreement</v-typography>
      <Navigator />
    </div>

    <Loader v-if="isLoadAgreement || isAddingText || isDeletingText || isUpdatingText" />

    <div v-else class="card-box-wrapper">
      <div class="heading">
        <div class="upload-title">
          <h4 class="card-box-title">Admin Add Agreement</h4>
        </div>

        <div class="wrapper-icons" v-if="agreementId">
          <Tooltip text="Preview">
            <v-icon color="white" size="40" class="upload-icon" @click="previewModalHandler">
              mdi-eye-circle
            </v-icon>
          </Tooltip>

          <Tooltip text="Update">
            <v-icon color="white" size="40" class="upload-icon" @click="updateAgreementHandler">
              mdi-pencil-circle
            </v-icon>
          </Tooltip>

          <Tooltip text="Delete">
            <v-icon color="white" size="40" class="upload-icon" @click="deleteModal = true">
              mdi-delete-circle
            </v-icon>
          </Tooltip>
        </div>
      </div>

      <v-form fast-fail @submit.prevent="handleSubmit" class="auth-form">
        <JoditEditor v-model="agreement" :key="joditKey" />

        <div class="main-btn-wrapper" v-if="!agreementId" :key="joditKey">
          <Button button-text="Submit" :is-loading="isAddingText" type="submit" />
        </div>
      </v-form>

      <Modal
        v-model="previewModal"
        max-width="800"
        :close-on-outside-click="true"
        :showActions="false"
      >
        <template #prependIcon>
          <div class="preview-icon">
            <v-icon size="40" @click="previewModal = false" color="white">
              mdi-window-close
            </v-icon>
          </div>
        </template>
        <div class="modal-preview" v-html="agreement" :style="modalStyle"></div>
      </Modal>

      <Modal
        v-model="deleteModal"
        title="Delete Agreement!"
        prepend-icon="mdi-alert-circle"
        agree-text="Yes"
        disagree-text="No"
        @agree="deleteAgreement"
        max-width="450"
      >
        <p class="text-gray-700 text-center">Do You Want To Delete This Agreement?</p>
      </Modal>
    </div>
  </section>
</template>

<style>
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

.card-box-wrapper {
  background-color: #1e1e2f;
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  border-radius: 12px;
}

.main-btn-wrapper {
  display: flex;
  justify-content: end;
  align-items: center;
  width: 100%;
  padding-top: 16px;
}

.heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.upload-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.upload-icon {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.upload-icon:hover {
  transform: scale(1.1);
}

.card-box-title {
  font-size: 1.8rem !important;
  font-weight: 400 !important;
  color: #fff;
}

.wrapper-icons {
  display: inline-flex;
  align-items: center;
  gap: 18px;
}

.auth-form {
  width: 100%;
}

.modal-preview {
  overflow-y: auto;
  max-height: 325px;
  min-height: 500px !important;
}

.v-dialog > .v-overlay__content > .v-card {
  overflow-y: auto;
}

.preview-icon {
  display: flex;
  justify-content: end;
  cursor: pointer;
  width: 95%;
  padding-top: 10px;
  /* position: absolute;
  right: 30px;
  top: 40px; */
}
</style>
