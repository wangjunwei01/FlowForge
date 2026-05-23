# TODO5: 画布系统

> 阶段：核心 UI | 优先级：P0（核心模块，必须测试通过）
> 依赖：TODO1
> 预计周期：2-3 周

## 目标

实现流程编辑器的核心画布：Vue Flow 集成、自定义节点/连线组件、侧边栏拖拽放置、缩放平移、右键菜单、磁性吸附等。这是用户最直接交互的界面。

---

## 任务清单

### 5.1 Vue Flow 集成

- [ ] 安装 @vue-flow/core, @vue-flow/background, @vue-flow/controls
- [ ] `src/components/canvas/Canvas.vue` — 主画布组件，集成 Vue Flow
- [ ] 配置 snap-to-grid（16x16 网格）
- [ ] 配置画布事件：@nodes-change, @edges-change, @node-drag, @connect, @connect-start, @connect-end
- [ ] 配置画布选项：minimap, controls, background

### 5.2 三栏布局

- [ ] `src/views/FlowEditor.vue` — 流程编辑器主页面
- [ ] 左栏：侧边栏面板（节点列表 + 流程管理）
- [ ] 中栏：画布区域
- [ ] 右栏：配置面板（选中节点/连线时显示）
- [ ] 各栏可折叠/展开
- [ ] 响应拖拽调整栏宽

### 5.3 侧边栏面板

- [ ] `src/components/panels/SidebarPanel.vue` — 节点列表侧边栏
- [ ] 节点类型列表：HTTP / gRPC / WebSocket / SSE / Script / Transform / Mock
- [ ] 每种节点显示图标和名称
- [ ] 拖拽开始事件绑定
- [ ] 可折叠/展开分类

### 5.4 自定义节点组件

- [ ] `src/components/nodes/BaseNode.vue` — 节点基类（标题栏、状态指示器、端口位置）
- [ ] `src/components/nodes/HTTPNode.vue` — HTTP 请求节点
- [ ] `src/components/nodes/gRPCNode.vue` — gRPC 请求节点
- [ ] `src/components/nodes/WebSocketNode.vue` — WebSocket 节点
- [ ] `src/components/nodes/SSENode.vue` — SSE 节点
- [ ] `src/components/nodes/ScriptNode.vue` — 脚本节点
- [ ] `src/components/nodes/TransformNode.vue` — 数据转换节点
- [ ] `src/components/nodes/NodeHandles.vue` — 节点端口（输入/输出）
- [ ] 在 Vue Flow 中注册所有自定义节点类型

### 5.5 自定义连线组件

- [ ] `src/components/edges/CustomEdge.vue` — 自定义连线
- [ ] `src/components/edges/EdgeLabel.vue` — 连线标签（数据映射指示）
- [ ] 在 Vue Flow 中注册自定义连线类型

### 5.6 节点拖拽到画布

- [ ] `src/composables/useDragDrop.ts` — 拖拽 composable
- [ ] 侧边栏节点拖拽开始，携带节点类型信息
- [ ] 画布接收拖拽放下事件，在对应位置创建节点
- [ ] 放置位置吸附到网格

### 5.7 连线交互

- [ ] 从端口拖拽开始创建连线
- [ ] 连线过程实时预览
- [ ] 端口类型兼容性检查（输入只能连输出）
- [ ] 端口数据类型兼容性检查
- [ ] 不允许自连（同一节点的输出连自己的输入）

### 5.8 画布控制

- [ ] `src/components/canvas/CanvasControls.vue` — 缩放/平移/适应控制
- [ ] `src/components/canvas/MiniMap.vue` — 小地图
- [ ] 缩放：鼠标滚轮缩放，按钮缩放，适应画布
- [ ] 平移：鼠标拖拽画布平移
- [ ] 选择：单击选节点，框选多节点

### 5.9 磁性吸附

- [ ] `src/composables/useMagneticSnap.ts` — 磁性吸附逻辑
- [ ] 节点拖拽时检测与其他节点的对齐线
- [ ] 吸附阈值内高亮对齐线并吸附位置
- [ ] 连线拖拽时高亮附近可连接端口

### 5.10 右键菜单

- [ ] `src/components/canvas/ContextMenu.vue` — 右键菜单
- [ ] 节点右键：编辑 / 复制 / 粘贴 / 删除 / 禁用 / 设置断点
- [ ] 连线右键：编辑数据映射 / 删除
- [ ] 画布空白处右键：粘贴 / 全选 / 适应画布

### 5.11 多标签页

- [ ] `src/components/common/TabBar.vue` — 多标签栏组件
- [ ] 标签栏显示打开的流程列表
- [ ] 当前激活标签高亮
- [ ] 关闭标签时检查未保存修改
- [ ] 标签可拖拽排序
- [ ] 新建流程标签（+按钮）

### 5.12 单元测试

- [ ] 节点类型注册测试
- [ ] 磁性吸附算法测试
- [ ] 拖拽放下位置计算测试
- [ ] 连线端口兼容性测试

---

## 验收标准

### 核心验收（必须通过）

| # | 验收项 | 通过条件 |
|---|--------|----------|
| 1 | 画布渲染 | 三栏布局正确显示，画布区域可正常绘制 |
| 2 | 节点创建 | 从侧边栏拖拽可创建对应类型节点，位置吸附网格 |
| 3 | 连线创建 | 从端口拖拽可创建连线，端口类型检查生效 |
| 4 | 节点类型 | 7 种节点类型（HTTP/gRPC/WS/SSE/Script/Transform/Mock）均可创建 |
| 5 | 磁性吸附 | 拖拽节点时对齐线高亮显示，松手后吸附 |
| 6 | 右键菜单 | 节点/连线/空白处右键菜单正确弹出，菜单项可点击 |
| 7 | 画布缩放 | 滚轮缩放、按钮缩放、适应画布均可正常工作 |
| 8 | 多标签页 | 可打开/切换/关闭多个流程标签，未保存提示正常 |
| 9 | 节点选择 | 单击选择、框选多选、Ctrl+点击追加选择均可工作 |
| 10 | 暗色模式 | 画布和节点在暗色模式下显示正常 |

### 非核心验收（可后续补充）

| # | 验收项 | 通过条件 |
|---|--------|----------|
| 1 | 小地图 | MiniMap 正确显示节点缩略图 |
| 2 | 标签拖拽排序 | 标签可拖拽重排序 |
| 3 | 大量节点 | 100 个节点时画布操作依然流畅 |