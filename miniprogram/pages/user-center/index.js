Page({
  data: {
    nickname: "",
    avatarUrl: "",
  },

  onShow() {
    const { nickname, avatarUrl } = getApp().globalData;
    this.setData({ nickname, avatarUrl });
  },

  goEdit() {
    wx.navigateTo({ url: "/pages/profile-edit/index" });
  },

  goPetList() {
    wx.navigateTo({ url: "/pages/pet-list/index" });
  },
});
