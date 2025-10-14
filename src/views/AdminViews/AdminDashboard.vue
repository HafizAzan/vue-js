<script setup>
import Button from '@/components/Button.vue'
import Input from '@/components/Input.vue'
import Loader from '@/components/Loader.vue'
import Modal from '@/components/Modal.vue'
import Navigator from '@/components/Navigator.vue'
import Pagination from '@/components/Pagination.vue'
import Table from '@/components/Table.vue'
import Tooltip from '@/components/Tooltip.vue'
import UploadCSV from '@/components/UploadCSV.vue'
import { ROUTES } from '@/router'
import { API_ROUTES } from '@/router/apiRoutes'
import DropDownVue from '@/components/DropDown.vue'
import {
  adminAddTime,
  adminUpdateTime,
  deleteUserById,
  fetchAllTime,
  fetchAllUser,
  fetchAllUserData,
  fetchUserId,
  updateUser,
} from '@/utils/admin-api-service'
import { fetchAllValues } from '@/utils/api-service'
import { baseUrl } from '@/utils/config'
import { formatDateTimeUTC, userListHeaders } from '@/utils/constant'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
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
  overAllTime: '',
  animationStartTime: '',
  animationStopTime: '',
  animationFrequency: '',
  time_id: '',
})

const {
  data: getAllTime,
  isLoading: isGetAllTimeLoader,
  isFetching: isFetchingTime,
  refetch: refetchAllTime,
} = useQuery({
  queryKey: computed(() => ['all-users']),
  queryFn: () => fetchAllTime(),
})

const {
  data: allValues,
  isLoading: isValueLoading,
  refetch: refetcAllValues,
} = useQuery({
  queryKey: ['get-values'],
  queryFn: fetchAllValues,
})

const {
  data: GetAllUserData,
  isLoading: isAllUserLoading,
  refetch: refetAllUserData,
} = useQuery({
  queryKey: ['get-all-user-data'],
  queryFn: fetchAllUserData,
})

const { mutateAsync: addTime, isPending: isAddingTime } = useMutation({
  mutationKey: ['add-time'],
  mutationFn: (body) => adminAddTime(body),
})

