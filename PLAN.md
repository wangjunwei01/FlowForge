# FlowForge 开发计划

## 项目背景

FlowForge 是一个可视化的接口测试工具，支持流程图式的节点编排。用户可以添加接口节点，将节点串联成链，前一个节点的输出可作为后一个节点的输入，多个节点的输出也可以汇聚到一个节点。节点在画布上支持拖拽操作和磁性链接（自动吸附对齐）。

**技术栈**：Tauri 2.x + Vue 3 + TypeScript
**目标体积**：10-30MB
**平台支持**：Windows / macOS / Linux
**接口类型**：HTTP RESTful API + gRPC + WebSocket + SSE
**数据传递**：JSONPath提取 + 脚本处理 + 可视化映射
**开发周期**：16周完整方案

---

## 架构总览

```
┌─────────────────────────────────────────────────────────────┐
│                       展示层 (Presentation)                  │
│   画布视图  |  侧边栏面板  |  配置面板  |  结果面板          │
│   多标签栏  |  主题系统    |  暗色模式                      │
├─────────────────────────────────────────────────────────────┤
│                     业务逻辑层 (Business)                    │
│  画布管理器 | 节点管理器 | 执行引擎 | 数据映射器             │
│  多流程管理器 | 自动保存管理器 | 崩溃恢复                    │
├─────────────────────────────────────────────────────────────┤
│                       服务层 (Service)                       │
│  HTTP客户端 | gRPC客户端 | WebSocket客户端 | SSE客户端       │
│  文件读写 | 认证服务 | 文档生成 | Mock Server               │
├─────────────────────────────────────────────────────────────┤
│                      数据抽象层 (Repository)                 │
│  数据提供者接口 | 本地存储提供者 | 远程存储提供者(预留)      │
│  Schema版本号 | 数据迁移链 | 自动保存                       │
├─────────────────────────────────────────────────────────────┤
│                      数据访问层 (Data Access)                │
│  流程存储 | 历史记录存储 | 项目存储                          │
├─────────────────────────────────────────────────────────────┤
│                    Tauri 原生层 (Native)                     │
│  窗口管理 | 系统API | IPC桥接 | 进程管理 | 代码签名更新     │
└─────────────────────────────────────────────────────────────┘
```

---

## 技术选型

| 分类 | 技术 | 说明 |
|------|------|------|
| 后端框架 | Tauri 2.x (Rust) | 体积小、跨平台、性能好 |
| 前端框架 | Vue 3.5+ (Composition API) + TypeScript 5.x | 生态成熟、组件丰富 |
| 状态管理 | Pinia 2.x | Vue 3 官方推荐，Pinia 3 尚在 alpha |
| 画布/流程图 | @vue-flow/core v1.x + @vue-flow/background + @vue-flow/controls | Vue 3 原生、轻量、API 友好 |
| UI组件库 | Element Plus 2.x | 组件丰富、文档完善、支持暗色模式 |
| JSONPath | jsonpath-plus | 功能完整的 JSONPath 实现 |
| 脚本引擎 | rquickjs (Rust 沙箱) | QuickJS 绑定，Windows 兼容性优于 quickjs crate |
| HTTP客户端 | axios (前端) + reqwest (Rust后端) | 双层 HTTP 支持 |
| gRPC | tonic + prost + prost-types (Rust后端) | Rust 原生 gRPC，prost-types 支持动态消息 |
| WebSocket | tokio-tungstenite (Rust后端) | Rust 原生 WebSocket |
| SSE | reqwest EventSource (Rust后端) | 基于 reqwest 的 SSE 支持 |
| Mock Server | axum (Rust后端) | 与 tonic/reqwest 同生态，共享 tokio 运行时 |
| 代码编辑器 | CodeMirror 6 | 轻量、可扩展 |
| 本地存储 | tauri-plugin-store (配置) + JSON文件 (流程) | 分层存储策略 |
| 数据库(可选) | SQLite (via tauri-plugin-sql) | 未来扩展支持 |
| 文档生成 | markdown-it | Markdown 文档生成 |
| 错误处理 | anyhow + thiserror (Rust) + 全局错误拦截 (前端) | 统一错误处理机制 |
| 日志系统 | tauri-plugin-log | 多级别日志记录 |
| 安全存储 | tauri-plugin-keyring | 系统密钥库存储敏感信息 |
| 应用更新 | tauri-plugin-updater | 内置自动更新（需代码签名） |
| 国际化 | vue-i18n (预留) | 多语言支持预留 |
| 单元测试 | Vitest (前端) + Rust 内置 test (后端) | 前后端统一测试框架 |
| E2E测试 | Playwright + Tauri WebDriver | 桌面应用 E2E 测试 |
| 代码规范 | ESLint + Prettier (前端) + clippy + rustfmt (后端) | 双端代码规范 |
| Git规范 | commitlint + husky | 提交信息规范 |

---

## 项目目录结构

