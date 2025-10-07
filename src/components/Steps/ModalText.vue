```vue
<script setup>
import { ref, watch } from 'vue'
import Button from '../Button.vue'
import Textarea from '../Textarea.vue'

const props = defineProps({
  modalConfig: {
    type: Array,
    default: () => [],
  },
  defaultModalTexts: {
    type: Object,
    default: () => ({}),
  },
})

const handleFileUpload = (key) => {
  console.log('File upload clicked for:', key)
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
          <v-icon color="grey">mdi-pencil</v-icon>
        </div>

        <div class="textarea-group">
          <Textarea
            :model-value="defaultModalTexts[single.key]"
            label="Low"
            rows="2"
            placeholder="Enter low description..."
          />
        </div>
      </div>
    </div>

    <div class="next-btn">
      <Button button-text="Next" />
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
```
