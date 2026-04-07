<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { clearToken, getToken } from "@/utils/auth";
import { verifyToken } from "@/api/tickets";

const LOGIN_PAGE = "/pages/login/index";
const HOME_PAGE = "/pages/index/index";

let authCheckInFlight = false;

const getCurrentRoute = () => {
  const pages = getCurrentPages();
  return pages.length ? `/${pages[pages.length - 1].route}` : "";
};

const ensureAuthRoute = async () => {
  if (authCheckInFlight) {
    return;
  }

  authCheckInFlight = true;
  try {
    const token = getToken();
    const currentRoute = getCurrentRoute();

    if (!token) {
      if (currentRoute && currentRoute !== LOGIN_PAGE) {
        uni.reLaunch({ url: LOGIN_PAGE });
      }
      return;
    }

    const isValid = await verifyToken();
    if (!isValid) {
      clearToken();
      if (currentRoute !== LOGIN_PAGE) {
        uni.reLaunch({ url: LOGIN_PAGE });
      }
      return;
    }

    if (currentRoute === LOGIN_PAGE || !currentRoute) {
      uni.reLaunch({ url: HOME_PAGE });
    }
  } finally {
    authCheckInFlight = false;
  }
};

onLaunch(() => {
  console.log("App Launch");
  ensureAuthRoute();
});
onShow(() => {
  console.log("App Show");
  ensureAuthRoute();
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
