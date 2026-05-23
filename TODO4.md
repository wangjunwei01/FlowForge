# TODO4: 数据存储与持久化

> 阶段：核心服务 | 优先级：P0（核心模块，必须测试通过）
> 依赖：TODO2, TODO3
> 预计周期：1-2 周

## 目标

实现数据持久化层：LocalProvider（文件存储）、Schema 迁移机制、自动保存、崩溃恢复。这是所有数据操作的基础，确保数据可靠存取和版本迁移。

---

## 任务清单

### 4.1 LocalProvider 实现

- [ ] `src/providers/local.provider.ts` — 实现 DataProvider 接口
- [ ] 流程 CRUD：getFlow / saveFlow / deleteFlow / listFlows
- [ ] 项目 CRUD：getProject / saveProject / deleteProject / listProjects
- [ ] 执行历史：saveExecution / getExecutions
- [ ] 显示配置：saveDisplayConfig / getDisplayConfig
- [ ] 文件组织结构遵循 PLAN.md 存储策略（.flowforge/projects/{id}/flows/{id}.json 等）

### 4.2 文件操作服务

- [ ] `src/services/file.service.ts` — 封装 Tauri 文件操作 IPC 调用
- [ ] 目录创建/删除/列表
- [ ] 文件读取/写入/删除
- [ ] 文件存在性检查
- [ ] 文件拷贝/移动
- [ ] 确保所有路径限定在 `$APPDATA` 内

### 4.3 Schema 迁移机制

- [ ] `src/providers/migrations/types.ts` — 迁移类型定义
- [ ] `src/providers/migrations/index.ts` — 迁移注册和执行
- [ ] 迁移执行逻辑：按版本号链式迁移（v1 → v2 → v3）
- [ ] 迁移前自动备份原文件
- [ ] 迁移失败时回滚到备份
- [ ] `src/services/migration.service.ts` — 迁移服务封装

### 4.4 设置存储

- [ ] `src/stores/settings.ts` — 设置 Store 完整实现
- [ ] 集成 tauri-plugin-store 存储全局设置
- [ ] 设置项：主题偏好、语言、代理配置、窗口状态等
- [ ] 设置的读取/保存/重置

### 4.5 自动保存机制

- [ ] `src/stores/autosave.ts` — 自动保存状态管理
- [ ] `src/composables/useAutosave.ts` — 自动保存 composable
- [ ] 编辑操作 debounce 5s 后自动保存到草稿文件
- [ ] 流程切换时立即保存当前流程
- [ ] 应用关闭前（beforeunload）保存
- [ ] 保存成功后清除 hasUnsavedChanges 标记

### 4.6 崩溃恢复

- [ ] 启动时检测 `.flowforge/drafts/` 目录
- [ ] 发现草稿文件时弹出提示："检测到未保存的修改，是否恢复？"
- [ ] 用户选择恢复：将草稿内容替换到对应流程
- [ ] 用户选择丢弃：删除草稿文件
- [ ] 恢复完成后清理草稿文件

### 4.7 单元测试

- [ ] LocalProvider CRUD 操作测试
- [ ] Schema 迁移链式测试（v1 → v2 → v3 模拟）
- [ ] Schema 迁移回滚测试
- [ ] 自动保存 debounce 测试
- [ ] 崩溃恢复流程测试
- [ ] 设置存储读写测试

---

## 验收标准

### 核心验收（必须通过）

| # | 验收项 | 通过条件 |
|---|--------|----------|
| 1 | 流程 CRUD | 可创建/读取/更新/删除流程文件，数据完整 |
| 2 | 项目 CRUD | 可创建/读取/更新/删除项目，流程列表正确 |
| 3 | 目录结构 | 文件按 PLAN.md 规划的结构存储（projects/{id}/flows/{id}.json） |
| 4 | Schema 迁移 | 旧版本数据可正确迁移到新版本，迁移链正确 |
| 5 | 迁移回滚 | 迁移失败时可回滚到备份，数据无损坏 |
| 6 | 自动保存 | 编辑 5s 后自动保存草稿，切换流程时立即保存 |
| 7 | 崩溃恢复 | 有草稿文件时弹出恢复提示，恢复后数据正确 |
| 8 | 设置持久化 | 主题/语言等设置可正确读写和重置 |
| 9 | 路径安全 | 所有文件操作限定在 $APPDATA 内 |
| 10 | 单元测试 | 所有 LocalProvider 和迁移测试通过 |

### 非核心验收（可后续补充）

| # | 验收项 | 通过条件 |
|---|--------|----------|
| 1 | 执行历史 | 执行记录可正确保存和查询 |
| 2 | 显示配置 | 节点显示配置可正确保存和恢复 |
| 3 | 大文件性能 | 100 节点流程的保存/加载时间 < 500ms |