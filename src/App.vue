<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
onLaunch(() => {
  console.log("App Launch");
});
onShow(() => {
  console.log("App Show");
});
onHide(() => {
  console.log("App Hide");
});
</script>
<style>
/* 禁用页面弹性滚动效果 */
page {
  overscroll-behavior: none;
  -webkit-overflow-scrolling: auto;
}
body {
  overscroll-behavior: none;
}
</style>
