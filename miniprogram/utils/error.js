// 统一错误文案：优先展示云函数/接口返回的 message，
// 调用方可以传一句贴合当前场景的兜底文案，不传则用通用提示
function errorMessage(error, fallback) {
  if (error && error.message) return error.message
  return fallback || '云服务暂不可用，请稍后重试'
}

module.exports = { errorMessage }
