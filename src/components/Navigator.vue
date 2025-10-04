<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import logo from '@/assets/logo.svg'
import { ROUTES } from '@/router'

const drawer = ref(false)
const router = useRouter()
const route = useRoute()

const toggleDrawer = () => {
  drawer.value = !drawer.value
}

const navigationItem = [
  {
    icon: 'mdi-view-dashboard',
    title: 'Admin Dashboard',
    route: ROUTES.USER_LIST,
  },
  {
    icon: 'mdi-account-circle-outline',
    title: 'Admin Profile',
    route: ROUTES.ADMIN_PROFILE,
  },
  {
    icon: 'mdi-forum',
    title: 'Admin Add Question',
    route: ROUTES.ADMIN_ADD_QUESTION,
  },
  {
    icon: 'mdi-file-word-box-outline',
    title: 'Admin Add Jumble Words',
    route: ROUTES.ADMIN_ADD_JUMBLE_WORD,
  },
  {
    icon: 'mdi-image-multiple ',
    title: 'Admin Background Images',
    route: ROUTES.ADMIN_ADD_BACKGROUND_IMG,
  },
]

const navigateTo = (path) => {
  router.push(path)
  drawer.value = false
}
</script>

<template>
  <v-layout>
    <div class="icon" @click="toggleDrawer">
      <v-icon>mdi-menu</v-icon>
    </div>

    <v-navigation-drawer v-model="drawer" class="navigator" theme="dark" temporary width="300">
      <div class="logo">
        <img :src="logo" alt="Logo" />
      </div>

      <v-list color="transparent">
        <v-list-item
          v-for="(item, index) in navigationItem"
          :key="index"
          :prepend-icon="item.icon"
          :title="item.title"
          @click="navigateTo(item.route)"
          :class="{ active: route.path.startsWith(item.route || '/admin/user') }"
        />
      </v-list>

      <template v-slot:append>
        <div class="pa-2">
          <v-btn block @click="drawer = false">Logout</v-btn>
        </div>
      </template>
    </v-navigation-drawer>
  </v-layout>
</template>

<style scoped>
.v-layout {
  flex: 0;
}

.icon .v-icon {
  font-size: 4rem;
  cursor: pointer;
  padding: 10px;
}

.navigator {
  background-color: #000000f0;
  border: 1px solid orange;
  border-left: transparent;
  padding-top: 20px;
}

.logo {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.logo img {
  width: 8rem;
  height: 4rem;
}

.active {
  background-color: rgba(124, 21, 21, 0.651) !important;
  color: white !important;
}
</style>
