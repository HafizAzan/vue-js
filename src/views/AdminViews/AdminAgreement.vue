<script setup>
import Navigator from '@/components/Navigator.vue'
import JoditEditor from '@/components/JoditEditor.vue'
import { computed, onMounted, ref, watch } from 'vue'
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
const openPreviewModal = ref(null)
const previewModal = ref(false)
const deleteModal = ref(false)
const joditKey = ref(Date.now())
const activeRole = ref('web')
const editModalOpen = ref(null)

const {
  data: getAgreement,
  isLoading: isLoadAgreement,
  isFetching: isFetchingAgreement,
  refetch: refetchGetAgreement,
} = useQuery({
  queryKey: ['get-agreement', activeRole.value],
  queryFn: () => fetchAllAgreement(activeRole.value),
})

const { mutateAsync: addAgreementText, isPending: isAddingText } = useMutation({
  mutationKey: ['add-agreement'],
  mutationFn: (body) => adminAddAgreement(body),
})

const { mutateAsync: updateAgreementText, isPending: isUpdatingText } = useMutation({
  mutationKey: ['update-agreement'],
  mutationFn: ({ body }) => adminUpdateAgreement({ body }),
})

const { mutateAsync: deleteAgreementText, isPending: isDeletingText } = useMutation({
  mutationKey: ['delete-agreement'],
  mutationFn: (id) => deleteAgreementById(id),
})

const handleSubmit = async (type) => {
  const response = await addAgreementText({
    agreementText: agreement.value,
    agreementRole: 'web' || type,
  })
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

const updateAgreementHandler = async (type) => {
  editModalOpen.value = false
  const res = await updateAgreementText({
    body: { agreementText: agreement.value, agreementRole: type },
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
    agreement.value = data?.agreementText
    agreementId.value = data?._id
  } else {
    agreement.value = ''
    agreementId.value = null
  }
}

watch(getAgreement, updateAgreementState)
onMounted(updateAgreementState)

const previewModalHandler = () => (previewModal.value = true)

const viewHandler = async (type) => {
  previewModal.value = false
  openPreviewModal.value = type
  activeRole.value = type
  await refetchGetAgreement()
}

const previewModalWidth = computed(() => {
  if (openPreviewModal.value === 'mobile') return 500
  if (openPreviewModal.value === 'web') return 800
  return 0
})

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
      <v-typography variants="h3" class="text-sm-h3 text-h4 h3">Admin Agreement</v-typography>
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
            <v-icon color="white" size="40" class="upload-icon" @click="editModalOpen = true">
              mdi-pencil-circle
            </v-icon>
          </Tooltip>

          <!-- <Tooltip text="Delete">
            <v-icon color="white" size="40" class="upload-icon" @click="deleteModal = true">
              mdi-delete-circle
            </v-icon>
          </Tooltip> -->
        </div>
      </div>

      <v-form fast-fail @submit.prevent="handleSubmit('web')" class="auth-form">
        <JoditEditor v-model="agreement" :key="joditKey" />

        <div class="main-btn-wrapper" v-if="!agreementId" :key="joditKey">
          <Button button-text="Submit" :is-loading="isAddingText" type="submit" />
        </div>
      </v-form>

      <Modal
        v-model="previewModal"
        max-width="450"
        :close-on-outside-click="true"
        :showActions="false"
      >
        <template #prependIcon>
          <div class="preview-icon">
            <h2>Agreement Preview</h2>
            <v-icon size="40" @click="previewModal = false" color="white">
              mdi-window-close
            </v-icon>
          </div>

          <div class="btn-wrraper">
            <Button button-text="Web View" type="button" @click="viewHandler('web')" />
            <Button button-text="Mobile View" type="button" @click="viewHandler('mobile')" />
          </div>
        </template>
      </Modal>

      <Loader v-if="isFetchingAgreement" />

      <Modal
        v-else
        v-model="openPreviewModal"
        :max-width="previewModalWidth"
        :close-on-outside-click="true"
        :showActions="false"
      >
        <template #prependIcon>
          <div class="view-icon">
            <v-icon size="40" @click="openPreviewModal = null" color="white">
              mdi-window-close
            </v-icon>
          </div>
        </template>
        <div class="modal-preview" v-html="agreement" :style="modalStyle"></div>
      </Modal>

      <Modal
        v-model="editModalOpen"
        max-width="450"
        :close-on-outside-click="true"
        :showActions="false"
      >
        <template #prependIcon>
          <div class="preview-icon">
            <h2>Update Agreement</h2>
            <v-icon size="40" @click="editModalOpen = false" color="white">
              mdi-window-close
            </v-icon>
          </div>

          <div class="btn-wrraper-main">
            <Button button-text="Web" type="button" @click="updateAgreementHandler('web')" />
            <Button button-text="Mobile" type="button" @click="updateAgreementHandler('mobile')" />
            <Button button-text="Both" type="button" @click="updateAgreementHandler('both')" />
          </div>
        </template>
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
  gap: 5px;
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
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  width: 95%;
  padding-top: 10px;
  text-transform: capitalize;
}

.view-icon {
  display: flex;
  justify-content: end;
  cursor: pointer;
  width: 95%;
  padding-top: 10px;
}

.preview-icon h2 {
  font-size: 35px;
  font-weight: 600;
}

.btn-wrraper {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-top: 30px;
}

.btn-wrraper-main {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding-top: 30px;
}

@media (max-width: 410px) {
  .wrapper-icons {
    gap: 0px;
  }

  .wrapper-icons i {
    font-size: 30px !important;
  }
}

@media (max-width: 785px) {
  .content {
    flex-direction: row !important;
  }
}

@media (max-width: 600px) {
  .card-box-title {
    font-size: 1.4rem !important;
    font-weight: 400 !important;
    color: #fff;
  }
}
</style>
