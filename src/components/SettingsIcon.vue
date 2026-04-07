<template>
  <div class="settings-container">
    <!-- 全屏透明蒙层：菜单打开时出现，点击即关闭菜单 -->
    <view v-if="showMenu" class="settings-backdrop" @tap.stop="closeMenu"></view>

    <div class="more-icon" :class="[`status-${status}`, { active: showMenu }]" @tap.stop="toggleMenu">
      <div class="dots-container">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    </div>

    <!-- 下拉菜单：用 class 切换驱动 CSS 动画，不依赖 Transition 组件 -->
    <div class="dropdown-menu" :class="{ 'menu-visible': showMenu }" @tap.stop>
      <div v-for="(item, index) in menuItems" :key="index" class="menu-item" @tap="handleItemClick(item)">
        <span v-if="item.icon" class="item-icon">{{ item.icon }}</span>
        <span class="item-label">{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { clearToken, clearRememberedCredentials } from '@/utils/auth';

defineProps<{
  status: 'offline' | 'online' | 'break';
}>();

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void;
}>();

const showMenu = ref(false);

const menuItems = [
  { label: '系统设置', icon: '⚙️', action: 'settings' },
  { label: '清除缓存', icon: '🧹', action: 'clearCache' },
  { label: '检查更新', icon: '☁️', action: 'checkUpdate' },
  { label: '退出登录', icon: '🚪', action: 'logout' },
];

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
  emit('update:open', showMenu.value);
};

const closeMenu = () => {
  showMenu.value = false;
  emit('update:open', false);
};

const handleItemClick = (item: typeof menuItems[number]) => {
  closeMenu();

  if (item.action === 'logout') {
    uni.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          clearToken();
          // 注意：不要在这里调用 clearRememberedCredentials()，
          // 因为“记住我”的凭证应该持久保存，直到用户在登录页手动取消勾选。
          uni.reLaunch({ url: '/pages/login/index' });
        }
      },
    });
  } else {
    uni.showToast({ title: `触发: ${item.label}`, icon: 'none' });
  }
};

defineExpose({ close: closeMenu });
</script>

<style scoped>
.settings-container {
  position: relative;
}

/* 全屏蒙层 —— fixed 定位，z-index 高于页面内容但低于菜单本身 */
.settings-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 98;
  background-color: transparent;
}

.more-icon {
  position: relative;
  z-index: 100;
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
  transition: all 0.2s ease;
}

.more-icon.active {
  transform: scale(0.9);
  background: rgba(0, 0, 0, 0.05);
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

/* 下拉菜单 —— 默认隐藏，通过 class 切换控制显隐和动画 */
.dropdown-menu {
  position: absolute;
  top: 50px;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  min-width: 140px;
  padding: 8px;
  z-index: 99;
  border: 1px solid rgba(0, 0, 0, 0.05);

  /* 默认隐藏状态 */
  opacity: 0;
  transform: scale(0.4) translateY(-20px);
  transform-origin: top right;
  pointer-events: none;
  transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.25s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}

/* 展开状态 */
.dropdown-menu.menu-visible {
  opacity: 1;
  transform: scale(1) translateY(0);
  pointer-events: auto;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.menu-item:active {
  background-color: #f3f4f6;
}

.item-label {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.item-icon {
  font-size: 16px;
}
</style>
