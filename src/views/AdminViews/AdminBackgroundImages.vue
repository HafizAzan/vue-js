<script setup>
import BreadCrumb from '@/components/BreadCrumb.vue'
import Button from '@/components/Button.vue'
import Loader from '@/components/Loader.vue'
import Navigator from '@/components/Navigator.vue'
import Tooltip from '@/components/Tooltip.vue'
import { ROUTES } from '@/router'
import {
  adminAddBackgroundImages,
  fetchAllBgImg,
  updateAddBackgroundImages,
} from '@/utils/admin-api-service'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { toast } from 'vue-sonner'

const {
  data: getAllImages,
  isLoading: isGettingImages,
  refetch: refetchAllImages,
} = useQuery({
  queryKey: ['fetch-bg-img'],
  queryFn: fetchAllBgImg,
})

const { mutateAsync: addBgImg, isPending: isAddingImage } = useMutation({
  mutationKey: ['add-bg-img'],
  mutationFn: (body) => adminAddBackgroundImages(body),
})

const { mutateAsync: updateBgImg, isPending: isUpdatingImage } = useMutation({
  mutationKey: ['update-bg-img'],
  mutationFn: ({ id, body }) => updateAddBackgroundImages({ id, body }),
})

const defaultImages = reactive({
  home: { preview: null, name: null, file: null },
  register: { preview: null, name: null, file: null },
  login: { preview: null, name: null, file: null },
  answers: { preview: null, name: null, file: null },
  leaderboard: { preview: null, name: null, file: null },
  door: { preview: null, name: null, file: null },
})

const uploadImgId = ref(null)

onMounted(() => {
  const imgData = getAllImages.value?.[0]
  if (imgData) {
    Object.keys(defaultImages).forEach((key) => {
      defaultImages[key].preview = imgData[key] || null
      defaultImages[key].file = null
      defaultImages[key].name = null
    })
    uploadImgId.value = imgData._id || null
  }
})

watch(getAllImages, (newVal) => {
  const imgData = newVal?.[0]
  if (imgData) {
    Object.keys(defaultImages).forEach((key) => {
      defaultImages[key].preview = imgData[key] || null
      defaultImages[key].file = null
      defaultImages[key].name = null
    })
    uploadImgId.value = imgData._id || null
  }
})

const editImgKey = ref(null)
const fileInput = ref(null)

const triggerUpload = (key) => {
  editImgKey.value = key
  fileInput.value?.click()
}

const MAX_SIZE_MB = 15

const handleImageChange = async (event) => {
  const file = event.target.files[0]

  if (!file || !editImgKey.value) {
    toast.error('No file selected or unknown upload key.')
    return
  }

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    toast.error(`File too large! Max size is ${MAX_SIZE_MB}MB`)
    return
  }

  try {
    const reader = new FileReader()
    reader.onload = () => {
      defaultImages[editImgKey.value].name = file?.name
      defaultImages[editImgKey.value].preview = reader.result
      defaultImages[editImgKey.value].file = file
    }
    reader.readAsDataURL(file)

    if (uploadImgId.value) {
      const formData = new FormData()
      formData.append(editImgKey.value, file)

      const response = await updateBgImg({
        id: uploadImgId.value,
        body: formData,
      })

      if (response?.error) {
        toast.error('Upload failed: ' + (response.error?.message || 'Server error'))
      } else {
        toast.success('Image uploaded successfully!')
        refetchAllImages?.()
      }
    }
  } catch (error) {
    toast.error('An error occurred during upload.')
  } finally {
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

const allImagesUploaded = computed(() => {
  return Object.values(defaultImages).every((img) => img.file !== null)
})

const isDisabled = computed(() => {
  if (getAllImages.value?.length) {
    return true
  }

  return !allImagesUploaded.value
})

const handleUploadImages = async () => {
  if (!uploadImgId.value) {
    const formData = new FormData()

    Object.entries(defaultImages).forEach(([key, item]) => {
      if (item.file) {
        formData.append(key, item.file)
      }
    })

    try {
      const response = await addBgImg(formData)
      if (response?.error) {
        toast.error('Upload failed: ' + (response.error?.message || 'Server error'))
      } else {
        toast.success('Images uploaded successfully!')
        refetchAllImages?.()
      }
    } catch (error) {
      toast.error('Error during upload.')
    } finally {
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }
  }
}
</script>

<template>
  <section class="container" id="add-background-images">
    <div class="content">
      <v-typography variants="h3" class="text-sm-h3 text-h4 h3"
        >Admin Add Background Images</v-typography
      >
      <Navigator />
    </div>

    <BreadCrumb />
    <Loader v-if="isGettingImages || isUpdatingImage || isAddingImage" />

    <main class="card-box-wrapper">
      <div
        v-for="([key, value], index) in Object.entries(defaultImages)"
        :key="index"
        class="card-box"
      >
        <div class="card-box-one-row">
          <h3 style="color: white">{{ key.toUpperCase() }}</h3>
          <Tooltip text="Edit Photo">
            <v-icon class="pencil-icon" @click="triggerUpload(key)">mdi-pencil</v-icon>
          </Tooltip>
        </div>

        <div class="upload-img" v-if="!value?.preview" @click="triggerUpload(key)">
          <v-icon>mdi-image-size-select-actual</v-icon>
        </div>

        <div class="upload-img" v-if="value?.preview">
          <img :src="value?.preview || value?.file" alt="img" />
        </div>
      </div>

      <input ref="fileInput" type="file" accept="image/*" hidden @change="handleImageChange" />
    </main>

    <Tooltip :disabled="isDisabled" text="Upload All Images">
      <Button
        button-text="Upload BackGround Images"
        :disabled="isDisabled || isAddingImage"
        :is-loading="isAddingImage"
        @click="handleUploadImages"
      />
    </Tooltip>
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

.card-box-wrapper {
  display: flex;
  gap: 20px;
  flex-flow: row wrap;
  margin-bottom: 20px;
  justify-content: stretch;
  background-color: transparent !important;
}

.card-box {
  background-color: #1e1e2f;
  height: 270px;
  border-radius: 10px;
  flex: 1 1 auto;
  padding: 15px;
}

.card-box-one-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pencil-icon {
  color: white;
  cursor: pointer;
}

.upload-img i {
  color: white;
  cursor: pointer;
  font-size: 230px;
}

.upload-img {
  height: 13rem;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 10px;
  overflow: hidden;
  border-radius: 10px;
}

.upload-img img {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  object-fit: cover;
  transition: all ease 500ms;
  overflow: hidden;
}

.upload-img img:hover {
  transform: scale(1.1);
  cursor: pointer;
}

#add-background-images {
  padding-bottom: 10px;
}
</style>
