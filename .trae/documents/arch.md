
# 技术架构文档

## 技术选择

| 类别 | 技术 | 版本 | 选型理由 |
|------|------|------|---------|
| 核心框架 | Three.js | ^0.160.0 | 强大的3D渲染库，成熟稳定 |
| 语音识别 | Web Speech API | 原生 | 浏览器内置，无需额外依赖 |
| UI框架 | 原生 HTML/CSS/JS | - | 轻量高效，无需复杂框架 |
| 动画引擎 | GSAP | ^3.12.0 | 高性能动画库，流畅过渡 |
| 音效 | Howler.js | ^2.2.4 | 优秀的音频管理库 |

## 文件结构设计

```
/workspace
├── index.html              # 主页面
├── css/
│   └── style.css           # 样式文件
├── js/
│   ├── main.js             # 入口文件
│   ├── game.js             # 游戏逻辑
│   ├── speech.js           # 语音识别
│   ├── scene.js            # 3D场景管理
│   ├── train.js            # 火车模型
│   ├── character.js        # 文字3D物体
│   └── ui.js               # UI交互
├── assets/
│   ├── sounds/             # 音效文件
│   ├── images/             # 图片资源
│   └── models/             # 3D模型
└── data/
    └── characters.json     # 汉字数据
```

## 数据结构设计

### 汉字数据结构
```json
{
  "characters": [
    {
      "id": 1,
      "char": "山",
      "pinyin": "shān",
      "scene": "mountain",
      "description": "高大的山峰"
    },
    {
      "id": 2,
      "char": "水",
      "pinyin": "shuǐ",
      "scene": "river",
      "description": "清澈的流水"
    }
  ]
}
```

## 功能模块分解与技术实现

### 1. 3D场景模块 (scene.js)
- 使用Three.js创建3D场景
- 包含相机、灯光、地面、轨道等基础元素
- 实现场景切换和过渡动画

### 2. 火车模块 (train.js)
- 创建火车3D模型（使用Three.js几何图形组合）
- 实现火车移动动画
- 处理火车与障碍物的交互

### 3. 文字物体模块 (character.js)
- 使用Three.js TextGeometry创建3D文字
- 添加发光材质和边框效果
- 实现文字物体的出现和消失动画

### 4. 语音识别模块 (speech.js)
- 封装Web Speech API
- 实现语音监听和识别
- 结果匹配和反馈

### 5. 游戏逻辑模块 (game.js)
- 管理游戏状态
- 处理关卡进度
- 协调各模块交互

### 6. UI交互模块 (ui.js)
- 页面切换管理
- 按钮点击处理
- 反馈动画和效果

## 核心API/类/函数

| 模块 | 函数/类 | 功能描述 | 参数 | 返回值 |
|------|--------|---------|------|-------|
| scene.js | SceneManager | 3D场景管理类 | - | - |
| scene.js | init() | 初始化场景 | - | void |
| train.js | Train | 火车类 | - | - |
| train.js | moveForward() | 火车前进 | distance: number | Promise&lt;void&gt; |
| character.js | Character3D | 3D文字类 | char: string | - |
| character.js | show() | 显示文字 | - | Promise&lt;void&gt; |
| speech.js | SpeechRecognition | 语音识别类 | - | - |
| speech.js | startListening() | 开始监听 | target: string | Promise&lt;boolean&gt; |
| game.js | GameManager | 游戏管理类 | - | - |
| game.js | startLevel() | 开始关卡 | level: number | void |
| ui.js | showHomePage() | 显示首页 | - | void |
| ui.js | showGamePage() | 显示游戏页 | - | void |

## 关键技术路径与难点

### 语音识别准确性
- 使用Web Speech API的中文识别
- 提供拼音和汉字双重匹配
- 实现容错处理和重试机制

### 3D性能优化
- 使用简单几何体组合火车和场景
- 合理设置渲染帧率
- 资源预加载和复用

### 电视投屏适配
- 使用Presentation API实现投屏
- 适配大屏幕显示
- 大尺寸交互元素

## 部署与集成

- 纯前端应用，可直接部署到静态服务器
- 支持HTTPS（Web Speech API要求）
- 响应式设计适配各种设备
