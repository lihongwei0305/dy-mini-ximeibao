Component({
  properties: {
    visible: { type: Boolean, value: false },
    title:   { type: String,  value: '洗煤宝配煤助手' },
    desc:    { type: String,  value: '登录后即可使用完整功能' },
    btnText: { type: String,  value: '授权登录' },
    loading: { type: Boolean, value: false },
    errorMsg:{ type: String,  value: '' },
    loginRes:{ type: Object,  value: {} },
    // 是否点遮罩可关闭
    maskClosable: { type: Boolean, value: false },
  },

  methods: {
    // button bindtap —— 必须在此同步调用 tt.getUserProfile
    onAuthTap() {
      console.log(this.properties.loginRes);
      tt.getUserProfile({
        desc: '用于完善个人资料',
        success: async (res) => {
          console.log(res);
          this.triggerEvent('auth', {
            userInfo:      res.userInfo      || {},
            encryptedData: res.encryptedData || '',
            iv:            res.iv            || '',
          })
        },
        fail: (err) => {
          console.warn('[auth-modal] getUserProfile fail:', err)
          // 用户拒绝授权，触发 cancel 通知外部关闭弹窗，不继续登录流程
          this.triggerEvent('cancel')
        },
      })
    
    },

    onCancel() {
      this.triggerEvent('cancel')
    },

    onMaskTap() {
      if (this.properties.maskClosable) {
        this.triggerEvent('cancel')
      }
    },
  },
})
