import * as THREE from 'three';
import { SceneManager } from './scene.js';
import { Train } from './train.js';
import { Character3D } from './character.js';
import { SpeechRecognizer } from './speech.js';
import { UI } from './ui.js';

export class GameManager {
  constructor() {
    this.characters = [];
    this.currentIndex = 0;
    this.sceneManager = null;
    this.playerTrain = null;
    this.aiTrains = [];
    this.currentCharacter = null;
    this.speechRecognizer = null;
    this.ui = null;
    this.isPlaying = false;
    this.isListeningActive = false;
    this.isDriving = false;
    this.driveStartTime = 0;
    this.driveDuration = 10000;
    this.clock = new THREE.Clock();
    this.lastSpeedDecrease = 0;
    this.speedDecreaseInterval = 5000;
    this.trackOffsets = [-4, 0, 4]; // 三条轨道的X偏移
    
    this.sceneEmojis = {
      mountain: '⛰️',
      river: '🌊',
      sun: '☀️',
      moon: '🌙',
      flower: '🌸',
      tree: '🌳',
      bird: '🐦',
      fish: '🐟'
    };

    this.init();
  }

  async init() {
    await this.loadCharacters();
    this.setupUI();
    this.setupCast();
  }

  async loadCharacters() {
    try {
      const response = await fetch('data/characters.json');
      const data = await response.json();
      this.characters = data.characters;
    } catch (error) {
      console.error('加载汉字数据失败:', error);
      this.characters = [
        { id: 1, char: '山', pinyin: 'shān', scene: 'mountain', description: '高大的山峰', color: 0x4CAF50 },
        { id: 2, char: '水', pinyin: 'shuǐ', scene: 'river', description: '清澈的流水', color: 0x2196F3 },
        { id: 3, char: '日', pinyin: 'rì', scene: 'sun', description: '温暖的太阳', color: 0xFF9800 },
        { id: 4, char: '月', pinyin: 'yuè', scene: 'moon', description: '明亮的月亮', color: 0x9C27B0 },
        { id: 5, char: '花', pinyin: 'huā', scene: 'flower', description: '美丽的花朵', color: 0xE91E63 },
        { id: 6, char: '树', pinyin: 'shù', scene: 'tree', description: '高大的树木', color: 0x8BC34A },
        { id: 7, char: '鸟', pinyin: 'niǎo', scene: 'bird', description: '可爱的小鸟', color: 0x00BCD4 },
        { id: 8, char: '鱼', pinyin: 'yú', scene: 'fish', description: '快乐的小鱼', color: 0x03A9F4 }
      ];
    }
  }

  setupUI() {
    this.ui = new UI();
    
    this.ui.on('onStart', () => this.startGame());
    this.ui.on('onHome', () => this.goHome());
    this.ui.on('onContinue', () => this.nextCharacter());
    this.ui.on('onCast', () => this.toggleCast());
    this.ui.on('onViewToggle', () => this.toggleView());
    this.ui.on('onManualSubmit', (value) => this.handleManualInput(value));
  }

  setupCast() {
    if ('presentation' in navigator) {
      navigator.presentation.defaultRequest = new PresentationRequest(window.location.href);
      navigator.presentation.defaultRequest.addEventListener('connectionavailable', (event) => {
        this.presentationConnection = event.connection;
      });
    }
  }

  async toggleCast() {
    try {
      if ('presentation' in navigator) {
        const request = new PresentationRequest(window.location.href);
        const connection = await request.start();
        this.presentationRequest = connection;
      } else {
        alert('您的浏览器不支持投屏功能');
      }
    } catch (error) {
      console.error('投屏失败:', error);
    }
  }

  toggleView() {
    if (this.sceneManager) {
      this.sceneManager.toggleView();
    }
  }

