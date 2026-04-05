<template>
  <div class="user-avatar">
    <!-- 用户头像 -->
    <img src="/static/avatar.png" alt="用户头像" class="avatar-img" />
  </div>
</template>

<script setup lang="ts">
// 头像相关逻辑后续补充
</script>

<style scoped>
.user-avatar {
  display: flex;
  align-items: center;
}
.avatar-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
</style>
