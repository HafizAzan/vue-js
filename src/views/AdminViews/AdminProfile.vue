<script setup>
import Button from '@/components/Button.vue'
import Loader from '@/components/Loader.vue'
import Navigator from '@/components/Navigator.vue'
import { fetchAdminProfile } from '@/utils/admin-api-service'
import { useQuery } from '@tanstack/vue-query'
import { computed } from 'vue'

const { data: getAdminData, isLoading: isAdminLoading } = useQuery({
  queryKey: ['admin-profile'],
  queryFn: () => fetchAdminProfile(),
})

const adminData = computed(() => {
  const data = getAdminData.value
  return {
    userName: data?.admin?.userName ?? '-',
    email: data?.admin?.email ?? '-',
    id: data?.admin?.id ?? '-',
  }
})

console.log(getAdminData.value, 'GTDV')
</script>

<template>
  <main class="container">
    <div class="content">
      <v-typography variants="h3" class="text-h3 h3">Admin Profile</v-typography>
      <Navigator />
    </div>

    <Loader v-if="isAdminLoading" />

    <main v-else class="main-card-wrapper">
      <div class="card">
        <div class="card-header">
          <h4>Admin Overview</h4>
          <v-icon>mdi-pencil</v-icon>
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
          <Button button-text="Update Password" />
        </div>
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
}

.card {
  background: linear-gradient(45deg, #6a11cb 0%, #2575fc 100%);
  width: 30rem;
  height: 100%;
  border-radius: 10px;
  padding: 30px 35px;
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
  width: 45%;
  margin: 0 auto;
  margin-top: 25px;
}
</style>
