<template>
  <div class="user-avatar">
    <div class="avatar-wrapper" :class="`status-${status}`">
      <svg class="avatar-icon" width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  status: 'offline' | 'online' | 'break';
}>();
</script>

<style scoped>
.user-avatar {
  display: flex;
  align-items: center;
}

.avatar-wrapper {
  color: #5f6368;
  width: 36px;
  height: 36px;
  background: #e5e7eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-wrapper.status-offline {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
}

.avatar-wrapper.status-online {
  background: rgba(255, 255, 255, 0.4);
  color: #56759b;
  box-shadow: inset 0 0 0 1px rgba(86, 131, 179, 0.1);
  backdrop-filter: blur(8px);
}

.avatar-wrapper.status-break {
  background: rgba(255, 255, 255, 0.4);
  color: #9d6a6a;
  box-shadow: inset 0 0 0 1px rgba(186, 110, 110, 0.1);
  backdrop-filter: blur(8px);
}

.avatar-icon {
  opacity: 0.7;
}
</style>
