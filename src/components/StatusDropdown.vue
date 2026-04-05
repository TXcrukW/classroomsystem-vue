<template>
  <div class="status-dropdown-shell">
    <div class="status-dropdown" :class="[`status-${status}`, { expanded: showDropdown }]">
      <view class="status-trigger" @tap.stop="toggleDropdown">
        <div class="status-indicator" :class="modelValue"></div>
        <span class="status-text">{{ currentStatusOption.label }}</span>
        <span class="status-triangle" :class="{ expanded: showDropdown }"></span>
      </view>

      <div v-if="showDropdown" class="dropdown-menu" @tap.stop>
        <view
          v-for="option in statusOptions"
          :key="option.value"
          class="dropdown-item"
          :class="{ active: option.value === modelValue }"
          @tap="selectStatus(option.value)"
        >
          <div class="status-indicator" :class="option.value"></div>
          <span class="dropdown-item-label">{{ option.label }}</span>
          <span v-if="option.value === modelValue" class="dropdown-item-mark"></span>
        </view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

type UserStatus = 'offline' | 'online' | 'break';

type StatusOption = {
  value: UserStatus;
  label: string;
};

const props = withDefaults(defineProps<{
  modelValue?: UserStatus;
  status?: UserStatus;
}>(), {
  modelValue: 'offline',
  status: 'offline',
});

const emit = defineEmits<{
  (event: 'request-change', value: UserStatus): void;
  (event: 'update:open', value: boolean): void;
}>();

const showDropdown = ref(false);

const statusOptions: StatusOption[] = [
  { value: 'online', label: '上线' },
  { value: 'break', label: '小休' },
  { value: 'offline', label: '下线中' },
];

const currentStatusOption = computed(() => {
  return statusOptions.find((option) => option.value === props.modelValue) || statusOptions[2];
});

const setOpen = (val: boolean) => {
  showDropdown.value = val;
  emit('update:open', val);
};

const close = () => {
  setOpen(false);
};

const toggleDropdown = () => {
  setOpen(!showDropdown.value);
};

defineExpose({ close });

const selectStatus = (status: UserStatus) => {
  if (status !== props.modelValue) {
    emit('request-change', status);
  }

  close();
};
</script>

<style scoped>
.status-dropdown-shell {
  position: relative;
  z-index: 40;
}

.status-dropdown {
  color: #4b5563;
  position: relative;
}

.status-trigger {
  color: inherit;
  display: flex;
  align-items: center;
  gap: 8px;
  box-sizing: border-box;
  background: #ececef;
  padding: 8px 12px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  user-select: none;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.04);
  transition: transform 0.22s ease, box-shadow 0.22s ease, background-color 0.22s ease;
}

.status-dropdown.expanded .status-trigger {
  transform: translateY(1px);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06), 0 10px 20px rgba(15, 23, 42, 0.1);
}

.status-dropdown.status-offline .status-trigger {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
}

.status-dropdown.status-online .status-trigger {
  background: rgba(255, 255, 255, 0.4);
  color: #315374;
  box-shadow: inset 0 0 0 1px rgba(86, 131, 179, 0.1);
  backdrop-filter: blur(8px);
}

.status-dropdown.status-break .status-trigger {
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
  font-weight: 600;
}

.status-triangle {
  width: 0;
  height: 0;
  margin-left: 2px;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid currentColor;
  transform-origin: center 2px;
  transition: transform 0.24s ease, opacity 0.24s ease;
  opacity: 0.82;
}

.status-triangle.expanded {
  transform: rotate(180deg);
  opacity: 1;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  min-width: 144px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 16px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.16);
  backdrop-filter: blur(18px);
  overflow: hidden;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  box-sizing: border-box;
  padding: 11px 12px;
  border: none;
  border-radius: 12px;
  background: transparent;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.dropdown-item:active {
  transform: scale(0.98);
}

.dropdown-item.active {
  background: rgba(59, 130, 246, 0.08);
}

.dropdown-item-label {
  flex: 1;
  color: #1f2937;
  font-size: 14px;
  text-align: left;
}

.dropdown-item-mark {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid #3b82f6;
  transform: rotate(-90deg);
}

.dropdown-menu-enter-active,
.dropdown-menu-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
  transform-origin: top left;
}

.dropdown-menu-enter-from,
.dropdown-menu-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.96);
}

.dropdown-menu-enter-to,
.dropdown-menu-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>
