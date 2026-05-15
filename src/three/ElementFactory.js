import * as THREE from 'three';
import { generateId } from '../utils/helpers';

/**
 * 3D 元素工厂
 * 负责根据 AI 解析结果生成 3D 对象
 */
class ElementFactory {
  constructor() {
    this.geometryCache = new Map();
    this.colorMap = this.initColorMap();
  }

  /**
   * 初始化颜色映射
   */
  initColorMap() {
    return {
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
  }

  /**
   * 根据解析结果生成场景元素
   */
  generateElements(parsedPrompt, sceneConfig = {}) {
    const elements = [];
    const { objects, colors, materials, motions, mood, style } = parsedPrompt;

    // 生成主要对象
    objects.forEach((obj, index) => {
      const element = this.createSceneObject(obj, {
        colors,
        materials,
        motions,
        index,
        total: objects.length,
      });
      elements.push(element);
    });

    // 生成环境元素
    const envElements = this.createEnvironmentElements(mood, style, colors);
    elements.push(...envElements);

    // 添加辅助几何体以丰富场景
    if (elements.length < 3) {
      const additionalElements = this.createAdditionalElements(colors, materials, motions);
      elements.push(...additionalElements);
    }

    return elements;
  }

  /**
   * 创建场景对象
   */
  createSceneObject(objConfig, options) {
    const { type, importance, size } = objConfig;
    const { colors, materials, motions, index, total } = options;

    const geometry = this.createGeometry(type, size);
    const material = this.createMaterial(type, colors, materials);
    const position = this.calculatePosition(index, total, importance);
    const scale = this.calculateScale(type, size, importance);
    const animation = this.createAnimation(type, motions, importance);

    return {
      id: generateId(),
      type: 'main',
      objectType: type,
      geometry,
      material,
      position,
      rotation: [0, Math.random() * Math.PI * 2, 0],
      scale,
      animation,
      importance,
    };
  }

  /**
   * 创建几何体
   */
  createGeometry(type, size) {
    const sizeValue = this.getSizeValue(size);
    
    const geometryConfigs = {
      mountain: {
        type: 'ConeGeometry',
        params: [sizeValue * 2, sizeValue * 4, 6],
      },
      water: {
        type: 'PlaneGeometry',
        params: [sizeValue * 6, sizeValue * 6, 32, 32],
      },
      tree: {
        type: 'group',
        children: [
          {
            type: 'CylinderGeometry',
            params: [sizeValue * 0.3, sizeValue * 0.4, sizeValue * 2, 8],
            position: [0, -sizeValue, 0],
          },
          {
            type: 'ConeGeometry',
            params: [sizeValue * 1.2, sizeValue * 3, 8],
            position: [0, sizeValue * 0.5, 0],
          },
        ],
      },
      flower: {
        type: 'group',
        children: Array.from({ length: 5 }, (_, i) => ({
          type: 'SphereGeometry',
          params: [sizeValue * 0.3, 16, 16],
          position: [
            Math.cos((i * Math.PI * 2) / 5) * sizeValue * 0.5,
            0,
            Math.sin((i * Math.PI * 2) / 5) * sizeValue * 0.5,
          ],
        })),
      },
      cloud: {
        type: 'group',
        children: Array.from({ length: 4 }, (_, i) => ({
          type: 'SphereGeometry',
          params: [
            sizeValue * (0.5 + Math.random() * 0.5),
            16,
            16,
          ],
          position: [
            (i - 1.5) * sizeValue * 0.8,
            Math.random() * sizeValue * 0.5,
            Math.random() * sizeValue * 0.5,
          ],
        })),
      },
      star: {
        type: 'OctahedronGeometry',
        params: [sizeValue * 0.5, 0],
      },
      moon: {
        type: 'SphereGeometry',
        params: [sizeValue * 1.5, 32, 32],
      },
      sun: {
        type: 'SphereGeometry',
        params: [sizeValue * 2, 32, 32],
      },
      building: {
        type: 'BoxGeometry',
        params: [sizeValue * 1.5, sizeValue * 4, sizeValue * 1.5],
      },
      tower: {
        type: 'CylinderGeometry',
        params: [sizeValue * 0.8, sizeValue * 1.2, sizeValue * 5, 8],
      },
      castle: {
        type: 'group',
        children: [
          {
            type: 'BoxGeometry',
            params: [sizeValue * 3, sizeValue * 2, sizeValue * 3],
          },
          ...Array.from({ length: 4 }, (_, i) => ({
            type: 'BoxGeometry',
            params: [sizeValue * 0.8, sizeValue * 3, sizeValue * 0.8],
            position: [
              (i < 2 ? -1 : 1) * sizeValue * 1.8,
              sizeValue * 0.5,
              (i % 2 === 0 ? -1 : 1) * sizeValue * 1.8,
            ],
          })),
        ],
      },
      spaceship: {
        type: 'ConeGeometry',
        params: [sizeValue, sizeValue * 3, 8],
      },
      robot: {
        type: 'group',
        children: [
          {
            type: 'BoxGeometry',
            params: [sizeValue * 1.2, sizeValue * 1.5, sizeValue],
            position: [0, 0, 0],
          },
          {
            type: 'SphereGeometry',
            params: [sizeValue * 0.6, 16, 16],
            position: [0, sizeValue * 1.2, 0],
          },
        ],
      },
      ufo: {
        type: 'group',
        children: [
          {
            type: 'CylinderGeometry',
            params: [sizeValue * 1.5, sizeValue * 1.2, sizeValue * 0.3, 16],
          },
          {
            type: 'SphereGeometry',
            params: [sizeValue * 0.7, 16, 16],
            position: [0, sizeValue * 0.3, 0],
          },
        ],
      },
      sphere: {
        type: 'SphereGeometry',
        params: [sizeValue, 32, 32],
      },
      cube: {
        type: 'BoxGeometry',
        params: [sizeValue * 1.5, sizeValue * 1.5, sizeValue * 1.5],
      },
      torus: {
        type: 'TorusGeometry',
        params: [sizeValue, sizeValue * 0.4, 16, 100],
      },
      pyramid: {
        type: 'ConeGeometry',
        params: [sizeValue * 1.5, sizeValue * 3, 4],
      },
    };

    return geometryConfigs[type] || geometryConfigs.sphere;
  }

  /**
   * 创建材质
   */
  createMaterial(type, colors, materials) {
    const primaryColor = this.getColorFromList(colors);
    
    const materialConfigs = {
      metal: {
        type: 'MeshStandardMaterial',
        color: primaryColor,
        metalness: 0.9,
        roughness: 0.1,
        emissive: primaryColor,
        emissiveIntensity: 0.2,
      },
      glass: {
        type: 'MeshPhysicalMaterial',
        color: primaryColor,
        metalness: 0,
        roughness: 0,
        transmission: 0.9,
        thickness: 1.5,
        ior: 1.5,
        transparent: true,
        opacity: 0.6,
      },
      crystal: {
        type: 'MeshPhysicalMaterial',
        color: primaryColor,
        metalness: 0,
        roughness: 0,
        transmission: 0.8,
        thickness: 2,
        ior: 2.4,
        iridescence: 1,
        transparent: true,
        opacity: 0.7,
      },
      neon: {
        type: 'MeshBasicMaterial',
        color: primaryColor,
        transparent: true,
        opacity: 0.9,
      },
      wood: {
        type: 'MeshStandardMaterial',
        color: '#8B4513',
        metalness: 0,
        roughness: 0.8,
      },
      ice: {
        type: 'MeshPhysicalMaterial',
        color: '#ADD8E6',
        metalness: 0,
        roughness: 0.1,
        transmission: 0.9,
        thickness: 1,
        transparent: true,
        opacity: 0.8,
      },
      fire: {
        type: 'MeshStandardMaterial',
        color: '#ff4500',
        emissive: '#ff4500',
        emissiveIntensity: 2,
      },
      hologram: {
        type: 'MeshBasicMaterial',
        color: primaryColor,
        transparent: true,
        opacity: 0.4,
        wireframe: true,
      },
    };

    // 根据材质关键词选择材质
    if (materials.includes('metal')) return materialConfigs.metal;
    if (materials.includes('glass')) return materialConfigs.glass;
    if (materials.includes('crystal')) return materialConfigs.crystal;
    if (materials.includes('neon')) return materialConfigs.neon;
    if (materials.includes('wood')) return materialConfigs.wood;
    if (materials.includes('ice')) return materialConfigs.ice;
    if (materials.includes('fire')) return materialConfigs.fire;
    if (materials.includes('hologram')) return materialConfigs.hologram;

    // 根据对象类型选择默认材质
    if (['star', 'sun', 'moon', 'ufo'].includes(type)) {
      return materialConfigs.neon;
    }
    if (['water', 'ice'].includes(type)) {
      return materialConfigs.glass;
    }

    return materialConfigs.metal;
  }

  /**
   * 计算位置
   */
  calculatePosition(index, total, importance) {
    const radius = 3 + importance * 0.5;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const y = 1 - (index / Math.max(total - 1, 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = goldenAngle * index;

    return [
      Math.cos(theta) * radiusAtY * radius,
      y * radius + Math.random() * 2 - 1,
      Math.sin(theta) * radiusAtY * radius,
    ];
  }

  /**
   * 计算缩放
   */
  calculateScale(type, size, importance) {
    const baseScale = {
      tiny: 0.3,
      small: 0.6,
      medium: 1,
      large: 1.8,
    };

    const scale = baseScale[size] || 1;
    const importanceMultiplier = 0.5 + (importance / 10) * 1.5;

    return [scale * importanceMultiplier, scale * importanceMultiplier, scale * importanceMultiplier];
  }

  /**
   * 创建动画
   */
  createAnimation(type, motions, importance) {
    const animations = [];

    if (motions.includes('rotate') || importance > 7) {
      animations.push({
        type: 'rotation',
        speed: 0.005 + Math.random() * 0.01,
        axis: ['y', 'x', 'z'][Math.floor(Math.random() * 3)],
      });
    }

    if (motions.includes('float') || motions.includes('rise')) {
      animations.push({
        type: 'float',
        amplitude: 0.5 + Math.random() * 0.5,
        speed: 0.5 + Math.random() * 0.5,
        offset: Math.random() * Math.PI * 2,
      });
    }

    if (motions.includes('twinkle') || ['star', 'sun'].includes(type)) {
      animations.push({
        type: 'scale',
        min: 0.8,
        max: 1.2,
        speed: 2 + Math.random() * 2,
      });
    }

    if (motions.includes('pulse')) {
      animations.push({
        type: 'scale',
        min: 0.9,
        max: 1.1,
        speed: 1 + Math.random(),
      });
    }

    // 默认动画
    if (animations.length === 0) {
      animations.push({
        type: 'float',
        amplitude: 0.3,
        speed: 0.3,
        offset: Math.random() * Math.PI * 2,
      });
    }

    return animations;
  }

  /**
   * 创建环境元素
   */
  createEnvironmentElements(mood, style, colors) {
    const elements = [];

    // 添加基础几何体装饰
    const decorCount = 5 + Math.floor(Math.random() * 5);
    for (let i = 0; i < decorCount; i++) {
      elements.push({
        id: generateId(),
        type: 'decor',
        objectType: ['sphere', 'cube', 'octahedron', 'torus'][Math.floor(Math.random() * 4)],
        geometry: {
          type: ['SphereGeometry', 'BoxGeometry', 'OctahedronGeometry', 'TorusGeometry'][
            Math.floor(Math.random() * 4)
          ],
          params: [0.2 + Math.random() * 0.4, 16, 16],
        },
        material: {
          type: 'MeshBasicMaterial',
          color: this.getColorFromList(colors),
          transparent: true,
          opacity: 0.6,
        },
        position: [
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 20,
        ],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        animation: [
          {
            type: 'float',
            amplitude: 0.5 + Math.random() * 0.5,
            speed: 0.2 + Math.random() * 0.3,
            offset: Math.random() * Math.PI * 2,
          },
        ],
      });
    }

    return elements;
  }

  /**
   * 创建额外的辅助元素
   */
  createAdditionalElements(colors, materials, motions) {
    const elements = [];
    const count = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < count; i++) {
      elements.push({
        id: generateId(),
        type: 'supplementary',
        objectType: 'geometric',
        geometry: {
          type: ['TorusKnotGeometry', 'IcosahedronGeometry', 'DodecahedronGeometry'][
            Math.floor(Math.random() * 3)
          ],
          params: [0.5, 0.15, 100, 16],
        },
        material: this.createMaterial('sphere', colors, materials),
        position: [
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 15,
        ],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        animation: this.createAnimation('sphere', motions, 5),
      });
    }

    return elements;
  }

  /**
   * 获取尺寸值
   */
  getSizeValue(size) {
    const sizeMap = {
      tiny: 0.3,
      small: 0.6,
      medium: 1,
      large: 1.5,
    };
    return sizeMap[size] || 1;
  }

  /**
   * 从颜色列表获取颜色
   */
  getColorFromList(colors) {
    if (!colors || colors.length === 0) {
      return this.colorMap.cyan;
    }
    return this.colorMap[colors[0]] || this.colorMap.cyan;
  }

  /**
   * 获取粒子配置
   */
  getParticleConfig(mood, colors) {
    const particleConfigs = {
      mysterious: {
        type: 'dust',
        count: 800,
        size: 0.03,
        color: this.getColorFromList(colors),
        speed: 0.1,
      },
      peaceful: {
        type: 'fireflies',
        count: 100,
        size: 0.1,
        color: this.getColorFromList(colors),
        speed: 0.2,
      },
      energetic: {
        type: 'magic',
        count: 500,
        size: 0.12,
        color: this.getColorFromList(colors),
        speed: 0.5,
      },
      dark: {
        type: 'embers',
        count: 300,
        size: 0.08,
        color: '#ff4500',
        speed: 0.3,
      },
      ethereal: {
        type: 'stars',
        count: 1000,
        size: 0.05,
        color: '#ffffff',
        speed: 0.05,
      },
      cyberpunk: {
        type: 'digital',
        count: 600,
        size: 0.06,
        color: this.getColorFromList(colors),
        speed: 0.4,
      },
      fantasy: {
        type: 'magic',
        count: 500,
        size: 0.12,
        color: this.getColorFromList(colors),
        speed: 0.4,
      },
    };

    return particleConfigs[mood] || particleConfigs.ethereal;
  }
}

export default ElementFactory;
