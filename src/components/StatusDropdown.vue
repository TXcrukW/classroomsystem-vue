<template>
  <div class="status-dropdown" :class="`status-${status}`" @click="toggleDropdown">
    <div class="status-indicator" :class="modelValue"></div>
    <span class="status-text">{{ statusText }}</span>
    <svg class="dropdown-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M6 9l6 6 6-6" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    
    <div v-if="showDropdown" class="dropdown-menu">
      <div class="dropdown-item" @click.stop="selectStatus('online')">
        <div class="status-indicator online"></div>
        <span>上线</span>
      </div>
      <div class="dropdown-item" @click.stop="selectStatus('break')">
        <div class="status-indicator break"></div>
        <span>小休</span>
      </div>
      <div class="dropdown-item" @click.stop="selectStatus('offline')">
        <div class="status-indicator offline"></div>
        <span>下线中</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const props = withDefaults(defineProps<{
  modelValue?: 'offline' | 'online' | 'break';
  status?: 'offline' | 'online' | 'break';
}>(), {
  modelValue: 'offline',
  status: 'offline',
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: 'offline' | 'online' | 'break'): void;
}>();

const showDropdown = ref(false);

const statusText = computed(() => {
  const statusMap: Record<string, string> = {
    online: '上线',
    break: '小休',
    offline: '下线中'
  };
  return statusMap[props.modelValue] || '下线中';
});

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const selectStatus = (status: 'offline' | 'online' | 'break') => {
  emit('update:modelValue', status);
  showDropdown.value = false;
};
</script>

<style scoped>
.status-dropdown {
  color: #4b5563;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #ececef;
  padding: 8px 12px;
  border-radius: 20px;
  cursor: pointer;
  position: relative;
  user-select: none;
  z-index: 30;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.04);
}

.status-dropdown.status-offline {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
}

.status-dropdown.status-online {
  background: rgba(255, 255, 255, 0.4);
  color: #315374;
  box-shadow: inset 0 0 0 1px rgba(86, 131, 179, 0.1);
  backdrop-filter: blur(8px);
}

.status-dropdown.status-break {
  background: rgba(255, 255, 255, 0.4);
  color: #8b5353;
  box-shadow: inset 0 0 0 1px rgba(186, 110, 110, 0.1);
  backdrop-filter: blur(8px);
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-indicator.online {
  background: #22c55e;
}

.status-indicator.break {
  background: #f59e0b;
}

.status-indicator.offline {
  background: #ef4444;
}

.status-text {
  color: currentColor;
  font-size: 14px;
  font-weight: 500;
}

.dropdown-arrow {
  margin-left: 2px;
}

.dropdown-arrow path {
  stroke: currentColor;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 120px;
  overflow: hidden;
  z-index: 40;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.dropdown-item span {
  color: #333;
  font-size: 14px;
}
</style>
