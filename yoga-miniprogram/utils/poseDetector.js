// utils/poseDetector.js
// 姿态检测器抽象类 + Mock 实现 + 评分
// 真实环境接入 MediaPipe / TF.js MoveNet 时,只需替换 RealPoseDetector 即可

const { angleAt, verticalAngle, mid, POSES } = require('./poses.js');

/**
 * 生成空关键点(全部为零,score=0)
 */
function emptyKeypoints() {
  return Array.from({ length: 17 }, () => ({ x: 0, y: 0, score: 0 }));
}

/**
 * 计算单条规则的得分(0~100)
 *  - value 越接近 target 得分越高
 *  - tolerance: 容差(单位与 value 相同)
 */
function scoreRule(rule, value) {
  const diff = Math.abs(value - rule.target);
  if (diff <= rule.tolerance) {
    // 容差内:100 ~ 70
    return 100 - (diff / rule.tolerance) * 30;
  }
  // 容差外:70 起按超出幅度快速下降,至 0
  const over = diff - rule.tolerance;
  // 超出量按 tolerance 的倍数计算
  const ratio = over / Math.max(rule.tolerance, 0.001);
  return Math.max(0, 70 - ratio * 17.5);
}

/**
 * 根据规则集计算体式得分
 *  @returns { total: 0~100, details: [{name, value, score}] }
 */
function computePoseScore(pose, keypoints) {
  if (!keypoints || keypoints.length < 17) {
    return { total: 0, details: [] };
  }
  let totalWeight = 0;
  let weightedSum = 0;
  const details = [];
  pose.rules.forEach((rule) => {
    let value;
    try {
      value = rule.compute(keypoints);
    } catch (e) {
      console.warn('规则计算失败', rule.name, e);
      return;
    }
    const s = scoreRule(rule, value);
    details.push({ name: rule.name, value: Math.round(value), score: Math.round(s) });
    weightedSum += s * rule.weight;
    totalWeight += rule.weight;
  });
  const total = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  return { total, details };
}

/* ---------------- PoseDetector 基类 ---------------- */
class PoseDetector {
  constructor() {
    this.ready = false;
  }
  async init() {
    this.ready = true;
  }
  /**
   * 检测单帧
   *  @param {ArrayBuffer} frameData  RGBA 像素(可选,某些实现不需要)
   *  @param {number} width
   *  @param {number} height
   *  @returns {Promise<{keypoints: Array, score: number} | null>}
   */
  async detect(frameData, width, height) {
    throw new Error('需子类实现');
  }
  destroy() {
    this.ready = false;
  }
}

/* ---------------- Mock 姿态检测器 ---------------- */
/**
 * 模拟检测器:在没有真实 ML 模型时,基于目标体式生成逐渐"变好"的姿态,
 * 让你能完整体验从识别到评分的全流程。
 * 真实使用时,可在 init() 阶段加载 TF.js MoveNet 或调用云端 API。
 */
class MockPoseDetector extends PoseDetector {
  constructor(pose) {
    super();
    this.pose = pose;
    this.startTime = Date.now();
    this.lastKeypoints = null;
    // 难度等级影响收敛速度
    this.convergeTime = 4000; // 4 秒趋于稳定
  }

  /**
   * 关键点中心归一化到画面 0.5, 0.45
   */
  _baseKeypoints() {
    // 基于"站姿"基础姿态,再根据目标体式调整
    const kp = emptyKeypoints().map(() => ({ x: 0.5, y: 0.5, score: 0.9 }));
    // 默认站姿: 鼻 0.5,0.20
    kp[0] = { x: 0.5, y: 0.20, score: 0.95 };
    kp[1] = { x: 0.48, y: 0.18, score: 0.9 };
    kp[2] = { x: 0.52, y: 0.18, score: 0.9 };
    kp[3] = { x: 0.47, y: 0.19, score: 0.85 };
    kp[4] = { x: 0.53, y: 0.19, score: 0.85 };
    kp[5] = { x: 0.43, y: 0.25, score: 0.95 };
    kp[6] = { x: 0.57, y: 0.25, score: 0.95 };
    kp[7] = { x: 0.40, y: 0.38, score: 0.9 };
    kp[8] = { x: 0.60, y: 0.38, score: 0.9 };
    kp[9] = { x: 0.39, y: 0.50, score: 0.85 };
    kp[10] = { x: 0.61, y: 0.50, score: 0.85 };
    kp[11] = { x: 0.45, y: 0.50, score: 0.95 };
    kp[12] = { x: 0.55, y: 0.50, score: 0.95 };
    kp[13] = { x: 0.45, y: 0.70, score: 0.9 };
    kp[14] = { x: 0.55, y: 0.70, score: 0.9 };
    kp[15] = { x: 0.45, y: 0.90, score: 0.85 };
    kp[16] = { x: 0.55, y: 0.90, score: 0.85 };
    return kp;
  }

