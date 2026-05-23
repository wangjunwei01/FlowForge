# TODO1: 项目基础设施

> 阶段：骨架搭建 | 优先级：P0（核心模块，必须测试通过）
> 依赖：无
> 预计周期：1-2 周

## 目标

搭建项目整体骨架，确保 Tauri 2 + Vue 3 + TypeScript 项目可运行、可开发、可测试。建立开发规范和工具链，为后续所有模块提供基础支撑。

---

## 任务清单

### 1.1 项目初始化

- [ ] 使用 `create-tauri-app` 脚手架创建 Tauri 2.x + Vue 3 + TypeScript 项目
- [ ] 确认 `cargo` 和 `node` 版本满足要求（Node 20+, Rust 1.77+）
- [ ] 验证 `pnpm tauri dev` 可正常启动开发服务器
- [ ] 验证 `pnpm tauri build` 可正常构建

### 1.2 工具链配置

- [ ] 配置 Vite（vite.config.ts）
- [ ] 配置 ESLint + Prettier（.eslintrc, .prettierrc）
- [ ] 配置 TypeScript（tsconfig.json）
- [ ] 配置 commitlint + husky（.commitlintrc.json, .husky/）
- [ ] 配置 Vitest 单元测试框架（vitest.config.ts）
- [ ] 配置 Playwright E2E 测试框架（playwright.config.ts）
- [ ] 配置 Rust 代码规范（rustfmt.toml, clippy）
- [ ] 添加 .gitignore

### 1.3 目录结构搭建

- [ ] 按 PLAN.md 规划创建完整目录结构（前端 `src/` + 后端 `src-tauri/src/`）
- [ ] 创建所有 `mod.rs` 和 `index.ts` 入口文件
- [ ] 创建占位文件确保目录结构完整

### 1.4 主题系统

- [ ] 实现 CSS 变量体系（src/assets/styles/variables.css）
- [ ] 实现亮色主题（themes/light.css）
- [ ] 实现暗色主题（themes/dark.css）
- [ ] 实现全局重置样式（global.css）
- [ ] 实现 useTheme composable（切换主题、持久化偏好、跟随系统）
- [ ] 集成 Element Plus 暗色模式

### 1.5 基础布局

- [ ] 实现三栏布局骨架：侧边栏 + 画布 + 配置面板（App.vue / FlowEditor.vue）
- [ ] 实现侧边栏可折叠/展开
- [ ] 实现配置面板可折叠/展开
- [ ] 设置最小窗口尺寸 1024x680

### 1.6 窗口管理

- [ ] 实现 useWindowState composable（位置/尺寸/最大化状态持久化）
- [ ] 注册 Tauri 窗口事件监听（resize, move, close）
- [ ] 应用启动时恢复上次窗口状态
- [ ] 应用关闭前保存窗口状态

### 1.7 应用菜单

- [ ] 实现 useAppMenu composable（File/Edit/View/Run/Help 菜单结构）
- [ ] 注册 Tauri 原生菜单
- [ ] 绑定菜单项到对应功能/快捷键

### 1.8 Pinia 状态管理

- [ ] 创建 Pinia store 骨架（canvas, node, execution, project, settings, tabs, autosave）
- [ ] 每个 store 定义基本 state 结构（与 PLAN.md 数据模型对齐）
- [ ] 配置 Pinia 持久化插件（如需要）

### 1.9 错误处理与日志

- [ ] 前端：实现全局错误拦截（Vue errorHandler + window.onerror）
- [ ] 前端：实现统一错误提示（Element Plus Message）
- [ ] 前端：实现错误码体系（ErrorCode 枚举）
- [ ] Rust：配置 anyhow + thiserror
- [ ] Rust：配置 tauri-plugin-log（日志级别、文件轮转）
- [ ] Rust：实现 IPC 错误序列化（Rust Error → 前端友好格式）

### 1.10 Tauri 2 安全配置

- [ ] 配置 capabilities/default.json（权限声明）
- [ ] 限制文件系统访问范围（$APPDATA/**）
- [ ] 声明所需的插件权限（fs, dialog, store, http 等）

### 1.11 国际化预留

- [ ] 集成 vue-i18n（src/i18n/index.ts）
- [ ] 创建中文语言包骨架（src/i18n/locales/zh-CN.ts）
- [ ] 创建英文语言包骨架（src/i18n/locales/en-US.ts）
- [ ] 配置 i18n fallback 机制

---

## 验收标准

### 核心验收（必须通过）

| # | 验收项 | 通过条件 |
|---|--------|----------|
| 1 | 项目启动 | `pnpm tauri dev` 可正常启动，界面显示三栏布局 |
| 2 | 主题切换 | 亮色/暗色模式切换正常，Element Plus 组件跟随切换 |
| 3 | 窗口持久化 | 关闭重新打开后，窗口位置/尺寸/最大化状态恢复 |
| 4 | 应用菜单 | File/Edit/View/Run/Help 菜单项显示正确 |
| 5 | 错误处理 | 前端异常能被全局拦截并显示友好提示 |
| 6 | 日志输出 | Rust 端日志能写入文件，前端错误能被记录 |
| 7 | 安全配置 | Tauri capabilities 配置正确，文件系统访问受限 |
| 8 | 开发工具链 | ESLint/Prettier/commitlint/Typeript 编译均无报错 |
| 9 | 单元测试框架 | `pnpm test:unit` 可正常运行（空测试套件通过） |
| 10 | 构建打包 | `pnpm tauri build` 可生成安装包 |

### 非核心验收（可后续补充）

| # | 验收项 | 通过条件 |
|---|--------|----------|
| 1 | 国际化 | 中英文切换正常，界面文字跟随变化 |
| 2 | E2E 框架 | Playwright 配置就绪，可运行空测试通过 |
| 3 | Rust 测试 | `cargo test` 可正常运行 |