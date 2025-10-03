<script setup>
import { useAttrs, useSlots } from 'vue'

const props = defineProps({
  headers: {
    type: Array,
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },
})

const attr = useAttrs()
const slots = useSlots()
</script>

<template>
  <v-card flat v-bind="props">
    <v-data-table
      :headers="headers"
      :items="items"
      class="custom-table"
      hide-default-footer
      v-bind="attr"
    >
      <template v-for="(_, slot) in slots" #[slot]="scope">
        <slot :name="slot" v-bind="scope" />
      </template>
    </v-data-table>
  </v-card>
</template>

<style scoped>
.v-card,
.custom-table {
  background-color: transparent;
  position: static;
}

:deep(table) {
  border-collapse: separate !important;
  border-spacing: 0 20px !important;
  border-radius: 20px !important;
  border: none !important;
}

:deep(table > thead > tr) {
  color: white;
  font-size: 25px;
}

:deep(table > thead > tr > th) {
  border: none !important;
}

:deep(table > tbody > tr) {
  color: white;
  font-size: 25px;
  padding: 0px !important;
}

:deep(table > tbody > tr > td) {
  background-color: rgba(124, 21, 21, 0.651);
  color: white;
  font-size: 25px;
  padding: 10px 16px;
}

:deep(table > tbody > tr > td:first-child) {
  border-top-left-radius: 25px;
  border-bottom-left-radius: 25px;
}

:deep(table > tbody > tr > td:last-child) {
  border-top-right-radius: 25px;
  border-bottom-right-radius: 25px;
}
</style>
