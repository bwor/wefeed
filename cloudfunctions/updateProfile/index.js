const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  const { nickname, avatarUrl } = event;

  try {
    // 构建更新数据
    const updateData = {};
    if (nickname !== undefined) {
      updateData.nickname = nickname;
    }
    if (avatarUrl !== undefined) {
      updateData.avatarUrl = avatarUrl;
    }

    // 使用 openid 字段查询用户
    const userQuery = await db.collection("users").where({ openid: OPENID }).get();

    if (userQuery.data && userQuery.data.length > 0) {
      // 用户存在，执行更新
      const userId = userQuery.data[0]._id;
      updateData.updateAt = Date.now();
      
      await db.collection("users").doc(userId).update({
        data: updateData,
      });
    } else {
      // 用户不存在，创建新记录
      const now = Date.now();
      await db.collection("users").add({
        data: {
          openid: OPENID,
          ...updateData,
          createAt: now,
          updateAt: now,
        },
      });
    }

    // 获取更新后的用户数据
    const updatedQuery = await db.collection("users").where({ openid: OPENID }).get();
    const updatedData = updatedQuery.data && updatedQuery.data.length > 0 
      ? updatedQuery.data[0] 
      : null;

    return {
      success: true,
      msg: "更新成功",
      openid: OPENID,
      profile: updatedData,
    };
  } catch (error) {
    console.error("更新用户资料失败:", error);
    return {
      success: false,
      msg: error.message,
      error: error,
    };
  }
};