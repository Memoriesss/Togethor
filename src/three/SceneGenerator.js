import PromptParser from '../ai/PromptParser';
import ElementFactory from './ElementFactory';

class SceneGenerator {
  constructor() {
    this.parser = new PromptParser();
    this.factory = new ElementFactory();
    this.animationBuilder = this.initAnimationBuilder();
  }

  /**
   * 初始化动画构建器
   */
  initAnimationBuilder() {
    return {
      buildRotationAnimation: (speed = 0.01, axis = 'y') => ({
        type: 'rotation',
        speed,
        axis,
      }),

      buildFloatAnimation: (amplitude = 1, speed = 1, offset = 0) => ({
        type: 'float',
        amplitude,
        speed,
        offset,
      }),

      buildPulseAnimation: (min = 0.8, max = 1.2, speed = 1) => ({
        type: 'scale',
        min,
        max,
        speed,
      }),
    };
  }

  /**
   * 主生成方法
   * @param {string} prompt - 用户输入的提示词
   * @returns {Object} 完整的场景配置
   */
  generateScene(prompt) {
    // 解析提示词
    const parsedPrompt = this.parser.parse(prompt);

    // 生成场景元素
    const elements = this.factory.generateElements(parsedPrompt);

    // 生成光照配置
    const lighting = this.generateLighting(parsedPrompt);

    // 生成氛围配置
    const atmosphere = this.generateAtmosphere(parsedPrompt);

    // 生成粒子配置
    const particles = this.factory.getParticleConfig(parsedPrompt.mood, parsedPrompt.colors);

    return {
      elements,
      lighting,
      atmosphere,
      particles,
      metadata: {
        prompt,
        parsedPrompt,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * 生成光照配置
   */
  generateLighting(parsedPrompt) {
    const { mood, style, colors } = parsedPrompt;
    const primaryColor = this.getColor(colors[0] || 'cyan');

    const lightingPresets = {
      ethereal: {
        ambient: { intensity: 0.3, color: '#8866aa' },
        directional: { intensity: 0.8, color: '#ffffff', position: [5, 10, 5] },
        points: [
          { intensity: 1, color: primaryColor, position: [-3, 2, 2], distance: 20 },
          { intensity: 0.8, color: '#00ffff', position: [3, 2, -2], distance: 20 },
        ],
      },
      cyberpunk: {
        ambient: { intensity: 0.2, color: '#000033' },
        directional: { intensity: 0.5, color: '#ff0066', position: [10, 10, 5] },
        points: [
          { intensity: 2, color: '#00ffff', position: [-5, 3, 3], distance: 25 },
          { intensity: 2, color: '#ff00ff', position: [5, 3, -3], distance: 25 },
        ],
      },
      fantasy: {
        ambient: { intensity: 0.35, color: '#553366' },
        directional: { intensity: 0.7, color: '#ffd700', position: [8, 12, 4] },
        points: [
          { intensity: 1.2, color: '#ff69b4', position: [-4, 3, 2], distance: 22 },
          { intensity: 1, color: '#9370db', position: [4, 2, -3], distance: 20 },
        ],
      },
      dark: {
        ambient: { intensity: 0.1, color: '#000011' },
        directional: { intensity: 0.3, color: '#333366', position: [5, 10, 5] },
        points: [
          { intensity: 1.5, color: '#ff0000', position: [0, 5, 0], distance: 30 },
        ],
      },
      mysterious: {
        ambient: { intensity: 0.15, color: '#1a1a2e' },
        directional: { intensity: 0.4, color: '#6666aa', position: [3, 8, 3] },
        points: [
          { intensity: 1, color: '#4b0082', position: [-2, 4, 2], distance: 18 },
          { intensity: 0.8, color: '#000080', position: [2, 3, -2], distance: 16 },
        ],
      },
      peaceful: {
        ambient: { intensity: 0.4, color: '#667799' },
        directional: { intensity: 0.6, color: '#aaccff', position: [5, 8, 5] },
        points: [],
      },
      energetic: {
        ambient: { intensity: 0.3, color: '#ffcc33' },
        directional: { intensity: 1, color: '#ffffff', position: [10, 15, 5] },
        points: [
          { intensity: 1.5, color: '#ff6600', position: [-3, 4, 3], distance: 25 },
          { intensity: 1.5, color: '#ffff00', position: [3, 4, -3], distance: 25 },
        ],
      },
    };

    return lightingPresets[mood] || lightingPresets.ethereal;
  }

  /**
   * 生成氛围配置
   */
  generateAtmosphere(parsedPrompt) {
    const { mood } = parsedPrompt;

    const atmosphereConfigs = {
      mysterious: {
        fogColor: '#0a0a1a',
        fogNear: 5,
        fogFar: 60,
        backgroundColor: '#050510',
      },
      peaceful: {
        fogColor: '#1a2a3a',
        fogNear: 10,
        fogFar: 80,
        backgroundColor: '#0f1a2a',
      },
      energetic: {
        fogColor: '#2a1a3a',
        fogNear: 15,
        fogFar: 100,
        backgroundColor: '#1a0f2a',
      },
      dark: {
        fogColor: '#000000',
        fogNear: 3,
        fogFar: 40,
        backgroundColor: '#000000',
      },
      ethereal: {
        fogColor: '#1a1a3a',
        fogNear: 20,
        fogFar: 120,
        backgroundColor: '#0a0a1f',
      },
      cyberpunk: {
        fogColor: '#0a0a2a',
        fogNear: 8,
        fogFar: 70,
        backgroundColor: '#050515',
      },
      fantasy: {
        fogColor: '#2a1a4a',
        fogNear: 15,
        fogFar: 90,
        backgroundColor: '#150a2a',
      },
    };

    return atmosphereConfigs[mood] || atmosphereConfigs.ethereal;
  }

  /**
   * 获取颜色值
   */
  getColor(colorKey) {
    const colorMap = {
      red: '#ff6b6b',
      blue: '#4ecdc4',
      green: '#4ecdc4',
      yellow: '#ffe66d',
      purple: '#9b59b6',
      pink: '#ff69b4',
      orange: '#ff9f43',
      white: '#ffffff',
      black: '#2d3436',
      cyan: '#00d2d3',
    };
    return colorMap[colorKey] || '#00d2d3';
  }

  /**
   * 继续幻想 - 在现有场景基础上添加元素
   */
  extendScene(existingScene, additionalPrompt) {
    const parsedAdditional = this.parser.parse(additionalPrompt);
    const newElements = this.factory.generateElements(parsedAdditional);

    // 调整新元素位置，避免与现有元素重叠
    const adjustedElements = newElements.map((el, index) => ({
      ...el,
      position: [
        el.position[0] + (Math.random() - 0.5) * 5,
        el.position[1] + (Math.random() - 0.5) * 3,
        el.position[2] + (Math.random() - 0.5) * 5,
      ],
    }));

    return {
      ...existingScene,
      elements: [...existingScene.elements, ...adjustedElements],
    };
  }

  /**
   * 转换场景风格
   */
  transformStyle(existingScene, newStyle) {
    const { mood, colors } = existingScene.metadata?.parsedPrompt || {};
    
    return {
      ...existingScene,
      lighting: this.generateLighting({ mood: newStyle, style: newStyle, colors }),
      atmosphere: this.generateAtmosphere({ mood: newStyle }),
    };
  }
}

export default SceneGenerator;
