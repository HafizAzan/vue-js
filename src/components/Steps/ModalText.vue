<script setup>
import { ref, reactive, computed } from 'vue'
import Button from '../Button.vue'
import Textarea from '../Textarea.vue'
import { VIcon } from 'vuetify/components'
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

const emit = defineEmits(['next-step'])

const editableFields = reactive({})
props.modalConfig.forEach((item) => {
  editableFields[item.key] = false
})

const toggleEdit = (key) => {
  editableFields[key] = !editableFields[key]
}

const updateModal = async (single) => {
  const formData = new FormData()
  const value = props.defaultModalTexts[single?.key]
  formData.append(single?.key, value)

  const response = await props.update({ id: props.defaultModalTexts?._id, body: formData })

  if (response?.error) {
    toast.error(response?.error?.message || 'Failed To Update')
  } else {
    toast.success(response?.message || 'Updated Successfully!')
    editableFields[single?.key] = false
    await props.refetch()
  }
}

const isAllFieldsFilled = computed(() => {
  const allFilled = props.modalConfig.every((item) => {
    const value = props.defaultModalTexts[item.key]
    return value !== '' && value !== null && value !== undefined
  })

  const anyEditing = Object.values(editableFields).some((isEditing) => isEditing)
  return allFilled && !anyEditing
})

const stepChange = () => {
  const steps = ['modal', 'audio', 'blur']
  const currentIndex = steps.indexOf(props.nextStep)
  const next = steps[currentIndex + 1] || 'modal'
  emit('next-step', next)
}
</script>

<template>
  <main class="card-box-wrapper">
    <div v-for="(single, index) in modalConfig" :key="index || single?.key" class="card-box">
      <div class="card-box-one-row">
        <div class="heading">
          <div class="upload-title">
            <h4 class="card-box-title">{{ single?.heading }}</h4>
          </div>

          <v-icon color="grey" class="upload-icon" @click="toggleEdit(single.key)">
            {{ editableFields[single.key] ? 'mdi-check' : 'mdi-pencil' }}
          </v-icon>
        </div>

        <div class="textarea-group">
          <Textarea
            v-model="props.defaultModalTexts[single.key]"
            :label="single.heading"
            rows="2"
            placeholder="Enter description..."
            :readonly="!editableFields[single.key]"
          />
        </div>

        <div class="next-btn">
          <Button
            button-text="Update"
            v-if="editableFields[single.key]"
            @click="updateModal(single)"
          />
        </div>
      </div>
    </div>

    <div class="next-btn">
      <Button button-text="Next" :disabled="!isAllFieldsFilled" @click="stepChange" />
    </div>
  </main>
</template>

<style scoped>
.card-box-wrapper {
  background-color: #1e1e2f;
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  border-radius: 12px;
}

.card-box {
  background-color: #2a2a3d;
  flex-basis: 48%;
  border-radius: 10px;
  padding: 20px;
  color: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.card-box:hover {
  transform: translateY(-3px);
}

.heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.upload-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.upload-icon {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.upload-icon:hover {
  transform: scale(1.1);
}

.card-box-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
}

.textarea-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.next-btn {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-top: 20px;
}
</style>
