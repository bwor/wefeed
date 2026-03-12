Page({
  onShow() {
    // 无需获取个人信息
  },

  goProfile() {
    wx.switchTab({ url: '/pages/profile/profile' });
  },
});