  startGame() {
    this.currentIndex = 0;
    this.isPlaying = true;
    
    this.sceneManager = new SceneManager('game-canvas');
    
    // 玩家火车在中间轨道
    this.playerTrain = new Train(0xCC3300, true);
    this.playerTrain.getObject().position.x = this.trackOffsets[1];
    this.sceneManager.addObject(this.playerTrain.getObject());
    
    // AI火车1在左边轨道
    const aiTrain1 = new Train(0x2196F3, false);
    aiTrain1.getObject().position.x = this.trackOffsets[0];
    aiTrain1.currentSpeed = 40 + Math.random() * 10;
    aiTrain1.positionZ = -30; // 稍微落后一点
    this.sceneManager.addObject(aiTrain1.getObject());
    
    // AI火车2在右边轨道
    const aiTrain2 = new Train(0x4CAF50, false);
    aiTrain2.getObject().position.x = this.trackOffsets[2];
    aiTrain2.currentSpeed = 40 + Math.random() * 10;
    aiTrain2.positionZ = -15; // 稍微领先一点
    this.sceneManager.addObject(aiTrain2.getObject());
    
    this.aiTrains = [aiTrain1, aiTrain2];
    
    this.speechRecognizer = new SpeechRecognizer();
    
    this.sceneManager.startAnimation(() => {
      const delta = this.clock.getDelta();
      const now = Date.now();
      
      if (this.playerTrain) {
        this.playerTrain.update(delta);
        
        if (this.isDriving) {
          this.checkDriveComplete();
          
          // 更新玩家火车位置（基于速度）
          const moveFactor = this.playerTrain.currentSpeed / 40;
          this.playerTrain.positionZ += delta * 5 * moveFactor;
          
          if (now - this.lastSpeedDecrease > this.speedDecreaseInterval) {
            this.playerTrain.decreaseSpeed(5);
            this.lastSpeedDecrease = now;
          }
        } else {
          this.playerTrain.decreaseSpeed(delta * 2);
        }
      }
      
      // 更新AI火车
      this.aiTrains.forEach((aiTrain, index) => {
        aiTrain.update(delta);
        
        // AI火车随机变化速度
        if (Math.random() < 0.02) {
          aiTrain.currentSpeed = 40 + Math.random() * 10;
        }
        
        // 更新AI火车位置
        const moveFactor = aiTrain.currentSpeed / 40;
        aiTrain.positionZ += delta * 5 * moveFactor;
      });
      
      this.updateRaceUI();
    });
    
    this.ui.showPage('game');
    this.showCurrentCharacter();
  }

  updateRaceUI() {
    const positions = [];
    
    positions.push({
      name: '玩家',
      speed: Math.round(this.playerTrain.currentSpeed),
      z: this.playerTrain.positionZ,
      isPlayer: true,
      color: '#CC3300'
    });
    
    this.aiTrains.forEach((ai, index) => {
      positions.push({
        name: `AI${index + 1}`,
        speed: Math.round(ai.currentSpeed),
        z: ai.positionZ,
        isPlayer: false,
        color: index === 0 ? '#2196F3' : '#4CAF50'
      });
    });
    
    positions.sort((a, b) => b.z - a.z);
    
    this.ui.updateRaceUI(positions);
  }

  async showCurrentCharacter() {
    if (this.currentIndex >= this.characters.length) {
      this.gameComplete();
      return;
    }

    const charData = this.characters[this.currentIndex];
    
    this.ui.clearFireworks();
    this.ui.updateCharacter(charData.char, charData.pinyin);
    this.ui.updateProgress(this.currentIndex, this.characters.length);
    this.ui.updateHintText(`大声说出这个字或在下方输入！速度: ${Math.round(this.playerTrain.currentSpeed)}`);
    this.ui.clearManualInput();
    this.ui.showQuestionUI();
    this.ui.showInputArea();
    
    if (this.currentCharacter) {
      this.sceneManager.removeObject(this.currentCharacter.getObject());
    }
    
    this.sceneManager.setTheme(charData.scene);
    
    this.currentCharacter = new Character3D(charData.char, charData.color);
    this.sceneManager.addObject(this.currentCharacter.getObject());
    
    await this.currentCharacter.show();
    
    this.startAutoListening();
  }

