Page({
  data: {
    nickname: "",
    avatarUrl: "",
    avatarPreview: "",
    tempFilePath: "",
    saving: false,
  },

  onShow() {
    const { nickname, avatarUrl } = getApp().globalData;
    this.setData({ nickname, avatarUrl });
  },

  onChooseAvatar(e) {
    const url = e.detail.avatarUrl;
    if (!url) return;

    if (url.startsWith('http')) {
      wx.downloadFile({
        url,
        success: (res) => {
          if (res.tempFilePath) {
            this.setData({ avatarPreview: res.tempFilePath, tempFilePath: res.tempFilePath });
          }
        },
        fail: () => wx.showToast({ title: "下载失败", icon: "error" }),
      });
    } else {
      this.setData({ avatarPreview: url, tempFilePath: url });
    }
  },

  onInput(e) {
    this.setData({ nickname: e.detail.value });
  },

  async save() {
    const { openid } = getApp().globalData;
    if (!openid) {
      wx.showToast({ title: "用户信息获取失败", icon: "error" });
      return;
    }

    this.setData({ saving: true });

    try {
      const data = {};
      const nickname = this.data.nickname || getApp().globalData.nickname;
      if (nickname) data.nickname = nickname;

      if (this.data.tempFilePath) {
        const result = await wx.cloud.uploadFile({
          cloudPath: `avatars/${openid}-${Date.now()}.jpg`,
          filePath: this.data.tempFilePath,
        });
        if (result.fileID) {
          data.avatarUrl = result.fileID;
        }
      }

      if (!Object.keys(data).length) {
        this.setData({ saving: false });
        wx.showToast({ title: "已保存" });
        setTimeout(() => wx.navigateBack(), 500);
        return;
      }

      const res = await wx.cloud.callFunction({
        name: "updateProfile",
        data,
      });

      if (res.result.success) {
        getApp().updateUserProfile(data);
        this.setData({ saving: false, tempFilePath: "", avatarPreview: "" });
        wx.showToast({ title: "已保存" });
        setTimeout(() => wx.navigateBack(), 500);
      } else {
        throw new Error(res.result.msg);
      }
    } catch (err) {
      console.error("保存失败:", err);
      this.setData({ saving: false });
      wx.showToast({ title: err.message || "保存失败", icon: "error" });
    }
  },

  logout() {
    wx.showModal({
      title: "提示",
      content: "确定要注销账号吗？此操作不可恢复。",
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: "账号已注销", icon: "success" });
        }
      },
    });
  },
});
