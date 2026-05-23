# TODO7: HTTP 节点与请求

> 阶段：核心业务 | 优先级：P0（核心模块，必须测试通过）
> 依赖：TODO3, TODO6
> 预计周期：2 周

## 目标

实现 HTTP 请求节点的完整配置和执行流程：配置面板、请求发送、响应展示、Cookie 管理、代理/SSL 配置、环境变量替换、请求取消、错误策略、导入导出。这是最核心的节点类型。

---

## 任务清单

### 7.1 通用配置面板框架

- [ ] `src/components/panels/ConfigPanel.vue` — 配置面板容器
- [ ] 根据选中节点类型动态切换配置内容
- [ ] 无选中时显示流程配置
- [ ] 配置面板可折叠/展开

### 7.2 HTTP 节点配置面板

- [ ] `src/components/nodes/HTTPNode.vue` 节点视图更新（显示方法/URL/状态）
- [ ] 方法选择器（GET/POST/PUT/DELETE/PATCH/HEAD/OPTIONS）
- [ ] URL 输入框（支持环境变量 {{VAR}} 语法高亮）
- [ ] 请求标签页组织：Params / Headers / Body / Auth / Cookies / Proxy / SSL / Error Strategy

### 7.3 参数编辑器

- [ ] `src/components/panels/ParamsEditor.vue` — URL 查询参数编辑器
- [ ] 键值对表格形式，支持添加/删除行
- [ ] 支持禁用单个参数
- [ ] 参数自动同步到 URL 或从 URL 解析

### 7.4 Headers 编辑器

- [ ] `src/components/panels/HeadersEditor.vue` — Headers 编辑器
- [ ] 键值对表格形式
- [ ] 常用 Header 预设（Content-Type, Authorization 等）
- [ ] 支持禁用单个 Header

### 7.5 Body 编辑器

- [ ] `src/components/panels/BodyEditor.vue` — Body 编辑器
- [ ] 支持格式切换：JSON / Form / Raw / Binary / None
- [ ] JSON 模式：CodeMirror 编辑器 + 格式化 + 校验
- [ ] Form 模式：键值对表格
- [ ] Raw 模式：纯文本编辑器
- [ ] Binary 模式：文件选择器

### 7.6 认证配置

- [ ] `src/components/panels/AuthEditor.vue` — 认证配置面板
- [ ] None / Basic Auth / Bearer Token / API Key / OAuth2
- [ ] Basic Auth：用户名/密码输入
- [ ] Bearer Token：Token 输入
- [ ] API Key：Key/Value/添加位置（Header/Query）
- [ ] OAuth2：授权类型/Token URL/Client ID/Client Secret/Scopes

### 7.7 Cookie 管理

- [ ] `src/components/panels/CookieEditor.vue` — Cookie 编辑器
- [ ] `src/services/cookie.service.ts` — Cookie 服务（按域存储/提取/跨请求传递）
- [ ] 显示当前域的 Cookie 列表
- [ ] 支持手动添加/编辑/删除 Cookie
- [ ] 响应 Set-Cookie 自动提取并存储
- [ ] 后续请求自动附加对应域的 Cookie

### 7.8 代理配置

- [ ] `src/components/panels/ProxyEditor.vue` — 代理配置面板
- [ ] `src/services/proxy.service.ts` — 代理配置服务
- [ ] 代理类型选择：HTTP / SOCKS5
- [ ] 代理地址和端口
- [ ] 代理认证（用户名/密码）

### 7.9 SSL/TLS 配置

- [ ] `src/components/panels/SSLEditor.vue` — SSL/TLS 配置面板
- [ ] `src/services/ssl.service.ts` — SSL 证书管理服务
- [ ] 证书验证开关
- [ ] 客户端证书路径
- [ ] 客户端私钥路径
- [ ] CA 证书路径

### 7.10 错误策略配置

- [ ] `src/components/panels/ErrorStrategyEditor.vue` — 错误策略面板
- [ ] 终止流程 / 跳过节点 / 自定义重试
- [ ] 重试配置：次数/间隔/状态码
- [ ] 错误策略与节点配置关联

### 7.11 请求取消

- [ ] `src/services/cancel.service.ts` — AbortController 封装
- [ ] `src/composables/useExecution.ts` — 执行 composable（含取消管理）
- [ ] 每个请求关联一个 AbortController
- [ ] 取消单个请求
- [ ] 取消所有请求
- [ ] `src/components/execution/CancelButton.vue` — 取消按钮组件

