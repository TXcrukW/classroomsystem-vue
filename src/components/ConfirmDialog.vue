<template>
  <div v-show="visible" class="dialog-root" :class="{ active: visible }">
    <div class="dialog-mask" @click="handleCancel"></div>
    <div class="dialog-panel" @click.stop>
      <div class="dialog-header">
        <p class="dialog-title">{{ title }}</p>
        <p v-if="message" class="dialog-message">{{ message }}</p>
      </div>
      <div class="dialog-actions">
        <button class="dialog-btn dialog-btn-cancel" type="button" @click="handleCancel">
          {{ cancelText }}
        </button>
        <button class="dialog-btn dialog-btn-confirm" type="button" @click="handleConfirm">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  visible: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}>(), {
  title: '确认操作',
  message: '',
  confirmText: '确认',
  cancelText: '取消',
});

const emit = defineEmits<{
  (event: 'confirm'): void;
  (event: 'cancel'): void;
}>();

const handleCancel = () => {
  emit('cancel');
};

const handleConfirm = () => {
  emit('confirm');
};
</script>

<style scoped>
.dialog-root {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.dialog-root.active {
  opacity: 1;
  pointer-events: auto;
}

.dialog-mask {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.3);
  backdrop-filter: blur(4px);
}

.dialog-panel {
  position: relative;
  z-index: 1;
  width: min(100%, 320px);
  overflow: hidden;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.18);
  transform: translateY(18px) scale(0.96);
  transition: transform 0.24s ease, opacity 0.24s ease;
  opacity: 0;
}

.dialog-root.active .dialog-panel {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.dialog-header {
  padding: 22px 20px 18px;
}

.dialog-title {
  margin: 0;
  color: #111827;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.4;
}

.dialog-message {
  margin: 8px 0 0;
  color: #4b5563;
  font-size: 14px;
  line-height: 1.6;
}

.dialog-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-top: 1px solid rgba(229, 231, 235, 0.9);
}

.dialog-btn {
  padding: 15px 12px;
  border: none;
  background: transparent;
  font-size: 15px;
  font-weight: 600;
}

.dialog-btn-cancel {
  color: #6b7280;
}

.dialog-btn-confirm {
  color: #2563eb;
  border-left: 1px solid rgba(229, 231, 235, 0.9);
}
</style>