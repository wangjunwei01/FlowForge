# TODO6: 状态管理与交互

> 阶段：核心 UI | 优先级：P0（核心模块，必须测试通过）
> 依赖：TODO5
> 预计周期：1-2 周

## 目标

实现所有 Pinia Store、撤销重做系统、快捷键、剪贴板操作。这些是画布交互的状态基础，支撑后续的业务逻辑。

---

## 任务清单

### 6.1 Canvas Store

- [ ] `src/stores/canvas.ts` — 完整实现
- [ ] 管理画布节点列表（添加/删除/更新/定位）
- [ ] 管理画布连线列表（添加/删除/更新）
- [ ] 管理选中节点/连线（单选/多选/框选）
- [ ] 与 Vue Flow 节点/边数据双向同步
- [ ] 画布视口状态（缩放级别、平移偏移）

### 6.2 Node Store

- [ ] `src/stores/node.ts` — 完整实现
- [ ] 管理当前选中节点的配置数据
- [ ] 节点配置更新（方法/URL/Headers 等）
- [ ] 节点启用/禁用状态切换

### 6.3 Tab Store

- [ ] `src/stores/tabs.ts` — 完整实现
- [ ] 打开的流程标签列表
- [ ] 当前激活标签索引
- [ ] 每个标签的未保存标记
- [ ] 打开/切换/关闭标签操作
- [ ] 关闭标签时检查未保存修改

### 6.4 Project Store

- [ ] `src/stores/project.ts` — 完整实现
- [ ] 当前项目信息
- [ ] 项目下的流程列表
- [ ] 环境列表和当前激活环境
- [ ] 环境变量（全局变量池）

### 6.5 Execution Store

- [ ] `src/stores/execution.ts` — 完整实现
- [ ] 执行状态（idle / running / paused / completed / failed）
- [ ] 各节点执行结果
- [ ] 执行日志
- [ ] 调试状态（断点、当前节点、调用栈、监视变量）

### 6.6 撤销/重做系统

- [ ] `src/composables/useHistory.ts` — 撤销/重做
- [ ] 维护 HistoryState（past / present / future 三栈）
- [ ] 快照生成：每次操作前创建 FlowSnapshot
- [ ] 操作类型记录（创建节点 / 删除节点 / 移动节点 / 创建连线 / 删除连线 / 更新配置）
- [ ] 撤销：当前状态压入 future，从 past 弹出恢复
- [ ] 重做：当前状态压入 past，从 future 弹出恢复
- [ ] 历史栈限制：最多 50 条
- [ ] 批量操作视为单个原子操作
- [ ] 支持 Ctrl+Z / Ctrl+Y 快捷键

### 6.7 快捷键系统

- [ ] `src/composables/useKeyboard.ts` — 快捷键管理
- [ ] Ctrl+Z: 撤销
- [ ] Ctrl+Y / Ctrl+Shift+Z: 重做
- [ ] Ctrl+C: 复制选中节点
- [ ] Ctrl+V: 粘贴节点
- [ ] Delete / Backspace: 删除选中节点/连线
- [ ] Ctrl+A: 全选
- [ ] Ctrl+S: 保存当前流程
- [ ] Escape: 取消当前操作/取消选择
- [ ] 快捷键与输入框/编辑器不冲突（编辑模式时忽略）

### 6.8 剪贴板操作

- [ ] `src/composables/useClipboard.ts` — 复制/粘贴/剪切
- [ ] 复制选中节点到内部剪贴板（序列化为 JSON）
- [ ] 粘贴时重新生成节点 ID 和位置偏移
- [ ] 粘贴连线时更新 source/target 引用
- [ ] 剪切 = 复制 + 删除

### 6.9 DataProvider 集成

- [ ] Store 与 DataProvider 的读写对接
- [ ] 流程保存：Store 数据 → DataProvider.saveFlow()
- [ ] 流程加载：DataProvider.getFlow() → Store 数据
- [ ] 项目保存/加载
- [ ] 环境变量读写

### 6.10 单元测试

- [ ] Canvas Store：节点/边 CRUD 测试
- [ ] Node Store：配置更新测试
- [ ] Tab Store：标签操作测试
- [ ] Execution Store：状态变更测试
- [ ] 撤销/重做：各种操作类型的撤销重做测试
- [ ] 快捷键：冲突处理测试
- [ ] 剪贴板：复制/粘贴/剪切测试
- [ ] DataProvider 集成：读写一致测试

---

## 验收标准

### 核心验收（必须通过）

| # | 验收项 | 通过条件 |
|---|--------|----------|
| 1 | Canvas Store | 节点和连线可正确增删改查 |
| 2 | Tab Store | 标签可打开/切换/关闭，未保存标记正确 |
| 3 | 撤销/重做 | Ctrl+Z 撤销、Ctrl+Y 重做，操作类型正确记录 |
| 4 | 历史栈限制 | 超过 50 条历史后自动丢弃最早的 |
| 5 | 批量操作 | 多选移动视为单个原子操作，一次撤销全部回退 |
| 6 | 快捷键 | Copy/Paste/Delete/SelectAll 快捷键正常工作 |
| 7 | 剪贴板 | 复制节点后粘贴，ID 重新生成，位置偏移 |
| 8 | Store 同步 | Store 数据与 Vue Flow 节点/边数据双向同步 |
| 9 | 单元测试 | 所有 Store 和 composable 测试通过 |

### 非核心验收（可后续补充）

| # | 验收项 | 通过条件 |
|---|--------|----------|
| 1 | 环境变量 | 环境切换后变量池自动更新 |
| 2 | 执行状态 | 执行状态可在 idle/running/paused 间正确切换 |