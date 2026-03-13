# eventManager 云函数

日历事件管理云函数

## 功能

- list: 获取事件列表
- add: 添加事件
- update: 更新事件
- delete: 删除事件
- byDate: 获取指定日期的事件

## 部署步骤

1. 在微信开发者工具中，找到 `cloudfunctions/eventManager` 文件夹
2. 右键点击 `eventManager` 文件夹
3. 选择 **"上传并部署：云端安装依赖"**
4. 等待上传完成

## 使用说明

部署完成后，在小程序中调用方式：

```javascript
const cloud = wx.cloud;

// 添加事件
await cloud.callFunction({
  name: "eventManager",
  data: {
    action: "add",
    data: {
      date: "2024-01-01",
      title: "测试事件",
      time: "10:00",
      note: "测试备注",
    },
  },
});

// 获取事件列表
await cloud.callFunction({
  name: "eventManager",
  data: {
    action: "list",
  },
});
```
