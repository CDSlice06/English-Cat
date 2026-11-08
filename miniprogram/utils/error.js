// 统一错误文案：优先展示云函数/接口返回的 message，
// 调用方可以传一句贴合当前场景的兜底文案，不传则用通用提示
// 云函数执行超时（-504003）与网络波动类报错，原文对用户没有意义，统一换成友好文案
const TIMEOUT_PATTERN = /-504003|timed out|timeout|超时|ESOCKETTIMEDOUT|ETIMEDOUT|ECONNRESET/i

function isTimeoutError(error) {
  const text = `${(error && (error.errCode || error.errMsg)) || ''} ${(error && error.message) || ''}`
  return TIMEOUT_PATTERN.test(text)
}

function errorMessage(error, fallback) {
  if (isTimeoutError(error)) return fallback || '服务响应有点慢，请稍后重试'
  if (error && error.message) return error.message
  return fallback || '云服务暂不可用，请稍后重试'
}

module.exports = { errorMessage, isTimeoutError }
