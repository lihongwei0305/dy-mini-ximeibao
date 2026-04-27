const { H5_BASE_URL } = require('../../config')
Page({
  data: {
    webviewUrl: '',
    modalVisible: false,
    loginLoading: false,
    loginError: '',
    _pendingRedirect: '/',
  },

  onLoad: async function (options) {
    // 优先使用 URL 传入的 token，其次读本地缓存
    const token    = options.token    || tt.getStorageSync('tt_token')
    const expireAt = Number(options.expireAt || tt.getStorageSync('tt_token_expire_at') || 0)

   

    if (token && expireAt > Date.now()) {
      console.log('有token直接跳转');
      // token 未过期，直接加载 webview
      const redirect = this.data._pendingRedirect || '/'
      const params = new URLSearchParams({ token, expireAt: String(expireAt), redirect })
      console.log('webview:',`${H5_BASE_URL}/login?${params.toString()}`);
      this.setData({ webviewUrl: `${H5_BASE_URL}/login?${params.toString()}` })
      return
    }
  },

  webviewMessage: function (e) {
    // console.log('[index] 收到 H5 消息:', e)
    // const dataList = e.detail && e.detail.data
    // if (!dataList || !Array.isArray(dataList)) return
    // dataList.forEach(item => {
    //   if (item.action === 'requireLogin') {
    //     console.log('[index] H5 要求登录, redirect:', item.redirect)
    //     this.setData({
    //       _pendingRedirect: item.redirect || '/',
    //       modalVisible: true,
    //       loginError: '',
    //     })
    //   } else if (item.action === 'syncUser') {
    //     const {user } = item
    //     if (user?.openid) {
    //       console.log('[index] 收到 syncUser, openid:', user.openid)
    //       // syncUser(token, user)
    //       // logLogin(token, user)
    //     }
    //   }
    // })
  },


  webviewOnLoad() {
    console.log('✅ WebView 页面加载完成！');
    // 这里就可以安全地调用 evalJS 主动发消息了
  },


  onWebviewError: function (e) {
    console.log('[index] 网页加载失败', e)
  },
})
