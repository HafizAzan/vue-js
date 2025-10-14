<script setup>
import Button from '@/components/Button.vue'
import Loader from '@/components/Loader.vue'
import Modal from '@/components/Modal.vue'
import { useUserStore } from '@/store/useUserStore'
import { fetchAllAgreement } from '@/utils/admin-api-service'
import { useQuery } from '@tanstack/vue-query'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const { setIsFirstTime } = useUserStore()
const modalOpen = ref(false)
const agreement = ref('')
const agreementId = ref(null)

const { data: getAgreement, isLoading: isLoadAgreement } = useQuery({
  queryKey: ['get-agreement'],
  queryFn: () => fetchAllAgreement('web'),
})

const goToLeaderboard = () => {
  modalOpen.value = true
}

const updateAgreementState = () => {
  const data = getAgreement?.value?.[0]
  if (data) {
    agreement.value = data.agreementText
    agreementId.value = data._id
  } else {
    agreement.value = ''
    agreementId.value = null
  }
}

watch(getAgreement, updateAgreementState)
onMounted(updateAgreementState)

const modalStyle = {
  padding: '15px',
  background: 'rgba(255, 255, 255, 0.82)',
  borderRadius: '8px',
  color: 'black',
  minHeight: '500px',
  overflowY: 'auto',
}

const agreementHandler = () => {
  setIsFirstTime(true)
  router.push('/signup')
}
</script>

<template>
  <main class="main-home-content">
    <Loader v-if="isLoadAgreement" color="white" />
    <v-typography variants="h2" class="text-sm-h2 text-h4 h2">Noetic Adventure</v-typography>
    <Button buttonText="Get Started" @click="goToLeaderboard" appendIcon="mdi-arrow-right" />
    <Modal
      v-model="modalOpen"
      title="Agreement Assign"
      agree-text="Yes"
      disagree-text="No"
      @agree="agreementHandler"
      max-width="800"
    >
      <div class="modal-preview" v-html="agreement" :style="modalStyle"></div>
    </Modal>
  </main>
</template>

<style scoped>
.main-home-content {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-flow: column wrap;
  gap: 20px;
  height: 50vh;
}

.modal-preview {
  overflow-y: auto;
  max-height: 325px;
  min-height: 500px !important;
}
</style>
