Page({
  data: {
    selectedDate: "",
  },

  onLoad() {
    // 设置当前日期为选中日期
    const today = new Date();
    const selectedDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;
    this.setData({ selectedDate });
  },

  handleAddSuccess() {
    console.log("添加事件成功");
  },

  handleDeleteSuccess() {
    console.log("删除事件成功");
  },
});
