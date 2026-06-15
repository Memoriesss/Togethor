// pages/index/index.js
const { getPoseList } = require('../../utils/poses.js');
const app = getApp();

Page({
  data: {
    poses: [],
    totalMinutes: 0,
    historyCount: 0
  },

  onLoad() {
    this.setData({ poses: getPoseList() });
  },

  onShow() {
    // 每次回到首页刷新统计
    const history = (app.globalData && app.globalData.history) || [];
    const totalSeconds = history.reduce((s, r) => s + (r.duration || 0), 0);
    this.setData({
      totalMinutes: Math.round(totalSeconds / 60),
      historyCount: history.length
    });
  },

  onSelectPose(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/practice/practice?poseId=${id}`
    });
  }
});
