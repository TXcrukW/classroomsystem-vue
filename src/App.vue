<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { isSessionLoggedIn, resetSessionLogin } from "@/utils/auth";

const LOGIN_PAGE = "/pages/login/index";

const ensureLoginPageForGuest = () => {
  if (isSessionLoggedIn()) {
    return;
  }

  const pages = getCurrentPages();
  const currentRoute = pages.length ? `/${pages[pages.length - 1].route}` : "";
  if (currentRoute === LOGIN_PAGE) {
    return;
  }

  uni.reLaunch({ url: LOGIN_PAGE });
};

onLaunch(() => {
  console.log("App Launch");
  resetSessionLogin();
  uni.removeStorageSync("isLoggedIn");
  ensureLoginPageForGuest();
});
onShow(() => {
  console.log("App Show");
  ensureLoginPageForGuest();
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