```
FlowForge/
├── src-tauri/                       # Tauri Rust 后端
│   ├── src/
│   │   ├── main.rs                  # 应用入口
│   │   ├── lib.rs                   # 库定义
│   │   ├── commands/                # Tauri IPC 命令
│   │   │   ├── mod.rs
│   │   │   ├── http.rs              # HTTP 请求命令
│   │   │   ├── grpc.rs              # gRPC 请求命令
│   │   │   ├── websocket.rs         # WebSocket 命令
│   │   │   ├── script.rs            # 脚本执行命令
│   │   │   ├── store.rs             # 存储操作命令
│   │   │   └── keyring.rs           # 密钥库操作命令
│   │   ├── services/                # 核心服务
│   │   │   ├── mod.rs
│   │   │   ├── http_client.rs       # HTTP 客户端服务
│   │   │   ├── grpc_client.rs       # gRPC 客户端服务
│   │   │   ├── websocket_client.rs  # WebSocket 客户端服务
│   │   │   ├── script_engine.rs     # rquickjs 脚本沙箱
│   │   │   ├── mock_server.rs       # Mock Server 服务（基于 axum）
│   │   │   ├── proto_manager.rs     # Proto 文件解析与管理
│   │   │   ├── updater.rs           # 应用更新服务
│   │   │   └── keyring.rs           # 密钥库服务
│   │   ├── models/                  # 数据模型
│   │   │   ├── mod.rs
│   │   │   ├── request.rs           # 请求模型
│   │   │   ├── response.rs          # 响应模型
│   │   │   ├── flow.rs              # 流程模型
│   │   │   └── error.rs             # 错误模型
│   │   └── utils/                   # 工具函数
│   │       ├── mod.rs
│   │       ├── error.rs             # 统一错误处理
│   │       └── logger.rs            # 日志配置
│   ├── Cargo.toml                   # Rust 依赖配置
│   ├── tauri.conf.json              # Tauri 配置
│   └── icons/                       # 应用图标
│
├── src/                             # Vue 前端
│   ├── main.ts                      # 应用入口
│   ├── App.vue                      # 根组件
│   ├── assets/                      # 静态资源
│   │   ├── styles/                  # 全局样式
│   │   │   ├── variables.css        # CSS 变量（含暗色模式）
│   │   │   ├── global.css           # 全局重置样式
│   │   │   └── themes/              # 主题定义
│   │   │       ├── light.css        # 亮色主题
│   │   │       └── dark.css         # 暗色主题
│   │   └── icons/                   # 图标
│   │
│   ├── components/                  # 组件
│   │   ├── common/                  # 通用组件
│   │   │   ├── Button.vue
│   │   │   ├── Dialog.vue
│   │   │   ├── Tooltip.vue
│   │   │   └── TabBar.vue           # 多标签栏（流程切换）
│   │   ├── canvas/                  # 画布组件
│   │   │   ├── Canvas.vue           # 主画布（Vue Flow）
│   │   │   ├── CanvasControls.vue   # 画布控制（缩放/平移）
│   │   │   ├── MiniMap.vue          # 小地图
│   │   │   └── ContextMenu.vue      # 右键菜单
│   │   ├── nodes/                   # 节点组件
│   │   │   ├── BaseNode.vue         # 节点基类
│   │   │   ├── HTTPNode.vue         # HTTP 请求节点
│   │   │   ├── gRPCNode.vue         # gRPC 请求节点
│   │   │   ├── WebSocketNode.vue    # WebSocket 节点
│   │   │   ├── SSENode.vue          # SSE 节点
│   │   │   ├── ScriptNode.vue       # 脚本节点
│   │   │   ├── TransformNode.vue    # 数据转换节点
│   │   │   └── NodeHandles.vue      # 节点端口
│   │   ├── edges/                   # 连线组件
│   │   │   ├── CustomEdge.vue       # 自定义连线
│   │   │   └── EdgeLabel.vue        # 连线标签
│   │   ├── panels/                  # 面板组件
│   │   │   ├── SidebarPanel.vue     # 侧边栏（节点列表）
│   │   │   ├── ConfigPanel.vue      # 配置面板
│   │   │   ├── ResultPanel.vue      # 结果面板
│   │   │   ├── HeadersEditor.vue     # Headers 编辑器
│   │   │   ├── BodyEditor.vue        # Body 编辑器
│   │   │   ├── AuthEditor.vue        # 认证配置
│   │   │   ├── ParamsEditor.vue     # 参数编辑器
│   │   │   ├── CookieEditor.vue      # Cookie 管理编辑器
│   │   │   ├── ProxyEditor.vue       # 代理配置编辑器
│   │   │   ├── SSLEditor.vue         # SSL/TLS 配置编辑器
│   │   │   ├── ProtoManager.vue      # Proto 文件管理面板
│   │   │   └── ErrorStrategyEditor.vue # 错误策略配置（跳过/重试/终止）
│   │   ├── mapping/                 # 数据映射组件
│   │   │   ├── JSONPathEditor.vue   # JSONPath 编辑
│   │   │   ├── ScriptEditor.vue     # 脚本编辑器
│   │   │   ├── VisualMapper.vue     # 可视化映射
│   │   │   └── VariablePicker.vue   # 变量选择器
│   │   ├── execution/               # 执行相关组件
│   │   │   ├── ExecutionBar.vue     # 执行控制栏
│   │   │   ├── ExecutionLog.vue     # 执行日志
│   │   │   ├── NodeStatus.vue       # 节点状态指示
│   │   │   ├── ResponseViewer.vue   # 响应查看器
│   │   │   └── CancelButton.vue     # 请求取消/终止按钮
│   │   ├── import/                  # 导入组件
│   │   │   ├── ImportDialog.vue     # 导入对话框
│   │   │   ├── CurlParser.ts        # cURL 命令解析器
│   │   │   ├── PostmanImporter.ts   # Postman 集合导入
│   │   │   ├── InsomniaImporter.ts  # Insomnia 集合导入
│   │   │   └── OpenAPIImporter.ts   # OpenAPI/Swagger 导入
│   │   ├── export/                  # 导出组件
│   │   │   ├── ExportDialog.vue      # 导出对话框
│   │   │   └── CodeGenerator.ts      # 生成 cURL / Python requests / axios 代码
│   │   └── mock/                    # Mock 组件
│   │       ├── MockConfig.vue       # Mock 配置面板
│   │       └── MockServer.vue       # Mock 服务器状态
│   │
│   ├── views/                       # 页面视图
│   │   ├── FlowEditor.vue           # 流程编辑器主页面
│   │   ├── ProjectManager.vue       # 项目管理
│   │   └── Settings.vue             # 设置页面
│   │
│   ├── stores/                      # Pinia 状态管理
│   │   ├── canvas.ts                # 画布状态（节点、连线、选择）
│   │   ├── node.ts                  # 节点状态
│   │   ├── execution.ts             # 执行状态
│   │   ├── project.ts               # 项目状态
│   │   ├── settings.ts              # 设置状态
│   │   ├── tabs.ts                  # 多标签页状态
│   │   └── autosave.ts              # 自动保存状态
│   │
│   ├── composables/                 # 组合式函数
│   │   ├── useCanvas.ts             # 画布操作
│   │   ├── useNode.ts               # 节点操作
│   │   ├── useEdge.ts               # 连线操作
│   │   ├── useMagneticSnap.ts       # 磁性吸附逻辑
│   │   ├── useExecution.ts          # 执行操作（含 AbortController 取消）
│   │   ├── useDragDrop.ts           # 拖拽操作
│   │   ├── useClipboard.ts          # 剪贴板操作
│   │   ├── useKeyboard.ts           # 快捷键
│   │   ├── useHistory.ts            # 撤销/重做
│   │   ├── useDebugger.ts           # 断点调试
│   │   ├── useAutosave.ts           # 自动保存
│   │   ├── useTheme.ts              # 主题切换
│   │   ├── useImport.ts             # 外部导入
│   │   ├── useExport.ts             # 代码导出（cURL/Python/axios）
│   │   ├── useAppMenu.ts            # 应用菜单注册
│   │   └── useWindowState.ts        # 窗口状态持久化
│   │
│   ├── services/                    # 服务层
│   │   ├── http.service.ts          # HTTP 服务
│   │   ├── grpc.service.ts         # gRPC 服务
│   │   ├── websocket.service.ts     # WebSocket 服务
│   │   ├── sse.service.ts          # SSE 服务
│   │   ├── execution-engine.ts      # 流程执行引擎（支持并行分支 + 请求取消）
│   │   ├── file.service.ts          # 文件服务
│   │   ├── documentation.service.ts # 文档生成服务
│   │   ├── import.service.ts        # 外部导入服务
│   │   ├── export.service.ts        # 导出服务（cURL/代码生成）
│   │   ├── mock.service.ts          # Mock 服务
│   │   ├── migration.service.ts    # Schema 迁移服务
│   │   ├── cookie.service.ts        # Cookie 管理（按域存储/提取）
│   │   ├── proxy.service.ts         # 代理配置管理
│   │   ├── ssl.service.ts           # SSL/TLS 证书管理
│   │   ├── proto.service.ts         # Proto 文件管理（解析/缓存）
│   │   └── cancel.service.ts        # 请求取消管理（AbortController 封装）
│   │
│   ├── providers/                   # 数据抽象层
│   │   ├── index.ts                 # 导出
│   │   ├── types.ts                 # 数据提供者接口定义
│   │   ├── local.provider.ts        # 本地文件存储实现
│   │   ├── remote.provider.ts       # 远程存储实现(预留)
│   │   └── migrations/              # Schema 迁移脚本
│   │       ├── index.ts             # 迁移注册
│   │       ├── v1_to_v2.ts          # 版本迁移示例
│   │       └── types.ts             # 迁移类型定义
│   │
│   ├── types/                       # TypeScript 类型定义
│   │   ├── node.types.ts            # 节点类型
│   │   ├── edge.types.ts            # 连线类型
│   │   ├── flow.types.ts            # 流程类型
│   │   ├── request.types.ts         # 请求类型
│   │   ├── mapping.types.ts         # 映射类型
│   │   ├── execution.types.ts       # 执行类型
│   │   ├── mock.types.ts            # Mock 类型
│   │   ├── import.types.ts          # 导入类型
│   │   ├── cookie.types.ts          # Cookie 类型
│   │   ├── proxy.types.ts           # 代理类型
│   │   ├── ssl.types.ts             # SSL/TLS 类型
│   │   ├── proto.types.ts           # Proto 文件类型
│   │   ├── menu.types.ts            # 菜单类型
│   │   └── window.types.ts          # 窗口状态类型
│   │
│   ├── constants/                   # 常量定义
│   │   ├── nodeTypes.ts             # 节点类型常量
│   │   ├── httpMethods.ts           # HTTP 方法
│   │   ├── statusCodes.ts           # 状态码
│   │   └── schema.ts                # Schema 版本常量
│   │
│   ├── utils/                       # 工具函数
│   │   ├── error-handler.ts         # 统一错误处理
│   │   ├── logger.ts                # 日志工具
│   │   ├── crypto.ts                # 加密工具
│   │   ├── large-response.ts        # 大响应体处理（虚拟滚动、截断）
│   │   └── debounce.ts              # 防抖/节流工具
│   │
│   ├── i18n/                        # 国际化（预留）
│   │   ├── index.ts                 # i18n 初始化
│   │   └── locales/
│   │       ├── zh-CN.ts             # 中文
│   │       └── en-US.ts             # 英文
│   │
│   └── router/                      # 路由配置
│       └── index.ts
│
├── tests/                           # 测试
│   ├── unit/                        # 单元测试
│   │   ├── services/                # 服务测试
│   │   ├── composables/             # 组合式函数测试
│   │   └── utils/                   # 工具函数测试
│   └── e2e/                         # E2E 测试
│       ├── flow.spec.ts             # 流程编辑 E2E
│       ├── execution.spec.ts        # 执行测试
│       └── import.spec.ts           # 导入测试
│
├── public/                          # 公共资源
├── .github/                         # GitHub 配置
│   └── workflows/
│       ├── build.yml                # 构建工作流
│       └── release.yml              # 发布工作流
├── .husky/                          # Git hooks
├── .commitlintrc.json               # Commit 规范配置
├── package.json                     # 前端依赖
├── vite.config.ts                   # Vite 配置
├── tsconfig.json                    # TypeScript 配置
├── vitest.config.ts                 # Vitest 测试配置
├── playwright.config.ts             # Playwright E2E 配置
└── README.md
```

---

## 核心数据模型

