# 校园工单项目 (classroomsystem-vue)

## 开发环境配置
本项目为基于 Vue 3 + Vite 的 uni-app 项目。

### 0. 前置要求
- **Node.js**: 建议版本 v18 (目前通过 nvm 降级使用 18.20.8 确保兼容性)
- **HBuilderX**: 如果使用真机调试，建议保持编译器版本与 SDK 匹配。

### 1. 安装依赖
由于依赖关系中存在 Vue 版本及 peerDependencies 冲突，安装时必须添加 `--legacy-peer-deps` 参数：

```bash
npm install --legacy-peer-deps
```

### 2. 开发与编译命令
在终端运行以下脚本：

- **运行 H5 开发版**: `npm run dev:h5`
- **编译 H5 发行版**: `npm run build:h5`
- **运行 微信小程序版**: `npm run dev:mp-weixin`
- **编译 微信小程序版**: `npm run build:mp-weixin`

### 3. 注意事项
- **版本不匹配警告**: 项目在 `src/manifest.json` 中已配置 `ignoreVersion: true` 以忽略 HBuilderX 与 SDK 的版本差异提示。
- **环境迁移**: 更换电脑后，请先安装 Node.js 18，然后执行上述 `npm install --legacy-peer-deps` 即可恢复开发。

---
## Git 提交规范
推荐本次修复的 Commit Message:
`fix: 修复 node 降级后的依赖冲突，统一 uni-app 版本并忽略编译器版本匹配警告`
