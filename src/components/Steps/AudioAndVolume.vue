<script setup>
import { VSlider } from 'vuetify/components'

const props = defineProps({
  modalConfig: {
    type: Array,
    default: () => [],
  },
  defaultModalTexts: {
    type: Object,
    default: () => ({}),
  },
  audioUrl: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <section class="card-box-wrapper">
    <div class="card-box">
      <div class="sliders-audio-row">
        <div class="sliders-wrapper">
          <div v-for="(opt, index) in modalConfig" :key="index" class="slider-group">
            <label>{{ opt.heading }}</label>
            <v-slider
              v-model="props.defaultModalTexts[opt.key]"
              color="blue-lighten-2"
              track-color="#444"
              thumb-color="white"
              max="100"
              min="0"
              step="1"
              thumb-label="always"
            />
          </div>
        </div>

        <div class="audio-section">
          <label>Audio File</label>
          <audio v-if="audioUrl" :src="audioUrl" controls class="audio-player"></audio>
          <div v-else class="no-audio">No audio available</div>
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

.audio-player {
  width: 100%;
  outline: none;
  border-radius: 8px;
}

.no-audio {
  color: #888;
  font-size: 0.85rem;
}
</style>
