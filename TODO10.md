# TODO10: gRPC + WebSocket + SSE + Mock

> 阶段：协议扩展 | 优先级：P0（核心模块，必须测试通过）
> 依赖：TODO3, TODO6
> 预计周期：2 周

## 目标

实现除 HTTP 外的其他协议节点：gRPC（含 Proto 管理）、WebSocket、SSE、Mock Server。这些协议节点与 HTTP 节点共享画布和数据映射系统。

---

## 任务清单

### 10.1 gRPC 节点配置面板

- [ ] `src/components/nodes/gRPCNode.vue` 节点视图更新（显示服务名/方法名）
- [ ] 服务选择器：从已解析的 Proto 服务列表选择
- [ ] 方法选择器：选择服务下的方法（Unary / Client Streaming / Server Streaming / Bidirectional）
- [ ] 地址输入框（IP:端口）
- [ ] Metadata 编辑器（键值对）
- [ ] 请求消息编辑器（JSON 格式，根据 Proto Message 结构生成模板）
- [ ] 认证配置（Metadata 中传递 Token）

### 10.2 Proto 文件管理

- [ ] `src/components/panels/ProtoManager.vue` — Proto 文件管理面板
- [ ] 文件上传：选择 .proto 文件上传
- [ ] 文件列表：显示已上传的 .proto 文件
- [ ] 文件删除：删除 .proto 文件
- [ ] 解析结果：显示提取的 Service / Method / Message 列表
- [ ] 方法类型标识（Unary / Server Streaming / Client Streaming / Bidirectional）
- [ ] `src/services/proto.service.ts` — Proto 文件管理服务（解析/缓存）

### 10.3 gRPC 节点执行

- [ ] `src/services/grpc.service.ts` — 前端 gRPC 服务
- [ ] Unary 调用：发送请求 → 等待响应
- [ ] Server Streaming：发送请求 → 接收消息流，实时追加到响应区域
- [ ] Client Streaming：逐条发送消息 → 手动结束流
- [ ] Bidirectional Streaming：上下分栏，上方发送区/下方接收区
- [ ] Streaming UI 设计：
  - Unary：同 HTTP 请求显示
  - Server Streaming：响应区域实时追加消息流，自动滚动
  - Client Streaming：请求区域逐条发送，可手动结束流
  - Bidirectional：上下分栏显示
- [ ] 支持请求取消

### 10.4 WebSocket 节点配置面板

- [ ] `src/components/nodes/WebSocketNode.vue` 节点视图更新（显示连接状态）
- [ ] URL 输入框
- [ ] Protocols 输入
- [ ] Headers 编辑器
- [ ] 连接/断开按钮
- [ ] 消息发送区：文本输入 + 发送按钮
- [ ] 消息接收区：消息列表（显示方向、内容、时间戳）
- [ ] 断线重连配置：开关 + 重连间隔

### 10.5 WebSocket 节点执行

- [ ] `src/services/websocket.service.ts` — 前端 WebSocket 服务
- [ ] 调用 IPC 建立连接
- [ ] 监听 WebSocket 事件推送到前端
- [ ] 消息发送通过 IPC
- [ ] 连接状态实时更新（connecting / connected / disconnected / error）
- [ ] 断线自动重连

### 10.6 SSE 节点配置面板

- [ ] `src/components/nodes/SSENode.vue` 节点视图更新（显示连接状态）
- [ ] URL 输入框
- [ ] Headers 编辑器
- [ ] Last-Event-Id 配置
- [ ] 自动重连配置：开关 + 重连间隔
- [ ] 事件接收区：事件列表（事件类型、数据、ID、时间戳）

### 10.7 SSE 节点执行

- [ ] `src/services/sse.service.ts` — 前端 SSE 服务
- [ ] 调用 IPC 建立 SSE 连接
- [ ] 监听 SSE 事件推送到前端
- [ ] 事件类型过滤（只显示订阅的事件类型）
- [ ] 自动重连（Last-Event-Id 支持）

### 10.8 Mock 节点配置面板

- [ ] `src/components/mock/MockConfig.vue` — Mock 配置面板
- [ ] 端口号配置
- [ ] 启动/停止按钮
- [ ] 运行状态显示
- [ ] 路由列表：Method + Path → StatusCode + Headers + Body + Delay
- [ ] 添加/编辑/删除路由
- [ ] CORS 开关
- [ ] 默认响应头配置
- [ ] 自动启动随流程执行开关

### 10.9 Mock Server 集成

- [ ] `src/services/mock.service.ts` — Mock 服务
- [ ] 调用 IPC 启动/停止 Mock Server
- [ ] 调用 IPC 注册/更新/删除路由
- [ ] Mock Server 运行状态监听
- [ ] 流程执行前自动启动（如果配置了 autoStart）

### 10.10 节点执行器集成

- [ ] gRPC 节点执行器注册到执行引擎
- [ ] WebSocket 节点执行器注册到执行引擎
- [ ] SSE 节点执行器注册到执行引擎
- [ ] Mock 节点执行器注册到执行引擎
- [ ] 各节点在执行引擎中正确管理生命周期

### 10.11 单元测试

- [ ] gRPC 服务测试（Unary 调用）
- [ ] WebSocket 服务测试（连接/发送/接收/断开）
- [ ] SSE 服务测试（连接/接收事件/断开）
- [ ] Mock Server 测试（启停/路由/响应）
- [ ] Proto 解析服务测试（文件上传/解析/缓存）
- [ ] 各节点执行器在执行引擎中的集成测试

---

## 验收标准

### 核心验收（必须通过）

| # | 验收项 | 通过条件 |
|---|--------|----------|
| 1 | gRPC Unary | 可配置服务/方法，发送请求并收到响应 |
| 2 | Proto 管理 | 可上传 .proto 文件，解析出 Service/Method/Message |
| 3 | WebSocket | 可建立连接、发送/接收消息，显示消息流 |
| 4 | WebSocket 重连 | 断线后可自动重连 |
| 5 | SSE | 可连接 SSE 端点，接收事件流 |
| 6 | SSE 重连 | 支持自动重连和 Last-Event-Id |
| 7 | Mock Server | 可启动 Mock Server，注册路由，返回模拟响应 |
| 8 | Mock CORS | Mock Server 可正确处理 CORS 请求 |
| 9 | 执行引擎集成 | 四种协议节点均可被执行引擎正确调度 |
| 10 | 请求取消 | gRPC/WS/SSE 均可取消 |

### 非核心验收（可后续补充）

| # | 验收项 | 通过条件 |
|---|--------|----------|
| 1 | gRPC Streaming | 四种 Streaming 模式 UI 正确显示 |
| 2 | WebSocket 二进制 | 支持二进制消息发送和接收 |
| 3 | Mock 正则路由 | URL 正则匹配可工作 |
| 4 | Mock 延迟 | 延迟模拟可正确工作 |
| 5 | Proto 嵌套 import | 多文件 import 的 Proto 可正确解析 |