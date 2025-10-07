<script setup>
import Button from '@/components/Button.vue'
import Loader from '@/components/Loader.vue'
import Navigator from '@/components/Navigator.vue'
import AudioAndVolume from '@/components/Steps/AudioAndVolume.vue'
import ModalText from '@/components/Steps/ModalText.vue'
import Textarea from '@/components/Textarea.vue'
import { fetchAllModalConfig } from '@/utils/admin-api-service'
import { audioFile, modalConfig } from '@/utils/constant'
import { useQuery } from '@tanstack/vue-query'
import { reactive, ref, watch, watchEffect } from 'vue'

const defaultModalTexts = reactive({
  sessionText: '',
  timeUpText: '',
  allSessionFinishModalText: '',
  gateCompleteModalText: '',
  wrongCompleteModalText: '',
  lastLevelModalText: '',
  heading: '',
  audioFile: '',
  low: '',
  medium: '',
  high: '',
  opacityLow: '',
  opacityMedium: '',
  opacityHigh: '',
})

const { data: getAllModal, isLoading: isGettingModalText } = useQuery({
  queryKey: ['get-all-models'],
  queryFn: fetchAllModalConfig,
})

watchEffect(() => {
  const modalData = getAllModal.value?.[0]
  if (modalData) {
    Object.keys(defaultModalTexts).forEach((key) => {
      defaultModalTexts[key] = modalData[key] ?? ''
    })
  }
})

const stepSave = ref('modal')
const selectStepHandler = (type) => {
  console.log(type, 'type')
  stepSave.value = type
}
</script>

<template>
  <section class="container">
    <div class="content">
      <v-typography variants="h3" class="text-h3 h3">Upload Modal Text And Audio</v-typography>
      <Navigator />
    </div>

    <Loader v-if="isGettingModalText" />

    <main class="main-tab">
      <Button @click="selectStepHandler('modal')" button-text="Step : 01 Add Modal Text" />
      <Button @click="selectStepHandler('audio')" button-text="Step : 02 Add Audio & Volume" />
      <Button @click="selectStepHandler('blur')" button-text="Step : 03 Add BLur/Opacity" />
    </main>

    <ModalText
      :modal-config="modalConfig"
      :default-modal-texts="defaultModalTexts"
      v-if="stepSave === 'modal'"
    />

    <AudioAndVolume
      :modal-config="audioFile"
      :default-modal-texts="defaultModalTexts"
      :audioUrl="defaultModalTexts.audioFile"
      v-if="stepSave === 'audio'"
    />

    <div class="save-all-btn">
      <Button button-text="Save All" disabled />
    </div>
  </section>
</template>

<style>
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

.save-all-btn {
  display: flex;
  justify-content: end;
  padding-bottom: 10px;
  cursor: pointer;
}

.heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-bottom: 10px;
}

.heading .card-box-title,
.v-icon {
  font-size: 1.4rem;
  font-weight: 700;
  color: white;
}

.main-tab {
  display: flex;
  background-color: #1e1e2f;
  margin-bottom: 20px;
  align-items: center;
  justify-content: space-between;
  height: 5rem;
  border-radius: 10px;
  gap: 5px;
}

.main-tab button {
  flex: 1 1 auto;
  height: 98% !important;
  border-radius: 0px !important;
  min-height: 98%;
  background-color: transparent !important;
  border: 1px solid white;
  font-size: 1.3rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.4px !important;
}
</style>
