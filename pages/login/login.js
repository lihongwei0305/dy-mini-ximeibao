const app = getApp()
const { LOGIN_API_URL } = require('../../config')

Page({
  data: {
    redirect: '/',
    loading: false,
    errorMsg: '',
    modalVisible: true,
  },
  onLoad(options) {
    if (options.redirect) {
      this.setData({ redirect: decodeURIComponent(options.redirect) })
    }
  },

  // auth-modal 组件触发 auth 事件（内部已在 button bindtap 里调用了 tt.getUserProfile）
  onModalAuth(e) {
    const { userInfo, encryptedData, iv } = e.detail
    this.setData({ loading: true, errorMsg: '' })
    this.doLogin({ userInfo, encryptedData, iv })
  },

  onModalCancel() {
    tt.navigateBack()
  },

  doLogin({ userInfo = {}, encryptedData = '', iv = '' } = {}) {
    tt.login({
      success: (res) => {
        if (res.code) {
          console.log('[login] tt.login success, code:', res.code)

          console.log("encryptedData",encryptedData);
          
          tt.request({
            url: LOGIN_API_URL + "/douyin/auth/callback",
            method: 'POST',
            data: {
              code:          res.code,
              anonymousCode: res.anonymousCode || '',
              encryptedData: encryptedData,
              iv:            iv,
            },
            success: (apiRes) => {
              console.log('[login] 后端登录请求成功:', apiRes)
              tt.hideLoading()
              const token = apiRes.data?.token
              const expireAt = apiRes.data?.expireAt || (Date.now() + 7 * 24 * 3600 * 1000)

              if (!token) {
                console.error('[login] 后端未返回 token', apiRes)
                this.setData({ loading: false, errorMsg: '登录失败，请重试' })
                return
              }

              app.globalData.loginResult = {
                token,
                expireAt,
                redirect:  this.data.redirect,
                nickName:  userInfo.nickName  || '',
                avatarUrl: userInfo.avatarUrl || '',
                gender:    userInfo.gender    ?? '',
              }

              tt.showToast({ title: '登录成功' })
              setTimeout(() => tt.navigateBack(), 1000)
            },
            fail: (err) => {
              console.error('[login] 后端登录请求失败', err)
              this.setData({ loading: false, errorMsg: '登录请求失败，请重试' })
            }
          })
        } else {
          this.setData({ loading: false, errorMsg: '获取 code 失败，请重试' })
        }
      },
      fail: (err) => {
        console.error('[login] tt.login fail', err)
        this.setData({ loading: false, errorMsg: '登录环境调用失败' })
      }
    })
  }
})
