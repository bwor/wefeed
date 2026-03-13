Page({
  data: {
    pets: [],
    loading: false,
    refreshing: false,
  },

  onShow() {
    this.loadPets();
  },

  onPullDownRefresh() {
    this.loadPets().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onRefresh() {
    this.setData({ refreshing: true });
    this.loadPets().then(() => {
      this.setData({ refreshing: false });
    });
  },

  async loadPets() {
    this.setData({ loading: true });
    try {
      const res = await wx.cloud.callFunction({
        name: "petManager",
        data: { action: "list" },
      });

      if (res.result.success) {
        this.setData({ pets: res.result.data });
      } else {
        wx.showToast({ title: res.result.msg || "加载失败", icon: "error" });
      }
    } catch (err) {
      console.error("加载宠物列表失败:", err);
      wx.showToast({ title: "加载失败", icon: "error" });
    } finally {
      this.setData({ loading: false });
    }
  },

  goAdd() {
    wx.navigateTo({ url: "/pages/pet-edit/index" });
  },

  goEdit(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/pet-edit/index?id=${id}` });
  },

  async setDefault(e) {
    const { id } = e.currentTarget.dataset;
    try {
      const res = await wx.cloud.callFunction({
        name: "petManager",
        data: { action: "setDefault", petId: id },
      });

      if (res.result.success) {
        this.loadPets();
        wx.showToast({ title: "设置成功" });
      } else {
        wx.showToast({ title: res.result.msg || "设置失败", icon: "error" });
      }
    } catch (err) {
      console.error("设置默认宠物失败:", err);
      wx.showToast({ title: "设置失败", icon: "error" });
    }
  },

  async deletePet(e) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: "提示",
      content: "确定要删除这个宠物档案吗？",
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await wx.cloud.callFunction({
              name: "petManager",
              data: { action: "delete", petId: id },
            });

            if (result.result.success) {
              this.loadPets();
              wx.showToast({ title: "删除成功" });
            } else {
              wx.showToast({
                title: result.result.msg || "删除失败",
                icon: "error",
              });
            }
          } catch (err) {
            console.error("删除宠物失败:", err);
            wx.showToast({ title: "删除失败", icon: "error" });
          }
        }
      },
    });
  },

  goBack() {
    wx.navigateBack();
  },

  stopPropagation() {
    // 阻止事件冒泡
  },
});
