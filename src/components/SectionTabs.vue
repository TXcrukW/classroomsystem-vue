<template>
  <div class="section-tabs" :class="`status-${status}`">
    <button 
      :class="{ active: modelValue === 'waiting' }" 
      @click="setActive('waiting')"
    >
      待接单
    </button>
    <button 
      :class="{ active: modelValue === 'pending' }" 
      @click="setActive('pending')"
    >
      待完成
    </button>
  </div>
</template>

<script setup lang="ts">
type TicketTab = 'waiting' | 'pending';

defineProps<{
  status: 'offline' | 'online' | 'break';
  modelValue: TicketTab;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: TicketTab): void;
}>();

const setActive = (tab: TicketTab) => {
  emit('update:modelValue', tab);
};
</script>

<style scoped>
.section-tabs {
  --tab-bg: #3a3a3c;
  --tab-text: rgba(255, 255, 255, 0.68);
  --tab-active: #ffffff;
  --tab-indicator: rgba(255, 255, 255, 0.72);
  display: flex;
  align-items: center;
  background: var(--tab-bg);
  padding: 0 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.section-tabs.status-offline {
  --tab-bg: #3a3a3c;
  --tab-text: rgba(255, 255, 255, 0.7);
  --tab-active: #ffffff;
  --tab-indicator: rgba(255, 255, 255, 0.75);
}

.section-tabs.status-online {
  --tab-bg: #e7f2ff;
  --tab-text: #89a7c8;
  --tab-active: #3d5a80;
  --tab-indicator: #9bbfe6;
}

.section-tabs.status-break {
  --tab-bg: #ffebeb;
  --tab-text: #c58a8a;
  --tab-active: #8d4e4e;
  --tab-indicator: #d5a3a3;
}

.section-tabs button {
  flex: 1;
  position: relative;
  padding: 16px 0 14px;
  border: none;
  background: transparent;
  font-size: 16px;
  color: var(--tab-text);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.section-tabs button.active {
  color: var(--tab-active);
  font-weight: 600;
}

.section-tabs button.active::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 40px;
  height: 3px;
  transform: translateX(-50%);
  border-radius: 2px 2px 0 0;
  background: var(--tab-indicator);
}
</style>