  /**
   * 基于体式对基础姿态做调整
   */
  _adjustForPose(kp) {
    switch (this.pose.id) {
      case 'mountain':
        // 默认就是山式
        break;
      case 'tree':
        // 抬起右腿(左 13,15 不动,右 14,16 抬到 11 附近)
        kp[14] = { x: 0.48, y: 0.55, score: 0.9 };
        kp[16] = { x: 0.48, y: 0.50, score: 0.85 };
        break;
      case 'warrior1':
        // 前腿(左)屈膝 90 度
        kp[13] = { x: 0.45, y: 0.55, score: 0.9 };
        kp[15] = { x: 0.45, y: 0.85, score: 0.85 };
        // 后腿(右)伸直
        kp[14] = { x: 0.65, y: 0.70, score: 0.9 };
        kp[16] = { x: 0.75, y: 0.90, score: 0.85 };
        // 双手举过头
        kp[7] = { x: 0.43, y: 0.15, score: 0.9 };
        kp[9] = { x: 0.43, y: 0.05, score: 0.85 };
        kp[8] = { x: 0.57, y: 0.15, score: 0.9 };
        kp[10] = { x: 0.57, y: 0.05, score: 0.85 };
        break;
      case 'warrior2':
        kp[13] = { x: 0.45, y: 0.55, score: 0.9 };
        kp[15] = { x: 0.45, y: 0.85, score: 0.85 };
        kp[14] = { x: 0.65, y: 0.70, score: 0.9 };
        kp[16] = { x: 0.75, y: 0.90, score: 0.85 };
        // 双手侧平举
        kp[7] = { x: 0.30, y: 0.25, score: 0.9 };
        kp[9] = { x: 0.20, y: 0.25, score: 0.85 };
        kp[8] = { x: 0.70, y: 0.25, score: 0.9 };
        kp[10] = { x: 0.80, y: 0.25, score: 0.85 };
        break;
      case 'downdog':
        // 倒 V: 髋抬高, 头低
        kp[0] = { x: 0.50, y: 0.55, score: 0.9 };
        kp[5] = { x: 0.35, y: 0.60, score: 0.9 };
        kp[6] = { x: 0.65, y: 0.60, score: 0.9 };
        kp[11] = { x: 0.40, y: 0.30, score: 0.95 };
        kp[12] = { x: 0.60, y: 0.30, score: 0.95 };
        kp[13] = { x: 0.40, y: 0.55, score: 0.9 };
        kp[14] = { x: 0.60, y: 0.55, score: 0.9 };
        kp[15] = { x: 0.40, y: 0.90, score: 0.85 };
        kp[16] = { x: 0.60, y: 0.90, score: 0.85 };
        // 手撑地
        kp[7] = { x: 0.30, y: 0.75, score: 0.9 };
        kp[9] = { x: 0.25, y: 0.90, score: 0.85 };
        kp[8] = { x: 0.70, y: 0.75, score: 0.9 };
        kp[10] = { x: 0.75, y: 0.90, score: 0.85 };
        break;
      case 'cobra':
        // 俯卧抬头,髋贴近地面
        kp[0] = { x: 0.50, y: 0.35, score: 0.9 };
        kp[5] = { x: 0.43, y: 0.45, score: 0.9 };
        kp[6] = { x: 0.57, y: 0.45, score: 0.9 };
        kp[11] = { x: 0.45, y: 0.70, score: 0.9 };
        kp[12] = { x: 0.55, y: 0.70, score: 0.9 };
        kp[13] = { x: 0.45, y: 0.85, score: 0.9 };
        kp[14] = { x: 0.55, y: 0.85, score: 0.9 };
        kp[15] = { x: 0.45, y: 0.95, score: 0.85 };
        kp[16] = { x: 0.55, y: 0.95, score: 0.85 };
        kp[7] = { x: 0.43, y: 0.55, score: 0.9 };
        kp[9] = { x: 0.43, y: 0.70, score: 0.85 };
        kp[8] = { x: 0.57, y: 0.55, score: 0.9 };
        kp[10] = { x: 0.57, y: 0.70, score: 0.85 };
        break;
      case 'bridge':
        // 仰卧抬髋
        kp[0] = { x: 0.50, y: 0.65, score: 0.9 };
        kp[5] = { x: 0.43, y: 0.70, score: 0.9 };
        kp[6] = { x: 0.57, y: 0.70, score: 0.9 };
        kp[11] = { x: 0.45, y: 0.40, score: 0.95 };
        kp[12] = { x: 0.55, y: 0.40, score: 0.95 };
        kp[13] = { x: 0.45, y: 0.70, score: 0.9 };
        kp[14] = { x: 0.55, y: 0.70, score: 0.9 };
        kp[15] = { x: 0.45, y: 0.95, score: 0.85 };
        kp[16] = { x: 0.55, y: 0.95, score: 0.85 };
        break;
      case 'child':
        // 跪坐前折
        kp[0] = { x: 0.50, y: 0.80, score: 0.9 };
        kp[5] = { x: 0.43, y: 0.75, score: 0.9 };
        kp[6] = { x: 0.57, y: 0.75, score: 0.9 };
        kp[11] = { x: 0.45, y: 0.78, score: 0.9 };
        kp[12] = { x: 0.55, y: 0.78, score: 0.9 };
        kp[13] = { x: 0.45, y: 0.85, score: 0.9 };
        kp[14] = { x: 0.55, y: 0.85, score: 0.9 };
        kp[15] = { x: 0.45, y: 0.92, score: 0.85 };
        kp[16] = { x: 0.55, y: 0.92, score: 0.85 };
        kp[7] = { x: 0.43, y: 0.82, score: 0.9 };
        kp[9] = { x: 0.43, y: 0.95, score: 0.85 };
        kp[8] = { x: 0.57, y: 0.82, score: 0.9 };
        kp[10] = { x: 0.57, y: 0.95, score: 0.85 };
        break;
    }
    return kp;
  }

