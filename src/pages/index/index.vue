
<template>
  <div class="main-container" :class="`status-${currentStatus}`">
    <!-- 顶部栏 -->
    <div class="top-bar" @tap="dropdownOpen && closeStatusDropdown()">
      <div class="top-left">
        <UserAvatar :status="currentStatus" />
        <StatusDropdown
          ref="statusDropdownRef"
          :model-value="currentStatus"
          :status="currentStatus"
          @request-change="handleStatusRequest"
          @update:open="onDropdownOpenChange"
        />
      </div>
      <div class="top-right">
        <SettingsIcon :status="currentStatus" />
      </div>
    </div>
    <!-- 下拉遮罩：放在页面层级确保真机可点击 -->
    <view
      v-if="dropdownOpen"
      class="dropdown-overlay"
      @tap.stop="closeStatusDropdown"
    ></view>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <MainContent :status="currentStatus" />
    </div>

    <ConfirmDialog
      :visible="statusConfirmVisible"
      :title="statusDialogTitle"
      :message="statusDialogMessage"
      confirm-text="确认切换"
      cancel-text="再想想"
      @confirm="confirmStatusChange"
      @cancel="cancelStatusChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import UserAvatar from '@/components/UserAvatar.vue';
import StatusDropdown from '@/components/StatusDropdown.vue';
import SettingsIcon from '@/components/SettingsIcon.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import MainContent from './MainContent.vue';

type UserStatus = 'offline' | 'online' | 'break';

const statusLabelMap: Record<UserStatus, string> = {
  online: '上线',
  break: '小休',
  offline: '下线',
};

const statusDropdownRef = ref<{ close: () => void } | null>(null);
const dropdownOpen = ref(false);
const currentStatus = ref<UserStatus>('offline');
const pendingStatus = ref<UserStatus | null>(null);
const statusConfirmVisible = ref(false);

const onDropdownOpenChange = (val: boolean) => {
  dropdownOpen.value = val;
};

const closeStatusDropdown = () => {
  statusDropdownRef.value?.close();
  dropdownOpen.value = false;
};

const statusDialogTitle = computed(() => {
  if (!pendingStatus.value) {
    return '确认切换状态';
  }

  return `确认${statusLabelMap[pendingStatus.value]}？`;
});

const statusDialogMessage = computed(() => {
  if (!pendingStatus.value) {
    return '状态切换后，你的账号状态将更改。';
  }

  return `当前为${statusLabelMap[currentStatus.value]}，切换后将更新当前接单状态。`;
});

const resetStatusConfirm = () => {
  pendingStatus.value = null;
  statusConfirmVisible.value = false;
};

const handleStatusRequest = (nextStatus: UserStatus) => {
  if (nextStatus === currentStatus.value) {
    return;
  }

  pendingStatus.value = nextStatus;
  statusConfirmVisible.value = true;
};

const cancelStatusChange = () => {
  resetStatusConfirm();
};

const confirmStatusChange = () => {
  if (pendingStatus.value) {
    currentStatus.value = pendingStatus.value;
  }

  resetStatusConfirm();
};
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

.dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 19;
  background-color: rgba(0, 0, 0, 0.01);
}

.content-wrapper {
  position: relative;
  z-index: 1;
  background: transparent;
}
</style>
