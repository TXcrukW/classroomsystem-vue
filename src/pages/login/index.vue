<template>
  <view class="login-page">
    <view class="decor decor-circle-large"></view>
    <view class="decor decor-circle-medium"></view>
    <view class="decor decor-circle-soft"></view>
    <view class="decor decor-side-orb"></view>
    <view class="decor decor-line decor-line-one"></view>
    <view class="decor decor-line decor-line-two"></view>
    <view class="decor decor-ring"></view>
    <view class="decor decor-ring-dot"></view>
    <view class="decor decor-bottom-line"></view>
    <view class="decor decor-bottom-line-dot"></view>
    <view class="decor decor-mini-circle"></view>
    <view class="decor decor-gift"></view>

    <view class="page-shell">
      <text class="page-title">登录</text>

      <view class="welcome-row">
        <text class="welcome-copy">欢迎使用教室维修工单接单系统</text>
        <!--<text class="welcome-link" @tap="handleRegister">注册</text>-->
      </view>

      <view class="form-panel">
        <view class="field field-first">
          <view class="field-icon icon-user">
            <view class="icon-user-head"></view>
            <view class="icon-user-body"></view>
          </view>
          <input
            v-model.trim="username"
            class="field-input"
            type="text"
            placeholder="请输入用户名"
            placeholder-class="field-placeholder"
          />
        </view>

        <view class="field">
          <view class="field-icon icon-lock">
            <view class="icon-lock-body"></view>
            <view class="icon-lock-shackle"></view>
          </view>
          <input
            v-model="password"
            class="field-input"
            type="password"
            password
            placeholder="请输入密码"
            placeholder-class="field-placeholder"
          />
        </view>


        <button class="submit-button" :disabled="submitting" @tap="handleLogin">
          {{ submitting ? '登录中...' : '登录' }}
        </button>

        <view class="remember-row">
          <checkbox-group @change="handleRememberChange">
            <label class="remember-label">
              <checkbox :checked="rememberMe" class="remember-checkbox" color="#24b6e4" />
              <text class="remember-text">记住我</text>
            </label>
          </checkbox-group>
        </view>

        <view class="form-links">
          <text class="link-text" @tap="handleForgotPassword">忘记密码？</text>
          <text class="link-text link-text-primary" @tap="handleRegister">还没有账号？点此注册</text>
        </view>
      </view>
    </view>

    <view class="bottom-waves">
      <view class="wave wave-back"></view>
      <view class="wave wave-mid"></view>
      <view class="wave wave-front"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  clearRememberedCredentials,
  clearToken,
  getRememberedCredentials,
  getToken,
  saveRememberedCredentials,
  setToken,
  setCurrentUser,
} from '@/utils/auth';
import { verifyToken } from '@/api/tickets';

const username = ref('');
const password = ref('');
const submitting = ref(false);
const rememberMe = ref(false);

onMounted(async () => {
  const rememberedCredentials = getRememberedCredentials();
  if (rememberedCredentials) {
    username.value = rememberedCredentials.username;
    password.value = rememberedCredentials.password;
    rememberMe.value = true;
  }

  const token = getToken();
  if (token) {
    const isValid = await verifyToken();
    if (isValid) {
      uni.reLaunch({ url: '/pages/index/index' });
    } else {
      clearToken();
    }
  }
});

const handleRememberChange = (event: { detail?: { value?: string[] } }) => {
  rememberMe.value = !!event?.detail?.value?.length;
};

