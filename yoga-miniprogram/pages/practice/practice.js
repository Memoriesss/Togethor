// pages/practice/practice.js
const { getPoseById } = require('../../utils/poses.js');
const {
  MockPoseDetector,
  computePoseScore
} = require('../../utils/poseDetector.js');
const app = getApp();

// 关键点连接 (COCO 17)
const SKELETON_EDGES = [
  [0, 1], [0, 2], [1, 3], [2, 4],         // 头部
  [5, 7], [7, 9], [6, 8], [8, 10],         // 手臂
  [5, 6],                                   // 肩
  [5, 11], [6, 12], [11, 12],              // 躯干
  [11, 13], [13, 15], [12, 14], [14, 16]   // 腿
];

const KEYPOINT_NAMES = [
  '鼻', '左眼', '右眼', '左耳', '右耳',
  '左肩', '右肩', '左肘', '右肘', '左腕', '右腕',
  '左髋', '右髋', '左膝', '右膝', '左踝', '右踝'
];

Page({
  data: {
    pose: null,
    difficultyText: '入门',
    devicePosition: 'back',
    cameraReady: false,
    cameraStatus: '正在初始化摄像头...',
    needAuth: false,
    started: false,
    countdown: 0,
    remainSeconds: 0,
    currentScore: 0,
    bestScore: 0,
    qualifiedSeconds: 0,
    scoreText: '准备',
    scoreColor: '#b08e6b',
    detected: false,
    scoreDetails: []
  },

  // ---- 生命周期 ----
  onLoad(options) {
    const poseId = options.poseId;
    const pose = getPoseById(poseId);
    if (!pose) {
      wx.showToast({ title: '体式不存在', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1000);
      return;
    }
    const map = { 1: '入门', 2: '基础', 3: '进阶' };
    this.setData({
      pose,
      remainSeconds: pose.duration,
      difficultyText: map[pose.difficulty] || '入门'
    });
    this._initDetector();
    this._initCamera();
  },

  onUnload() {
    this._stopDetection();
    this._stopTimer();
    if (this.detector && this.detector.destroy) this.detector.destroy();
  },

  // ---- 初始化 ----
  _initDetector() {
    // 默认使用 Mock 检测器(演示完整流程)
    // 真实集成:替换为 RealPoseDetector 并加载 TF.js MoveNet
    this.detector = new MockPoseDetector(this.data.pose);
    this.detector.init();
  },

  _initCamera() {
    // 请求摄像头权限
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.camera'] === false) {
          this.setData({ cameraStatus: '请授权摄像头权限以开始练习', needAuth: true });
        } else {
          this._requestCameraAuth();
        }
      },
      fail: () => {
        this.setData({ cameraStatus: '摄像头不可用' });
      }
    });
  },

  _requestCameraAuth() {
    wx.authorize({
      scope: 'scope.camera',
      success: () => {
        this.setData({ cameraReady: true, cameraStatus: '', needAuth: false });
        // 准备 canvas
        this._initCanvas();
      },
      fail: () => {
        this.setData({ cameraStatus: '请授权摄像头权限以开始练习', needAuth: true });
      }
    });
  },

  onRequestCamera() {
    wx.openSetting({
      success: (res) => {
        if (res.authSetting['scope.camera']) {
          this._requestCameraAuth();
        }
      }
    });
  },

  // ---- Canvas 初始化 ----
  _initCanvas() {
    const query = this.createSelectorQuery();
    query
      .select('#skeletonCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res || !res[0] || !res[0].node) {
          console.warn('canvas 未就绪');
          return;
        }
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = (typeof wx.getWindowInfo === 'function'
          ? wx.getWindowInfo().pixelRatio
          : (typeof wx.getSystemInfoSync === 'function'
              ? wx.getSystemInfoSync().pixelRatio
              : 1));
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);
        this.canvas = canvas;
        this.canvasCtx = ctx;
        this.canvasW = res[0].width;
        this.canvasH = res[0].height;
      });
  },

  // ---- 开始/结束 ----
  onSwitchCamera() {
    this.setData({
      devicePosition: this.data.devicePosition === 'back' ? 'front' : 'back'
    });
  },

  onStart() {
    if (!this.data.cameraReady) {
      wx.showToast({ title: '请先授权摄像头', icon: 'none' });
      return;
    }
    this._startCountdown();
  },

  onStop() {
    this._finishPractice(true);
  },

  _startCountdown() {
    this.setData({ countdown: 3 });
    this.countdownTimer = setInterval(() => {
      const c = this.data.countdown - 1;
      if (c <= 0) {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
        this.setData({ countdown: 0 });
        this._beginPractice();
      } else {
        this.setData({ countdown: c });
      }
    }, 1000);
  },

  _beginPractice() {
    this.setData({ started: true });
    this.startTime = Date.now();
    this.bestScore = 0;
    this.qualifiedSeconds = 0;
    this._startDetection();
    this._startTimer();
  },

  // ---- 计时 ----
  _startTimer() {
    this._tickTimer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      const remain = Math.max(0, this.data.pose.duration - elapsed);
      this.setData({ remainSeconds: remain });
      if (remain <= 0) {
        this._finishPractice(false);
      }
    }, 500);
  },

  _stopTimer() {
    if (this._tickTimer) clearInterval(this._tickTimer);
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    this._tickTimer = null;
    this.countdownTimer = null;
  },

  // ---- 检测循环 ----
  _startDetection() {
    // 真实环境中,可以监听 CameraFrameListener 获取帧数据
    // const context = wx.createCameraContext(this);
    // const listener = context.onCameraFrame((frame) => {
    //   this._processFrame(frame.data, frame.width, frame.height);
    // });
    // listener.start();
    // this.frameListener = listener;

    // 演示模式: 直接使用 Mock 检测器
    this._detectTimer = setInterval(() => {
      this._runDetect();
    }, 150);
  },

  _stopDetection() {
    if (this._detectTimer) clearInterval(this._detectTimer);
    this._detectTimer = null;
    if (this.frameListener && this.frameListener.stop) {
      this.frameListener.stop();
    }
    this.frameListener = null;
  },

  async _runDetect() {
    if (!this.detector) return;
    let result;
    try {
      result = await this.detector.detect();
    } catch (e) {
      console.warn('detect error', e);
      return;
    }
    if (!result || !result.keypoints) {
      this.setData({ detected: false });
      return;
    }
    const { keypoints } = result;
    // 1) 绘制骨架
    this._drawSkeleton(keypoints);
    // 2) 计算得分
    const { total, details } = computePoseScore(this.data.pose, keypoints);
    this._updateScore(total, details);
  },

  _drawSkeleton(kp) {
    if (!this.canvasCtx || !this.canvasW) return;
    const ctx = this.canvasCtx;
    const W = this.canvasW;
    const H = this.canvasH;
    ctx.clearRect(0, 0, W, H);

    // 镜像: 前置摄像头画面是左右镜像的,但用户看到的是镜像后的
    // 这里关键点 x 直接用 (kp[i].x * W)
    const xOf = (i) => kp[i].x * W;
    const yOf = (i) => kp[i].y * H;

    // 1) 画连线
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255, 220, 120, 0.85)';
    ctx.lineCap = 'round';
    SKELETON_EDGES.forEach(([a, b]) => {
      if (kp[a].score < 0.3 || kp[b].score < 0.3) return;
      ctx.beginPath();
      ctx.moveTo(xOf(a), yOf(a));
      ctx.lineTo(xOf(b), yOf(b));
      ctx.stroke();
    });

    // 2) 画关键点
    for (let i = 0; i < 17; i++) {
      if (kp[i].score < 0.3) continue;
      ctx.beginPath();
      ctx.arc(xOf(i), yOf(i), 6, 0, Math.PI * 2);
      ctx.fillStyle = '#b08e6b';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  },

  _updateScore(total, details) {
    if (total > this.bestScore) this.bestScore = total;
    // 累计达标时长(>=80 分)
    if (total >= 80) {
      this.qualifiedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    }
    let text = '准备';
    let color = '#b08e6b';
    if (total >= 90) { text = '完美'; color = '#5fa15f'; }
    else if (total >= 75) { text = '不错'; color = '#b08e6b'; }
    else if (total >= 60) { text = '继续'; color = '#d4a868'; }
    else { text = '调整'; color = '#c87a7a'; }

    this.setData({
      detected: true,
      currentScore: total,
      scoreText: text,
      scoreColor: color,
      bestScore: this.bestScore,
      qualifiedSeconds: this.qualifiedSeconds,
      scoreDetails: details
    });
  },

  // ---- 完成 ----
  _finishPractice(manual) {
    if (this._finished) return;
    this._finished = true;
    this._stopDetection();
    this._stopTimer();
    const duration = Math.floor((Date.now() - (this.startTime || Date.now())) / 1000);
    const record = {
      poseId: this.data.pose.id,
      poseName: this.data.pose.name,
      score: this.bestScore,
      duration: Math.max(1, duration),
      qualifiedSeconds: this.qualifiedSeconds || 0,
      createTime: Date.now(),
      manualStop: !!manual
    };
    app.savePractice(record);
    wx.redirectTo({
      url: `/pages/result/result?record=${encodeURIComponent(JSON.stringify(record))}`
    });
  }
});