```typescript
// ===== Schema 版本号 =====

// 每个存储实体包含 schemaVersion 字段，用于数据迁移
const CURRENT_SCHEMA_VERSION = 1;

// ===== 流程定义 =====

interface Flow {
  id: string;
  name: string;
  schemaVersion: number;          // 数据版本号，用于迁移
  nodes: Record<string, FlowNode>; // 使用 Record 替代 Map，确保 JSON 序列化正确
  edges: Record<string, FlowEdge>;
  variables: Variable[];
  createdAt: string;
  updatedAt: string;
}

// 节点定义
interface FlowNode {
  id: string;
  type: NodeType;  // HTTP_REQUEST | GRPC_REQUEST | WEBSOCKET | SSE | SCRIPT | DATA_TRANSFORM | MOCK
  position: { x: number; y: number };
  data: NodeData;
  inputs: Port[];   // 输入端口
  outputs: Port[];  // 输出端口
}

// 连接定义
interface FlowEdge {
  id: string;
  source: string;       // 源节点ID
  sourceHandle: string; // 源端口ID
  target: string;       // 目标节点ID
  targetHandle: string; // 目标端口ID
  dataMapping: DataMapping[];  // 数据映射配置
}

// 数据映射
interface DataMapping {
  type: 'jsonpath' | 'script' | 'visual' | 'direct';
  source: string;       // JSONPath表达式或脚本代码
  target: string;       // 目标字段路径
}

// 端口定义
interface Port {
  id: string;
  name: string;
  type: 'input' | 'output';
  dataType: 'any' | 'json' | 'string' | 'number' | 'boolean' | 'binary' | 'stream';
  required: boolean;
}

// ===== 节点类型扩展 =====

enum NodeType {
  HTTP_REQUEST = 'HTTP_REQUEST',
  GRPC_REQUEST = 'GRPC_REQUEST',
  WEBSOCKET = 'WEBSOCKET',
  SSE = 'SSE',
  SCRIPT = 'SCRIPT',
  DATA_TRANSFORM = 'DATA_TRANSFORM',
  MOCK = 'MOCK',
}

// 基础节点数据（所有节点类型的父类型）
interface NodeData {
  label: string;               // 节点显示名称
  description?: string;         // 节点描述
  disabled?: boolean;           // 是否禁用（跳过执行）
}

// WebSocket 消息定义
interface WSMessage {
  id: string;
  direction: 'send' | 'receive';
  content: string;
  timestamp: string;
  type?: 'text' | 'binary';   // 消息类型
}

// WebSocket 节点数据
interface WebSocketNodeData extends NodeData {
  url: string;
  protocols: string[];
  messages: WSMessage[];
  reconnect?: boolean;          // 断线自动重连
  reconnectInterval?: number;   // 重连间隔(ms)
}

// SSE 节点数据
interface SSENodeData extends NodeData {
  url: string;
  headers: Record<string, string>;
  lastEventId?: string;
  reconnect?: boolean;          // 自动重连
  reconnectInterval?: number;   // 重连间隔(ms)
}

// Mock 节点数据
interface MockNodeData extends NodeData {
  port: number;
  routes: MockRoute[];
  autoStart: boolean;
  corsEnabled?: boolean;       // 是否启用 CORS
  defaultHeaders?: Record<string, string>; // 全局默认响应头
}

interface MockRoute {
  method: string;
  path: string;
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  delay?: number;
}

// HTTP 请求节点数据（最核心的节点类型）
interface HTTPNodeData extends NodeData {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  url: string;
  headers: Record<string, string>;
  params: Record<string, string>;       // URL 查询参数
  body?: {
    type: 'json' | 'form' | 'raw' | 'binary' | 'none';
    content: string;
    binaryFilePath?: string;
  };
  auth?: AuthConfig;                    // 认证配置
  timeout?: number;                     // 请求超时(ms)
  followRedirects?: boolean;            // 是否跟随重定向
  proxy?: ProxyConfig;                  // 代理配置
  ssl?: SSLConfig;                      // SSL/TLS 配置
}

// 认证配置
interface AuthConfig {
  type: 'none' | 'basic' | 'bearer' | 'apikey' | 'oauth2';
  basic?: { username: string; password: string };
  bearer?: { token: string };
  apikey?: { key: string; value: string; addTo: 'header' | 'query' };
  oauth2?: {
    grantType: 'authorization_code' | 'client_credentials' | 'password';
    tokenUrl: string;
    clientId: string;
    clientSecret: string;
    scopes?: string[];
  };
}

// 代理配置
interface ProxyConfig {
  enabled: boolean;
  type: 'http' | 'socks5';
  host: string;
  port: number;
  username?: string;
  password?: string;
}

// SSL/TLS 配置
interface SSLConfig {
  verify?: boolean;                      // 是否验证证书
  clientCertPath?: string;              // 客户端证书路径
  clientKeyPath?: string;               // 客户端私钥路径
  caCertPath?: string;                  // CA 证书路径
}

// Cookie 定义
interface Cookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

// 执行上下文（运行时状态）
interface ExecutionContext {
  variables: Record<string, any>;        // 当前变量池
  nodeResults: Record<string, any>;      // 各节点执行结果
  cookies: Record<string, Cookie[]>;         // Cookie 存储（域名 → Cookie 数组）
  environment: Environment;              // 当前环境
}

// 项目定义
interface Project {
  id: string;
  name: string;
  description?: string;
  schemaVersion: number;
  flows: string[];                       // 流程 ID 列表
  environments: Environment[];           // 环境列表
  activeEnvironmentId: string;          // 当前激活环境 ID
  createdAt: string;
  updatedAt: string;
}

// 项目元信息
interface ProjectMeta {
  id: string;
  name: string;
  description?: string;
  flowCount: number;
  createdAt: string;
  updatedAt: string;
}

// 执行错误策略
type ErrorStrategy = 'abort' | 'skip' | 'retry';
interface RetryConfig {
  maxRetries: number;                   // 最大重试次数
  retryDelay: number;                    // 重试间隔(ms)
  retryOn: number[];                     // 哪些状态码触发重试
}

// 窗口状态持久化
interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMaximized: boolean;
}

// 应用菜单结构
interface AppMenu {
  file: {
    newProject: string;
    openProject: string;
    save: string;
    saveAs: string;
    exportFlow: string;
    importFlow: string;
    settings: string;
    quit: string;
  };
  edit: {
    undo: string;
    redo: string;
    cut: string;
    copy: string;
    paste: string;
    delete: string;
    selectAll: string;
    find: string;
  };
  view: {
    zoomIn: string;
    zoomOut: string;
    resetZoom: string;
    toggleSidebar: string;
    toggleDarkMode: string;
    toggleMinimap: string;
  };
  run: {
    runFlow: string;
    debugFlow: string;
    stepOver: string;
    stop: string;
  };
  help: {
    documentation: string;
    keyboardShortcuts: string;
    about: string;
  };
}

// ===== 字段显示配置 =====

// 字段显示配置
interface FieldDisplayConfig {
  field: string;           // 原始字段名，支持JSONPath: "data.user.id"
  label: string;           // 显示名称: "用户ID"
  format?: 'raw' | 'datetime' | 'number' | 'boolean' | 'custom';
  formatOptions?: {
    dateFormat?: string;   // 日期格式化: "YYYY-MM-DD HH:mm:ss"
    numberFormat?: string; // 数字格式化: "0.00"
    customTemplate?: string; // 自定义模板: "{value} 次"
  };
  visible: boolean;        // 是否显示
  order: number;          // 显示顺序
}

// 节点显示配置
interface NodeDisplayConfig {
  nodeId: string;
  viewMode: 'raw' | 'formatted' | 'mapped';  // 显示模式
  fields: FieldDisplayConfig[];
}

// 响应数据包装
interface ResponseData {
  raw: any;                          // 原始响应
  formatted?: Record<string, any>;   // 格式化后的数据
  displayConfig?: NodeDisplayConfig; // 显示配置
  truncated?: boolean;               // 是否被截断（大响应体）
  sizeBytes?: number;                // 响应体大小
}

// ===== 大响应体处理策略 =====

// 当响应体超过阈值时：
// - < 100KB: 正常渲染
// - 100KB ~ 1MB: 虚拟滚动 + 延迟解析
// - > 1MB: 仅显示摘要信息 + 按需加载
const RESPONSE_SIZE_THRESHOLD = 100 * 1024;     // 100KB
const RESPONSE_SIZE_LARGE = 1024 * 1024;        // 1MB
const MAX_DISPLAY_LINES = 10000;                 // 最大显示行数

// ===== 数据抽象层 =====

// 数据提供者接口
interface DataProvider {
  // 流程操作
  getFlow(id: string): Promise<Flow>;
  saveFlow(flow: Flow): Promise<void>;
  deleteFlow(id: string): Promise<void>;
  listFlows(projectId: string): Promise<FlowMeta[]>;

  // 项目操作
  getProject(id: string): Promise<Project>;
  saveProject(project: Project): Promise<void>;
  deleteProject(id: string): Promise<void>;
  listProjects(): Promise<ProjectMeta[]>;

  // 执行历史
  saveExecution(execution: ExecutionRecord): Promise<void>;
  getExecutions(flowId: string, limit?: number): Promise<ExecutionRecord[]>;

  // 显示配置
  saveDisplayConfig(nodeId: string, config: NodeDisplayConfig): Promise<void>;
  getDisplayConfig(nodeId: string): Promise<NodeDisplayConfig | null>;

  // Schema 迁移
  migrate(data: any, fromVersion: number): Promise<any>;
}

// 流程元信息
interface FlowMeta {
  id: string;
  name: string;
  description?: string;
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
  nodeCount: number;
}

// 执行记录
interface ExecutionRecord {
  id: string;
  flowId: string;
  status: 'success' | 'failed' | 'partial';
  startTime: string;
  endTime: string;
  nodeResults: Record<string, NodeExecutionResult>;
}

interface NodeExecutionResult {
  nodeId: string;
  status: 'success' | 'failed' | 'skipped';
  response?: ResponseData;
  error?: string;
  duration: number;  // 执行耗时(ms)
}

// ===== 撤销/重做系统 =====

// 流程快照（统一使用数组，与 Flow 的 Record 类型一致）
interface FlowSnapshot {
  timestamp: number;
  nodes: FlowNode[];
  edges: FlowEdge[];
  action: string;  // 操作描述: "移动节点" / "创建连线" / "删除节点"
}

// 历史状态管理
interface HistoryState {
  past: FlowSnapshot[];      // 过去状态栈（最多50条）
  present: FlowSnapshot;      // 当前状态
  future: FlowSnapshot[];     // 未来状态栈（用于重做）
}

// ===== 自动保存与崩溃恢复 =====

interface AutosaveState {
  lastSavedAt: number;           // 上次保存时间戳
  hasUnsavedChanges: boolean;    // 是否有未保存修改
  draftFlowId: string | null;   // 草稿流程ID（崩溃恢复用）
}

// 自动保存策略：
// - 编辑操作 debounce 5s 后自动保存
// - 流程切换时立即保存
// - 应用关闭时保存
// - 启动时检测草稿文件，提示恢复

// ===== 环境变量与敏感信息 =====

// 变量定义
interface Variable {
  key: string;
  value: string;
  description?: string;
  sensitive: boolean;        // 是否为敏感信息
}

// 环境定义
interface Environment {
  id: string;
  name: string;              // "开发环境" / "生产环境"
  description?: string;
  variables: Variable[];
  isActive: boolean;         // 当前激活的环境
  createdAt: string;
  updatedAt: string;
}

// 敏感信息引用（存储在系统密钥库）
interface SecretRef {
  id: string;
  key: string;               // 变量名
  keyringService: string;    // 密钥库服务名
  keyringAccount: string;    // 密钥库账户名
}

// 变量引用语法统一为 {{VAR_NAME}}
// 在 URL、Headers、Body、脚本中均可使用

// ===== 断点调试 =====

// 断点定义
interface Breakpoint {
  nodeId: string;
  enabled: boolean;
  condition?: string;        // 条件表达式，如 "{{response.status}} == 200"
  hitCount?: number;         // 命中次数限制
}

// 调试状态
interface DebugState {
  mode: 'run' | 'debug' | 'step';
  currentNodeId: string | null;
  breakpoints: Record<string, Breakpoint>;
  callStack: string[];       // 执行调用栈
  watchVariables: Record<string, any>;  // 监视变量
}

// 调试执行结果
interface DebugNodeResult {
  nodeId: string;
  input: any;                // 输入数据快照
  output: any;               // 输出数据快照
  variables: Record<string, any>; // 执行后变量状态
  duration: number;
  status: 'success' | 'failed' | 'paused';
}

// ===== Mock Server =====

interface MockConfig {
  port: number;
  routes: MockRoute[];
  running: boolean;
}

// ===== 外部导入 =====

interface ImportSource {
  type: 'curl' | 'postman' | 'insomnia' | 'openapi';
  data: string | File;
}

// 导入结果
interface ImportResult {
  success: boolean;
  importedCount: number;
  skippedCount: number;
  errors: ImportError[];
}

interface ImportError {
  item: string;
  reason: string;
}
```