const { mutateAsync: updateTime, isPending: isUpdatingTime } = useMutation({
  mutationKey: ['update-time'],
  mutationFn: (body) => adminUpdateTime(body),
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

const openDialog = ref(null)
const isEditingTime = ref(false)
const arrayValues = computed(() => allValues?.value?.data?.A)
const totalPages = computed(() => getAllUsers?.value?.totalPages || 1)
const users = computed(() => getAllUsers?.value?.users || [])
const page = computed({
  get: () => currentPage.value,
  set: (val) => (currentPage.value = val),
})

watch(getSingleUser, (val) => {
  if (val) {
    form.username = val.user.userName || ''
    form.email = val.user.email || ''
    form.password = val.user.password || ''
  }
})

watch(getAllTime, (val) => {
  if (val) {
    form.overAllTime = val?.time?.overAllTime || ''
    form.animationStartTime = val?.time?.animationTime || ''
    form.animationStopTime = val?.time?.animationStopTime || ''
    form.animationFrequency = val?.time?.animationFrequency || ''
    form.time_id = val?.time?._id || ''
  }
})

onMounted(() => {
  if (getAllTime?.value?.time) {
    form.overAllTime = getAllTime?.value?.time?.overAllTime || ''
    form.animationStartTime = getAllTime?.value?.time?.animationTime || ''
    form.animationStopTime = getAllTime?.value?.time?.animationStopTime || ''
    form.animationFrequency = getAllTime?.value?.time?.animationFrequency || ''
    form.time_id = getAllTime?.value?.time?._id || ''
  }
})

const DownloadCSVFile = async () => {
  try {
    reportLoading.value = true
    const response = await fetch(`${baseUrl}${API_ROUTES.ADMIN.DOWNLOAD_CSV}`, {
      method: 'GET',
    })

    if (!response.ok) {
      toast.error('Failed to fetch CSV file')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'all-user-csv-file.csv'
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    toast.error('Failed to download CSV file')
  } finally {
    reportLoading.value = false
  }
}

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

const openTimerModal = (type) => {
  if (type === 'timer') {
    openDialog.value = 'timer'
  }
}

const isDisabled = computed(() => {
  const hasTime = !!getAllTime.value?.time
  if (!hasTime) return false
  return !isEditingTime.value
})

watch(getAllTime, (val) => {
  isEditingTime.value = !val?.time
})

const editTimeForm = () => {
  isEditingTime.value = !isEditingTime.value
}

const timerHandler = async () => {
  const { overAllTime, animationStartTime, animationStopTime, animationFrequency } = form
  const body = {
    overAllTime: overAllTime,
    animationTime: animationStartTime,
    animationStopTime: animationStopTime,
    animationFrequency: animationFrequency,
  }

  try {
    if (getAllTime.value?.time) {
      const response = await updateTime(body)
      if (response?.error) {
        toast.error(response?.error?.message || 'Failed To Update Please Try Again Later')
      } else {
        await refetchAllTime()
        toast.success(
          response?.message || response?.data?.message || 'Time Form Updated SuccessFully!',
        )
      }
    } else {
      const res = await addTime(body)
      if (res?.error) {
        toast.error(res?.error?.message || 'Failed To Save Please Try Again Later')
      } else {
        await refetchAllTime()
        toast.success(res?.message || res?.data?.message || 'Time Form Saved SuccessFully!')
      }
    }
  } catch (error) {
    toast.error(`Error :`, error)
  }
  isEditingTime.value = false
  openDialog.value = null
}

const arrayAssign = (singleRow) => {
  const allUsers = GetAllUserData?.value?.value ?? []
  const assignedSections = allUsers.map((user) => user.section).filter(Boolean)

  return (
    arrayValues?.value
      ?.filter(
        (item) =>
          (Array.isArray(item?.items) &&
            item.items.length > 0 &&
            !assignedSections.includes(item.section)) ||
          item.section === singleRow?.section,
      )
      ?.sort((a, b) => {
        const aNum = parseInt(a.section.replace('section', ''), 10)
        const bNum = parseInt(b.section.replace('section', ''), 10)
        return aNum - bNum
      })
      ?.map((item) => {
        return {
          title: item.section,
          id: item._id,
          raw: item,
          isSelected: item.section === singleRow?.section,
        }
      }) ?? []
  )
}

const selectSectionHandler = async (item, userId) => {
  const userData = {
    items: item?.raw?.items,
    section: item?.title,
  }

  const res = await editSingleUser({
    userId: userId,
    userData: userData,
  })

  if (res?.error) {
    toast.error(res?.error?.message || 'Failed To Assign Array Please Try Again Later!')
  } else {
    toast.success(res?.data?.message || 'Array Assign SuccessFully!')
    arrayAssign(item?.raw)
    fetchUserId(userId)
    await refetAllUserData()
    await refetcAllValues()
  }
}
</script>

<template>
  <main class="container">
    <div class="content">
      <v-typography variants="h3" class="text-h3 heading-title h3">User List</v-typography>

      <div class="nav-icon">
        <UploadCSV :refetch="refetcAllValues" />

        <Tooltip text="Download CSV file">
          <v-icon @click="DownloadCSVFile"> mdi-tray-arrow-down</v-icon>
        </Tooltip>

        <Tooltip text="Set Time">
          <v-icon @click="openTimerModal('timer')">mdi-clock-time-four-outline</v-icon>
        </Tooltip>

        <Navigator />
      </div>
    </div>

    <Loader
      v-if="
        isGetAllUserLoader ||
        isFetchingUser ||
        reportLoading ||
        isDeletingUser ||
        isGetSingleUser ||
        isGetAllTimeLoader ||
        isFetchingTime ||
        isValueLoading ||
        isAllUserLoading ||
        isUpdatingUser
      "
      color="white"
    />

    <div v-else class="main-content-table">
      <Table :headers="userListHeaders" :items="users">
        <template #item.userName="{ item }">
          <div class="ellipsis">
            <span>{{ item?.userName }}</span>
          </div>
        </template>

        <template #item.createdAt="{ item }">
          <div class="ellipsis">
            <span>{{ formatDateTimeUTC(item?.createdAt) }}</span>
          </div>
        </template>

        <template #item.actions="{ item }">
          <div class="action-icons">
            <DropDownVue
              :key="item._id + '-' + (item.section || 'unassigned') + '-' + date"
              :selected="item.section"
              :items="arrayAssign(item)"
              defaultLocation="bottom"
              @select="(val) => selectSectionHandler(val, item?._id)"
            >
              <template #prependIcon>
                <Tooltip text="Assign Array">
                  <v-icon>mdi-account-group</v-icon>
                </Tooltip>
              </template>
            </DropDownVue>

            <Tooltip text="View Details">
              <v-icon @click="navigateUserDetail(item)">mdi-eye</v-icon>
            </Tooltip>

            <Tooltip text="Edit User Info">
              <v-icon @click="editModal(item?._id)">mdi-pencil</v-icon>
            </Tooltip>

            <Tooltip text="Delete User">
              <v-icon @click="openModal(item?._id)">mdi-trash-can-outline</v-icon>
            </Tooltip>

            <Tooltip text="Download PDF">
              <v-icon @click="downloadPDF(item?._id)">mdi-download</v-icon>
            </Tooltip>
          </div>
        </template>
      </Table>

      <Pagination v-model="page" :length="totalPages" :total-visible="5" rounded="circle" />

      <Modal
        v-model="openDialog"
        v-if="openDialog === 'timer'"
        max-width="450"
        :showActions="false"
        @disagree="
          () => {
            openDialog = null
            isEditingTime = false
          }
        "
      >
        <template #title>
          <div class="sub-header">
            <p class="form-title">{{ isEditingTime ? 'Update' : 'Set' }} Time</p>
            <Tooltip text="Edit">
              <v-icon @click="editTimeForm">{{
                isEditingTime ? 'mdi-check' : 'mdi-pencil'
              }}</v-icon>
            </Tooltip>
          </div>
        </template>

        <v-form fast-fail @submit.prevent="timerHandler" class="auth-form">
          <div class="main-input">
            <Input
              v-model="form.overAllTime"
              label="Enter Over All Time (10 seconds)"
              type="number"
              :readonly="isDisabled"
            />
          </div>

          <div class="main-input">
            <Input
              v-model="form.animationStartTime"
              label="Enter Animation Start Time (4 seconds)"
              type="number"
              :readonly="isDisabled"
            />
          </div>

          <div class="main-input">
            <Input
              v-model="form.animationStopTime"
              label="Enter Animation Stop Time (8 seconds)"
              type="number"
              :readonly="isDisabled"
            />
          </div>

          <div class="main-input">
            <Input
              v-model="form.animationFrequency"
              label="Enter Animation Frequency"
              type="number"
              :readonly="isDisabled"
            />
          </div>

          <Button
            type="submit"
            :buttonText="isEditingTime ? 'Update Time' : 'Save Time'"
            appendIcon="mdi-arrow-right"
            :is-loading="isUpdatingUser || isAddingTime || isUpdatingTime"
            :disabled="isDisabled"
          />
        </v-form>
      </Modal>

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

      <Modal v-model="editId" max-width="450" :show-actions="false">
        <template #title>
          <div class="pt-5">
            <p class="form-title">Edit User Info</p>
          </div>
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

.nav-icon {
  display: inline-flex;
  gap: 20px;
  align-items: center;
}

.nav-icon .v-icon {
  font-size: 3.4rem;
  cursor: pointer;
  padding: 10px;
}

.sub-header {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  padding: 0px 40px;
  padding-top: 20px;
}

.sub-header .v-icon {
  font-size: 2rem;
  cursor: pointer;
}

/* Media Query */
@media (max-width: 400px) {
  .content,
  .content-btns {
    align-items: center;
    justify-content: center;
  }
}

@media (max-width: 785px) {
  .content {
    flex-direction: row;
  }
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  text-transform: capitalize;
}
</style>
