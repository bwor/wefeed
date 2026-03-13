// 初始化云函数
const cloud = wx.cloud;

Page({
  data: {
    // 日历相关数据
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
    selectedDay: new Date().getDate(),
    weekdays: ["日", "一", "二", "三", "四", "五", "六"],
    prevMonthDays: [],
    currentMonthDays: [],
    nextMonthDays: [],

    // 事件相关数据
    events: [],
    selectedDateEvents: [],
    showForm: false,
    newEvent: {
      title: "",
      time: "",
      note: "",
    },
  },

  onLoad() {
    // 先初始化数据，确保showForm为false
    this.setData({
      showForm: false,
      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth() + 1,
      selectedDay: new Date().getDate(),
      events: [],
      selectedDateEvents: [],
      newEvent: {
        title: "",
        time: "",
        note: "",
      },
    });
    // 初始化日历
    this.initCalendar();
    // 加载事件数据
    this.loadEvents();
    // 确保弹窗默认不显示
    this.setData({ showForm: false });
  },

  onShow() {
    // 确保每次页面显示时弹窗都默认隐藏
    this.setData({ showForm: false });
  },

  // 初始化日历
  initCalendar() {
    const { currentYear, currentMonth } = this.data;
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);
    const firstDayWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    // 计算上个月的天数
    const prevMonthLastDay = new Date(
      currentYear,
      currentMonth - 1,
      0,
    ).getDate();
    const prevMonthDays = [];
    for (let i = firstDayWeek - 1; i >= 0; i--) {
      prevMonthDays.push(prevMonthLastDay - i);
    }

    // 计算当前月的天数
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push(i);
    }

    // 计算下个月的天数
    const nextMonthDays = [];
    const totalDays = prevMonthDays.length + currentMonthDays.length;
    const remainingDays = 42 - totalDays; // 6行7列
    for (let i = 1; i <= remainingDays; i++) {
      nextMonthDays.push(i);
    }

    this.setData({
      prevMonthDays,
      currentMonthDays,
      nextMonthDays,
      showForm: false,
    });

    // 更新选中日期的事件
    this.updateSelectedDateEvents();
  },

  // 加载事件数据
  async loadEvents() {
    try {
      const res = await cloud.callFunction({
        name: "eventManager",
        data: {
          action: "list",
        },
      });
      console.log("加载事件成功:", res);
      if (res.result && res.result.success) {
        console.log("事件数据:", res.result.data);
        this.setData({
          events: res.result.data || [],
          showForm: false,
        });
      } else {
        console.log("加载事件失败:", res.result);
        this.setData({
          events: [],
          showForm: false,
        });
      }
      // 更新选中日期的事件
      this.updateSelectedDateEvents();
      console.log("选中日期的事件:", this.data.selectedDateEvents);
    } catch (err) {
      console.error("加载事件失败:", err);
      wx.showToast({ title: "加载失败: " + err.message, icon: "none" });
      this.setData({
        events: [],
        showForm: false,
      });
    }
  },

  // 上一个月
  prevMonth() {
    let { currentYear, currentMonth } = this.data;
    currentMonth--;
    if (currentMonth < 1) {
      currentMonth = 12;
      currentYear--;
    }
    this.setData({
      currentYear,
      currentMonth,
      showForm: false,
    });
    this.initCalendar();
  },

  // 下一个月
  nextMonth() {
    let { currentYear, currentMonth } = this.data;
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
    this.setData({
      currentYear,
      currentMonth,
      showForm: false,
    });
    this.initCalendar();
  },

  // 选择日期
  selectDate(e) {
    const day = e.currentTarget.dataset.day;
    this.setData({
      selectedDay: day,
      showForm: false,
    });
    this.updateSelectedDateEvents();
  },

  // 判断是否是今天
  isToday(day) {
    const today = new Date();
    return (
      today.getFullYear() === this.data.currentYear &&
      today.getMonth() + 1 === this.data.currentMonth &&
      today.getDate() === day
    );
  },

  // 判断是否是选中的日期
  isSelected(day) {
    return day === this.data.selectedDay;
  },

  // 判断日期是否有事件
  hasEvent(day) {
    const { currentYear, currentMonth, events } = this.data;
    const dateStr = `${currentYear}-${currentMonth.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    const eventList = events || [];
    return eventList.some((event) => event.date === dateStr);
  },

  // 更新选中日期的事件
  updateSelectedDateEvents() {
    const { currentYear, currentMonth, selectedDay, events } = this.data;
    console.log("更新选中日期事件 - events:", events);
    const dateStr = `${currentYear}-${currentMonth.toString().padStart(2, "0")}-${selectedDay.toString().padStart(2, "0")}`;
    console.log("当前日期字符串:", dateStr);
    const eventList = events || [];
    const selectedEvents = eventList.filter((event) => event.date === dateStr);
    console.log("筛选后的事件:", selectedEvents);
    this.setData({
      selectedDateEvents: selectedEvents,
      selectedDate: dateStr,
      showForm: false,
    });
  },

  // 显示添加事件表单
  showAddEventForm() {
    this.setData({
      showForm: true,
      newEvent: {
        title: "",
        time: "",
        note: "",
      },
    });
  },

  // 隐藏添加事件表单
  hideAddEventForm() {
    this.setData({ showForm: false });
  },

  // 绑定标题输入
  bindTitleInput(e) {
    this.setData({
      "newEvent.title": e.detail.value,
    });
  },

  // 绑定时间选择
  bindTimeChange(e) {
    this.setData({
      "newEvent.time": e.detail.value,
    });
  },

  // 绑定备注输入
  bindNoteInput(e) {
    this.setData({
      "newEvent.note": e.detail.value,
    });
  },

  // 添加事件
  async addEvent() {
    const { newEvent, selectedDate } = this.data;

    // 验证表单
    if (!newEvent.title) {
      wx.showToast({ title: "请输入标题", icon: "none" });
      return;
    }

    if (!newEvent.time) {
      wx.showToast({ title: "请选择时间", icon: "none" });
      return;
    }

    try {
      // 调用云函数添加事件
      const res = await cloud.callFunction({
        name: "eventManager",
        data: {
          action: "add",
          data: {
            date: selectedDate,
            title: newEvent.title,
            time: newEvent.time,
            note: newEvent.note,
          },
        },
      });

      console.log("添加事件返回:", res);
      if (res.result && res.result.success) {
        wx.showToast({ title: "添加成功", icon: "success" });
        this.setData({ showForm: false });
        // 重新加载事件数据
        this.loadEvents();
      } else {
        wx.showToast({
          title: res.result ? res.result.msg || "添加失败" : "添加失败",
          icon: "none",
        });
      }
    } catch (err) {
      console.error("添加事件失败:", err);
      wx.showToast({ title: "添加失败: " + err.message, icon: "none" });
    }
  },

  // 删除事件
  async deleteEvent(e) {
    const eventId = e.currentTarget.dataset.id;

    wx.showModal({
      title: "确认删除",
      content: "确定要删除这个事项吗？",
      success: async (res) => {
        if (res.confirm) {
          try {
            const res = await cloud.callFunction({
              name: "eventManager",
              data: {
                action: "delete",
                eventId: eventId,
              },
            });

            console.log("删除事件返回:", res);
            if (res.result && res.result.success) {
              wx.showToast({ title: "删除成功", icon: "success" });
              this.setData({ showForm: false });
              // 重新加载事件数据
              this.loadEvents();
            } else {
              wx.showToast({
                title: res.result ? res.result.msg || "删除失败" : "删除失败",
                icon: "none",
              });
            }
          } catch (err) {
            console.error("删除事件失败:", err);
            wx.showToast({ title: "删除失败: " + err.message, icon: "none" });
          }
        }
      },
    });
  },
});