---

## 关键技术方案

### 1. 磁性链接（自动吸附对齐）

使用 Vue Flow 的 `snapGrid` 配置 + 自定义吸附检测逻辑：

```typescript
// Vue Flow 配置
<VueFlow
  :snap-to-grid="true"
  :snap-grid="[16, 16]"
  @node-drag="onNodeDrag"
/>

// 吸附到网格
const snapPosition = (pos) => ({
  x: Math.round(pos.x / 16) * 16,
  y: Math.round(pos.y / 16) * 16
});

// 端口吸附检测：拖拽连线时，检测附近可连接的端口
// 吸附阈值内自动高亮并吸附
```

**注意**：Vue Flow 本身不提供磁性吸附功能，需要通过 `@node-drag` 事件和自定义逻辑实现。核心是监听拖拽事件，计算节点间距离，在阈值内自动调整位置实现对齐。

### 2. 可视化数据映射

左右双栏 + SVG连线 拖拽映射：
- 左栏：源节点响应数据的树形视图
- 右栏：目标节点请求数据的结构视图
- 从左栏拖拽字段到右栏，自动生成映射关系
- SVG实时绘制映射连线

### 3. 执行引擎（支持并行分支）

基于 Kahn 算法的拓扑排序 + 并行调度：

```
1. 根据节点和连线构建有向无环图（DAG）
2. 拓扑排序确定执行层级
3. 按层级执行：
   - 同一层级内无依赖关系的节点并行执行
   - 前一层级全部完成后才开始下一层级
4. 收集各节点输出，作为后续节点输入
5. 如检测到循环依赖，报错终止
```

```typescript
// 执行引擎伪代码
async function executeFlow(flow: Flow, context: ExecutionContext): Promise<ExecutionResult> {
  const layers = topologicalSort(flow.nodes, flow.edges);
  for (const layer of layers) {
    // 同层节点并行执行
    const results = await Promise.allSettled(
      layer.map(node => executeNode(node, context))
    );
    // 收集结果，更新上下文
    for (const result of results) {
      if (result.status === 'rejected') {
        // 根据错误策略决定：跳过 / 终止 / 继续
      }
    }
  }
}
```

### 4. 脚本沙箱

Rust 后端使用 rquickjs 隔离执行（Windows 兼容性更好）：
- 禁用网络/文件访问
- 超时保护（默认5秒）
- 内存限制
- 注入安全的 console.log 和 $input 变量

> **注意**：原方案中 `quickjs` crate 在 Windows 上编译可能有问题。`rquickjs` 是更成熟的 Rust QuickJS 绑定，跨平台兼容性更好。

### 5. gRPC 支持

Rust tonic + prost + prost-types 原生 gRPC：
- Proto 文件解析和动态消息构建（使用 prost-types）
- 支持 Unary、Server Streaming、Client Streaming、Bidirectional Streaming 四种调用模式
- 元数据（Metadata）传递
- Streaming 调用的 UI 需单独设计（见下方）

**gRPC Streaming UI 设计**：

| 模式 | UI 表现 |
|------|---------|
| Unary | 同 HTTP 请求：发送 → 等待响应 |
| Server Streaming | 发送请求后，响应区域实时追加消息流，自动滚动 |
| Client Streaming | 请求区域支持逐条发送消息，可手动结束流 |
| Bidirectional | 上下分栏：上方发送区，下方接收区，两侧同时滚动 |

### 6. WebSocket / SSE 支持

| 类型 | 实现方式 | UI 特点 |
|------|----------|---------|
| WebSocket | tokio-tungstenite (Rust后端) | 实时消息流，支持发送/接收双向面板 |
| SSE | reqwest EventSource (Rust后端) | 只读事件流，自动重连支持 |

### 7. 体积优化

Cargo.toml release 配置：
```toml
[profile.release]
lto = true          # 链接时优化
codegen-units = 1   # 单代码生成单元
panic = "abort"     # 不展开panic
strip = true        # 剥离符号表
opt-level = "z"     # 优化体积
```

**性能预算**：

| 指标 | 目标 |
|------|------|
| 安装包体积 | 10-30MB |
| 冷启动时间 | < 3s |
| 画布最大节点数 | 500 节点流畅操作 |
| 响应体渲染 | < 100KB 正常渲染，> 1MB 虚拟滚动 |
| 流程保存 | < 500ms |
| 应用最小窗口 | 1024 x 680 px |

### 8. 节点结果显示增强

每个节点支持多种查看模式，用户可在原始数据与格式化展示之间切换：

```
┌─────────────────────────────────────────┐
│  [原始] [格式化] [映射预览]             │  ← 切换标签
├────────────────────┬────────────────────┤
│  原始JSON          │  格式化显示         │
│  "userid": "xxx"   │  用户ID: xxx       │
│  "created_at": ... │  创建时间: ...      │
└────────────────────┴────────────────────┘
```

**实现要点**：
- `ResponseViewer.vue` 组件支持三种视图模式切换
- `NodeDisplayConfig` 定义字段标签映射和格式化规则
- 格式化模式根据 `FieldDisplayConfig` 渲染字段，支持自定义显示名称、格式类型、排序和可见性
- 映射预览模式展示当前节点输出经过数据映射后的效果
- 大响应体自动启用虚拟滚动，避免 DOM 节点过多造成卡顿

### 9. 数据层抽象（Repository 模式）

所有数据操作通过 `DataProvider` 接口抽象，业务层不直接依赖具体存储实现：

```
┌──────────────┐
│   Service    │  业务逻辑，仅依赖 DataProvider 接口
├──────────────┤
│  Repository  │  DataProvider 接口定义
├──────────────┤
│   Provider   │  LocalProvider (当前) / RemoteProvider (预留)
└──────────────┘
```

**实现要点**：
- `providers/types.ts` 定义 `DataProvider` 接口
- `LocalProvider` 实现本地文件读写，第一阶段使用
- `RemoteProvider` 预留接口，未来对接远程服务器
- 通过依赖注入在应用启动时注册 Provider 实例
- Service 层通过 `DataProvider` 接口访问数据，不直接操作文件或数据库

### 10. Schema 迁移机制

随版本迭代，数据结构可能变更。所有存储实体内嵌 `schemaVersion` 字段，加载时自动迁移：

```typescript
// migration.service.ts
const migrations: Migration[] = [
  {
    fromVersion: 1,
    toVersion: 2,
    migrate: (data: FlowV1): FlowV2 => {
      // 例如：将 Map 格式迁移为 Record 格式
      // 或新增必填字段时填充默认值
      return { ...data, newField: 'defaultValue', schemaVersion: 2 };
    }
  },
];

async function migrateFlow(data: any): Promise<Flow> {
  let current = data;
  while (current.schemaVersion < CURRENT_SCHEMA_VERSION) {
    const migration = migrations.find(m => m.fromVersion === current.schemaVersion);
    if (!migration) throw new Error(`No migration from version ${current.schemaVersion}`);
    current = migration.migrate(current);
  }
  return current;
}
```

**要点**：
- 迁移是单向的、链式的（v1 → v2 → v3）
- 迁移前自动备份原文件
- 迁移失败时回滚到备份

### 11. 自动保存与崩溃恢复

```
┌─────────────────────────────────────────────────────────┐
│  自动保存                                                │
│  ├─ 编辑操作 debounce 5s 后自动保存到草稿文件            │
│  ├─ 流程切换时立即保存当前流程                           │
│  ├─ 应用关闭前（beforeunload）保存                       │
│  └─ 保存成功后清除 hasUnsavedChanges 标记                │
├─────────────────────────────────────────────────────────┤
│  崩溃恢复                                                │
│  ├─ 启动时检测 .flowforge/drafts/ 目录                  │
│  ├─ 发现草稿文件时弹出提示：                             │
│  │   "检测到未保存的修改，是否恢复？"                    │
│  │   [恢复] [丢弃]                                      │
│  └─ 用户选择恢复后，将草稿内容替换到对应流程              │
└─────────────────────────────────────────────────────────┘
```

