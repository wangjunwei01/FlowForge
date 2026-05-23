# TODO3: Rust 后端服务层

> 阶段：核心服务 | 优先级：P0（核心模块，必须测试通过）
> 依赖：TODO2
> 预计周期：2-3 周

## 目标

实现所有 Rust 后端核心服务：HTTP 客户端、gRPC 客户端、WebSocket 客户端、脚本沙箱、Mock Server、Proto 管理、密钥库。这些服务通过 Tauri IPC 命令暴露给前端，是所有网络请求的执行层。

---

## 任务清单

### 3.1 HTTP 客户端服务

- [ ] `src-tauri/src/services/http_client.rs` — 基于 reqwest 实现
- [ ] 支持 GET/POST/PUT/DELETE/PATCH/HEAD/OPTIONS 方法
- [ ] 支持 Headers / Params / Body（JSON/Form/Raw/Binary/None）
- [ ] 支持 Basic / Bearer / API Key / OAuth2 认证
- [ ] 支持 HTTP / SOCKS5 代理
- [ ] 支持 SSL/TLS 证书配置（验证开关、客户端证书、CA 证书）
- [ ] 支持请求超时和重定向控制
- [ ] 支持请求取消（通过 IPC 传入 cancel token）
- [ ] 支持 Cookie 自动提取和跨请求传递
- [ ] 响应结构：状态码、Headers、Body、耗时、大小

### 3.2 HTTP IPC 命令

- [ ] `src-tauri/src/commands/http.rs` — Tauri IPC 命令
- [ ] `http_request` 命令：接收前端请求参数，调用 http_client，返回响应
- [ ] `http_cancel` 命令：取消正在进行的 HTTP 请求
- [ ] 错误序列化：AppError → 前端友好的 JSON 结构

### 3.3 gRPC 客户端服务

- [ ] `src-tauri/src/services/grpc_client.rs` — 基于 tonic + prost 实现
- [ ] 支持 Unary 调用模式
- [ ] 支持 Server Streaming 模式（通过 Tauri Event 推送流式消息）
- [ ] 支持 Client Streaming 模式（通过 IPC 分段发送）
- [ ] 支持 Bidirectional Streaming 模式
- [ ] 支持 Metadata 传递
- [ ] 支持请求取消

### 3.4 gRPC IPC 命令

- [ ] `src-tauri/src/commands/grpc.rs`
- [ ] `grpc_request` 命令：Unary 调用
- [ ] `grpc_stream_start` / `grpc_stream_send` / `grpc_stream_end` 命令：流式调用控制
- [ ] gRPC 流式消息通过 `app.emit()` 推送到前端

### 3.5 Proto 文件管理

- [ ] `src-tauri/src/services/proto_manager.rs` — Proto 文件解析与管理
- [ ] 上传 .proto 文件到应用数据目录
- [ ] 使用 prost-types 解析 .proto 文件，提取 Service/Method/Message 定义
- [ ] 缓存解析结果，避免重复解析
- [ ] 支持嵌套 import 和多文件 Proto 包
- [ ] Proto 文件删除和列表管理

### 3.6 WebSocket 客户端服务

- [ ] `src-tauri/src/services/websocket_client.rs` — 基于 tokio-tungstenite 实现
- [ ] 连接 / 断开 / 重连控制
- [ ] 发送文本和二进制消息
- [ ] 接收消息通过 `app.emit()` 推送到前端
- [ ] 断线自动重连（可配置重连间隔）
- [ ] 连接状态通知（connecting / connected / disconnected / error）

### 3.7 WebSocket IPC 命令

- [ ] `src-tauri/src/commands/websocket.rs`
- [ ] `ws_connect` / `ws_disconnect` / `ws_send` 命令
- [ ] 连接状态变更通过 emit 推送

### 3.8 SSE 客户端服务

- [ ] `src-tauri/src/services/sse_client.rs` — 基于 reqwest EventSource 实现
- [ ] SSE 连接/断开控制
- [ ] 事件流消息通过 `app.emit()` 推送到前端
- [ ] 支持自动重连（可配置）
- [ ] 支持 Last-Event-Id

### 3.9 SSE IPC 命令

- [ ] `src-tauri/src/commands/` — SSE 相关命令（与 HTTP 命令同文件或独立）

### 3.10 脚本沙箱引擎

