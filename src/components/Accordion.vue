<script setup>
import { defineProps, watch } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  variant: {
    type: String,
    default: 'accordion',
  },
  title: {
    type: String,
    default: 'Accordion',
  },
})

watch(props.items, (val) => {
  console.log(val, 'val')
})
</script>

<template>
  <div style="width: 100%">
    <v-expansion-panels>
      <v-expansion-panel v-for="(item, i) in props.items" :key="i" :title="item.title">
        <template #text>
          <ul class="accordion-details">
            <li v-for="(detail, idx) in item.details" :key="idx">
              <strong>{{ detail.label }}:</strong> {{ detail.value }}
            </li>

            <li v-for="(epoch, idx) in item.epochs" :key="'ep-' + idx">
              <div style="margin-top: 10px">
                <strong>Epoch {{ epoch.label }}</strong>
                <ul class="accordion-details epoch">
                  <li v-for="(info, i) in epoch.value" :key="'info-' + i">
                    <strong>{{ info.label }}:</strong> {{ info.value }}
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </template>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<style scoped>
.user-title {
  font-size: 20px;
  font-weight: 700;
  color: #dcdde1;
  min-width: 140px;
}

.disabled-form-row {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 15px;
  padding: 12px 15px;
  background-color: #2a2a3d;
  border-radius: 8px;
  box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.3);
  transition: background-color 0.3s ease;
}

.epoch {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.v-expansion-panel {
  background-color: #12121f;
  border: 1px solid #555a7b;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  letter-spacing: 0.03em;
  min-height: 38px;
}

.v-expansion-panel-content {
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.accordion-details {
  list-style: none;
  padding-left: 0;
  margin: 0;
}
.accordion-details li {
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