### 12. 多标签页管理

支持同时打开多个流程，通过标签栏切换：

```
┌─────────────────────────────────────────────────┐
│  [流程1] [流程2*] [+]                            │  ← 标签栏
├─────────────────────────────────────────────────┤
│                                                  │
│              当前流程的画布内容                    │
│                                                  │
└─────────────────────────────────────────────────┘
```

**实现要点**：
- `tabs.ts` 管理打开的流程列表和当前激活标签
- 切换标签时自动保存当前流程
- 标签上显示未保存标记（•）
- 关闭标签时检查未保存修改
- 支持拖拽排序标签

### 13. 主题系统与暗色模式

```css
/* variables.css */
:root {
  /* 亮色主题 */
  --bg-primary: #ffffff;
  --text-primary: #1d1d1f;
  /* ... */
}

[data-theme="dark"] {
  /* 暗色主题 */
  --bg-primary: #1e1e1e;
  --text-primary: #e5e5e5;
  /* ... */
}
```

**实现要点**：
- Element Plus 内置暗色模式支持，通过 `document.documentElement.setAttribute('data-theme', 'dark')` 切换
- 画布组件（Vue Flow）需要自定义暗色样式
- 主题偏好持久化到 `settings.json`
- 跟随系统主题选项

### 14. 外部工具导入

支持从主流 API 工具导入集合：

| 来源 | 导入方式 | 支持内容 |
|------|----------|----------|
| cURL | 解析 cURL 命令文本 | 请求方法、URL、Headers、Body |
| Postman | 解析 Collection JSON | 请求集合、环境变量、认证配置 |
| Insomnia | 解析 Insomnia YAML/JSON | 请求集合、环境 |
| OpenAPI | 解析 Swagger/OpenAPI JSON/YAML | API 定义、Schema |

**实现要点**：
- `ImportDialog.vue` 提供可视化导入向导
- 解析器将外部格式转换为 FlowForge 的 Flow 格式
- 导入结果预览，允许用户选择导入哪些接口
- 导入失败的项目（不支持的特性）在结果中列出

### 15. Mock Server

在本地启动轻量 HTTP 服务器，模拟 API 响应：

```
┌─────────────────────────────────────────┐
│  Mock Server                             │
│  端口: [8080] [启动]                     │
├─────────────────────────────────────────┤
│  路由列表                                │
│  GET  /api/users    → 200 { users: [] } │
│  POST /api/login    → 200 { token: "…" } │
│  [添加路由]                              │
├─────────────────────────────────────────┤
│  延迟模拟: [0ms] ↕️                      │
│  ☑ 自动启动随流程执行                    │
└─────────────────────────────────────────┘
```

**实现要点**：
- Rust 后端使用 `axum` 起轻量 HTTP 服务器（选择 axum 是因为与 tonic/reqwest 同生态，共享 tokio 运行时）
- Mock 节点配置响应码、Headers、Body、延迟
- 支持在流程执行前自动启动 Mock Server
- 支持正则匹配 URL 路径

### 16. 文档生成

所有节点配置完成后，支持一键生成接口文档：

**Markdown 文档结构**：
```markdown
# 流程名称

## 概述
流程描述信息

## 节点列表
| 节点 | 类型 | 描述 |
|------|------|------|
| HTTP-1 | HTTP请求 | 获取用户信息 |

## 数据流
HTTP-1 → Script-1 → HTTP-2

## 节点详情
### HTTP-1: 获取用户信息
- 方法: GET
- URL: https://api.example.com/users/{{id}}
- 请求头: Content-Type: application/json
- 认证: Bearer Token
- 输入参数:
  - id (string, 必填) - 用户ID
- 输出字段:
  - userid → 用户ID
  - username → 用户名

## 数据映射关系
| 源节点 | 源字段 | → | 目标节点 | 目标字段 | 映射方式 |
|--------|--------|---|----------|----------|----------|
| HTTP-1 | $.data.id | → | HTTP-2 | params.id | JSONPath |
```

**实现要点**：
- `DocumentationService` 负责文档生成逻辑
- 支持 Markdown 格式导出（第一阶段实现）
- 预留 OpenAPI / Swagger 格式导出接口（下一阶段实现）
- 文档内容包含：节点列表、数据流图、节点详情（请求/响应/认证）、数据映射关系

### 17. 代码签名与自动更新

Tauri 内置更新需要代码签名证书：

**平台签名要求**：

| 平台 | 签名类型 | 获取方式 | 估算成本 |
|------|----------|----------|----------|
| Windows | Authenticode 代码签名证书 | DigiCert/Sectigo 购买 | $200-500/年 |
| macOS | Apple Developer ID 证书 | Apple Developer Program | $99/年 |
| Linux | 无需签名 | - | 免费 |

> **注意**：未签名的 Windows 应用会触发 SmartScreen 警告，macOS 会阻止运行。早期开发阶段可跳过签名，但正式发布必须签名。

**更新配置**：
```json
// tauri.conf.json
{
  "plugins": {
    "updater": {
      "active": true,
      "endpoints": [
        "https://releases.flowforge.dev/{{target}}/{{arch}}/{{current_version}}"
      ],
      "pubkey": "dW50cnVzdGVk..."
    }
  }
}
```

### 18. 撤销/重做（Undo/Redo）系统

画布编辑操作支持撤销和重做，采用命令模式实现：

```
操作类型：
┌─────────────────────────────────────┐
│  CREATE_NODE    - 创建节点          │
│  DELETE_NODE    - 删除节点          │
│  MOVE_NODE      - 移动节点          │
│  CREATE_EDGE    - 创建连线          │
│  DELETE_EDGE    - 删除连线          │
│  UPDATE_CONFIG  - 更新节点配置      │
└─────────────────────────────────────┘
```

**实现要点**：
- `useHistory.ts` 维护 `HistoryState`，包含 `past`、`present`、`future` 三栈
- 每次操作前生成 `FlowSnapshot` 并压入 `past` 栈（限制最多50条）
- 撤销时：当前状态压入 `future`，从 `past` 弹出恢复
- 重做时：当前状态压入 `past`，从 `future` 弹出恢复
- 支持 Ctrl+Z / Ctrl+Y 快捷键
- 批量操作（如多选移动）视为单个原子操作

### 19. 错误处理与日志系统

分层错误处理机制：

```
┌─────────────────────────────────────────────────────────┐
│  前端错误处理                                            │
│  ├─ 全局错误拦截 (Vue errorHandler + window.onerror)    │
│  ├─ API错误统一处理 (axios interceptor)                 │
│  ├─ 用户友好错误提示 (Element Plus Message)             │
│  └─ 错误上报 (可选 Sentry 集成)                          │
├─────────────────────────────────────────────────────────┤
│  Rust后端错误处理                                        │
│  ├─ anyhow 统一错误类型                                  │
│  ├─ thiserror 自定义业务错误                            │
│  ├─ 错误日志写入文件 (tauri-plugin-log)                 │
│  └─ IPC 错误序列化为前端友好格式                         │
└─────────────────────────────────────────────────────────┘
```

**错误分类**：
```typescript
enum ErrorCode {
  NETWORK_ERROR = 'E001',       // 网络请求失败
  VALIDATION_ERROR = 'E002',    // 数据验证失败
  EXECUTION_ERROR = 'E003',     // 流程执行失败
  SCRIPT_ERROR = 'E004',        // 脚本执行错误
  FILE_ERROR = 'E005',          // 文件读写错误
  GRPC_ERROR = 'E006',         // gRPC 调用失败
  WEBSOCKET_ERROR = 'E007',     // WebSocket 连接失败
  SSE_ERROR = 'E008',           // SSE 连接失败
  MOCK_ERROR = 'E009',         // Mock Server 错误
  IMPORT_ERROR = 'E010',        // 导入失败
  MIGRATION_ERROR = 'E011',     // 数据迁移失败
}
```

**日志级别与轮转**：
- `TRACE`：详细调试信息（仅开发模式）
- `DEBUG`：调试信息
- `INFO`：正常运行信息
- `WARN`：警告信息
- `ERROR`：错误信息
- 日志文件存储于 `.flowforge/logs/`，按日期分割，单文件最大 10MB，保留30天

### 20. 环境变量与敏感信息管理

敏感信息安全存储策略：

```
┌─────────────────────────────────────────────────────────┐
│  存储策略                                                │
│  ├─ 系统密钥库 (tauri-plugin-keyring)                   │
│  │   └─ 高敏感信息：密码、OAuth Token、API Secret        │
│  ├─ 加密JSON文件                                         │
│  │   └─ 中敏感信息：API Key、认证凭证                    │
│  ├─ 普通JSON文件                                         │
│  │   └─ 非敏感配置：URL模板、默认参数                    │
└─────────────────────────────────────────────────────────┘
```

**环境管理界面**：
```
┌─────────────────────────────────────────┐
│  环境: [开发环境 ▼]                      │
├─────────────────────────────────────────┤
│  变量列表                                │
│  ├─ API_URL = https://dev.api.com       │
│  ├─ API_KEY = ******** (密钥库)         │
│  ├─ TIMEOUT = 5000                      │
│  └─ [添加变量]                           │
├─────────────────────────────────────────┤
│  [切换环境] [管理环境]                   │
└─────────────────────────────────────────┘
```

**实现要点**：
- 环境切换时自动更新全局变量池
- 变量引用语法统一为 `{{VAR_NAME}}`
- 敏感信息在 UI 中默认隐藏，点击可查看
- 环境配置可导入/导出（敏感信息需单独处理）

