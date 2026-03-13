Page({
  data: {
    petId: '',
    name: '',
    avatar: '',
    tempAvatar: '',
    type: 'cat',
    breed: '',
    gender: 'unknown',
    birthday: '',
    weight: '',
    color: '',
    remark: '',
    isDefault: false,
    saving: false,
    typeOptions: [
      { value: 'cat', label: '猫咪' },
      { value: 'dog', label: '狗狗' },
      { value: 'other', label: '其他' }
    ],
    genderOptions: [
      { value: 'male', label: '公' },
      { value: 'female', label: '母' },
      { value: 'unknown', label: '未知' }
    ]
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ petId: options.id });
      this.loadPetDetail(options.id);
    }
  },

  async loadPetDetail(id) {
    try {
      const res = await wx.cloud.callFunction({
        name: 'petManager',
        data: { action: 'detail', petId: id }
      });

      if (res.result.success) {
        const pet = res.result.data;
        this.setData({
          name: pet.name || '',
          avatar: pet.avatar || '',
          type: pet.type || 'cat',
          breed: pet.breed || '',
          gender: pet.gender || 'unknown',
          birthday: pet.birthday ? this.formatDate(pet.birthday) : '',
          weight: pet.weight ? String(pet.weight) : '',
          color: pet.color || '',
          remark: pet.remark || '',
          isDefault: pet.isDefault || false
        });
      } else {
        wx.showToast({ title: res.result.msg || '加载失败', icon: 'error' });
      }
    } catch (err) {
      console.error('加载宠物详情失败:', err);
      wx.showToast({ title: '加载失败', icon: 'error' });
    }
  },

  formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  onInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({ [field]: e.detail.value });
  },

  onTypeChange(e) {
    const index = e.detail.value;
    this.setData({ type: this.data.typeOptions[index].value });
  },

  onGenderChange(e) {
    const index = e.detail.value;
    this.setData({ gender: this.data.genderOptions[index].value });
  },

  onDateChange(e) {
    this.setData({ birthday: e.detail.value });
  },

  onDefaultChange(e) {
    this.setData({ isDefault: e.detail.value });
  },

  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.setData({ tempAvatar: tempFilePath });
      }
    });
  },

  async uploadAvatar() {
    const { tempAvatar } = this.data;
    if (!tempAvatar) return this.data.avatar;

    try {
      const { openid } = getApp().globalData;
      const cloudPath = `pets/${openid}/${Date.now()}.jpg`;
      const result = await wx.cloud.uploadFile({
        cloudPath,
        filePath: tempAvatar
      });
      return result.fileID;
    } catch (err) {
      console.error('上传头像失败:', err);
      throw new Error('头像上传失败');
    }
  },

  async save() {
    const { name, petId, isDefault } = this.data;

    if (!name.trim()) {
      wx.showToast({ title: '请输入宠物名字', icon: 'error' });
      return;
    }

    this.setData({ saving: true });

    try {
      const avatar = await this.uploadAvatar();

      const petData = {
        name: name.trim(),
        avatar,
        type: this.data.type,
        breed: this.data.breed.trim(),
        gender: this.data.gender,
        birthday: this.data.birthday,
        weight: this.data.weight,
        color: this.data.color.trim(),
        remark: this.data.remark.trim(),
        isDefault
      };

      const action = petId ? 'update' : 'add';
      const callData = {
        name: 'petManager',
        data: {
          action,
          data: petData
        }
      };

      if (petId) {
        callData.data.petId = petId;
      }

      const res = await wx.cloud.callFunction(callData);

      if (res.result.success) {
        wx.showToast({ title: petId ? '更新成功' : '添加成功' });
        setTimeout(() => wx.navigateBack(), 500);
      } else {
        wx.showToast({ title: res.result.msg || '保存失败', icon: 'error' });
      }
    } catch (err) {
      console.error('保存失败:', err);
      wx.showToast({ title: err.message || '保存失败', icon: 'error' });
    } finally {
      this.setData({ saving: false });
    }
  },

  goBack() {
    wx.navigateBack();
  }
});
