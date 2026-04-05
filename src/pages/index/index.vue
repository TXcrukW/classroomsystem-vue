
<template>
  <div class="main-container" :class="`status-${currentStatus}`">
    <!-- 顶部栏 -->
    <div class="top-bar">
      <div class="top-left">
        <UserAvatar :status="currentStatus" />
        <StatusDropdown v-model="currentStatus" :status="currentStatus" />
      </div>
      <div class="top-right">
        <SettingsIcon :status="currentStatus" />
      </div>
    </div>
    <!-- 主内容区 -->
    <div class="content-wrapper">
      <MainContent :status="currentStatus" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import UserAvatar from '@/components/UserAvatar.vue';
import StatusDropdown from '@/components/StatusDropdown.vue';
import SettingsIcon from '@/components/SettingsIcon.vue';
import MainContent from './MainContent.vue';

const currentStatus = ref<'offline' | 'online' | 'break'>('offline');
</script>

<style scoped>
.main-container {
  --header-bg: #2f2f31;
  --header-bg-soft: #3a3a3c;
  min-height: 100vh;
  background: linear-gradient(180deg, var(--header-bg) 0, var(--header-bg-soft) 176px, #f5f5f5 176px, #f5f5f5 100%);
  position: relative;
  overflow: hidden;
}

.main-container.status-offline {
  --header-bg: #2f2f31;
  --header-bg-soft: #3a3a3c;
}

.main-container.status-online {
  --header-bg: #d9ebff;
  --header-bg-soft: #e7f2ff;
}

.main-container.status-break {
  --header-bg: #ffe0e0;
  --header-bg-soft: #ffebeb;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: calc(var(--status-bar-height, 0px) + 12px) 16px 12px;
  position: relative;
  z-index: 20;
  background: var(--header-bg);
}

.top-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.top-right {
  display: flex;
  align-items: center;
}

.content-wrapper {
  position: relative;
  z-index: 1;
  background: transparent;
}
</style>