### 21. 断点调试与单步执行

流程执行时的调试能力：

```
执行控制面板：
┌─────────────────────────────────────────────────────────┐
│  [▶ 执行] [▶▶ 调试执行] [⏸ 暂停] [⏹ 停止]              │
│  [→ 单步执行] [→→ 跳过当前]                              │
├─────────────────────────────────────────────────────────┤
│  当前节点: HTTP-2 (已暂停)                               │
│  ├─ 输入数据预览                                         │
│  │   { "userId": "{{prev.userId}}" }                    │
│  ├─ 输出数据预览 (执行后)                                │
│  │   { "status": 200, "data": {...} }                   │
│  ├─ 变量监视                                             │
│  │   {{token}} = "abc123..."                            │
│  └─────────────────────────────────────────────────────┤
│  调用栈: HTTP-1 → Script-1 → HTTP-2                     │
└─────────────────────────────────────────────────────────┘
```

**断点设置**：
```
┌─────────────────────────────────────┐
│  节点: HTTP-2                        │
│  ☑ 启用断点                          │
│  条件: {{response.status}} == 200   │
│  命中次数: 0 (不限)                  │
└─────────────────────────────────────┘
```

**实现要点**：
- 节点上右键可设置/取消断点
- 断点节点显示红色标记
- 条件断点：表达式为真时才暂停
- 单步执行时，逐节点推进并更新监视变量
- 调试模式下实时显示输入/输出数据

### 22. 国际化预留

多语言支持预留接口：

```typescript
// i18n/index.ts
import { createI18n } from 'vue-i18n';
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';

const i18n = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  legacy: false,
  messages: { 'zh-CN': zhCN, 'en-US': enUS }
});

export default i18n;
```

**语言文件示例**：
```typescript
// locales/zh-CN.ts
export default {
  node: {
    http: {
      title: 'HTTP请求',
      method: '请求方法',
      url: '请求地址',
      headers: '请求头',
      body: '请求体'
    },
    grpc: {
      title: 'gRPC请求',
      service: '服务名称',
      method: '方法名称'
    }
  },
  execution: {
    run: '执行',
    debug: '调试执行',
    pause: '暂停',
    stop: '停止',
    step: '单步执行'
  },
  error: {
    network: '网络请求失败',
    validation: '数据验证失败',
    script: '脚本执行错误'
  }
};
```

### 23. 插件扩展机制（v2 预留，v1 不实现）

> 插件系统复杂度极高（动态加载 Vue 组件、沙箱执行、权限控制），v1 版本**不实现**。以下为 v2 设计预留。

```
插件目录结构：
.flowforge/plugins/
├── my-custom-node/
│   ├── manifest.json       # 插件清单
│   ├── main.js             # 入口文件
│   ├── components/
│   │   ├── NodeView.vue    # 节点渲染组件
│   │   └── ConfigPanel.vue # 配置面板
│   └── executor.js         # 执行逻辑
```

**安全限制**：
- 插件在沙箱环境执行，权限受 manifest 控制
- 默认禁用网络、文件系统、进程访问
- 需显式声明权限才能使用受限能力

### 24. 应用更新机制

Tauri 内置更新支持（需配合代码签名，见第17节）：

**更新流程**：
```
┌─────────────────────────────────────┐
│  应用启动时检查更新                  │
│  ├─ 后台静默检查（可配置）           │
│  ├─ 发现新版本弹出提示               │
│  │   ┌─────────────────────────┐   │
│  │   │ 发现新版本 v2.1.0       │   │
│  │   │ [立即更新] [稍后提醒]   │   │
│  │   └─────────────────────────┘   │
│  ├─ 用户确认后下载更新包             │
│  └─ 下载完成提示重启安装             │
└─────────────────────────────────────┘
```

### 25. CI/CD 与自动化构建

GitHub Actions 自动化构建配置：

```yaml
# .github/workflows/build.yml
name: Build & Release

on:
  push:
    branches: [main, release/*]
  pull_request:
    branches: [main]

jobs:
  build:
    strategy:
      matrix:
        include:
          - platform: 'macos-latest'
            args: '--target universal-apple-darwin'
          - platform: 'ubuntu-22.04'
            args: ''
          - platform: 'windows-latest'
            args: ''

    runs-on: ${{ matrix.platform }}
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Setup Rust
        uses: dtolnay/rust-action@stable

      - name: Install dependencies (Ubuntu only)
        if: matrix.platform == 'ubuntu-22.04'
        run: |
          sudo apt-get update
          sudo apt-get install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf libssl-dev

      - name: Install dependencies
        run: pnpm install

      - name: Build Tauri app
        uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tagName: v__VERSION__
          releaseName: 'FlowForge v__VERSION__'
          releaseBody: 'See CHANGELOG.md for details.'
          releaseDraft: true
          prerelease: false
          args: ${{ matrix.args }}

  test:
    strategy:
      matrix:
        platform: [ubuntu-latest, windows-latest, macos-latest]
    runs-on: ${{ matrix.platform }}
    steps:
      - uses: actions/checkout@v4
      - name: Install dependencies
        run: pnpm install
      - name: Run frontend tests
        run: pnpm test:unit
      - name: Run Rust tests
        run: cargo test
      - name: Run E2E tests
        run: pnpm test:e2e

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install dependencies
        run: pnpm install
      - name: Lint frontend
        run: pnpm lint
      - name: Lint Rust
        run: cargo clippy -- -D warnings
      - name: Check formatting
        run: |
          pnpm format:check
          cargo fmt --check

  commitlint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Validate commits
        uses: wagtail/commitlint-action@v1
```

**发布流程**：
1. 代码合并到 `main` 分支触发构建测试
2. 版本发布时打 tag，触发 Release 构建
3. 自动生成各平台安装包并上传 GitHub Releases
4. Windows: `.exe` / `.msi`（需代码签名）
5. macOS: `.dmg` / `.app`（需 Apple Developer ID 签名）
6. Linux: `.deb` / `.AppImage`

### 26. 存储策略

采用分层存储策略，分阶段演进：

```
┌──────────────────────────────────────────────────────────┐
│  第一阶段：本地JSON文件（便携、简单、无依赖）              │
│  .flowforge/                                             │
│  ├── projects/                                           │
│  │   └── {project-id}/                                   │
│  │       ├── project.json        # 项目元信息            │
│  │       ├── flows/                                      │
│  │       │   ├── {flow-id}.json  # 流程定义              │
│  │       │   └── {flow-id}.json                          │
│  │       ├── displays/                                   │
│  │       │   └── {node-id}.json  # 节点显示配置          │
│  │       ├── history/                                    │
│  │       │   └── {execution-id}.json # 执行历史          │
│  │       └── drafts/                                    │
│  │           └── {flow-id}.draft.json # 崩溃恢复草稿     │
│  └── settings.json               # 全局设置             │
├──────────────────────────────────────────────────────────┤
│  第二阶段：SQLite（可选升级，支持历史版本和快速查询）      │
│  .flowforge/flowforge.db                                 │
│  - flows 表、nodes 表、edges 表                          │
│  - execution_history 表                                  │
│  - display_configs 表                                    │
├──────────────────────────────────────────────────────────┤
│  第三阶段：远程同步（预留 DataProvider 接口）              │
│  - 通过 RemoteProvider 实现多端同步                       │
│  - 支持协作编辑（未来）                                   │
└──────────────────────────────────────────────────────────┘
```

**阶段选择依据**：
- **JSON文件**：零依赖、人类可读、便于Git版本管理、方便导入导出，适合第一阶段快速开发
- **SQLite**：单文件数据库、查询灵活、支持历史版本和快速检索，适合数据量增大后迁移
- **远程存储**：通过 `DataProvider` 抽象实现，业务层代码无需修改

**JSON 流程文件格式示例**：
```json
{
  "id": "flow-001",
  "name": "用户登录流程",
  "schemaVersion": 1,
  "version": "1.0",
  "nodes": {
    "node-1": {
      "id": "node-1",
      "type": "HTTP_REQUEST",
      "position": { "x": 100, "y": 200 },
      "data": { "method": "POST", "url": "https://api.example.com/login" }
    }
  },
  "edges": {
    "edge-1": {
      "id": "edge-1",
      "source": "node-1",
      "target": "node-2",
      "dataMapping": [
        { "type": "jsonpath", "source": "$.token", "target": "headers.Authorization" }
      ]
    }
  },
  "variables": [],
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-01T00:00:00Z"
}
```

### 27. 前后端执行边界

明确划分哪些逻辑在 Rust 后端执行、哪些在 Vue 前端执行：

| 层级 | 职责 | 说明 |
|------|------|------|
| **Rust 后端** | 所有网络请求（HTTP/gRPC/WS/SSE） | 网络操作必须在后端，避免浏览器 CORS/安全限制 |
| **Rust 后端** | 脚本沙箱执行（rquickjs） | 安全隔离、超时/内存限制 |
| **Rust 后端** | Mock Server 服务器 | 需要监听端口 |
| **Rust 后端** | 文件读写、密钥库 | 系统级操作必须经过 Tauri 权限 |
| **Rust 后端** | Proto 文件解析 | 使用 prost/prost-types 动态构建消息 |
| **Rust 后端** | 数据迁移 | 文件版本管理 |
| **Vue 前端** | 画布交互、节点拖拽、连线 | UI 渲染和交互 |
| **Vue 前端** | 配置面板、表单校验 | 表单交互 |
| **Vue 前端** | 执行引擎编排（拓扑排序） | 纯算法，不涉及系统 API |
| **Vue 前端** | 数据映射、JSONPath 提取 | 纯数据转换 |
| **Vue 前端** | 状态管理（Pinia） | 前端状态 |
| **Vue 前端** | 撤销/重做、快捷键 | UI 交互逻辑 |

