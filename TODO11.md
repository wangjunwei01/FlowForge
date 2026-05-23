# TODO11: 项目管理与导入导出

> 阶段：功能完善 | 优先级：P1（非核心模块，后续统一测试）
> 依赖：TODO4, TODO6
> 预计周期：1-2 周

## 目标

实现项目管理、环境变量管理、导入导出、文档生成等功能。这些功能完善产品体验但不是核心流程的必要依赖。

---

## 任务清单

### 11.1 项目管理

- [ ] `src/views/ProjectManager.vue` — 项目管理页面
- [ ] 项目列表：显示所有项目（名称、描述、流程数、更新时间）
- [ ] 新建项目：名称、描述
- [ ] 打开项目：从列表选择
- [ ] 删除项目：确认对话框
- [ ] 项目重命名

### 11.2 流程管理

- [ ] 流程列表：在项目内显示所有流程
- [ ] 新建流程：创建空白流程
- [ ] 复制流程
- [ ] 删除流程：确认对话框
- [ ] 流程重命名
- [ ] 流程排序（拖拽）

### 11.3 环境变量管理

- [ ] 环境列表管理：添加/编辑/删除环境
- [ ] 环境切换下拉选择
- [ ] 变量编辑：键/值/描述/敏感标记
- [ ] 批量导入变量（从 JSON/CSV）
- [ ] 批量导出变量
- [ ] 敏感信息存储到系统密钥库（调用 keyring IPC）
- [ ] 环境配置导入/导出（敏感信息单独处理）

### 11.4 导入功能

- [ ] `src/components/import/ImportDialog.vue` — 导入对话框
- [ ] 支持导入来源选择：cURL / Postman / Insomnia / OpenAPI
- [ ] `src/components/import/CurlParser.ts` — cURL 解析器（已在 TODO7 实现，此处集成到对话框）
- [ ] `src/components/import/PostmanImporter.ts` — Postman Collection JSON 解析
- [ ] `src/components/import/InsomniaImporter.ts` — Insomnia YAML/JSON 解析
- [ ] `src/components/import/OpenAPIImporter.ts` — OpenAPI/Swagger JSON/YAML 解析
- [ ] `src/services/import.service.ts` — 导入服务
- [ ] `src/composables/useImport.ts` — 导入 composable
- [ ] 导入结果预览：显示将导入的接口列表
- [ ] 允许用户选择导入哪些接口
- [ ] 导入失败的项目列出错误原因
- [ ] 导入成功后转换为 FlowForge Flow 格式

### 11.5 导出功能

- [ ] `src/components/export/ExportDialog.vue` — 导出对话框（已在 TODO7 实现，此处完善）
- [ ] 导出为 FlowForge JSON 格式（完整流程）
- [ ] 导出为 OpenAPI/Swagger 格式（预留）

### 11.6 文档生成

- [ ] `src/services/documentation.service.ts` — 文档生成服务
- [ ] 生成 Markdown 格式接口文档
- [ ] 文档内容：流程名、概述、节点列表、数据流图、节点详情、数据映射关系
- [ ] 节点详情：方法/URL/请求头/认证/输入参数/输出字段
- [ ] 数据映射关系表格
- [ ] 文档导出为 .md 文件

### 11.7 文件对话框集成

- [ ] 使用 Tauri dialog 插件实现原生文件对话框
- [ ] 保存流程文件对话框
- [ ] 打开流程文件对话框
- [ ] 导入文件选择对话框
- [ ] Proto 文件选择对话框
- [ ] 二进制文件选择对话框（HTTP Body）

### 11.8 单元测试

- [ ] Postman 导入解析测试
- [ ] Insomnia 导入解析测试
- [ ] OpenAPI 导入解析测试
- [ ] cURL 解析测试（已在 TODO7，此处补充边界场景）
- [ ] 文档生成测试
- [ ] 环境变量 CRUD 测试
- [ ] 项目/流程文件操作测试

---

## 验收标准

### 核心验收（必须通过）

| # | 验收项 | 通过条件 |
|---|--------|----------|
| 1 | 项目管理 | 可创建/打开/删除/重命名项目 |
| 2 | 流程管理 | 可创建/复制/删除/重命名流程 |
| 3 | 环境管理 | 可添加/编辑/删除/切换环境 |
| 4 | 环境变量 | 变量 CRUD 正常，环境切换后变量池更新 |
| 5 | cURL 导入 | 可从 cURL 命令创建 HTTP 节点 |
| 6 | Postman 导入 | 可从 Postman Collection 创建流程 |
| 7 | 保存/加载 | 流程可正确保存和重新加载，数据无丢失 |
| 8 | 文档生成 | 可生成包含节点列表和映射关系的 Markdown 文档 |

### 非核心验收（可后续补充）

| # | 验收项 | 通过条件 |
|---|--------|----------|
| 1 | Insomnia 导入 | 可从 Insomnia 集合创建流程 |
| 2 | OpenAPI 导入 | 可从 OpenAPI/Swagger 文档创建流程 |
| 3 | 批量变量导入 | 可从 JSON/CSV 批量导入变量 |
| 4 | 敏感信息密钥库 | 敏感变量存储到系统密钥库 |
| 5 | OpenAPI 导出 | 可导出为 OpenAPI/Swagger 格式 |