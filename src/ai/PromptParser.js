// 对象类型映射
const OBJECT_TYPES = {
  // 自然元素
  mountain: ['山', '山峰', 'mountain', 'peak'],
  water: ['水', '湖', '海', 'water', 'ocean', 'lake'],
  tree: ['树', '森林', 'tree', 'forest'],
  flower: ['花', '花朵', 'flower', 'blossom'],
  cloud: ['云', '云朵', 'cloud'],
  star: ['星', '星星', 'star'],
  moon: ['月亮', 'moon'],
  sun: ['太阳', 'sun'],
  
  // 建筑
  building: ['建筑', '房子', 'building', 'house'],
  tower: ['塔', 'tower'],
  castle: ['城堡', 'castle'],
  
  // 科技
  spaceship: ['飞船', '太空船', 'spaceship', 'rocket'],
  satellite: ['卫星', 'satellite'],
  robot: ['机器人', 'robot'],
  ufo: ['UFO', '飞碟'],
  
  // 几何
  sphere: ['球', 'sphere'],
  cube: ['立方体', 'cube'],
  torus: ['环', 'torus'],
  pyramid: ['金字塔', 'pyramid'],
  
  // 生物
  animal: ['动物', 'animal'],
  bird: ['鸟', 'bird'],
  fish: ['鱼', 'fish'],
};

// 氛围关键词映射
const MOOD_KEYWORDS = {
  mysterious: ['神秘', '未知', 'mysterious', 'mystery', 'dark', 'shadow'],
  peaceful: ['宁静', '平静', 'peaceful', 'calm', 'serene', '安静'],
  energetic: ['活力', '热情', 'energetic', 'vibrant', 'dynamic'],
  dark: ['黑暗', '恐怖', 'dark', 'scary', 'gloomy'],
  ethereal: ['空灵', '飘渺', 'ethereal', 'dreamy', 'magical', '魔法'],
  cyberpunk: ['赛博', 'cyberpunk', '科技', '未来'],
  fantasy: ['奇幻', 'fantasy', '魔幻', '仙侠'],
};

// 颜色关键词映射
const COLOR_KEYWORDS = {
  red: ['红', '红色', 'red', 'crimson'],
  blue: ['蓝', '蓝色', 'blue', 'azure'],
  green: ['绿', '绿色', 'green', 'emerald'],
  yellow: ['黄', '黄色', 'yellow', 'golden'],
  purple: ['紫', '紫色', 'purple', 'violet', 'violet'],
  pink: ['粉', '粉色', 'pink', 'rose'],
  orange: ['橙', '橙色', 'orange'],
  white: ['白', '白色', 'white', 'silver'],
  black: ['黑', '黑色', 'black', 'dark'],
  cyan: ['青', '青色', 'cyan', 'teal'],
};

// 材质关键词映射
const MATERIAL_KEYWORDS = {
  metal: ['金属', 'metal', '铁', '钢'],
  glass: ['玻璃', 'glass', '透明'],
  crystal: ['水晶', 'crystal', '宝石'],
  neon: ['霓虹', 'neon', '发光'],
  wood: ['木头', 'wood', '木质'],
  ice: ['冰', 'ice', '冰冻'],
  fire: ['火', 'fire', '火焰'],
  hologram: ['全息', 'hologram', '投影'],
};

// 动态效果关键词
const MOTION_KEYWORDS = {
  rotate: ['旋转', '转', 'rotate', 'spin', 'rolling'],
  float: ['漂浮', '浮', 'float', 'hover'],
  twinkle: ['闪烁', 'sparkle', 'twinkle', '闪光'],
  flow: ['流动', '流', 'flow', 'streaming'],
  pulse: ['脉动', '跳动', 'pulse', 'beating'],
  fall: ['下落', 'fall', '飘落'],
  rise: ['上升', 'rise', '升起'],
  spiral: ['螺旋', 'spiral', '旋转上升'],
};

/**
 * 提示词解析器
 * 负责将自然语言提示词转换为结构化的场景配置
 */
class PromptParser {
  constructor() {
    this.objectMap = OBJECT_TYPES;
    this.moodMap = MOOD_KEYWORDS;
    this.colorMap = COLOR_KEYWORDS;
    this.materialMap = MATERIAL_KEYWORDS;
    this.motionMap = MOTION_KEYWORDS;
  }

  /**
   * 解析提示词
   * @param {string} prompt - 用户输入的提示词
   * @returns {Object} 解析后的场景配置
   */
  parse(prompt) {
    const normalizedPrompt = this.normalizeText(prompt);
    const words = this.tokenize(normalizedPrompt);
    
    const result = {
      keywords: words,
      objects: this.extractObjects(words),
      mood: this.detectMood(words),
      style: this.detectStyle(words),
      colors: this.extractColors(words),
      materials: this.extractMaterials(words),
      motions: this.extractMotions(words),
      lighting: this.inferLighting(words),
      atmosphere: this.inferAtmosphere(words),
    };
    
    return result;
  }

  /**
   * 文本归一化
   */
  normalizeText(text) {
    return text.toLowerCase().trim();
  }

  /**
   * 分词处理
   */
  tokenize(text) {
    // 中英文混合分词
    const chineseTokens = this.tokenizeChinese(text);
    const englishTokens = text.split(/[\s,\.;!?，。、；！？""''（）\(\)\[\]]+/).filter(Boolean);
    
    return [...new Set([...chineseTokens, ...englishTokens])];
  }

