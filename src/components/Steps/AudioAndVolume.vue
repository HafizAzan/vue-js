<script setup>
import { ref, reactive, watch, computed } from 'vue'
import Button from '../Button.vue'
import { toast } from 'vue-sonner'
import Tooltip from '../Tooltip.vue'

const props = defineProps({
  modalConfig: {
    type: Array,
    default: () => [],
  },
  defaultModalTexts: {
    type: Object,
    default: () => ({}),
  },
  audioFile: {
    type: String,
    default: '',
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
    default: 'audio',
  },
})

const emit = defineEmits(['next-step', 'update-default-texts', 'step-complete'])

const editableFields = reactive({})
props.modalConfig.forEach((item) => {
  editableFields[item.key] = props.defaultModalTexts?._id ? false : true
})

const toggleEdit = (key) => {
  editableFields[key] = !editableFields[key]
}

const updateSlider = async (single) => {
  const formData = new FormData()
  const value = props.defaultModalTexts[single.key]
  formData.append(single.key, value)

  const response = await props.update({
    id: props.defaultModalTexts._id,
    body: formData,
  })

  if (response?.error) {
    toast.error(response?.error?.message || 'Failed To Update')
  } else {
    toast.success(response?.message || 'Slider updated successfully!')
    editableFields[single.key] = false
    await props.refetch()
  }
}

const audioInputRef = ref(null)
const selectedAudio = ref(props.audioFile || '')
const audioPlayer = ref(null)
const isPlaying = reactive({})

const handleAudioUploadClick = () => {
  audioInputRef.value?.click()
}

const handleAudioChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  if (props.defaultModalTexts?._id) {
    const formData = new FormData()
    formData.append('audioFile', file)

    const response = await props.update({
      id: props.defaultModalTexts._id,
      body: formData,
    })

    if (response?.error) {
      toast.error(response?.error?.message || 'Audio upload failed!')
    } else {
      toast.success(response?.message || 'Audio uploaded successfully!')
      selectedAudio.value = URL.createObjectURL(file)
      await props.refetch()
    }
  } else {
    const previewUrl = URL.createObjectURL(file)
    selectedAudio.value = previewUrl

    emit('update-default-texts', {
      ...props.defaultModalTexts,
      audioFile: file || previewUrl,
    })
  }
}

const togglePlay = (key) => {
  if (!audioPlayer.value) return
  const player = audioPlayer.value

  if (isPlaying[key]) {
    player.pause()
    isPlaying[key] = false
    return
  }

  Object.keys(isPlaying).forEach((k) => (isPlaying[k] = false))

  const volume = props.defaultModalTexts[key] ?? 0.5
  player.volume = volume

  player.currentTime = 0
  player.play()
  isPlaying[key] = true

  player.onended = () => {
    isPlaying[key] = false
  }
}

watch(
  () => props.defaultModalTexts,
  (newVal) => {
    emit('update-default-texts', { ...newVal })
  },
  { deep: true },
)

const isAllFilled = computed(() => {
  const slidersFilled = props.modalConfig.every((opt) => {
    const val = props.defaultModalTexts[opt.key]
    return val !== null && val !== undefined && val !== '' && val !== 0
  })

  const audioFilled =
    selectedAudio.value &&
    selectedAudio.value !== '' &&
    selectedAudio.value !== null &&
    selectedAudio.value !== undefined

  return slidersFilled && audioFilled
})

const stepChange = () => {
  emit('update-default-texts', { ...props.defaultModalTexts })
  emit('next-step', 'blur')
  emit('step-complete', 'audio', isAllFilled.value)
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
                <Tooltip :text="isPlaying[opt.key] ? 'Pause Audio' : 'Play Audio'">
                  <v-icon color="grey" class="upload-icon" size="20" @click="togglePlay(opt.key)">
                    {{ isPlaying[opt.key] ? 'mdi-pause' : 'mdi-play' }}
                  </v-icon>
                </Tooltip>

                <Tooltip :text="editableFields[opt.key] ? 'Close Editable' : 'Editable'">
                  <v-icon color="grey" size="18" class="edit-icon" @click="toggleEdit(opt.key)">
                    {{ editableFields[opt.key] ? 'mdi-check' : 'mdi-pencil' }}
                  </v-icon>
                </Tooltip>
              </div>
            </div>

            <v-slider
              v-model="props.defaultModalTexts[opt.key]"
              :readonly="!editableFields[opt.key]"
              color="blue-lighten-2"
              track-color="#444"
              thumb-color="white"
              min="0"
              max="1"
              step="0.01"
              thumb-label
            >
              <template #thumb-label="{ modelValue }">
                {{ Math.round(modelValue * 100) || 0 }}%
              </template>
            </v-slider>

            <div class="update-btn" v-if="editableFields[opt.key] && props.defaultModalTexts._id">
              <Tooltip text="Update">
                <Button button-text="Update" @click="updateSlider(opt)" />
              </Tooltip>
            </div>
          </div>
        </div>

        <div class="audio-section">
          <label>Audio File</label>
          <div v-if="selectedAudio && selectedAudio !== ''" class="main-audio-wrapper">
            <v-icon color="black" class="audio-icon" size="18" @click="handleAudioUploadClick">
              mdi-pencil
            </v-icon>

            <audio
              ref="audioPlayer"
              :src="selectedAudio"
              class="audio-player"
              controls
              controlsList="nodownload noplaybackrate noremoteplayback"
            ></audio>
          </div>

          <div v-else class="no-audio" @click="handleAudioUploadClick">
            <v-icon size="100">mdi-file-upload</v-icon>
          </div>

          <input
            type="file"
            accept="audio/*"
            ref="audioInputRef"
            hidden
            @change="handleAudioChange"
          />
        </div>
      </div>

      <div class="next-btn">
        <Tooltip text="Next Step 03">
          <Button button-text="Next" @click="stepChange" :disabled="!isAllFilled" />
        </Tooltip>
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
  flex-wrap: wrap;
}

.sliders-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
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

.edit-icon {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.edit-icon:hover {
  transform: scale(1.1);
}

.update-btn {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.audio-section {
  max-width: 30%;
  width: 30%;
  min-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  position: relative;
  padding-top: 15px;
}

.audio-section label {
  font-size: 0.9rem;
  color: #aaa;
  margin-bottom: 6px;
}

.main-audio-wrapper {
  width: 100%;
  outline: none;
  border-radius: 8px;
  background-color: #f1f3f4;
  position: relative;
}

.audio-player {
  width: 90%;
  outline: none;
  border-radius: 8px;
}

.no-audio {
  color: #888;
  font-size: 0.85rem;
}

.audio-icon {
  position: absolute;
  right: 12px;
  z-index: 100;
  top: 18px;
  cursor: pointer;
}

.next-btn {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-top: 20px;
}

.icons-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.no-audio .v-icon {
  cursor: pointer;
}

@media (max-width: 600px) {
  .slider-group,
  .card-box,
  .card-box-wrapper {
    padding: 10px;
  }
}
</style>
