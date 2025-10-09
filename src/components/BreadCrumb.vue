<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { ROUTES } from '@/router'

const routeTitleMap = {
  [ROUTES.USER_LIST]: 'User List',
  [ROUTES.SINGLE_USER]: 'User Detail',
  [ROUTES.ADMIN_PROFILE]: 'Admin Profile',
  [ROUTES.ADMIN_ADD_QUESTION]: 'Add Question',
  [ROUTES.ADMIN_ADD_JUMBLE_WORD]: 'Add Jumble Words',
  [ROUTES.ADMIN_ADD_BACKGROUND_IMG]: 'Add Background Images',
  [ROUTES.ADMIN_AGREEMENT]: 'Add Agreement',
}

function getRouteTitle(path) {
  if (routeTitleMap[path]) return routeTitleMap[path]

  const baseRoute = Object.keys(routeTitleMap).find((routeKey) => path.startsWith(routeKey))

  return baseRoute ? routeTitleMap[baseRoute] : path.split('/').pop()
}

const route = useRoute()

const items = computed(() => {
  const segments = route.path.split('/').filter(Boolean)

  const breadcrumbItems = []

  const isAdmin = route.path.startsWith('/admin')

  if (isAdmin) {
    breadcrumbItems.push({
      title: 'User List',
      to: '/admin/user-list',
      disabled: segments.length === 1,
    })
  }

  let accumulatedPath = ''

  segments.forEach((segment, index) => {
    if ((isAdmin && index === 0) || route.path.startsWith(ROUTES.USER_LIST)) return
    accumulatedPath += `/admin/${segment}`

    breadcrumbItems.push({
      title: getRouteTitle(accumulatedPath),
      to: accumulatedPath,
      disabled: index === segments.length - 1,
    })
  })

  return breadcrumbItems
})
</script>

<template>
  <div>
    <v-breadcrumbs :items="items" divider=">" />
  </div>
</template>
