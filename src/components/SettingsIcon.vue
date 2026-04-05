<template>
  <div class="more-icon" :class="`status-${status}`">
    <div class="dots-container">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  status: 'offline' | 'online' | 'break';
}>();
</script>

<style scoped>
.more-icon {
  color: #6b7280;
  width: 40px;
  height: 40px;
  background: #ececef;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.04);
}

.more-icon.status-offline {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
}

.more-icon.status-online {
  background: rgba(255, 255, 255, 0.4);
  color: #5d7da6;
  box-shadow: inset 0 0 0 1px rgba(86, 131, 179, 0.1);
  backdrop-filter: blur(8px);
}

.more-icon.status-break {
  background: rgba(255, 255, 255, 0.4);
  color: #9d6a6a;
  box-shadow: inset 0 0 0 1px rgba(186, 110, 110, 0.1);
  backdrop-filter: blur(8px);
}

.dots-container {
  display: flex;
  gap: 3px;
}

.dot {
  width: 5px;
  height: 5px;
  background: currentColor;
  border-radius: 50%;
}
</style>
