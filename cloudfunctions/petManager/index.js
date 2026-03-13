const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

// 宠物数据验证
function validatePetData(data) {
  const { name, type, gender, weight, birthday } = data;

  if (!name || name.trim() === "") {
    return { valid: false, msg: "宠物名字不能为空" };
  }

  if (name.length > 20) {
    return { valid: false, msg: "宠物名字不能超过20个字符" };
  }

  if (type && !["cat", "dog", "other"].includes(type)) {
    return { valid: false, msg: "宠物类型不正确" };
  }

  if (gender && !["male", "female", "unknown"].includes(gender)) {
    return { valid: false, msg: "性别类型不正确" };
  }

  if (weight !== undefined && weight !== null && weight !== "") {
    const w = parseFloat(weight);
    if (isNaN(w) || w < 0 || w > 999) {
      return { valid: false, msg: "体重格式不正确" };
    }
  }

  return { valid: true };
}

// 获取宠物列表
async function getPetList(OPENID) {
  try {
    const res = await db
      .collection("pets")
      .where({ openid: OPENID })
      .orderBy("isDefault", "desc")
      .orderBy("createTime", "desc")
      .get();

    return {
      success: true,
      data: res.data,
      count: res.data.length,
    };
  } catch (error) {
    console.error("获取宠物列表失败:", error);
    return { success: false, msg: "获取宠物列表失败", error: error.message };
  }
}

// 获取单个宠物详情
async function getPetDetail(OPENID, petId) {
  try {
    const res = await db.collection("pets").doc(petId).get();

    if (!res.data) {
      return { success: false, msg: "宠物不存在" };
    }

    if (res.data.openid !== OPENID) {
      return { success: false, msg: "无权访问该宠物" };
    }

    return { success: true, data: res.data };
  } catch (error) {
    console.error("获取宠物详情失败:", error);
    return { success: false, msg: "获取宠物详情失败", error: error.message };
  }
}

// 添加宠物
async function addPet(OPENID, data) {
  const validation = validatePetData(data);
  if (!validation.valid) {
    return { success: false, msg: validation.msg };
  }

  try {
    const {
      name,
      avatar,
      type,
      breed,
      gender,
      birthday,
      weight,
      color,
      remark,
      isDefault,
    } = data;

    const petData = {
      openid: OPENID,
      name: name.trim(),
      avatar: avatar || "",
      type: type || "other",
      breed: breed ? breed.trim() : "",
      gender: gender || "unknown",
      birthday: birthday ? new Date(birthday) : null,
      weight: weight ? parseFloat(weight) : null,
      color: color ? color.trim() : "",
      remark: remark ? remark.trim() : "",
      isDefault: isDefault || false,
      createTime: db.serverDate(),
      updateTime: db.serverDate(),
    };

    // 如果设为默认，先将其他宠物设为非默认
    if (isDefault) {
      await db
        .collection("pets")
        .where({ openid: OPENID })
        .update({
          data: { isDefault: false },
        });
    }

    const res = await db.collection("pets").add({ data: petData });

    return {
      success: true,
      msg: "添加成功",
      petId: res._id,
    };
  } catch (error) {
    console.error("添加宠物失败:", error);
    return { success: false, msg: "添加宠物失败", error: error.message };
  }
}

// 更新宠物
async function updatePet(OPENID, petId, data) {
  const validation = validatePetData(data);
  if (!validation.valid) {
    return { success: false, msg: validation.msg };
  }

  try {
    // 检查权限
    const petRes = await db.collection("pets").doc(petId).get();
    if (!petRes.data) {
      return { success: false, msg: "宠物不存在" };
    }
    if (petRes.data.openid !== OPENID) {
      return { success: false, msg: "无权修改该宠物" };
    }

    const {
      name,
      avatar,
      type,
      breed,
      gender,
      birthday,
      weight,
      color,
      remark,
      isDefault,
    } = data;

    const updateData = {
      name: name.trim(),
      avatar: avatar || "",
      type: type || "other",
      breed: breed ? breed.trim() : "",
      gender: gender || "unknown",
      birthday: birthday ? new Date(birthday) : null,
      weight: weight ? parseFloat(weight) : null,
      color: color ? color.trim() : "",
      remark: remark ? remark.trim() : "",
      updateTime: db.serverDate(),
    };

    // 如果设为默认，先将其他宠物设为非默认
    if (isDefault) {
      await db
        .collection("pets")
        .where({
          openid: OPENID,
          _id: _.neq(petId),
        })
        .update({
          data: { isDefault: false },
        });
      updateData.isDefault = true;
    }

    await db.collection("pets").doc(petId).update({ data: updateData });

    return { success: true, msg: "更新成功" };
  } catch (error) {
    console.error("更新宠物失败:", error);
    return { success: false, msg: "更新宠物失败", error: error.message };
  }
}

// 删除宠物
async function deletePet(OPENID, petId) {
  try {
    // 检查权限
    const petRes = await db.collection("pets").doc(petId).get();
    if (!petRes.data) {
      return { success: false, msg: "宠物不存在" };
    }
    if (petRes.data.openid !== OPENID) {
      return { success: false, msg: "无权删除该宠物" };
    }

    await db.collection("pets").doc(petId).remove();

    return { success: true, msg: "删除成功" };
  } catch (error) {
    console.error("删除宠物失败:", error);
    return { success: false, msg: "删除宠物失败", error: error.message };
  }
}

// 设置默认宠物
async function setDefaultPet(OPENID, petId) {
  try {
    // 检查权限
    const petRes = await db.collection("pets").doc(petId).get();
    if (!petRes.data) {
      return { success: false, msg: "宠物不存在" };
    }
    if (petRes.data.openid !== OPENID) {
      return { success: false, msg: "无权操作该宠物" };
    }

    // 先将所有宠物设为非默认
    await db
      .collection("pets")
      .where({ openid: OPENID })
      .update({
        data: { isDefault: false },
      });

    // 将指定宠物设为默认
    await db
      .collection("pets")
      .doc(petId)
      .update({
        data: { isDefault: true },
      });

    return { success: true, msg: "设置成功" };
  } catch (error) {
    console.error("设置默认宠物失败:", error);
    return { success: false, msg: "设置默认宠物失败", error: error.message };
  }
}

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  const { action, petId, data } = event;

  if (!OPENID) {
    return { success: false, msg: "用户未登录" };
  }

  switch (action) {
    case "list":
      return await getPetList(OPENID);
    case "detail":
      return await getPetDetail(OPENID, petId);
    case "add":
      return await addPet(OPENID, data);
    case "update":
      return await updatePet(OPENID, petId, data);
    case "delete":
      return await deletePet(OPENID, petId);
    case "setDefault":
      return await setDefaultPet(OPENID, petId);
    default:
      return { success: false, msg: "未知操作" };
  }
};
