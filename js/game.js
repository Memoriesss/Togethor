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
    this.train = null;
    this.currentCharacter = null;
    this.speechRecognizer = null;
    this.ui = null;
    this.isPlaying = false;
    this.isListeningActive = false;
    this.isDriving = false;
    this.driveStartTime = 0;
    this.driveDuration = 10000;
    this.clock = new THREE.Clock();
    
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

  startGame() {
    this.currentIndex = 0;
    this.isPlaying = true;
    
    this.sceneManager = new SceneManager('game-canvas');
    
    this.train = new Train();
    this.sceneManager.addObject(this.train.getObject());
    
    this.speechRecognizer = new SpeechRecognizer();
    
    this.sceneManager.startAnimation(() => {
      const delta = this.clock.getDelta();
      if (this.train && !this.isDriving) {
        this.train.update(delta);
      }
      if (this.isDriving) {
        this.train.update(delta);
        this.checkDriveComplete();
      }
    });
    
    this.ui.showPage('game');
    this.showCurrentCharacter();
  }

  async showCurrentCharacter() {
    if (this.currentIndex >= this.characters.length) {
      this.gameComplete();
      return;
    }

    const charData = this.characters[this.currentIndex];
    
    this.ui.updateCharacter(charData.char, charData.pinyin);
    this.ui.updateProgress(this.currentIndex, this.characters.length);
    this.ui.updateHintText('大声说出这个字或在下方输入！');
    this.ui.clearManualInput();
    this.ui.showQuestionUI();
    
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
      this.ui.updateHintText('请使用键盘输入汉字');
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
    
    this.startDriving();
  }

  startDriving() {
    this.isDriving = true;
    this.driveStartTime = Date.now();
    this.sceneManager.startMoving();
    this.ui.updateHintText('火车正在行驶中...');
    
    setTimeout(() => {
      this.ui.hideQuestionUI();
    }, 100);
  }

  checkDriveComplete() {
    const elapsed = Date.now() - this.driveStartTime;
    if (elapsed >= this.driveDuration) {
      this.stopDriving();
      this.showScenePage();
    } else {
      const remaining = Math.ceil((this.driveDuration - elapsed) / 1000);
      this.ui.updateHintText(`火车正在行驶中... ${remaining}秒`);
    }
  }

  stopDriving() {
    this.isDriving = false;
    this.sceneManager.stopMoving();
  }

  handleIncorrect() {
    this.ui.updateHintText('再试一次！');
  }

  showScenePage() {
    const charData = this.characters[this.currentIndex];
    const emoji = this.sceneEmojis[charData.scene] || '🎯';
    
    this.ui.updateScenePage(charData.char, charData.description, emoji);
    this.ui.showPage('scene');
    this.ui.showFireworks();
  }

  nextCharacter() {
    this.currentIndex++;
    this.train.reset();
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
    alert('恭喜你！完成了所有汉字的学习！🎉');
    this.goHome();
  }
}