const handleLogin = async () => {
  if (!username.value) {
    uni.showToast({ title: '请输入用户名', icon: 'none' });
    return;
  }

  if (!password.value) {
    uni.showToast({ title: '请输入密码', icon: 'none' });
    return;
  }

  submitting.value = true;

  try {
    const API_BASE = 'http://192.168.10.2:6789'; // 遵循接口文档
    const res = await uni.request({
      url: `${API_BASE}/api/login`,
      method: 'POST',
      data: {
        username: username.value,
        password: password.value
      }
    });

    const data = res.data as any;

    if (res.statusCode === 200 && data.status === 'success') {
      const token = data.token;
      setToken(token);
      
      // 保存当前登录用户的 username 和 status
      if (data.user && data.user.username) {
        setCurrentUser(data.user.username);
        // 如果后端返回了用户上一次的状态，则保存以便在主页初始化
        if (data.user.status) {
          uni.setStorageSync('user_last_status', data.user.status);
        }
      } else {
        setCurrentUser(username.value); // fallback
      }

      if (rememberMe.value) {
        saveRememberedCredentials({
          username: username.value,
          password: password.value,
        });
      } else {
        clearRememberedCredentials();
      }
      
      uni.showToast({ title: '登录成功', icon: 'success' });
      
      setTimeout(() => {
        uni.reLaunch({
          url: '/pages/index/index',
        });
      }, 500);
    } else {
      uni.showToast({ 
        title: data.message || '登录失败', 
        icon: 'none' 
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    uni.showToast({ title: '网络请求失败', icon: 'none' });
  } finally {
    submitting.value = false;
  }
};

const handleForgotPassword = () => {
  uni.showToast({ title: '找回密码功能开发中', icon: 'none' });
};

const handleRegister = () => {
  uni.showToast({ title: '注册功能开发中', icon: 'none' });
};
</script>

<style scoped>
.remember-row {
  margin: 12px 0 0 2px;
  display: flex;
  align-items: center;
  min-height: 28px;
}
.remember-label {
  display: flex;
  align-items: center;
  font-size: 15px;
  color: #888;
  user-select: none;
}
.remember-checkbox {
  transform: scale(0.9);
  margin-right: 4px;
}
.remember-text {
  font-size: 15px;
  color: #666;
}
</style>

<style scoped>
.login-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 30% 35%, rgba(255, 244, 226, 0.58), transparent 28%),
    linear-gradient(180deg, #ffffff 0%, #fffdf8 46%, #ffffff 100%);
  position: relative;
  overflow: hidden;
}

.decor {
  position: absolute;
  z-index: 0;
}

.decor-circle-large {
  top: -48px;
  right: -82px;
  width: 236px;
  height: 236px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, rgba(144, 255, 242, 0.88), rgba(36, 190, 230, 0.92));
  opacity: 0.92;
}

.decor-circle-medium {
  top: -28px;
  right: 106px;
  width: 152px;
  height: 152px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(160, 255, 244, 0.58), rgba(73, 220, 210, 0.25));
}

.decor-circle-soft {
  top: 52px;
  right: -34px;
  width: 218px;
  height: 144px;
  border-radius: 50%;
  background: radial-gradient(circle at 25% 20%, rgba(190, 255, 245, 0.22), rgba(130, 232, 226, 0.08));
}

