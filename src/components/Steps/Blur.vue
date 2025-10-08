<script setup>
import { ref } from 'vue'
import { VSlider, VBtn } from 'vuetify/components'
import Button from '../Button.vue'
import { toast } from 'vue-sonner'

const props = defineProps({
  modalConfig: {
    type: Array,
    default: () => [],
  },
  defaultModalTexts: {
    type: Object,
    default: () => ({}),
  },
  update: {
    type: Function,
    default: () => {},
  },
  refetch: {
    type: Function,
    default: () => {},
  },
  nextStep: {
    type: String,
    default: 'modal',
  },
})

const appliedBlur = ref(0)
const activeKey = ref(null)
const editingKey = ref(null)

const toggleBlur = (key) => {
  if (activeKey.value === key) {
    activeKey.value = null
    appliedBlur.value = 0
  } else {
    activeKey.value = key
    appliedBlur.value = parseFloat(props.defaultModalTexts[key]) || 0
  }
}

const toggleEdit = (key) => {
  if (editingKey.value === key) {
    editingKey.value = null
  } else {
    editingKey.value = key
  }
}

const handleUpdate = async (key) => {
  const formData = new FormData()
  formData.append(key, props.defaultModalTexts[key])

  const response = await props.update({
    id: props.defaultModalTexts._id,
    body: formData,
  })

  if (response?.error) {
    toast.error(response?.error?.message || 'Audio upload failed!')
  } else {
    toast.success(response?.message || 'Audio uploaded successfully!')
    editingKey.value = null
    await props.refetch()
  }
}
</script>

<template>
  <section class="card-box-wrapper">
    <div class="card-box">
      <div class="sliders-audio-row">
        <div class="sliders-wrapper">
          <div v-for="(opt, index) in modalConfig" :key="index" class="slider-group">
            <div class="slider-header">
              <label>{{ opt.heading }}</label>

              <div class="icons-wrapper">
                <v-icon color="grey" size="20" class="edit-icon" @click="toggleBlur(opt.key)">
                  {{ activeKey === opt.key ? 'mdi-close-box' : 'mdi-plus-box' }}
                </v-icon>

                <v-icon color="grey" size="18" class="edit-icon" @click="toggleEdit(opt.key)">
                  {{ editingKey === opt.key ? 'mdi-close' : 'mdi-pencil' }}
                </v-icon>
              </div>
            </div>

            <v-slider
              v-model="props.defaultModalTexts[opt.key]"
              :readonly="editingKey !== opt.key"
              color="blue-lighten-2"
              track-color="#444"
              thumb-color="white"
              min="0"
              max="20"
              step="0.1"
              thumb-label="always"
            >
              <template #thumb-label="{ modelValue }"> {{ Math.round(modelValue * 5) }}% </template>
            </v-slider>

            <div class="update-btn" v-if="editingKey === opt.key">
              <Button button-text="Update" @click="handleUpdate(opt.key)" />
            </div>
          </div>
        </div>

        <div class="audio-section">
          <label>Hidden Word</label>
          <p class="hidden-word" :style="{ filter: `blur(${appliedBlur}px)` }">Hello World!</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.card-box-wrapper {
  background-color: #1e1e2f;
  display: flex;
  justify-content: center;
  padding: 20px;
  border-radius: 10px;
}

.card-box {
  background-color: #2a2a3d;
  color: white;
  width: 100%;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.sliders-audio-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.sliders-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 70%;
}

.slider-group {
  background-color: #1f1f2f;
  padding: 15px;
  border-radius: 8px;
}

.slider-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.slider-group label {
  font-size: 0.9rem;
  color: #aaa;
  margin-bottom: 4px;
  display: block;
}

.audio-section {
  width: 28%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}

.audio-section label {
  font-size: 0.9rem;
  color: #aaa;
  margin-bottom: 6px;
}

.hidden-word {
  font-size: 4vw;
  transition: filter 0.3s ease;
}

.icons-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.v-btn.mt-2 {
  margin-top: 8px;
  font-size: 0.75rem;
  text-transform: none;
}

.update-btn {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
</style>