### 7.12 响应展示

- [ ] `src/components/execution/ResponseViewer.vue` — 响应查看器
- [ ] 原始视图 / 格式化视图 / 映射预览 三种模式切换
- [ ] 响应 Headers / Body / Cookies 标签页
- [ ] 响应时间和大小显示
- [ ] 状态码和状态文字
- [ ] Body 格式化（JSON 高亮、XML 格式化）

### 7.13 大响应体处理

- [ ] `src/utils/large-response.ts` — 大响应体处理
- [ ] < 100KB: 正常渲染
- [ ] 100KB ~ 1MB: 虚拟滚动 + 延迟解析
- [ ] > 1MB: 仅显示摘要信息 + 按需加载
- [ ] 响应体截断提示

### 7.14 环境变量替换

- [ ] URL / Headers / Body / 认证中的 `{{VAR}}` 占位符替换
- [ ] 替换时机：请求发送前
- [ ] 敏感变量（sensitive: true）在 UI 中隐藏显示
- [ ] 变量不存在时提示错误

### 7.15 cURL 导入

- [ ] `src/components/import/CurlParser.ts` — cURL 命令解析器
- [ ] 解析方法、URL、Headers、Body
- [ ] 支持常见 cURL 选项（-X, -H, -d, --data-raw, -u, -k 等）
- [ ] 解析结果转换为 HTTPNodeData

### 7.16 代码导出

- [ ] `src/services/export.service.ts` — 代码导出服务
- [ ] `src/composables/useExport.ts` — 导出 composable
- [ ] `src/components/export/ExportDialog.vue` — 导出对话框
- [ ] `src/components/export/CodeGenerator.ts` — 代码生成器
- [ ] cURL 命令生成
- [ ] Python requests 代码生成
- [ ] JavaScript axios 代码生成
- [ ] JavaScript fetch 代码生成
- [ ] 导出时环境变量替换选项

### 7.17 HTTP 服务集成

- [ ] `src/services/http.service.ts` — 前端 HTTP 服务（封装 IPC 调用）
- [ ] 构建 Tauri IPC 请求参数
- [ ] 处理 IPC 响应和错误
- [ ] 请求前进行环境变量替换
- [ ] 响应后提取 Cookie 并存储

### 7.18 单元测试

- [ ] cURL 解析器测试（各种 cURL 格式）
- [ ] 代码导出生成测试
- [ ] Cookie 服务测试（存储/提取/跨域）
- [ ] 环境变量替换测试
- [ ] AbortController 取消测试
- [ ] 大响应体判断逻辑测试

---

## 验收标准

### 核心验收（必须通过）

| # | 验收项 | 通过条件 |
|---|--------|----------|
| 1 | HTTP 方法 | GET/POST/PUT/DELETE/PATCH 均可正确发送请求 |
| 2 | URL + Params | URL 输入和查询参数编辑正常，参数自动同步 |
| 3 | Headers | 可添加/编辑/删除/禁用 Header |
| 4 | Body | JSON/Form/Raw/Binary/None 五种模式均可工作 |
| 5 | 认证 | Basic/Bearer/API Key 认证配置正确附加到请求 |
| 6 | 响应展示 | 状态码、Headers、Body 正确显示，JSON 格式化正常 |
| 7 | 环境变量 | {{VAR}} 占位符在请求发送前正确替换 |
| 8 | 请求取消 | 点击取消按钮可中断正在进行的请求 |
| 9 | cURL 导入 | 可从 cURL 命令创建 HTTP 节点 |
| 10 | 代码导出 | 可导出为 cURL/Python requests/axios/fetch 四种格式 |
| 11 | 错误策略 | 终止/跳过/重试三种策略配置正确 |
| 12 | 单元测试 | 核心服务测试全部通过 |

### 非核心验收（可后续补充）

| # | 验收项 | 通过条件 |
|---|--------|----------|
| 1 | Cookie 管理 | 响应 Cookie 自动提取，后续请求自动附加 |
| 2 | 代理 | HTTP/SOCKS5 代理可正确工作 |
| 3 | SSL/TLS | 客户端证书和无验证选项可正确工作 |
| 4 | OAuth2 | OAuth2 授权流程完整可用 |
| 5 | 大响应体 | > 100KB 响应虚拟滚动正常，> 1MB 显示摘要 |
| 6 | Proxy/SSL 编辑器 | 代理和 SSL 面板 UI 完整可用 |