<script setup>
import BreadCrumb from '@/components/BreadCrumb.vue'
import Button from '@/components/Button.vue'
import Loader from '@/components/Loader.vue'
import Navigator from '@/components/Navigator.vue'
import { ROUTES } from '@/router'
import { adminAddBackgroundImages, fetchAllBgImg } from '@/utils/admin-api-service'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { computed, onMounted, reactive, ref, watch } from 'vue'

const breadcrumbItems = [
  {
    title: 'User List',
    disabled: false,
    to: ROUTES.USER_LIST,
  },
  {
    title: 'Admin Background Images',
    disabled: true,
    to: ROUTES.ADMIN_ADD_JUMBLE_WORD,
  },
]

const { data: getAllImages, isLoading: isGettingImages } = useQuery({
  queryKey: ['fetch-bg-img'],
  queryFn: fetchAllBgImg,
})

const { mutateAsync: addBgImg, isPending: isAddingImage } = useMutation({
  mutationKey: ['add-bg-img'],
  mutationFn: (body) => adminAddBackgroundImages(body),
})

const defaultImages = reactive({
  home: null,
  register: null,
  login: null,
  answers: null,
  leaderboard: null,
  door: null,
})

onMounted(() => {
  if (getAllImages.value?.length) {
    defaultImages.home = getAllImages.value[0]?.home || ''
    defaultImages.register = getAllImages.value[0]?.register || ''
    defaultImages.login = getAllImages.value[0]?.login || ''
    defaultImages.answers = getAllImages.value[0]?.answers || ''
    defaultImages.leaderboard = getAllImages.value[0]?.leaderboard || ''
    defaultImages.door = getAllImages.value[0]?.door || ''
  }
})

watch(getAllImages, (newVal) => {
  if (newVal?.length) {
    defaultImages.home = newVal[0]?.home || ''
    defaultImages.register = newVal[0]?.register || ''
    defaultImages.login = newVal[0]?.login || ''
    defaultImages.answers = newVal[0]?.answers || ''
    defaultImages.leaderboard = newVal[0]?.leaderboard || ''
    defaultImages.door = newVal[0]?.door || ''
  }
})

const editImgKey = ref(null)
const fileInput = ref(null)

const triggerUpload = (key) => {
  editImgKey.value = key
  fileInput.value?.click()
}

const handleImageChange = (event) => {
  const file = event.target.files[0]
  if (file && editImgKey.value) {
    const reader = new FileReader()
    reader.onload = () => {
      defaultImages[editImgKey.value] = reader.result
    }
    reader.readAsDataURL(file)
  }
}

const allImagesUploaded = computed(() => {
  return Object.values(defaultImages).every((img) => img !== null)
})

const isDisabled = computed(() => {
  if (getAllImages.value?.length) {
    return true
  }
  if (!allImagesUploaded.value) {
    return true
  }

  return false
})

const handleUploadImages = async () => {}
</script>

<template>
  <section class="container">
    <div class="content">
      <v-typography variants="h3" class="text-h3 h3">Admin Add Background Images</v-typography>
      <Navigator />
    </div>

    <BreadCrumb :items="breadcrumbItems" />
    <Loader v-if="isGettingImages" />

    <main class="card-box-wrapper">
      <div
        v-for="([key, value], index) in Object.entries(defaultImages)"
        :key="index"
        class="card-box"
      >
        <div class="card-box-one-row">
          <h3 style="color: white">{{ key.toUpperCase() }}</h3>
          <v-icon class="pencil-icon">mdi-pencil</v-icon>
        </div>

        <div class="upload-img" v-if="!value" @click="triggerUpload(key)">
          <v-icon>mdi-image-size-select-actual</v-icon>
        </div>

        <div class="upload-img" v-if="value">
          <img :src="value" alt="img" />
        </div>
      </div>

      <input ref="fileInput" type="file" accept="image/*" hidden @change="handleImageChange" />
    </main>

    <Button
      button-text="Upload BackGround Images"
      :disabled="isDisabled"
      @click="handleUploadImages"
    />
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
  width: 15rem;
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
</style>
