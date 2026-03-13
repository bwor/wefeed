const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

// 获取事件列表
async function getEventList(OPENID) {
  try {
    const res = await db
      .collection("events")
      .where({ openid: OPENID })
      .orderBy("date", "desc")
      .orderBy("time", "asc")
      .get();

    return {
      success: true,
      data: res.data,
      count: res.data.length,
    };
  } catch (error) {
    console.error("获取事件列表失败:", error);
    return { success: false, msg: "获取事件列表失败", error: error.message };
  }
}

// 获取单个事件详情
async function getEventDetail(OPENID, eventId) {
  try {
    const res = await db.collection("events").doc(eventId).get();

    if (!res.data) {
      return { success: false, msg: "事件不存在" };
    }

    if (res.data.openid !== OPENID) {
      return { success: false, msg: "无权访问该事件" };
    }

    return { success: true, data: res.data };
  } catch (error) {
    console.error("获取事件详情失败:", error);
    return { success: false, msg: "获取事件详情失败", error: error.message };
  }
}

// 添加事件
async function addEvent(OPENID, data) {
  const { title, time, note, date } = data;

  if (!title || title.trim() === "") {
    return { success: false, msg: "标题不能为空" };
  }

  if (title.length > 50) {
    return { success: false, msg: "标题不能超过50个字符" };
  }

  if (!time || time.trim() === "") {
    return { success: false, msg: "时间不能为空" };
  }

  if (!date || date.trim() === "") {
    return { success: false, msg: "日期不能为空" };
  }

  try {
    const eventData = {
      openid: OPENID,
      title: title.trim(),
      time: time.trim(),
      note: note ? note.trim() : "",
      date: date.trim(),
      createdAt: db.serverDate(),
      updatedAt: db.serverDate(),
    };

    const res = await db.collection("events").add({ data: eventData });

    return {
      success: true,
      msg: "添加成功",
      eventId: res._id,
    };
  } catch (error) {
    console.error("添加事件失败:", error);
    return { success: false, msg: "添加事件失败", error: error.message };
  }
}

// 更新事件
async function updateEvent(OPENID, eventId, data) {
  const { title, time, note, date } = data;

  if (!title || title.trim() === "") {
    return { success: false, msg: "标题不能为空" };
  }

  if (title.length > 50) {
    return { success: false, msg: "标题不能超过50个字符" };
  }

  if (!time || time.trim() === "") {
    return { success: false, msg: "时间不能为空" };
  }

  if (!date || date.trim() === "") {
    return { success: false, msg: "日期不能为空" };
  }

  try {
    const eventRes = await db.collection("events").doc(eventId).get();
    if (!eventRes.data) {
      return { success: false, msg: "事件不存在" };
    }
    if (eventRes.data.openid !== OPENID) {
      return { success: false, msg: "无权修改该事件" };
    }

    const updateData = {
      title: title.trim(),
      time: time.trim(),
      note: note ? note.trim() : "",
      date: date.trim(),
      updatedAt: db.serverDate(),
    };

    await db.collection("events").doc(eventId).update({ data: updateData });

    return { success: true, msg: "更新成功" };
  } catch (error) {
    console.error("更新事件失败:", error);
    return { success: false, msg: "更新事件失败", error: error.message };
  }
}

// 删除事件
async function deleteEvent(OPENID, eventId) {
  try {
    const eventRes = await db.collection("events").doc(eventId).get();
    if (!eventRes.data) {
      return { success: false, msg: "事件不存在" };
    }
    if (eventRes.data.openid !== OPENID) {
      return { success: false, msg: "无权删除该事件" };
    }

    await db.collection("events").doc(eventId).remove();

    return { success: true, msg: "删除成功" };
  } catch (error) {
    console.error("删除事件失败:", error);
    return { success: false, msg: "删除事件失败", error: error.message };
  }
}

// 获取指定日期的事件
async function getEventsByDate(OPENID, date) {
  try {
    const res = await db
      .collection("events")
      .where({ openid: OPENID, date: date })
      .orderBy("time", "asc")
      .get();

    return {
      success: true,
      data: res.data,
      count: res.data.length,
    };
  } catch (error) {
    console.error("获取指定日期的事件失败:", error);
    return { success: false, msg: "获取指定日期的事件失败", error: error.message };
  }
}

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  const { action, eventId, data } = event;

  if (!OPENID) {
    return { success: false, msg: "用户未登录" };
  }

  switch (action) {
    case "list":
      return await getEventList(OPENID);
    case "detail":
      return await getEventDetail(OPENID, eventId);
    case "add":
      return await addEvent(OPENID, data);
    case "update":
      return await updateEvent(OPENID, eventId, data);
    case "delete":
      return await deleteEvent(OPENID, eventId);
    case "byDate":
      return await getEventsByDate(OPENID, data.date);
    default:
      return { success: false, msg: "未知操作" };
  }
};
