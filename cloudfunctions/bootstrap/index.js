const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  let created = false;
  let nickname = "";
  try {
    console.log("OPENID", OPENID);
    // 使用 _openid 字段查询
    const r = await db.collection("users").where({ _openid: OPENID }).get();
    console.log("r", r);
    
    if (r.data && r.data.length > 0) {
      const userData = r.data[0];
      nickname = userData.nickname || "";
      
      // Return the full user profile data
      return { 
        openid: OPENID, 
        created, 
        nickname,
        avatarUrl: userData.avatarUrl || '',
        createAt: userData.createAt,
        updateAt: userData.updateAt,
        ...userData
      };
    } else {
      throw new Error("User not found");
    }
  } catch (e) {
    const adjs = [
      "可爱",
      "聪明",
      "机敏",
      "勇敢",
      "温柔",
      "开朗",
      "活力",
      "温暖",
      "闪亮",
      "果敢",
    ];
    const animals = [
      "鲸鱼",
      "狐狸",
      "猫咪",
      "麋鹿",
      "海豚",
      "长颈鹿",
      "熊猫",
      "猎鹰",
      "天鹅",
      "雪豹",
    ];
    const n = Math.floor(Math.random() * 10000);
    nickname =
      adjs[Math.floor(Math.random() * adjs.length)] +
      animals[Math.floor(Math.random() * animals.length)] +
      n;
    
    const now = Date.now();
    
    // 创建新用户，使用 _openid 字段
    await db.collection("users").add({
      data: { 
        _openid: OPENID,
        nickname,
        createAt: now,
        updateAt: now
      },
    });
    created = true;
    
    // Return the new user profile data
    return { 
      openid: OPENID, 
      created, 
      nickname,
      avatarUrl: '',
      createAt: now,
      updateAt: now
    };
  }
};