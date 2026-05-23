# TODO2: 类型定义与数据模型

> 阶段：骨架搭建 | 优先级：P0（核心模块，必须测试通过）
> 依赖：TODO1
> 预计周期：1 周

## 目标

定义所有 TypeScript 类型和 Rust 数据模型，建立数据层基础。后续所有模块的数据结构都依赖此模块，必须确保类型完整、一致、可序列化。

---

## 任务清单

### 2.1 TypeScript 类型定义

- [ ] `src/types/node.types.ts` — 节点类型（FlowNode, NodeData, HTTPNodeData, gRPCNodeData, WebSocketNodeData, SSENodeData, MockNodeData, ScriptNodeData, TransformNodeData）
- [ ] `src/types/edge.types.ts` — 连线类型（FlowEdge, DataMapping, Port）
- [ ] `src/types/flow.types.ts` — 流程类型（Flow, FlowMeta, FlowSnapshot, HistoryState）
- [ ] `src/types/request.types.ts` — 请求类型（HTTPMethod, AuthConfig, ProxyConfig, SSLConfig）
- [ ] `src/types/mapping.types.ts` — 映射类型（DataMappingType, Variable, Environment, SecretRef）
- [ ] `src/types/execution.types.ts` — 执行类型（ExecutionContext, ExecutionRecord, NodeExecutionResult, ErrorStrategy, RetryConfig, Breakpoint, DebugState, DebugNodeResult, ResponseData, NodeDisplayConfig）
- [ ] `src/types/mock.types.ts` — Mock 类型（MockConfig, MockRoute, MockNodeData）
- [ ] `src/types/import.types.ts` — 导入类型（ImportSource, ImportResult, ImportError）
- [ ] `src/types/cookie.types.ts` — Cookie 类型（Cookie, CookieStorage）
- [ ] `src/types/proxy.types.ts` — 代理类型（ProxyConfig）
- [ ] `src/types/ssl.types.ts` — SSL/TLS 类型（SSLConfig）
- [ ] `src/types/proto.types.ts` — Proto 类型（ProtoFile, ProtoService, ProtoMethod, ProtoMessage）
- [ ] `src/types/menu.types.ts` — 菜单类型（AppMenu）
- [ ] `src/types/window.types.ts` — 窗口类型（WindowState）

### 2.2 类型研发重点

- [ ] 确保 Flow 使用 `Record<string, FlowNode>` 和 `Record<string, FlowEdge>`（而非 Map），保证 JSON 序列化正确
- [ ] 确保 FlowSnapshot 使用数组形式（`FlowNode[]` / `FlowEdge[]`），与 Flow 的 Record 形式可以互转
- [ ] 定义 `toSnapshot(flow: Flow): FlowSnapshot` 和 `fromSnapshot(snapshot: FlowSnapshot, flow: Flow): Flow` 工具函数
- [ ] 所有包含 `schemaVersion` 的实体使用 `CURRENT_SCHEMA_VERSION` 常量
- [ ] NodeType 枚举值与 Vue Flow 节点类型映射关系明确

### 2.3 常量定义

- [ ] `src/constants/nodeTypes.ts` — 节点类型常量（与 NodeType 枚举对应）
- [ ] `src/constants/httpMethods.ts` — HTTP 方法常量
- [ ] `src/constants/statusCodes.ts` — 常用状态码映射
- [ ] `src/constants/schema.ts` — Schema 版本常量（CURRENT_SCHEMA_VERSION = 1）
- [ ] `src/constants/sizes.ts` — 尺寸阈值常量（RESPONSE_SIZE_THRESHOLD, RESPONSE_SIZE_LARGE, MAX_DISPLAY_LINES）

### 2.4 Rust 数据模型

- [ ] `src-tauri/src/models/mod.rs` — 模块导出
- [ ] `src-tauri/src/models/request.rs` — HTTP 请求/响应模型（与前端类型对齐）
- [ ] `src-tauri/src/models/response.rs` — 响应模型
- [ ] `src-tauri/src/models/flow.rs` — 流程模型（仅 Rust 端需要的部分）
- [ ] `src-tauri/src/models/error.rs` — 自定义错误类型（AppError，含 ErrorCode 映射）
- [ ] 确保 Rust 模型与 TS 类型通过 serde_json 正确序列化/反序列化

### 2.5 DataProvider 接口

- [ ] `src/providers/types.ts` — 定义 DataProvider 接口（所有方法签名）
- [ ] `src/providers/types.ts` — 定义 FlowMeta, ProjectMeta 接口
- [ ] `src/providers/migrations/types.ts` — 定义 Migration 接口和迁移类型
- [ ] `src/providers/index.ts` — 导出

### 2.6 Rust 错误模型

- [ ] `src-tauri/src/utils/error.rs` — 统一错误处理（AppError 枚举，实现 From 各种底层错误）
- [ ] `src-tauri/src/utils/logger.rs` — 日志配置（tauri-plugin-log 初始化）
- [ ] `src-tauri/src/utils/mod.rs` — 模块导出

### 2.7 单元测试

- [ ] Flow ↔ FlowSnapshot 类型转换测试
- [ ] Rust 模型序列化/反序列化测试
- [ ] DataProvider 接口类型检查测试（编译时）

---

## 验收标准

### 核心验收（必须通过）

| # | 验收项 | 通过条件 |
|---|--------|----------|
| 1 | 类型完整 | PLAN.md 中所有数据模型在 TypeScript 中有对应类型定义 |
| 2 | 枚举正确 | NodeType 枚举覆盖所有节点类型，与 PLAN.md 一致 |
| 3 | Record 而非 Map | Flow.nodes 和 Flow.edges 使用 Record 类型，FlowSnapshot 使用数组 |
| 4 | 类型转换 | toSnapshot / fromSnapshot 函数可正确互转，单元测试通过 |
| 5 | Rust 模型对齐 | Rust 端模型与 TS 类型可正确序列化/反序列化 |
| 6 | 常量定义 | 所有常量文件存在且值与 PLAN.md 一致 |
| 7 | DataProvider 接口 | 接口定义完整，涵盖所有 CRUD 方法 |
| 8 | 编译通过 | 前端 `pnpm build` 和 Rust `cargo build` 均无类型错误 |
| 9 | 单元测试 | `pnpm test:unit` 和 `cargo test` 全部通过 |