**通信方式**：前端通过 Tauri `invoke` 调用后端命令，后端通过 `emit` 推送事件到前端。长时间运行的操作（如 WebSocket/SSE）使用事件流通信。

### 28. FlowSnapshot 与 Flow 类型转换

`Flow` 使用 `Record<string, FlowNode>` 存储（便于 JSON 序列化和按 ID 查找），而 `FlowSnapshot` 使用 `FlowNode[]` 数组（便于撤销/重做时的顺序和差异比较）。需要在以下场景做类型转换：

```typescript
// Flow → FlowSnapshot：保存快照时
function toSnapshot(flow: Flow): FlowSnapshot {
  return {
    timestamp: Date.now(),
    nodes: Object.values(flow.nodes),
    edges: Object.values(flow.edges),
    action: ''
  };
}

// FlowSnapshot → Flow：恢复快照时
function fromSnapshot(snapshot: FlowSnapshot, flow: Flow): Flow {
  return {
    ...flow,
    nodes: Object.fromEntries(snapshot.nodes.map(n => [n.id, n])),
    edges: Object.fromEntries(snapshot.edges.map(e => [e.id, e])),
  };
}
```

### 29. Tauri 2 安全模型与能力配置

Tauri 2.x 使用基于能力（Capabilities）的权限模型，替代 Tauri 1.x 的白名单机制：

```json
// src-tauri/capabilities/default.json
{
  "identifier": "default",
  "description": "Default capabilities for FlowForge",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "shell:allow-open",
    "dialog:allow-open",
    "fs:default",
    { "identifier": "fs:allow-read", "allow": [{ "path": "$APPDATA/**" }] },
    { "identifier": "fs:allow-write", "allow": [{ "path": "$APPDATA/**" }] },
    "http:default",
    { "identifier": "http:allow-fetch", "allow": [{ "url": "https://**" }] },
    "store:default"
  ]
}
```

**安全要点**：
- 每个 Tauri 插件需要显式声明权限
- 文件系统访问限制在 `$APPDATA` 目录
- HTTP 请求需在后端 reqwest 中执行，前端仅通过 IPC 调用
- 脚本沙箱完全隔离，不访问任何系统资源

### 30. 请求取消机制

使用 `AbortController` 实现请求取消，前端和 Rust 后端协同处理：

```typescript
// cancel.service.ts
class CancelService {
  private controllers: Map<string, AbortController> = new Map();

  create(id: string): AbortController {
    const controller = new AbortController();
    this.controllers.set(id, controller);
    return controller;
  }

  cancel(id: string): void {
    this.controllers.get(id)?.abort();
    this.controllers.delete(id);
  }

  cancelAll(): void {
    this.controllers.forEach(c => c.abort());
    this.controllers.clear();
  }
}
```

**实现要点**：
- 前端创建 `AbortController`，将 `signal` 通过 IPC 传递给 Rust 后端
- Rust 端监听取消信号，终止正在进行的 HTTP/gRPC/WS 请求
- 执行引擎在流程中断或用户停止时调用 `cancelAll()`
- 单个节点支持超时取消（配置 `timeout` 字段）

### 31. 节点错误策略 UI

每个节点可配置独立错误处理策略：

```
┌─────────────────────────────────────────┐
│  错误处理策略                           │
│  ○ 终止流程（默认）                     │
│  ○ 跳过当前节点，继续后续               │
│  ● 自定义重试                            │
│    重试次数: [3]                          │
│    重试间隔: [1000] ms                    │
│    触发重试的状态码: [500, 502, 503]     │
└─────────────────────────────────────────┘
```

**实现要点**：
- `ErrorStrategy` 和 `RetryConfig` 已在数据模型中定义
- `ErrorStrategyEditor.vue` 提供可视化配置
- 执行引擎根据每节点的 `errorStrategy` 决定错误处理行为
- 默认策略为 `abort`（终止整个流程）

### 32. 代码导出（Export to Code）

将节点配置导出为多种代码格式：

| 导出格式 | 说明 | 用途 |
|----------|------|------|
| cURL | 生成 `curl` 命令 | 快速终端调试 |
| Python requests | 生成 `requests` 库代码 | Python 脚本 |
| JavaScript axios | 生成 `axios` 代码 | Node.js/前端项目 |
| JavaScript fetch | 生成 `fetch` API 代码 | 浏览器环境 |

**实现要点**：
- `export.service.ts` 负责代码生成逻辑
- 仅支持 HTTP 节点导出（gRPC/WS/SSE 需特殊处理）
- 导出时替换环境变量为实际值或保留占位符（用户可选）
- 支持 Header/Body/Auth 的完整导出

### 33. Proto 文件管理

gRPC 节点需要 Proto 文件来定义服务和方法：

```
┌─────────────────────────────────────────┐
│  Proto 文件管理                          │
│  ┌───────────────────────────────────┐  │
│  │  📄 user.proto          [删除]     │  │
│  │  📄 order.proto          [删除]     │  │
│  │  [上传 .proto 文件]                │  │
│  └───────────────────────────────────┘  │
│  已解析服务：                             │
│  ├─ UserService                         │
│  │   ├─ GetUser (Unary)                │
│  │   └─ ListUsers (Server Streaming)   │
│  └─ OrderService                        │
│      └─ CreateOrder (Unary)            │
└─────────────────────────────────────────┘
```

**实现要点**：
- `ProtoManager.vue` 提供 Proto 文件上传、删除、浏览界面
- Rust 后端使用 `prost-types` 解析 `.proto` 文件，提取服务和消息定义
- 解析结果缓存到 `proto.service.ts`，避免重复解析
- 支持嵌套 import 和多文件 Proto 包

---

## 开发阶段

### 第一阶段：项目搭建（第1-2周）
- [ ] 初始化 Tauri 2.x + Vue 3 + TypeScript 项目
- [ ] 配置 Vite、ESLint、Prettier、commitlint、husky
- [ ] 搭建项目目录结构
- [ ] 实现基础布局（三栏：侧边栏 + 画布 + 配置面板）
- [ ] 设置最小窗口尺寸 (1024x680)
- [ ] 集成 Element Plus 组件库（含暗色模式）
- [ ] 实现主题系统（亮色/暗色切换）
- [ ] 配置 Tauri 2 安全模型与权限能力（capabilities）
- [ ] 实现应用菜单（File/Edit/View/Run/Help）
- [ ] 实现窗口状态持久化（位置/尺寸/最大化）
- [ ] 配置 Pinia 状态管理
- [ ] 配置错误处理和日志系统
- [ ] 配置国际化预留接口
- [ ] 配置 Vitest 单元测试框架
- [ ] 配置 Playwright E2E 测试框架
- [ ] 添加 .gitignore 和提交规范

### 第二阶段：画布系统（第3-5周）
- [ ] 集成 Vue Flow 库
- [ ] 实现从侧边栏拖拽节点到画布
- [ ] 创建自定义节点组件
- [ ] 实现连线功能（拖拽端口创建连接）
- [ ] 实现磁性吸附功能
- [ ] 实现画布缩放和平移
- [ ] 实现节点选择和多选
- [ ] 实现右键菜单
- [ ] 实现撤销/重做系统（Undo/Redo）
- [ ] 实现快捷键系统
- [ ] 实现多标签页管理（多流程切换）
- [ ] 实现自动保存机制（5s debounce）

### 第三阶段：HTTP 请求节点（第6-7周）
- [ ] HTTP 节点配置面板
- [ ] 支持多种 HTTP 方法
- [ ] Headers 编辑器
- [ ] Body 编辑器（JSON/Form/Raw/Binary）
- [ ] 认证配置（Basic/Bearer/API Key/OAuth2）
- [ ] Cookie 管理（按域存储、提取、跨请求传递）
- [ ] 代理配置（HTTP/SOCKS5 代理）
- [ ] SSL/TLS 配置（证书验证、客户端证书）
- [ ] 请求超时与重定向控制
- [ ] 请求取消/中断机制（AbortController）
- [ ] 错误策略配置（节点级：终止/跳过/重试）
- [ ] Rust 后端 HTTP 请求实现（reqwest，含代理/SSL/Cookie 支持）
- [ ] 响应解析和展示（含大响应体虚拟滚动）
- [ ] 环境变量管理功能
- [ ] 敏感信息安全存储（系统密钥库）
- [ ] cURL/Postman/Insomnia 导入功能
- [ ] 节点导出为 cURL / Python requests / axios 代码

### 第四阶段：数据映射系统（第8-9周）
- [ ] JSONPath 提取器（带实时预览）
- [ ] 可视化数据映射组件
- [ ] 脚本编辑器（CodeMirror）
- [ ] Rust rquickjs 脚本沙箱
- [ ] 变量系统（全局/局部变量，统一 {{VAR}} 语法）
- [ ] 节点结果显示配置（字段标签、格式化）
- [ ] DataProvider 接口定义
- [ ] LocalProvider 文件存储实现
- [ ] Schema 迁移机制实现

### 第五阶段：执行引擎（第10-11周）
- [ ] 拓扑排序算法 + 并行分支调度
- [ ] 流程执行器
- [ ] 执行状态管理
- [ ] 执行结果展示
- [ ] 执行日志记录
- [ ] 断点调试功能
- [ ] 单步执行功能
- [ ] 变量监视面板
- [ ] 崩溃恢复机制
- [ ] 单元测试：执行引擎核心逻辑

