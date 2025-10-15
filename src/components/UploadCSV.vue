<script setup>
import { ref } from 'vue'
import Tooltip from './Tooltip.vue'
import { toast } from 'vue-sonner'
import { adminAddValues, deleteAllValue } from '@/utils/admin-api-service'
import { useMutation } from '@tanstack/vue-query'
import Modal from './Modal.vue'
import Button from './Button.vue'

const props = defineProps({
  refetch: {
    type: Function,
    default: () => {},
  },
})

const fileInputRef = ref(null)
const isUploading = ref(false)
const assignArrayModal = ref(false)
const progress = ref(0)

const { mutateAsync: addValues } = useMutation({
  mutationKey: ['upload-values'],
  mutationFn: ({ formData, config }) => adminAddValues(formData, config),
})

const { mutateAsync: deleteAllValues, isPending: isDeleting } = useMutation({
  mutationKey: ['delete-all-values'],
  mutationFn: () => deleteAllValue(),
})

const triggerFileInput = () => {
  if (!isUploading.value) {
    fileInputRef.value.value = ''
    fileInputRef.value.click()
  }
  assignArrayModal.value = false
}

const deleteArrayHandler = async () => {
  const res = await deleteAllValues()
  const num = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
  assignArrayModal.value = false

  if (res?.error) {
    toast.error(res?.error?.message || res?.error?.data?.message || 'Failed To Delete All Values')
  } else {
    const message = String(res?.data?.message || res?.message).trim()
    const anyNumberFound = num.some((val) => message.includes(val))
    if (!anyNumberFound && message.includes(0)) {
      toast.error(message || 'No Items Deleted')
    } else {
      toast.success(message || 'Items Deleted SuccessFully')
    }
    await refetch()
  }
}

const uploadFile = async (file) => {
  isUploading.value = true
  progress.value = 0

  const formData = new FormData()
  formData.append('file', file)

  let uploadProgress = 0

  try {
    const response = await addValues({
      formData,
      config: {
        onUploadProgress: (event) => {
          const percent = Math.round((event.loaded * 100) / event.total)
          uploadProgress = percent > 99 ? 99 : percent
          progress.value = uploadProgress
        },
      },
    })

    progress.value = 100

    if (response?.error) {
      toast.error(response.error.message || 'Upload failed')
    } else {
      toast.success(response.message || 'File uploaded successfully!')
      props.refetch()
    }
  } catch (err) {
    toast.error('Network or server error')
  } finally {
    setTimeout(() => {
      isUploading.value = false
      progress.value = 0
    }, 800)
  }
}

const handleFileChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ]

  if (!allowedTypes.includes(file.type)) {
    e.target.value = ''
    toast.error('Please upload a valid Excel (.xls or .xlsx) file')
    return
  }

  await uploadFile(file)
}
</script>

<template>
  <div class="item-add">
    <input
      type="file"
      ref="fileInputRef"
      accept=".xls,.xlsx"
      style="display: none"
      @change="handleFileChange"
      :disabled="isUploading"
    />

    <Tooltip text="Upload Array">
      <v-icon
        @click="assignArrayModal = true"
        :class="{ 'icon-disabled': isUploading }"
        class="upload-icon"
      >
        mdi-file-upload-outline
      </v-icon>
    </Tooltip>

    <div v-if="isUploading" class="upload-overlay">
      <div class="progress-content">
        <p class="uploading-text">
          {{ Number(progress) === 100 ? 'Uploaded SuccessFully!' : 'Uploading...' }}
        </p>

        <v-progress-linear
          :model-value="progress"
          color="purple"
          height="15"
          rounded="lg"
          striped
          :indeterminate="false"
          class="progress-bar"
        ></v-progress-linear>

        <p class="progress-percent">{{ progress }}%</p>
      </div>
    </div>

    <Modal v-model="assignArrayModal" max-width="500" :showActions="false">
      <template #title>
        <v-icon size="70" class="modal-upload-icon">mdi-file-upload</v-icon>
        <p class="modal-main-title">
          Do you want to upload a new array or delete all existing data?
        </p>

        <div class="main-btn-wrapper">
          <Button button-text="Upload Array" type="button" @click="triggerFileInput" />
          <Button
            button-text="Delete All Array"
            type="button"
            @click="deleteArrayHandler"
            :is-loading="isDeleting"
            :disabled="isDeleting"
          />
        </div>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.upload-icon {
  font-size: 3.4rem;
  cursor: pointer;
  padding: 10px;
  transition: opacity 0.2s ease;
}

.upload-icon:hover {
  transform: scale(1) !important;
}

.icon-disabled {
  opacity: 0.5;
  pointer-events: none;
}
.upload-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}
.progress-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 300px;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
.uploading-text {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}
.progress-percent {
  font-size: 1rem;
  font-weight: 500;
  color: #555;
}
.progress-bar {
  transition: width 0.3s linear !important;
}

.modal-main-title {
  font-size: 20px !important;
  font-weight: 400;
  padding: 0px 10px;
  padding-top: 10px;
  text-align: center;
}

.main-btn-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding-top: 16px;
  gap: 10px;
}

.modal-upload-icon {
  padding-top: 20px;
  padding-bottom: 10px;
}

:deep(.v-card-text) {
  padding: 0.3rem !important;
}

@media (max-width: 420px) {
  .upload-icon {
    font-size: 2rem;
  }
}
</style>
