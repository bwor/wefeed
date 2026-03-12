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
    wx.navigateTo({ url: "/pages/edit/edit" });
  },

  goPetList() {
    wx.navigateTo({ url: "/pages/pet-list/pet-list" });
  },
});
