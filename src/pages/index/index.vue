
<template>
  <div class="main-container">
    <div class="hero-bg"></div>
    <!-- 顶部栏 -->
    <div class="top-bar">
      <div class="top-left">
        <UserAvatar />
        <StatusDropdown />
      </div>
      <div class="top-right">
        <SettingsIcon />
      </div>
    </div>
    <!-- 主内容区 -->
    <div class="content-wrapper">
      <MainContent />
    </div>
  </div>
</template>

<script setup lang="ts">
import UserAvatar from '@/components/UserAvatar.vue';
import StatusDropdown from '@/components/StatusDropdown.vue';
import SettingsIcon from '@/components/SettingsIcon.vue';
import MainContent from './MainContent.vue';
</script>

<style scoped>
.main-container {
  min-height: 100vh;
  background: #f2f4f8;
  padding: 0 16px 32px 16px;
  position: relative;
  overflow: hidden;
}
.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 220px;
  background: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.25), transparent 50%),
    linear-gradient(120deg, #3b7af7, #2d5df2 55%, #2a4fe8);
  border-bottom-left-radius: 28px;
  border-bottom-right-radius: 28px;
  z-index: 0;
}
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 8px 0 8px;
  position: relative;
  z-index: 1;
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
  margin-top: 22px;
  position: relative;
  z-index: 1;
}
</style>
