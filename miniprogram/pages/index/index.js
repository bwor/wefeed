Page({
  data: {
    nickname: '',
  },

  onShow() {
    const { nickname } = getApp().globalData;
    this.setData({ nickname });
  },

  goProfile() {
    wx.switchTab({ url: '/pages/profile/profile' });
  },

  goPetList() {
    wx.navigateTo({ url: '/pages/pet-list/pet-list' });
  },
});