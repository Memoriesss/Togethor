// pages/result/result.js
const { getPoseById } = require('../../utils/poses.js');

Page({
  data: {
    record: {
      poseId: '',
      poseName: '',
      score: 0,
      duration: 0,
      qualifiedSeconds: 0
    },
    medalEmoji: '🌱',
    levelText: '入门',
    comment: '',
    heroBg: 'linear-gradient(135deg, #d4b896 0%, #b08e6b 100%)',
    adviceList: [],
    qualifiedRate: 0
  },

  onLoad(options) {
    let record;
    try {
      record = JSON.parse(decodeURIComponent(options.record));
    } catch (e) {
      console.warn('record 解析失败', e);
      record = this.data.record;
    }
    const score = record.score || 0;
    const duration = record.duration || 0;
    const qualified = record.qualifiedSeconds || 0;
    const qualifiedRate = duration > 0 ? Math.round((qualified / duration) * 100) : 0;

    let medalEmoji = '🌱';
    let levelText = '入门';
    let heroBg = 'linear-gradient(135deg, #d4b896 0%, #b08e6b 100%)';
    let comment = '继续保持,慢慢找到身体的觉知 ✨';

    if (score >= 90) {
      medalEmoji = '🏆';
      levelText = '大师级';
      heroBg = 'linear-gradient(135deg, #f5c971 0%, #c89253 100%)';
      comment = '体式精准到位,身心合一,继续向更高阶体式挑战吧!';
    } else if (score >= 80) {
      medalEmoji = '🥇';
      levelText = '优秀';
      heroBg = 'linear-gradient(135deg, #f0d7a0 0%, #b48c5a 100%)';
      comment = '非常棒!体式标准,稳定性也很好。';
    } else if (score >= 60) {
      medalEmoji = '🥈';
      levelText = '良好';
      heroBg = 'linear-gradient(135deg, #d4b896 0%, #9c7d59 100%)';
      comment = '基础已经掌握,再注意一下细节就能更上一层楼。';
    } else if (score >= 40) {
      medalEmoji = '🥉';
      levelText = '及格';
      heroBg = 'linear-gradient(135deg, #c9b09a 0%, #8e7256 100%)';
      comment = '别灰心,让我们一起看看哪里需要调整。';
    }

    const pose = getPoseById(record.poseId);
    const adviceList = pose ? pose.tips : ['坚持每日练习,你会看到自己的进步。'];

    this.setData({
      record: { ...record, score },
      medalEmoji,
      levelText,
      heroBg,
      comment,
      adviceList,
      qualifiedRate
    });
  },

  onAgain() {
    wx.redirectTo({
      url: `/pages/practice/practice?poseId=${this.data.record.poseId}`
    });
  },

  onBack() {
    wx.reLaunch({ url: '/pages/index/index' });
  }
});