- [ ] `src-tauri/src/services/script_engine.rs` — 基于 rquickjs 实现
- [ ] 创建隔离的 QuickJS 运行时
- [ ] 注入安全的 `$input` 变量和 `console.log`
- [ ] 禁用网络和文件系统访问
- [ ] 实现超时保护（默认 5 秒）
- [ ] 实现内存限制
- [ ] 脚本执行结果序列化返回前端

### 3.11 脚本 IPC 命令

- [ ] `src-tauri/src/commands/script.rs`
- [ ] `script_execute` 命令：执行脚本，返回结果或错误

### 3.12 Mock Server

- [ ] `src-tauri/src/services/mock_server.rs` — 基于 axum 实现
- [ ] 启动/停止 Mock Server（可配置端口）
- [ ] 注册路由（Method + Path → StatusCode + Headers + Body + Delay）
- [ ] 支持 CORS
- [ ] 支持正则匹配 URL 路径
- [ ] 支持延迟模拟
- [ ] 请求日志记录

### 3.13 Mock IPC 命令

- [ ] `src-tauri/src/commands/` — Mock 启停/路由管理命令

### 3.14 密钥库服务

- [ ] `src-tauri/src/services/keyring.rs` — 基于 tauri-plugin-keyring
- [ ] 存储敏感信息（密码、Token、API Secret）
- [ ] 读取敏感信息
- [ ] 删除敏感信息

### 3.15 密钥库 IPC 命令

- [ ] `src-tauri/src/commands/keyring.rs`
- [ ] `keyring_save` / `keyring_get` / `keyring_delete` 命令

### 3.16 文件操作命令

- [ ] `src-tauri/src/commands/store.rs` — 文件读写命令
- [ ] 读写项目/流程文件
- [ ] 读写配置文件
- [ ] 读写执行历史
- [ ] 文件路径限定在 $APPDATA 内

### 3.17 命令注册

- [ ] `src-tauri/src/lib.rs` — 注册所有 IPC 命令
- [ ] `src-tauri/src/commands/mod.rs` — 模块导出

### 3.18 单元测试

- [ ] HTTP 客户端：各种方法/认证/代理/SSL 的请求测试
- [ ] gRPC：Unary 调用测试（需本地 gRPC Server）
- [ ] 脚本沙箱：隔离性测试、超时测试、内存限制测试
- [ ] Mock Server：路由匹配、CORS、延迟模拟测试
- [ ] 错误处理：各种错误类型的序列化测试
- [ ] Proto 解析：简单和嵌套 proto 文件解析测试

---

## 验收标准

### 核心验收（必须通过）

| # | 验收项 | 通过条件 |
|---|--------|----------|
| 1 | HTTP 请求 | 可通过 IPC 发送 GET/POST 请求并正确返回响应 |
| 2 | HTTP 认证 | Basic/Bearer/API Key 认证可正确附加到请求 |
| 3 | HTTP 代理 | HTTP/SOCKS5 代理可正确工作 |
| 4 | HTTP 取消 | 可通过 cancel token 取消正在进行的请求 |
| 5 | gRPC Unary | 可通过 IPC 发送 Unary 调用并返回响应 |
| 6 | WebSocket | 可连接/发送/接收消息，断线重连正常 |
| 7 | SSE | 可连接 SSE 端点并接收事件流 |
| 8 | 脚本沙箱 | 可执行 JS 脚本并返回结果；超时和内存限制生效 |
| 9 | Mock Server | 可启动 Mock Server、注册路由、返回模拟响应 |
| 10 | Proto 解析 | 可解析 .proto 文件并提取 Service/Method/Message |
| 11 | 密钥库 | 可存储/读取/删除敏感信息 |
| 12 | 错误序列化 | Rust 错误可正确转化为前端 JSON 格式 |
| 13 | 编译通过 | `cargo build` 和 `cargo test` 均通过 |

### 非核心验收（可后续补充）

| # | 验收项 | 通过条件 |
|---|--------|----------|
| 1 | gRPC Streaming | 四种 Streaming 模式均可正确工作 |
| 2 | HTTP SSL 客户端证书 | 客户端证书认证可正确工作 |
| 3 | OAuth2 认证 | OAuth2 流程完整可用 |
| 4 | Mock 正则路由 | 正则匹配 URL 可正确工作 |