.decor-side-orb {
  top: 410px;
  left: -32px;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: radial-gradient(circle at 62% 38%, #8dfff2 0%, #4fdcd3 42%, #2bb3dc 100%);
  opacity: 0.98;
}

.decor-line {
  height: 2px;
  background: rgba(112, 226, 220, 0.55);
  transform-origin: center;
}

.decor-line-one {
  top: 92px;
  right: 110px;
  width: 224px;
  transform: rotate(47deg);
}

.decor-line-two {
  top: 142px;
  right: 58px;
  width: 192px;
  transform: rotate(-35deg);
}

.decor-ring {
  top: 372px;
  right: 78px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 3px solid rgba(94, 226, 223, 0.9);
  box-sizing: border-box;
}

.decor-ring::after {
  content: '';
  position: absolute;
  right: -8px;
  bottom: -3px;
  width: 12px;
  height: 3px;
  border-radius: 999px;
  background: rgba(94, 226, 223, 0.9);
  transform: rotate(45deg);
}

.decor-ring-dot {
  top: 416px;
  right: 34px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 2px solid rgba(94, 226, 223, 0.88);
}

.decor-bottom-line {
  left: 6px;
  bottom: 152px;
  width: 130px;
  height: 2px;
  background: rgba(112, 226, 220, 0.55);
  transform: rotate(35deg);
}

.decor-bottom-line-dot {
  left: 72px;
  bottom: 172px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 3px solid rgba(113, 232, 223, 0.88);
}

.decor-mini-circle {
  right: 172px;
  bottom: 98px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 2px solid rgba(113, 232, 223, 0.8);
}

.decor-gift {
  right: 44px;
  bottom: 98px;
  width: 18px;
  height: 22px;
  border: 2px solid rgba(156, 243, 233, 0.55);
  border-radius: 4px;
  box-sizing: border-box;
}

.decor-gift::before,
.decor-gift::after {
  content: '';
  position: absolute;
  background: rgba(156, 243, 233, 0.55);
}

.decor-gift::before {
  left: 50%;
  top: -3px;
  width: 2px;
  height: 25px;
  transform: translateX(-50%);
}

.decor-gift::after {
  left: 0;
  top: 7px;
  width: 100%;
  height: 2px;
}

.page-shell {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  padding: calc(var(--status-bar-height, 0px) + 30px) 20px 184px;
  box-sizing: border-box;
}

.page-title {
  display: block;
  text-align: center;
  font-size: 22px;
  line-height: 1;
  color: #222222;
  font-weight: 700;
  letter-spacing: 2px;
  margin-bottom: 62px;
}

.welcome-row {
  display: flex;
  align-items: center;
  margin-bottom: 70px;
  font-size: 14px;
  color: #747474;
  line-height: 1.4;
}

.welcome-copy {
  color: #747474;
}

.welcome-link {
  color: #16c8cf;
  font-weight: 600;
}

.form-panel {
  position: relative;
}

.field {
  display: flex;
  align-items: center;
  height: 58px;
  padding: 0 20px;
  box-sizing: border-box;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow:
    0 10px 26px rgba(220, 234, 232, 0.3),
    inset 0 0 10px rgba(232, 245, 243, 0.8);
  border: 1px solid rgba(240, 247, 246, 0.95);
  margin-bottom: 14px;
}

.field-first {
  margin-bottom: 16px;
}

.field-icon {
  position: relative;
  width: 22px;
  height: 22px;
  margin-right: 14px;
  flex-shrink: 0;
}

.icon-user-head {
  position: absolute;
  top: 1px;
  left: 6px;
  width: 10px;
  height: 10px;
  border: 2px solid #3b3b3b;
  border-radius: 50%;
  box-sizing: border-box;
}

.icon-user-body {
  position: absolute;
  left: 2px;
  bottom: 1px;
  width: 18px;
  height: 10px;
  border: 2px solid #3b3b3b;
  border-top: 0;
  border-radius: 0 0 10px 10px;
  box-sizing: border-box;
}

.icon-lock-body {
  position: absolute;
  left: 3px;
  bottom: 2px;
  width: 16px;
  height: 12px;
  border: 2px solid #3b3b3b;
  border-radius: 3px;
  box-sizing: border-box;
}

.icon-lock-shackle {
  position: absolute;
  top: 0;
  left: 6px;
  width: 10px;
  height: 9px;
  border: 2px solid #3b3b3b;
  border-bottom: 0;
  border-radius: 10px 10px 0 0;
  box-sizing: border-box;
}

.field-input {
  flex: 1;
  height: 58px;
  font-size: 15px;
  color: #4a4a4a;
}

.field-placeholder {
  color: #9f9f9f;
  font-size: 15px;
}

.submit-button {
  margin-top: 42px;
  height: 62px;
  border-radius: 999px;
  background: linear-gradient(90deg, #24b6e4 0%, #66efdd 100%);
  color: #ffffff;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 2px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 24px rgba(85, 218, 220, 0.2);
}

.submit-button::after {
  border: none;
}

.submit-button[disabled] {
  opacity: 0.72;
}

.form-links {
  margin-top: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 6px;
}

.link-text {
  color: #2e2e2e;
  font-size: 16px;
  font-weight: 500;
}

.link-text-primary {
  color: #16c8cf;
  font-size: 18px;
  font-weight: 700;
}

.bottom-waves {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -8px;
  height: 178px;
  z-index: 0;
}

.wave {
  position: absolute;
  left: -8%;
  width: 116%;
  border-radius: 50% 50% 0 0;
}

.wave-back {
  bottom: 46px;
  height: 94px;
  background: linear-gradient(90deg, rgba(193, 252, 242, 0.55) 0%, rgba(163, 241, 236, 0.5) 100%);
  clip-path: polygon(0 58%, 10% 46%, 22% 54%, 35% 45%, 50% 61%, 67% 42%, 82% 55%, 100% 36%, 100% 100%, 0 100%);
}

.wave-mid {
  bottom: 16px;
  height: 114px;
  background: linear-gradient(90deg, #7ef1de 0%, #48d9db 58%, #40bde6 100%);
  opacity: 0.74;
  clip-path: polygon(0 52%, 12% 38%, 24% 46%, 39% 34%, 56% 58%, 72% 40%, 85% 54%, 100% 33%, 100% 100%, 0 100%);
}

.wave-front {
  bottom: 0;
  height: 102px;
  background: linear-gradient(90deg, #63e8d6 0%, #31cde1 55%, #2aa6e0 100%);
  clip-path: polygon(0 34%, 18% 20%, 36% 28%, 56% 12%, 74% 40%, 100% 14%, 100% 100%, 0 100%);
}
</style>
