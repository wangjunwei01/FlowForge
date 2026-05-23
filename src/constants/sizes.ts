// 当响应体超过阈值时：
// - < 100KB: 正常渲染
// - 100KB ~ 1MB: 虚拟滚动 + 延迟解析
// - > 1MB: 仅显示摘要信息 + 按需加载
export const RESPONSE_SIZE_THRESHOLD = 100 * 1024 // 100KB
export const RESPONSE_SIZE_LARGE = 1024 * 1024 // 1MB
export const MAX_DISPLAY_LINES = 10000