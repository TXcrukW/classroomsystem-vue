<template>
  <div class="status-dropdown">
    <select>
      <option value="online">上线</option>
      <option value="break">小休</option>
      <option value="offline">下线</option>
    </select>
  </div>
</template>

<script setup lang="ts">
// 状态切换逻辑后续补充
</script>

<style scoped>
.status-dropdown select {
  margin-left: 8px;
  padding: 4px 8px;
}
</style>
