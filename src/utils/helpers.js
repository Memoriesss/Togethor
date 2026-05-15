/**
 * 生成唯一ID
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 防抖函数
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 节流函数
 */
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 随机数生成
 */
export function random(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * 随机整数生成
 */
export function randomInt(min, max) {
  return Math.floor(random(min, max + 1));
}

/**
 * 随机选择数组元素
 */
export function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * 颜色转换：hex to rgb
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * 颜色转换：rgb to hex
 */
export function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * 平滑插值
 */
export function lerp(start, end, t) {
  return start + (end - start) * t;
}

/**
 * 角度转弧度
 */
export function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * 弧度转角度
 */
export function radToDeg(radians) {
  return radians * (180 / Math.PI);
}

/**
 * 格式化日期
 */
export function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * 深拷贝
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (obj instanceof Object) {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

/**
 * 检查 WebGL 支持
 */
export function checkWebGLSupport() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    return {
      supported: !!gl,
      version: gl ? (gl instanceof WebGL2RenderingContext ? 2 : 1) : 0
    };
  } catch (e) {
    return { supported: false, version: 0 };
  }
}

/**
 * 获取浏览器信息
 */
export function getBrowserInfo() {
  const ua = navigator.userAgent;
  const isChrome = /Chrome/.test(ua) && /Google Inc/.test(navigator.vendor);
  const isFirefox = /Firefox/.test(ua);
  const isSafari = /Safari/.test(ua) && /Apple Computer/.test(navigator.vendor);
  const isEdge = /Edg/.test(ua);
  
  return {
    isChrome,
    isFirefox,
    isSafari,
    isEdge,
    isMobile: /Mobile|Android|iPhone|iPad/.test(ua),
    userAgent: ua
  };
}

/**
 * 性能监控
 */
export class PerformanceMonitor {
  constructor() {
    this.frames = [];
    this.lastTime = performance.now();
    this.fps = 60;
  }
  
  update() {
    const currentTime = performance.now();
    const delta = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    this.frames.push(1000 / delta);
    if (this.frames.length > 60) {
      this.frames.shift();
    }
    
    this.fps = Math.round(
      this.frames.reduce((a, b) => a + b, 0) / this.frames.length
    );
    
    return this.fps;
  }
  
  getFPS() {
    return this.fps;
  }
}

/**
 * 下载文件
 */
export function downloadFile(content, filename, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 复制到剪贴板
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}
