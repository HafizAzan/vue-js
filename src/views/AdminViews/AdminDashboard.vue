<script setup>
import Button from '@/components/Button.vue'
import Input from '@/components/Input.vue'
import Loader from '@/components/Loader.vue'
import Modal from '@/components/Modal.vue'
import Navigator from '@/components/Navigator.vue'
import Pagination from '@/components/Pagination.vue'
import Table from '@/components/Table.vue'
import { ROUTES } from '@/router'
import { API_ROUTES } from '@/router/apiRoutes'
import { deleteUserById, fetchAllUser, fetchUserId, updateUser } from '@/utils/admin-api-service'
import { baseUrl } from '@/utils/config'
import { formatDateTimeUTC, userListHeaders } from '@/utils/constant'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

const router = useRouter()
const currentPage = ref(1)
const reportLoading = ref(false)
const open = ref(null)
const editId = ref(null)
const form = reactive({
  username: '',
  email: '',
  password: '',
})

const {
  data: getAllUsers,
  isLoading: isGetAllUserLoader,
  isFetching: isFetchingUser,
  refetch: refetchAllUser,
} = useQuery({
  queryKey: computed(() => ['all-users', currentPage.value]),
  queryFn: () => fetchAllUser({ page: currentPage.value }),
  keepPreviousData: true,
})

const {
  data: getSingleUser,
  isLoading: isGetSingleUser,
  refetch: refetchSingleUser,
} = useQuery({
  queryKey: computed(() => ['get-single-user', editId.value]),
  queryFn: () => fetchUserId(editId.value),
  enabled: computed(() => !!editId.value),
})

const { mutateAsync: editSingleUser, isPending: isUpdatingUser } = useMutation({
  mutationKey: ['update-user'],
  mutationFn: ({ userId, userData }) => updateUser({ userId, userData }),
})

const { mutateAsync: deleteUser, isPending: isDeletingUser } = useMutation({
  mutationKey: ['delete-user'],
  mutationFn: (userId) => deleteUserById(userId),
})

const totalPages = computed(() => getAllUsers?.value?.totalPages || 1)
const users = computed(() => getAllUsers?.value?.users || [])
const page = computed({
  get: () => currentPage.value,
  set: (val) => (currentPage.value = val),
})

watch(getSingleUser, (val) => {
  if (val) {
    console.log(val.user)
    form.username = val.user.userName || ''
    form.email = val.user.email || ''
    form.password = val.user.password || ''
  }
})

const downloadPDF = async (userId) => {
  try {
    reportLoading.value = true
    const response = await fetch(`${baseUrl}${API_ROUTES.ADMIN.USER_REPORT}/${userId}`, {
      method: 'GET',
    })

    if (!response.ok) {
      toast.error('Failed to download PDF')
      return
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `UserPlayReport_${userId}.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()
    toast.success('Download PDF!')
    window.URL.revokeObjectURL(url)
  } catch (error) {
    toast.error(`Download error: ${error}`)
  } finally {
    reportLoading.value = false
  }
}

const navigateUserDetail = (single) => {
  router.push({
    name: 'singleUser',
    params: {
      userId: single?._id,
      username: single?.userName,
    },
  })
}
const openModal = (userId) => (open.value = userId)
const editModal = async (userId) => {
  await nextTick()
  editId.value = userId
  await refetchSingleUser()
}

const modalToggle = async (type) => {
  if (type === 'disagree') {
    open.value = null
  } else {
    const userId = open.value
    open.value = null
    const res = await deleteUser(userId)
    if (res?.error) {
      toast.error(`${res?.error || 'Failed To Delete'}`)
    } else {
      toast.success('User Deleted Successfully!')
      await refetchAllUser()
    }
  }
}

const handleSubmit = async () => {
  try {
    const { email, username, password } = form

    const payload = {
      userName: username,
      password,
      ...(email && { email: email }),
    }

    const res = await editSingleUser({
      userId: editId.value,
      userData: payload,
    })

    if (res?.error) {
      toast.error('Something Went Wrong!')
    } else {
      toast.success('Update User SuccessFully!')
      editId.value = null
      await refetchAllUser()
    }
  } catch (error) {
    toast.error(error)
  }
}
</script>

<template>
  <main class="container">
    <div class="content">
      <v-typography variants="h3" class="text-h3 h3">User List</v-typography>
      <Navigator />
    </div>

    <Loader
      v-if="
        isGetAllUserLoader || isFetchingUser || reportLoading || isDeletingUser || isGetSingleUser
      "
      color="white"
    />

    <div v-else class="main-content-table">
      <Table :headers="userListHeaders" :items="users">
        <template #item.createdAt="{ item }">
          <div>
            <span>{{ formatDateTimeUTC(item?.createdAt) }}</span>
          </div>
        </template>

        <template #item.actions="{ item }">
          <div class="action-icons">
            <v-icon>mdi-account-group</v-icon>
            <v-icon @click="navigateUserDetail(item)">mdi-eye</v-icon>
            <v-icon @click="editModal(item?._id)">mdi-pencil</v-icon>
            <v-icon @click="openModal(item?._id)">mdi-trash-can-outline</v-icon>
            <v-icon @click="downloadPDF(item?._id)">mdi-download</v-icon>
          </div>
        </template>
      </Table>

      <Pagination v-model="page" :length="totalPages" :total-visible="3" rounded="circle" />

      <Modal
        v-model="open"
        title="You Want To Delete This User?"
        prepend-icon="mdi-alert-circle"
        agree-text="Yes"
        disagree-text="No"
        @agree="() => modalToggle('agree')"
        @disagree="modalToggle('disagree')"
        max-width="450"
      >
        <p class="text-gray-700 text-center">
          This action will permanently delete the user and their data. Are you sure you want to
          proceed?
        </p>
      </Modal>

      <Modal v-model="editId" max-width="450">
        <template #title>
          <p class="form-title">Edit User Info</p>
        </template>

        <v-form fast-fail @submit.prevent="handleSubmit" class="auth-form">
          <div class="main-input">
            <Input v-model="form.username" label="Username" type="text" />
          </div>

          <div v-if="form.email" class="main-input">
            <Input v-model="form.email" label="Email" type="email" />
          </div>

          <div class="main-input">
            <Input v-model="form.password" label="Password" type="password" />
          </div>

          <Button
            type="submit"
            buttonText="Submit"
            appendIcon="mdi-arrow-right"
            :is-loading="isUpdatingUser"
            :disabled="isUpdatingUser"
          />
        </v-form>
      </Modal>
    </div>
  </main>
</template>

<style scoped>
.content {
  padding-top: 6rem;
  display: flex;
  align-items: start;
  justify-content: space-between;
  color: white;
  flex-wrap: wrap;
  gap: 20px;
}

.content-btns {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1rem;
}

.main-content-table {
  padding-top: 20px;
  padding-bottom: 10px;
}

.action-icons {
  display: flex;
  flex-direction: row;
  gap: 16px;
  align-items: end;
  justify-content: end;
}

.action-icons i {
  font-size: 30px;
  cursor: pointer;
}

.main-input {
  height: 30px;
  width: 100%;
  margin-bottom: 25px;
}

.form-title {
  font-size: 2.4rem;
}

.form-label {
  font-size: 1.5rem;
  font-weight: 600;
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

/* Media Query */
@media (max-width: 400px) {
  .content,
  .content-btns {
    align-items: center;
    justify-content: center;
  }
}
</style>
