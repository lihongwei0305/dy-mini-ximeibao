Page({
  data: {
    imageUrl: '',
    action: ''
  },
  onLoad: function (options) {
    if (options.url) {
      const decodedUrl = decodeURIComponent(options.url);
      const action = options.action; // 获取传入的动作：previewImage 或 saveImage
      
      this.setData({
        imageUrl: decodedUrl,
        action: action
      });
      console.log('中转页接收到的参数', decodedUrl, 'action:', action);

      const isValidImage = decodedUrl.startsWith('http') || decodedUrl.startsWith('data:image') || decodedUrl.startsWith('blob:');
      
      // 首次进来自动尝试保存
      if (action === 'saveImage' && isValidImage) {
        this.processSaveImage(decodedUrl);
      }
    }
  },

  handleSaveClick: function() {
    if (!this.data.imageUrl) return;
    this.processSaveImage(this.data.imageUrl);
  },

  processSaveImage: function(decodedUrl) {
    tt.showLoading({ title: '保存中...' });
    
    let base64Data = decodedUrl;
    if (base64Data.startsWith('data:image')) {
      base64Data = base64Data.replace(/^data:image\/\w+;base64,/, '');
      
      const fs = tt.getFileSystemManager();
      const filePath = `${tt.env.USER_DATA_PATH}/tmp_save_${Date.now()}.png`;

      fs.writeFile({
        filePath: filePath,
        data: base64Data,
        encoding: 'base64',
        success: () => {
          this.callNativeSave(filePath);
        },
        fail: (err) => {
          tt.hideLoading();
          console.error('写入文件失败:', err);
          tt.showToast({ title: '文件处理失败', icon: 'none' });
        }
      });
    } else {
      // 网络链接 (http)
      tt.downloadFile({
        url: decodedUrl,
        success: (res) => {
          if (res.statusCode === 200) {
            this.callNativeSave(res.tempFilePath);
          } else {
            tt.hideLoading();
            tt.showToast({ title: '下载失败', icon: 'none' });
          }
        },
        fail: () => {
          tt.hideLoading();
          tt.showToast({ title: '下载文件失败', icon: 'none' });
        }
      });
    }
  },

  callNativeSave: function(filePath) {
    tt.saveImageToPhotosAlbum({
      filePath: filePath,
      success: () => {
        tt.hideLoading();
      
        tt.navigateBack();
          tt.showToast({ title: '已保存到相册', icon: 'success' });
      },
      fail: (err) => {
        tt.hideLoading();
        console.error('保存相册失败:', err);
        // 如果是取消或者没有权限，给用户一个明确提示
        if (err.errMsg && (err.errMsg.includes('cancel') || err.errMsg.includes('deny'))) {
          tt.showToast({ title: '已取消或由于权限失败', icon: 'none' });
        } else {
          tt.showToast({ title: '保存失败请重试', icon: 'none' });
        }
      }
    });
  }
})