// components/pose-card/pose-card.js
Component({
  properties: {
    pose: {
      type: Object,
      value: {}
    }
  },

  data: {
    difficultyText: '入门'
  },

  observers: {
    'pose.difficulty': function (d) {
      const map = { 1: '入门', 2: '基础', 3: '进阶' };
      this.setData({ difficultyText: map[d] || '入门' });
    }
  },

  methods: {
    onTap() {
      this.triggerEvent('tap', { id: this.data.pose.id });
    }
  }
});