  /**
   * 中文分词（简单实现）
   */
  tokenizeChinese(text) {
    const tokens = [];
    const chineseKeywords = [
      ...Object.values(this.objectMap).flat(),
      ...Object.values(this.moodMap).flat(),
      ...Object.values(this.colorMap).flat(),
      ...Object.values(this.materialMap).flat(),
      ...Object.values(this.motionMap).flat(),
    ];
    
    for (const keyword of chineseKeywords) {
      if (text.includes(keyword)) {
        tokens.push(keyword);
      }
    }
    
    return tokens;
  }

  /**
   * 提取对象
   */
  extractObjects(words) {
    const objects = [];
    const processedTypes = new Set();
    
    for (const word of words) {
      for (const [type, keywords] of Object.entries(this.objectMap)) {
        if (keywords.includes(word) && !processedTypes.has(type)) {
          objects.push({
            type,
            keyword: word,
            importance: this.calculateImportance(type),
            size: this.inferSize(type),
          });
          processedTypes.add(type);
        }
      }
    }
    
    // 如果没有识别到对象，添加默认对象
    if (objects.length === 0) {
      objects.push({
        type: 'sphere',
        keyword: 'default',
        importance: 1,
        size: 'medium',
      });
    }
    
    return objects;
  }

  /**
   * 检测氛围
   */
  detectMood(words) {
    const moodScores = {};
    
    for (const [mood, keywords] of Object.entries(this.moodMap)) {
      const score = keywords.filter(k => words.includes(k)).length;
      if (score > 0) {
        moodScores[mood] = score;
      }
    }
    
    // 返回得分最高的氛围
    const sortedMoods = Object.entries(moodScores).sort((a, b) => b[1] - a[1]);
    return sortedMoods.length > 0 ? sortedMoods[0][0] : 'ethereal';
  }

  /**
   * 检测风格
   */
  detectStyle(words) {
    if (words.some(w => this.moodMap.cyberpunk.includes(w))) {
      return 'cyberpunk';
    }
    if (words.some(w => this.moodMap.fantasy.includes(w))) {
      return 'fantasy';
    }
    if (words.some(w => this.moodMap.dark.includes(w))) {
      return 'dark';
    }
    return 'cosmic';
  }

  /**
   * 提取颜色
   */
  extractColors(words) {
    const colors = [];
    
    for (const [color, keywords] of Object.entries(this.colorMap)) {
      if (keywords.some(k => words.includes(k))) {
        colors.push(color);
      }
    }
    
    // 如果没有提取到颜色，返回默认颜色
    return colors.length > 0 ? colors : ['cyan', 'purple'];
  }

  /**
   * 提取材质
   */
  extractMaterials(words) {
    const materials = [];
    
    for (const [material, keywords] of Object.entries(this.materialMap)) {
      if (keywords.some(k => words.includes(k))) {
        materials.push(material);
      }
    }
    
    return materials.length > 0 ? materials : ['neon'];
  }

  /**
   * 提取动态效果
   */
  extractMotions(words) {
    const motions = [];
    
    for (const [motion, keywords] of Object.entries(this.motionMap)) {
      if (keywords.some(k => words.includes(k))) {
        motions.push(motion);
      }
    }
    
    return motions.length > 0 ? motions : ['float'];
  }

  /**
   * 推断光照
   */
  inferLighting(words) {
    if (this.detectMood(words) === 'dark') {
      return {
        ambient: { intensity: 0.1, color: '#000022' },
        directional: { intensity: 0.3, color: '#4444ff' },
      };
    }
    if (words.some(w => this.moodMap.ethereal.includes(w))) {
      return {
        ambient: { intensity: 0.3, color: '#8866aa' },
        directional: { intensity: 0.8, color: '#ffffff' },
      };
    }
    return {
      ambient: { intensity: 0.4, color: '#333344' },
      directional: { intensity: 0.7, color: '#ffffff' },
    };
  }

  /**
   * 推断氛围
   */
  inferAtmosphere(words) {
    const mood = this.detectMood(words);
    
    const atmosphereMap = {
      mysterious: { fogColor: '#0a0a1a', fogDensity: 0.015 },
      peaceful: { fogColor: '#1a2a3a', fogDensity: 0.01 },
      energetic: { fogColor: '#2a1a3a', fogDensity: 0.012 },
      dark: { fogColor: '#000000', fogDensity: 0.02 },
      ethereal: { fogColor: '#1a1a3a', fogDensity: 0.008 },
      cyberpunk: { fogColor: '#0a0a2a', fogDensity: 0.018 },
      fantasy: { fogColor: '#2a1a4a', fogDensity: 0.01 },
    };
    
    return atmosphereMap[mood] || atmosphereMap.ethereal;
  }

  /**
   * 计算对象重要性
   */
  calculateImportance(type) {
    const importanceMap = {
      sun: 10,
      moon: 9,
      star: 8,
      mountain: 7,
      building: 6,
      castle: 6,
      tree: 5,
      flower: 4,
      spaceship: 8,
      sphere: 3,
      cube: 3,
      torus: 4,
    };
    
    return importanceMap[type] || 5;
  }

  /**
   * 推断对象大小
   */
  inferSize(type) {
    const sizeMap = {
      sun: 'large',
      moon: 'large',
      mountain: 'large',
      building: 'medium',
      tree: 'medium',
      flower: 'small',
      spaceship: 'medium',
      star: 'tiny',
      sphere: 'medium',
      cube: 'medium',
    };
    
    return sizeMap[type] || 'medium';
  }
}

export default PromptParser;
