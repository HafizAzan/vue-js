<script setup>
import Button from '@/components/Button.vue'
import Input from '@/components/Input.vue'
import { useUserStore } from '@/store/useUserStore'
import { loginUser, RegisterUser } from '@/utils/api-service'
import { useMutation } from '@tanstack/vue-query'
import { computed, reactive } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const { setToken } = useUserStore()
const isLogin = computed(() => route.path === '/login')

const { mutateAsync: login, isPending } = useMutation({
  mutationFn: (payload) => loginUser({ body: payload }),
})

const { mutateAsync: register, isPending: isRegiserPending } = useMutation({
  mutationFn: (payload) => RegisterUser({ body: payload }),
})

const form = reactive({
  username: '',
  email: '',
  password: '',
})

const handleSubmit = async () => {
  if (isLogin.value) {
    const payload = {
      userName: form.username,
      password: form.password,
    }
    const res = await login(payload)
    setToken(res?.token)
    console.log('res ', res)
  } else {
    const payload = {
      userName: form.username,
      email: form.email,
      password: form.password,
    }
    const res = await register(payload)
    setToken(res?.token)
    console.log('reg', res)
  }

  form.username = ''
  form.email = ''
  form.password = ''
}
</script>

<template>
  <v-sheet class="main-form-wrapper" width="600" height="700">
    <v-form fast-fail @submit.prevent="handleSubmit" class="auth-form">
      <v-typography variants="h3" class="text-h3 h3 form-text">{{
        isLogin ? 'Login' : 'Sign up'
      }}</v-typography>

      <v-typography v-if="isLogin" variants="h6" class="text-h6 h6 form-text"
        >Enter an anonymous username
      </v-typography>

      <Input v-model="form.username" label="Username" type="text" />
      <Input v-if="!isLogin" v-model="form.email" label="Email" type="email" />
      <Input v-model="form.password" label="Password" type="password" />

      <Button
        type="submit"
        v-if="!isLogin"
        button-text="Register"
        appendIcon="mdi-arrow-right"
        :disabled="isRegiserPending"
        :isLoading="isRegiserPending"
      />
      <Button
        type="submit"
        v-if="isLogin"
        button-text="Login"
        appendIcon="mdi-arrow-right"
        :disabled="isPending"
        :isLoading="isPending"
      />

      <v-typography v-if="isLogin" variants="h6" class="text-h6 h6"
        >Don't Have an account?
        <RouterLink to="/signup">Signup</RouterLink>
      </v-typography>

      <v-typography v-else variants="h6" class="text-h6 h6"
        >Have an account?
        <RouterLink to="/login">Login</RouterLink>
      </v-typography>
    </v-form>
  </v-sheet>
</template>

<style scoped>
.main-form-wrapper {
  margin: 0 auto;
  background-color: transparent;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.auth-form {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 75%;
  background-color: #000000d2;
  padding: 10px;
  display: flex;
  flex-flow: column wrap;
  gap: 20px;
  border-radius: 10px;
}

.form-text {
  text-align: center;
  margin: 8px 0px;
}

a {
  color: white;
}
</style>
