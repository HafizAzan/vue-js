```vue
<script setup>
import { ref, reactive, watch, computed } from 'vue'
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
  add: {
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

const emit = defineEmits(['update-default-texts', 'next-step'])

const appliedBlur = ref(0)
const activeKey = ref(null)
const editingKey = ref(null)

const editableFields = reactive({})
props.modalConfig.forEach((item) => {
  editableFields[item.key] = props.defaultModalTexts?._id ? false : true
})

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
  editableFields[key] = !editableFields[key]
  editingKey.value = editableFields[key] ? key : null
}

const handleUpdate = async (key) => {
  const formData = new FormData()
  formData.append(key, props.defaultModalTexts[key])

  const response = await props.update({
    id: props.defaultModalTexts._id,
    body: formData,
  })

  if (response?.error) {
    toast.error(response?.error?.message || 'Update failed!')
  } else {
    toast.success(response?.message || 'Updated successfully!')
    editableFields[key] = false
    editingKey.value = null
    await props.refetch()
  }
}

watch(
  () => props.defaultModalTexts,
  (newVal) => {
    emit('update-default-texts', { ...newVal })
  },
  { deep: true },
)

const stepChange = async () => {
  emit('update-default-texts', { ...props.defaultModalTexts })
  const formData = new FormData()
  Object.keys(props.defaultModalTexts).forEach((key) => {
    formData.append(key, props.defaultModalTexts[key])
  })

  const response = await props.add(formData)
  if (response?.error) {
    toast.error(response?.error?.message || 'Please Try Again Later Failed To Submit!')
  } else {
    toast.success(
      response?.data?.message || 'Modal Text And Audio/Volume And Blur Successfully Added!',
    )
    await props.refetch()
    setTimeout(() => {
      emit('next-step', 'modal')
    }, 2000)
  }
}

const isAllFilled = computed(() => {
  const slidersFilled = props.modalConfig.every((opt) => {
    const val = props.defaultModalTexts[opt.key]
    return val !== null && val !== undefined && val !== '' && val !== 0
  })

  return slidersFilled
})
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
                  {{ editableFields[opt.key] ? 'mdi-check' : 'mdi-pencil' }}
                </v-icon>
              </div>
            </div>

            <v-slider
              v-model="props.defaultModalTexts[opt.key]"
              :readonly="!editableFields[opt.key]"
              color="blue-lighten-2"
              track-color="#444"
              thumb-color="white"
              min="0"
              max="10"
              step="0.1"
              thumb-label
            >
              <template #thumb-label="{ modelValue }">
                {{ Math.round(modelValue * 10) || 0 }}%
              </template>
            </v-slider>

            <div class="update-btn" v-if="editableFields[opt.key] && props.defaultModalTexts._id">
              <Button button-text="Update" @click="handleUpdate(opt.key)" />
            </div>
          </div>
        </div>

        <div class="audio-section">
          <label>Hidden Word</label>
          <p class="hidden-word" :style="{ filter: `blur(${appliedBlur}px)` }">Hello World!</p>
        </div>
      </div>

      <div class="next-btn" v-if="!props.defaultModalTexts._id">
        <Button button-text="Submit" @click="stepChange" :disabled="!isAllFilled" />
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

.update-btn {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.next-btn {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-top: 20px;
}
</style>
```