  async startAutoListening() {
    if (!this.speechRecognizer.isSupported()) {
      this.ui.updateHintText(`请使用键盘输入汉字！速度: ${Math.round(this.playerTrain.currentSpeed)}`);
      this.ui.focusManualInput();
      return;
    }

    this.isListeningActive = true;
    this.keepListening();
  }

  async keepListening() {
    if (!this.isListeningActive || !this.isPlaying) return;

    try {
      const charData = this.characters[this.currentIndex];
      const result = await this.speechRecognizer.startListening(charData.char);
      
      if (result.isMatch) {
        this.isListeningActive = false;
        await this.handleCorrect();
      } else {
        setTimeout(() => this.keepListening(), 300);
      }
    } catch (error) {
      console.error('语音识别错误:', error);
      if (this.isListeningActive) {
        setTimeout(() => this.keepListening(), 800);
      }
    }
  }

  async handleManualInput(value) {
    const charData = this.characters[this.currentIndex];
    if (value === charData.char) {
      this.isListeningActive = false;
      await this.handleCorrect();
    } else {
      this.handleIncorrect();
    }
  }

  async handleCorrect() {
    await this.currentCharacter.celebrate();
    this.ui.showFireworks();
    
    await this.currentCharacter.hide();
    this.sceneManager.removeObject(this.currentCharacter.getObject());
    
    this.playerTrain.increaseSpeed(15);
    
    this.startDriving();
  }

  startDriving() {
    this.isDriving = true;
    this.driveStartTime = Date.now();
    this.sceneManager.startMoving();
    this.lastSpeedDecrease = Date.now();
    this.ui.updateHintText(`火车正在行驶中！速度: ${Math.round(this.playerTrain.currentSpeed)}`);
    
    this.ui.hideQuestionUI();
    this.ui.hideInputArea();
  }

  checkDriveComplete() {
    const elapsed = Date.now() - this.driveStartTime;
    if (elapsed >= this.driveDuration) {
      this.stopDriving();
      this.nextCharacter();
    } else {
      const remaining = Math.ceil((this.driveDuration - elapsed) / 1000);
      this.ui.updateHintText(`火车正在行驶中... ${remaining}秒 | 速度: ${Math.round(this.playerTrain.currentSpeed)}`);
    }
  }

  stopDriving() {
    this.isDriving = false;
    this.sceneManager.stopMoving();
  }

  handleIncorrect() {
    this.ui.updateHintText(`再试一次！速度: ${Math.round(this.playerTrain.currentSpeed)}`);
  }

  nextCharacter() {
    this.currentIndex++;
    this.playerTrain.reset();
    this.playerTrain.positionZ = 0;
    this.ui.clearFireworks();
    this.ui.showPage('game');
    this.showCurrentCharacter();
  }

  goHome() {
    this.isPlaying = false;
    this.isListeningActive = false;
    this.isDriving = false;
    
    if (this.sceneManager) {
      this.sceneManager.stopMoving();
      this.sceneManager.stopAnimation();
      this.sceneManager.clear();
    }
    
    this.currentIndex = 0;
    this.ui.showPage('home');
  }

  gameComplete() {
    const positions = [];
    positions.push({ name: '玩家', z: this.playerTrain.positionZ });
    this.aiTrains.forEach((ai, index) => {
      positions.push({ name: `AI${index + 1}`, z: ai.positionZ });
    });
    positions.sort((a, b) => b.z - a.z);
    
    let resultText = '比赛结束！\n\n排名：\n';
    positions.forEach((pos, index) => {
      resultText += `${index + 1}. ${pos.name}\n`;
    });
    
    alert(resultText);
    this.goHome();
  }
}
