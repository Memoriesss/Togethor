// app.js
App({
  globalData: {
    userInfo: null,
    systemInfo: null,
    history: [] // 练习历史
  },

  onLaunch() {
    // 获取系统信息
    try {
      let systemInfo = null;
      if (typeof wx.getWindowInfo === 'function') {
        systemInfo = wx.getWindowInfo();
      } else if (typeof wx.getSystemInfoSync === 'function') {
        systemInfo = wx.getSystemInfoSync();
      }
      this.globalData.systemInfo = systemInfo || {};
    } catch (e) {
      console.warn('获取系统信息失败', e);
      this.globalData.systemInfo = {};
    }

    // 加载本地历史记录
    const history = wx.getStorageSync('practiceHistory') || [];
    this.globalData.history = history;
  },

  /**
   * 保存练习记录
   * @param {Object} record {poseId, poseName, score, duration, createTime}
   */
  savePractice(record) {
    const history = this.globalData.history;
    history.unshift(record);
    // 仅保留最近 50 条
    if (history.length > 50) history.length = 50;
    this.globalData.history = history;
    wx.setStorageSync('practiceHistory', history);
  }
});
