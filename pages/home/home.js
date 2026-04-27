const { H5_BASE_URL, LOGIN_API_URL } = require('../../config')

Page({
  data: {
    modalVisible: false,
    loginLoading: false,
    loginError: '',
    _pendingModule: null,
  },

  onLoad: function () {
    // 每次进入都需要展示首页
    // const cachedToken = tt.getStorageSync('tt_token')
    // const cachedExpireAt = Number(tt.getStorageSync('tt_token_expire_at') || 0)
    // if (cachedToken && cachedExpireAt > Date.now()) {
    //   // token 有效，直接跳转，不展示首页
    //   tt.redirectTo({ url: '/pages/index/index' })
    // }
  },

  // 点击功能模块时检测登录状态
  onModuleTap: function (e) {
   console.log('onModuleTap');
    // tt.removeStorageSync('tt_token')
    // tt.removeStorageSync('tt_token_expire_at')
    const module = e.currentTarget.dataset.module;
    const cachedToken = tt.getStorageSync('tt_token')
    const cachedExpireAt = Number(tt.getStorageSync('tt_token_expire_at') || 0)
    // console.log('【cachedToken】:', cachedToken);
    // console.log('cachedExpireAt:', cachedExpireAt);
    if (cachedToken && cachedExpireAt > Date.now()) {
      console.log('-----------有token---------------');
      // 已登录，直接跳转
      this._navigateToModule(module)
    } else {
      console.log('-----------无token---------------');
      // 未登录，记录目标模块并弹出授权框
      this.setData({ _pendingModule: module, modalVisible: true, loginError: '' })
    }
  },

  _navigateToModule: function (module) {
    if (module === 'peimei') {
      const token = tt.getStorageSync('tt_token')
      const expireAt = tt.getStorageSync('tt_token_expire_at')
      tt.navigateTo({ url: `/pages/index/index?token=${token}&expireAt=${expireAt}` })
    }
  },

  // ─── auth-modal 事件 ───────────────────────────────────────────────────────

  onModalAuth: function (e) {
    const { userInfo, encryptedData, iv } = e.detail
    this.setData({ loginLoading: true, loginError: '' })
    this._doLogin({ userInfo, encryptedData, iv })
  },

  onModalCancel: function () {
    this.setData({ modalVisible: false, loginLoading: false, loginError: '', _pendingModule: null })
  },

  _doLogin: function ({ userInfo = {}, encryptedData = '', iv = '' } = {}) {
    tt.login({
      success: (res) => {
        console.log(res);
        if (!res.code) {
          this.setData({ loginLoading: false, loginError: '获取 code 失败，请重试' })
          return
        }
        tt.request({
          url: LOGIN_API_URL + '/douyin/auth/callback',
          method: 'POST',
          data: {
            code: res.code,
            anonymousCode: res.anonymousCode || '',
            encryptedData,
            iv,
            ns: 'uniauth',
            db: 'uniauth',
            ac: 'wx_auth',
          },
          success: (apiRes) => {
            const token = apiRes.data?.token
            const expiresIn = apiRes.data?.expiresIn
            const expireAt = expiresIn
              ? Date.now() + expiresIn * 1000
              : (apiRes.data?.expireAt || Date.now() + 7 * 24 * 3600 * 1000)
            if (!token) {
              this.setData({ loginLoading: false, loginError: '登录失败，请重试' })
              return
            };
            console.log('login success',token);
            tt.setStorageSync('tt_token', token)
            tt.setStorageSync('tt_token_expire_at', String(expireAt))
            const pendingModule = this.data._pendingModule
            this.setData({ modalVisible: false, loginLoading: false, loginError: '', _pendingModule: null })
            this._navigateToModule(pendingModule)
          },
          fail: () => {
            this.setData({ loginLoading: false, loginError: '网络请求失败，请重试' })
          },
        })
      },
      fail: () => {
        this.setData({ loginLoading: false, loginError: '登录环境调用失败' })
      },
    })
  },
})