### 第六阶段：gRPC + WebSocket + SSE（第12-13周）
- [ ] gRPC 节点配置面板
- [ ] Proto 文件管理 UI（上传、解析、缓存、服务/方法浏览）
- [ ] Proto 文件解析和动态消息构建
- [ ] Rust gRPC 客户端实现
- [ ] gRPC 四种 Streaming 模式的 UI 设计与实现
- [ ] WebSocket 节点配置与实现（含断线重连）
- [ ] SSE 节点配置与实现（含自动重连）
- [ ] Mock Server 实现（基于 axum 框架，含 CORS 支持）

### 第七阶段：项目管理（第14周）
- [ ] 流程保存和加载
- [ ] 项目文件管理
- [ ] 环境变量管理
- [ ] 导入/导出功能（含 OpenAPI/Swagger 导入）
- [ ] 代码导出功能（cURL / Python requests / axios）
- [ ] Markdown 文档生成功能
- [ ] 应用自动更新功能（配合代码签名）

### 第八阶段：优化和测试（第15-16周）
- [ ] 性能优化（画布 500 节点流畅操作）
- [ ] 体积优化（目标10-30MB）
- [ ] 大响应体处理优化（虚拟滚动 + 懒加载）
- [ ] 暗色模式完善
- [ ] 跨平台测试（Windows/macOS/Linux）
- [ ] 单元测试覆盖率 > 70%
- [ ] E2E 测试（Playwright）
- [ ] 无障碍（Accessibility）基础支持
- [ ] SQLite 存储迁移（可选，视数据量决定）
- [ ] CI/CD 自动化构建配置
- [ ] 代码签名配置（Windows + macOS）
- [ ] 国际化完善（多语言支持）
- [ ] Vue DevTools 集成（开发模式）

---

## 关键文件清单

| 文件 | 作用 |
|------|------|
| `src/components/canvas/Canvas.vue` | 主画布组件，集成 Vue Flow |
| `src/components/common/TabBar.vue` | 多标签栏组件 |
| `src/components/mock/MockConfig.vue` | Mock 配置面板 |
| `src/components/import/ImportDialog.vue` | 外部导入对话框 |
| `src/components/export/ExportDialog.vue` | 代码导出对话框 |
| `src/components/panels/CookieEditor.vue` | Cookie 管理编辑器 |
| `src/components/panels/ProxyEditor.vue` | 代理配置编辑器 |
| `src/components/panels/SSLEditor.vue` | SSL/TLS 配置编辑器 |
| `src/components/panels/ProtoManager.vue` | Proto 文件管理面板 |
| `src/components/panels/ErrorStrategyEditor.vue` | 错误策略配置 |
| `src/components/execution/CancelButton.vue` | 请求取消/终止按钮 |
| `src/stores/canvas.ts` | 画布状态管理（节点、连线、选择） |
| `src/stores/tabs.ts` | 多标签页状态管理 |
| `src/stores/autosave.ts` | 自动保存状态 |
| `src/services/execution-engine.ts` | 流程执行引擎（拓扑排序 + 并行调度 + 请求取消） |
| `src/services/migration.service.ts` | Schema 迁移服务 |
| `src/services/import.service.ts` | 外部导入服务 |
| `src/services/export.service.ts` | 代码导出服务（cURL/Python/axios） |
| `src/services/mock.service.ts` | Mock 服务 |
| `src/services/cookie.service.ts` | Cookie 管理（按域存储/提取） |
| `src/services/proxy.service.ts` | 代理配置管理 |
| `src/services/ssl.service.ts` | SSL/TLS 证书管理 |
| `src/services/proto.service.ts` | Proto 文件管理（解析/缓存） |
| `src/services/cancel.service.ts` | 请求取消管理（AbortController 封装） |
| `src/composables/useAutosave.ts` | 自动保存组合函数 |
| `src/composables/useTheme.ts` | 主题切换 |
| `src/composables/useImport.ts` | 外部导入组合函数 |
| `src/composables/useExport.ts` | 代码导出组合函数 |
| `src/composables/useAppMenu.ts` | 应用菜单注册 |
| `src/composables/useWindowState.ts` | 窗口状态持久化 |
| `src/composables/useMagneticSnap.ts` | 磁性吸附逻辑 |
| `src/providers/types.ts` | 数据提供者接口定义（含 migrate 方法） |
| `src/providers/local.provider.ts` | 本地文件存储实现 |
| `src/providers/migrations/` | Schema 迁移脚本目录 |
| `src/services/documentation.service.ts` | 文档生成服务 |
| `src/components/execution/ResponseViewer.vue` | 响应查看器（原始/格式化切换 + 虚拟滚动） |
| `src/composables/useHistory.ts` | 撤销/重做系统 |
| `src/composables/useDebugger.ts` | 断点调试 |
| `src/utils/error-handler.ts` | 统一错误处理 |
| `src/utils/logger.ts` | 日志工具 |
| `src/utils/crypto.ts` | 加密工具（敏感信息处理） |
| `src/utils/large-response.ts` | 大响应体处理 |
| `src/i18n/index.ts` | 国际化初始化 |
| `src-tauri/src/services/http_client.rs` | Rust HTTP 客户端 |
| `src-tauri/src/services/websocket_client.rs` | Rust WebSocket 客户端 |
| `src-tauri/src/services/mock_server.rs` | Rust Mock Server |
| `src-tauri/src/services/proto_manager.rs` | Rust Proto 文件解析与管理 |
| `src-tauri/src/services/script_engine.rs` | Rust 脚本沙箱 |

---

## Rust 后端目录补充

```
src-tauri/src/
├── commands/
│   ├── mod.rs
│   ├── http.rs              # HTTP 请求命令
│   ├── grpc.rs              # gRPC 请求命令
│   ├── websocket.rs         # WebSocket 命令
│   ├── script.rs            # 脚本执行命令
│   ├── store.rs             # 存储操作命令
│   └── keyring.rs           # 密钥库操作命令
├── services/
│   ├── mod.rs
│   ├── http_client.rs       # HTTP 客户端服务
│   ├── grpc_client.rs       # gRPC 客户端服务
│   ├── websocket_client.rs  # WebSocket 客户端服务
│   ├── script_engine.rs     # rquickjs 脚本沙箱
│   ├── mock_server.rs       # Mock Server 服务（基于 axum）
│   ├── proto_manager.rs     # Proto 文件解析与管理
│   ├── updater.rs           # 应用更新服务
│   └── keyring.rs           # 密钥库服务
├── models/
│   ├── mod.rs
│   ├── request.rs           # 请求模型
│   ├── response.rs          # 响应模型
│   ├── flow.rs              # 流程模型
│   └── error.rs             # 错误模型
└── utils/
    ├── mod.rs
    ├── error.rs              # 统一错误处理
    └── logger.rs             # 日志配置
```

---

## 验证方案

### 开发阶段验证
1. `pnpm tauri dev` 启动开发服务器
2. 测试节点创建和连接
3. 测试 HTTP 请求执行
4. 测试节点间数据映射
5. 测试流程执行
6. 测试自动保存和崩溃恢复
7. 测试暗色模式切换
8. 测试多标签页切换
9. 验证 Tauri 2 安全能力配置（capabilities）正确限制权限
10. 验证应用菜单各项功能正常
11. 验证窗口状态持久化（位置/尺寸/最大化恢复）

### 构建验证
1. `pnpm tauri build` 构建各平台包
2. 验证包体积在 10-30MB 范围内
3. 验证可执行文件双击可运行
4. 在 Windows/macOS/Linux 上分别测试
5. 验证未签名应用在 Windows/macOS 上的警告行为

### 功能验证
1. 创建包含3个以上节点的流程
2. 配置 HTTP 请求（含 Headers/Body/认证）
3. 配置代理（HTTP/SOCKS5）和 SSL/TLS 证书选项
4. 测试 Cookie 自动提取和跨请求传递
5. 测试请求取消/中断（AbortController）
6. 测试错误策略配置（节点级终止/跳过/重试）
7. 设置节点间数据映射
8. 执行流程并验证结果正确性
9. 保存项目并重新加载验证
10. 测试撤销/重做功能（Ctrl+Z / Ctrl+Y）
11. 测试断点调试和单步执行
12. 测试环境变量切换和敏感信息存储
13. 测试文档生成功能
14. 测试自动更新功能（模拟场景）
15. 测试 gRPC 四种调用模式
16. 测试 Proto 文件管理（上传/解析/浏览）
17. 测试 WebSocket 双向通信（含断线重连）
18. 测试 SSE 事件流（含自动重连）
19. 测试 Mock Server 创建和响应
20. 测试从 cURL/Postman/Insomnia/OpenAPI 导入
21. 测试导出为 cURL/Python requests/axios 代码
22. 测试大响应体（>1MB）的渲染性能
23. 验证暗色模式下所有界面正常
24. 验证窗口缩放到最小尺寸时布局不崩溃

### 性能验证
1. 在画布上创建 500 个节点，验证操作流畅
2. 加载 10MB JSON 响应，验证虚拟滚动正常
3. 冷启动时间 < 3s
4. 流程保存时间 < 500ms
5. 迁移旧版数据，验证 Schema 迁移正确性

### 测试策略

| 类型 | 框架 | 覆盖范围 | 目标覆盖率 |
|------|------|-----------|-----------|
| 前端单元测试 | Vitest | 组件、composables、utils | > 70% |
| Rust 单元测试 | cargo test | services、commands、models | > 70% |
| E2E 测试 | Playwright + Tauri WebDriver | 核心流程 | 关键路径 100% |
| 性能测试 | 手动 | 大节点/大响应体 | 达标即可 |