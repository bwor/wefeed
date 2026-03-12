App({
  globalData: {
    openid: "",
    nickname: "",
    avatarUrl: "",
  },

  async onLaunch() {
    if (wx.cloud) {
      wx.cloud.init({ traceUser: true });
      try {
        const res = await wx.cloud.callFunction({ name: "bootstrap" });
        console.log("bootstrap cloud function call result:", res);
        const { result = {} } = res;
        const { openid = "", nickname = "", avatarUrl = "" } = result;

        // Set basic user info
        this.globalData.openid = openid;
        this.globalData.nickname = nickname;
        this.globalData.avatarUrl = avatarUrl;
      } catch (error) {
        console.error("Bootstrap function failed:", error);
      }
    }
  },

  // Method to update global user profile
  updateUserProfile(profileData) {
    const { openid, nickname, avatarUrl, ...restProps } = profileData;

    // Update basic properties
    if (openid !== undefined) this.globalData.openid = openid;
    if (nickname !== undefined) this.globalData.nickname = nickname;
    if (avatarUrl !== undefined) this.globalData.avatarUrl = avatarUrl;

    // Add any additional properties
    Object.entries(restProps).forEach(([key, value]) => {
      this.globalData[key] = value;
    });
  },
});
