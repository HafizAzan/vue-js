<script setup>
import BreadCrumb from '@/components/BreadCrumb.vue'
import Button from '@/components/Button.vue'
import Input from '@/components/Input.vue'
import Loader from '@/components/Loader.vue'
import Modal from '@/components/Modal.vue'
import Navigator from '@/components/Navigator.vue'
import { ROUTES } from '@/router'
import { useUserStore } from '@/store/useUserStore'
import { fetchAdminProfile, updateAdminProfile } from '@/utils/admin-api-service'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { computed, reactive, ref, watch } from 'vue'
import { toast } from 'vue-sonner'

const {
  data: getAdminData,
  isLoading: isAdminLoading,
  refetch: refetchAdminProfile,
} = useQuery({
  queryKey: ['admin-profile'],
  queryFn: () => fetchAdminProfile(),
})

const { mutateAsync: editAdminProfile, isPending: isUpdatingAdminProfile } = useMutation({
  mutationKey: ['update-admin-profile'],
  mutationFn: ({ adminId, body }) => updateAdminProfile({ adminId, body }),
})

const adminData = computed(() => {
  const data = getAdminData.value
  return {
    userName: data?.admin?.userName ?? '-',
    email: data?.admin?.email ?? '-',
    password: data?.admin?.password ?? '-',
    id: data?.admin?.id ?? '-',
  }
})

const userStore = useUserStore()
const openInfoModal = ref(null)
const form = reactive({
  userName: '',
  email: '',
  password: '',
  c_password: '',
  r_password: '',
})

const editModal = (type) => {
  if (type === 'all') {
    form.userName = adminData.value.userName || ''
    form.email = adminData.value.email || ''
    openInfoModal.value = 'all'
  } else if (type === 'password') {
    form.password = ''
    form.c_password = ''
    form.r_password = ''
    openInfoModal.value = 'password'
  }
}

const handleSubmit = async () => {
  const { userName, email } = form
  const response = await editAdminProfile({
    adminId: userStore?.token?._id || userStore?.token?.adminId,
    body: { userName, email },
  })

  if (!response?.error) {
    toast.success('Admin Info SuccessFully!')
    userStore.setToken({ ...response?.token, loginAs: 'admin' })
    openInfoModal.value = null
    await refetchAdminProfile()
  } else {
    toast.error('Something Went Wrong!')
  }
}

const handlePasswordSubmit = async () => {
  const { password, c_password, r_password } = form

  if (!password || !c_password || !r_password) {
    toast.error('Please fill all password fields')
    return
  }

  if (password !== adminData?.value?.password) {
    toast.error('Current Password Not Match')
    return
  }

  if (c_password !== r_password) {
    toast.error('Passwords do not match')
    return
  }

  const response = await editAdminProfile({
    adminId: userStore?.token?._id || userStore?.token?.adminId,
    body: { password: c_password },
  })

  if (!response?.error) {
    toast.success('Password Successfully Updated!')
    userStore.setToken({ ...response?.token, loginAs: 'admin' })
    openInfoModal.value = null
    await refetchAdminProfile()
  } else {
    toast.error('Something Went Wrong!')
  }

  form.c_password = ''
  form.r_password = ''
  form.password = ''
}
</script>

<template>
  <main class="container">
    <div class="content">
      <v-typography variants="h3" class="text-sm-h3 text-h4 h3">Admin Profile</v-typography>
      <Navigator />
    </div>

    <BreadCrumb />

    <Loader v-if="isAdminLoading" />

    <main v-else class="main-card-wrapper">
      <div class="card">
        <div class="card-header">
          <h4>Admin Overview</h4>
          <v-icon @click="editModal('all')">mdi-pencil</v-icon>
        </div>

        <div class="card-info">
          <strong>Username : </strong>
          <span>
            {{ adminData?.userName }}
          </span>
        </div>

        <div class="card-info">
          <strong>Email : </strong>
          <span>
            {{ adminData?.email }}
          </span>
        </div>

        <div class="card-info">
          <strong>Profile ID : </strong>
          <span>
            {{ adminData?.id }}
          </span>
        </div>

        <div class="card-btn">
          <Button button-text="Update Password" @click="editModal('password')" />
        </div>

        <Modal
          v-model="openInfoModal"
          v-if="openInfoModal === 'all'"
          max-width="450"
          :show-actions="false"
        >
          <template #title>
            <p class="form-title">Edit Admin Info</p>
          </template>

          <v-form fast-fail @submit.prevent="handleSubmit" class="auth-form">
            <div class="main-input">
              <Input v-model="form.userName" label="Username" type="text" />
            </div>

            <div class="main-input">
              <Input v-model="form.email" label="Email" type="email" />
            </div>

            <Button
              type="submit"
              buttonText="Submit"
              appendIcon="mdi-arrow-right"
              :is-loading="isUpdatingAdminProfile"
              :disabled="isUpdatingAdminProfile"
            />
          </v-form>
        </Modal>

        <Modal
          v-model="openInfoModal"
          v-if="openInfoModal === 'password'"
          max-width="450"
          :show-actions="false"
        >
          <template #title>
            <p class="form-title">Edit Admin Password</p>
          </template>

          <v-form fast-fail @submit.prevent="handlePasswordSubmit" class="auth-form">
            <div class="main-input">
              <Input v-model="form.password" label="Current Password" type="password" />
            </div>

            <div class="main-input">
              <Input v-model="form.c_password" label="Confirm Password" type="password" />
            </div>

            <div class="main-input">
              <Input v-model="form.r_password" label="Repeat Password" type="password" />
            </div>

            <Button
              type="submit"
              buttonText="Submit"
              appendIcon="mdi-arrow-right"
              :is-loading="isUpdatingAdminProfile"
              :disabled="isUpdatingAdminProfile"
            />
          </v-form>
        </Modal>
      </div>
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

.main-card-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 3rem;
  margin-bottom: 3rem;
}

.card {
  background: linear-gradient(45deg, #6a11cb 0%, #2575fc 100%);
  width: 30rem;
  height: 100%;
  border-radius: 10px;
  padding: 30px 35px;
}

@media (max-width: 400px) {
  .card {
    background: linear-gradient(45deg, #6a11cb 0%, #2575fc 100%);
    width: 20rem;
    height: 100%;
    border-radius: 10px;
    padding: 30px 20px;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header h4 {
  font-size: 28px;
  color: white;
  font-weight: 700;
  letter-spacing: 0.8px;
}

.card-header i {
  font-size: 28px;
  color: white;
  cursor: pointer;
}

.card-info {
  margin-bottom: 10px;
}

.card-info strong {
  font-size: 20px;
  color: white;
}

.card-info span {
  font-size: 20px;
  color: white;
}

.card-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 0 auto;
  margin-top: 25px;
}

.auth-form {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 65%;
  padding: 10px;
  display: flex;
  flex-flow: column wrap;
  gap: 20px;
}

.form-title {
  font-size: 2.4rem;
  padding-top: 20px;
}

.main-input {
  height: 30px;
  width: 100%;
  margin-bottom: 25px;
}
</style>
