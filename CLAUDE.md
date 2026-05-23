# FlowForge 项目开发规则

> 本规则文档指导 Claude Code 如何按顺序开发 FlowForge 项目。所有模块必须按编号顺序开发，核心模块（P0）必须测试通过并验收后才能进入下一模块。

---

## 模块开发顺序

模块必须严格按以下顺序开发，因为存在依赖关系：

```
TODO1 (基础设施) → TODO2 (类型定义) → TODO3 (Rust后端) → TODO4 (数据存储)
                                              ↓                    ↓
TODO5 (画布系统) → TODO6 (状态管理) → TODO7 (HTTP节点) → TODO8 (数据映射) → TODO9 (执行引擎)
                                       ↗
TODO3 (Rust后端) + TODO6 (状态管理) → TODO10 (gRPC/WS/SSE/Mock)
TODO4 (数据存储) + TODO6 (状态管理) → TODO11 (项目管理/导入导出)
全部前序模块 → TODO12 (优化与发布)
```

**并行开发规则**：
- TODO5 可在 TODO2 完成后与 TODO3/TODO4 并行开发
- TODO6 必须在 TODO5 完成后开始
- TODO7 和 TODO8 在依赖满足后可与 TODO10 部分并行
- TODO11 在依赖满足后可与 TODO10 部分并行

---

## 验收规则

### P0 模块（核心模块）— 必须测试通过

TODO1 ~ TODO10 为 P0 核心模块。每个模块开发完成后：

1. **必须** 完成所有核心验收项测试
2. **必须** 在 ACCEPTANCE.md 中记录测试结果（将 ⬜ 改为 ✅ 或 ❌）
3. **必须** 核心验收项全部 ✅ 才能进入下一模块
4. 非核心验收项可以在后续统一测试时补充

### P1 模块（非核心模块）— 后续统一测试

TODO11 和 TODO12 为 P1 非核心模块：

1. 开发完成后进行基础功能验证即可
2. 非核心验收项在 TODO12 阶段统一测试
3. 验收结果仍需记录在 ACCEPTANCE.md

---

## 编码规范

### 通用规范

- 使用 TypeScript 严格模式（`strict: true`）
- 使用 ESLint + Prettier 格式化前端代码
- 使用 rustfmt + clippy 规范 Rust 代码
- Git 提交信息遵循 commitlint 规范（`feat:`, `fix:`, `chore:` 等）
- 每个模块完成后创建一个提交

### 前端规范

- 组件使用 Vue 3 Composition API + `<script setup>`
- 状态管理使用 Pinia Store
- 可复用逻辑提取为 composable（`use*.ts`）
- 类型定义放在 `src/types/` 目录
- 常量定义放在 `src/constants/` 目录
- 服务层放在 `src/services/` 目录
- 不使用 `any` 类型，必要时使用 `unknown`

### Rust 规范

- 错误处理使用 `anyhow` + `thiserror`
- 所有 IPC 命令参数和返回值使用 `#[derive(Serialize, Deserialize)]`
- 日志使用 `tauri-plugin-log`
- 文件操作限定在 `$APPDATA` 目录内

### 数据模型规范

- Flow 使用 `Record<string, FlowNode>` 而非 `Map<string, FlowNode>`
- FlowSnapshot 使用 `FlowNode[]` 数组
- 所有存储实体包含 `schemaVersion` 字段
- 环境变量引用语法统一为 `{{VAR_NAME}}`

---

## 测试规范

### 单元测试

- 每个模块开发时同步编写单元测试
- 前端测试框架：Vitest
- Rust 测试框架：`#[cfg(test)]` + `cargo test`
- 测试文件与源文件同目录或 `tests/` 目录

### 验收测试

- 每个模块开发完成后在 ACCEPTANCE.md 中记录验收结果
- 核心验收项（对应 TODO 中的"核心验收"表格）必须全部通过
- 非核心验收项可以暂不通过，但在 TODO12 阶段必须全部通过

### 验收流程

```
开发完成 → 编写/运行单元测试 → 核心验收项测试 → 更新 ACCEPTANCE.md → 进入下一模块
                                                    ↓ (如有不通过)
                                              修复问题 → 重新测试
```

---

## 文件结构约定

开发新模块时，遵循 PLAN.md 中定义的目录结构：

- **前端组件**：`src/components/{category}/{Name}.vue`
- **前端 Store**：`src/stores/{name}.ts`
- **前端 Composable**：`src/composables/use{Name}.ts`
- **前端服务**：`src/services/{name}.service.ts`
- **前端类型**：`src/types/{name}.types.ts`
- **前端常量**：`src/constants/{name}.ts`
- **Rust 命令**：`src-tauri/src/commands/{name}.rs`
- **Rust 服务**：`src-tauri/src/services/{name}.rs`
- **Rust 模型**：`src-tauri/src/models/{name}.rs`

---

## 依赖检查

进入新模块前确认前置依赖已完成：

| 模块 | 前置依赖 | 确认方式 |
|------|----------|----------|
| TODO1 | 无 | — |
| TODO2 | TODO1 | TODO1 核心验收通过 |
| TODO3 | TODO2 | TODO2 核心验收通过 |
| TODO4 | TODO2, TODO3 | TODO2 + TODO3 核心验收通过 |
| TODO5 | TODO1 | TODO1 核心验收通过 |
| TODO6 | TODO5 | TODO5 核心验收通过 |
| TODO7 | TODO3, TODO6 | TODO3 + TODO6 核心验收通过 |
| TODO8 | TODO3, TODO7 | TODO3 + TODO7 核心验收通过 |
| TODO9 | TODO7, TODO8 | TODO7 + TODO8 核心验收通过 |
| TODO10 | TODO3, TODO6 | TODO3 + TODO6 核心验收通过 |
| TODO11 | TODO4, TODO6 | TODO4 + TODO6 核心验收通过 |
| TODO12 | 全部 | 全部前序核心验收通过 |

---

## 重要提醒

1. **不要跳过模块**：每个模块都是后续模块的依赖，跳过会导致后续功能无法集成。
2. **必须写测试**：核心模块必须有单元测试，验收时检查测试通过情况。
3. **必须更新验收报告**：每完成一个模块，在 ACCEPTANCE.md 中更新验收结果。
4. **TypeScript 严格模式**：不允许使用 `any`，不允许 `@ts-ignore`。
5. **Rust 安全性**：所有文件操作限定在 `$APPDATA`，脚本沙箱禁止网络/文件访问。
6. **数据模型一致性**：前端 TypeScript 类型与 Rust 模型必须对齐，序列化/反序列化测试必须通过。
7. **暗色模式**：每个模块开发时必须同时考虑亮色和暗色模式的样式。
8. **参考 PLAN.md**：不确定技术细节时，以 PLAN.md 为准。