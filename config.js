const envInfo = tt.getEnvInfoSync()
const envVersion = envInfo?.microapp?.envType
// 'develop' | 'trial' | 'release'

const isDev = envVersion !== 'release'

module.exports = {
  H5_BASE_URL: isDev
    ? 'https://peimei-test.xuntukeji.cn'
    : 'https://peimei.xuntukeji.cn',
  LOGIN_API_URL: isDev
    ?  'https://uniauth-api-test.xuntukeji.cn/api'
    :  'https://uniauth-api.xuntukeji.cn/api',
  SURREAL_WS_URL: isDev
    ? 'wss://surreal-test.xuntukeji.cn/rpc'
    : 'wss://surreal.xuntukeji.cn/rpc',
  SURREAL_NS: 'uniauth',
  SURREAL_DB: 'uniauth',
}