  /**
   * 在基础姿态上加抖动噪声,模拟真实检测
   */
  _addNoise(kp, t) {
    // 周期性正弦偏移,模拟人轻微晃动
    const wobble = 0.012;
    return kp.map((p, i) => ({
      x: p.x + Math.sin(t / 500 + i) * wobble,
      y: p.y + Math.cos(t / 600 + i * 0.7) * wobble,
      score: p.score
    }));
  }

  async detect() {
    if (!this.ready) return null;
    const elapsed = Date.now() - this.startTime;
    const t = Date.now();
    // 前 0.5s 不稳定,可能无检测
    if (elapsed < 500) {
      if (Math.random() < 0.7) return null;
    }
    let kp = this._baseKeypoints();
    kp = this._adjustForPose(kp);
    kp = this._addNoise(kp, t);
    this.lastKeypoints = kp;
    return { keypoints: kp, score: 1.0 };
  }
}

/* ---------------- 真实检测器(待集成) ---------------- */
/**
 * 真实环境推荐方案:
 *  1. TF.js + MoveNet (Thunder 3MB): 浏览器/WMP 均可加载,约 30-50ms/帧
 *     加载: import * as tf from '@tensorflow/tfjs-core'
 *           import * as movenet from '@tensorflow-models/movenet'
 *  2. 微信 VisionKit (human body detect): 需用户授权云服务调用
 *  3. 自建后端推理: 通过 wx.request 把帧发到后端,后端返回关键点
 *
 * 集成时只需继承 PoseDetector 并在 detect() 内返回:
 *  { keypoints: [{x, y, score, name}], score: number }
 */
class RealPoseDetector extends PoseDetector {
  // eslint-disable-next-line no-unused-vars
  async init(modelUrl) {
    // TODO: 加载真实模型
    // 示例(TF.js):
    //   this.model = await movenet.load({ modelUrl });
    this.ready = true;
  }
  async detect() {
    // TODO: 调用真实模型
    //   const predictions = await this.model.estimateSinglePose(frameData, ...);
    //   return { keypoints: predictions.keypoints, score: predictions.score };
    return null;
  }
}

module.exports = {
  PoseDetector,
  MockPoseDetector,
  RealPoseDetector,
  computePoseScore,
  emptyKeypoints
};
