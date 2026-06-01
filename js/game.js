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
    this.trackOffsets = [-6, 0, 6];
    this.finishLineDistance = 1000; // 终点线距离
    this.finished = []; // 已到达终点的火车
    this.gameOver = false;
    
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
    this.finished = [];
    this.gameOver = false;
    
    this.sceneManager = new SceneManager('game-canvas');
    
    // 玩家火车 - 6节车厢
    this.playerTrain = new Train(0xCC3300, true, 6);
    this.playerTrain.getObject().position.x = this.trackOffsets[1];
    this.playerTrain.getObject().position.z = 0;
    this.playerTrain.distance = 0;
    this.playerTrain.isFinished = false;
    this.playerTrain.trackIndex = 1;
    this.sceneManager.addObject(this.playerTrain.getObject());
    
    // AI火车1 - 100节车厢
    const aiTrain1 = new Train(0x2196F3, false, 100);
    aiTrain1.getObject().position.x = this.trackOffsets[0];
    aiTrain1.getObject().position.z = 0;
    aiTrain1.currentSpeed = 42;
    aiTrain1.targetSpeed = 42;
    aiTrain1.distance = 0;
    aiTrain1.speedChangeTimer = 0;
    aiTrain1.isFinished = false;
    aiTrain1.trackIndex = 0;
    this.sceneManager.addObject(aiTrain1.getObject());
    
    // AI火车2 - 100节车厢
    const aiTrain2 = new Train(0x4CAF50, false, 100);
    aiTrain2.getObject().position.x = this.trackOffsets[2];
    aiTrain2.getObject().position.z = 0;
    aiTrain2.currentSpeed = 48;
    aiTrain2.targetSpeed = 48;
    aiTrain2.distance = 0;
    aiTrain2.speedChangeTimer = 0;
    aiTrain2.isFinished = false;
    aiTrain2.trackIndex = 2;
    this.sceneManager.addObject(aiTrain2.getObject());
    
    this.aiTrains = [aiTrain1, aiTrain2];
    
    // 创建终点线视觉效果
    this.sceneManager.createFinishLine(this.finishLineDistance);
    
    this.speechRecognizer = new SpeechRecognizer();
    
    this.sceneManager.startAnimation(() => {
      const delta = this.clock.getDelta();
      const now = Date.now();
      
      // 如果游戏已结束，只更新场景显示
      if (this.gameOver) {
        this.sceneManager.updateSceneObjects(0);
        this.sceneManager.updateCameraPosition();
        return;
      }
      
      const allTrains = [this.playerTrain, ...this.aiTrains];
      // 只计算未完成比赛的火车的平均速度
      const activeTrains = allTrains.filter(t => !t.isFinished);
      const averageSpeed = activeTrains.length > 0 
        ? activeTrains.reduce((sum, t) => sum + t.currentSpeed, 0) / activeTrains.length 
        : 0;
      
      const moveDistance = this.isDriving ? (averageSpeed / 40 * 0.8 * 60 * 1/60) : 0;
      
      if (this.isDriving && !this.gameOver) {
        this.sceneManager.totalDistance += moveDistance;
      }
      
      this.sceneManager.updateSceneObjects(moveDistance);
      this.sceneManager.updateCameraPosition();
      
      if (this.playerTrain && !this.playerTrain.isFinished) {
        this.playerTrain.update(delta);
        
        const playerTrackPos = this.sceneManager.getTrackPosition(this.sceneManager.totalDistance, 1);
        this.playerTrain.getObject().position.x = playerTrackPos.x;
        this.playerTrain.getObject().position.y = playerTrackPos.y;
        this.playerTrain.getObject().position.z = 5;
        this.playerTrain.setRotation(playerTrackPos.direction);
        
        if (this.isDriving) {
          this.checkDriveComplete();
          
          const relativeSpeed = this.playerTrain.currentSpeed - averageSpeed;
          const relativeMoveFactor = relativeSpeed / 40;
          this.playerTrain.distance += delta * 8 * relativeMoveFactor;
          
          if (now - this.lastSpeedDecrease > this.speedDecreaseInterval) {
            this.playerTrain.decreaseSpeed(5);
            this.lastSpeedDecrease = now;
          }
        } else {
          // 非行驶状态下速度减少，但不低于基础速度30
          if (this.playerTrain.currentSpeed > 30) {
            this.playerTrain.decreaseSpeed(delta * 3);
          }
        }
      }
      
      this.aiTrains.forEach((aiTrain) => {
        if (aiTrain.isFinished) return;
        
        aiTrain.update(delta);
        
        // AI速度每5秒变化一次，保持5秒
        aiTrain.speedChangeTimer += delta;
        
        if (aiTrain.speedChangeTimer > 5) {
          aiTrain.speedChangeTimer = 0;
          // 速度范围40~50
          aiTrain.targetSpeed = 40 + Math.random() * 10;
        }
        
        const speedDiff = aiTrain.targetSpeed - aiTrain.currentSpeed;
        // AI速度平滑调整，每次最多变化2
        if (Math.abs(speedDiff) > 0.5) {
          aiTrain.currentSpeed += Math.sign(speedDiff) * 2 * delta;
        } else {
          aiTrain.currentSpeed = aiTrain.targetSpeed;
        }
        
        const aiTrackPos = this.sceneManager.getTrackPosition(this.sceneManager.totalDistance, aiTrain.trackIndex);
        aiTrain.getObject().position.x = aiTrackPos.x;
        aiTrain.getObject().position.y = aiTrackPos.y;
        aiTrain.getObject().position.z = 5;
        aiTrain.setRotation(aiTrackPos.direction);
        
        const relativeSpeed = aiTrain.currentSpeed - averageSpeed;
        const relativeMoveFactor = relativeSpeed / 40;
        aiTrain.distance += delta * 8 * relativeMoveFactor;
      });
      
      this.updateRaceUI();
      
      // 检测终点线
      this.checkFinishLine();
    });
    
    this.ui.showPage('game');
    this.startCountdown();
  }
  
  checkFinishLine() {
    if (this.gameOver) return;
    
    const allTrains = [
      { train: this.playerTrain, name: '玩家', isPlayer: true },
      ...this.aiTrains.map((ai, idx) => ({ train: ai, name: `AI${idx + 1}`, isPlayer: false }))
    ];
    
    allTrains.forEach(({ train, name, isPlayer }) => {
      if (!this.finished.find(f => f.name === name) && train.distance >= this.finishLineDistance) {
        this.finished.push({
          name: name,
          isPlayer: isPlayer,
          rank: this.finished.length + 1,
          distance: train.distance
        });
        
        // 到达终点后让火车停止
        train.currentSpeed = 0;
        train.isFinished = true;
      }
    });
    
    // 检查是否所有火车都到达终点
    if (this.finished.length >= 3) {
      this.gameOver = true;
      this.showFinalRanking();
    }
  }

  startCountdown() {
    let count = 3;
    
    // 确保UI显示正确
    this.ui.showCountdown(count);
    
    const countInterval = setInterval(() => {
      count--;
      
      if (count > 0) {
        this.ui.updateCountdown(count);
      } else if (count === 0) {
        this.ui.updateCountdown('GO!');
      } else {
        clearInterval(countInterval);
        this.ui.hideCountdown();
        // 直接开始显示题目
        this.showCurrentCharacter();
      }
    }, 1000);
  }

  updateRaceUI() {
    const positions = [];
    
    positions.push({
      name: '玩家',
      speed: Math.round(this.playerTrain.currentSpeed),
      z: this.playerTrain.distance,
      isPlayer: true,
      color: '#CC3300'
    });
    
    this.aiTrains.forEach((ai, index) => {
      positions.push({
        name: `AI${index + 1}`,
        speed: Math.round(ai.currentSpeed),
        z: ai.distance,
        isPlayer: false,
        color: index === 0 ? '#2196F3' : '#4CAF50'
      });
    });
    
    positions.sort((a, b) => b.z - a.z);
    
    this.ui.updateRaceUI(positions);
    
    // 调试日志，每秒输出一次
    if (!this._lastSpeedLog || Date.now() - this._lastSpeedLog > 1000) {
      this._lastSpeedLog = Date.now();
      console.log('速度状态:', {
        player: Math.round(this.playerTrain.currentSpeed),
        ai1: Math.round(this.aiTrains[0].currentSpeed),
        ai2: Math.round(this.aiTrains[1].currentSpeed),
        isDriving: this.isDriving
      });
    }
  }

  async showCurrentCharacter() {
    if (this.currentIndex >= this.characters.length) {
      this.gameComplete();
      return;
    }

    const charData = this.characters[this.currentIndex];
    
    // 确保UI正确显示
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
    this.ui.updateHintText(`太棒了！速度提升到 ${Math.round(this.playerTrain.currentSpeed)}！`);
    
    this.startDriving();
  }

  startDriving() {
    this.isDriving = true;
    this.driveStartTime = Date.now();
    this.sceneManager.startMoving();
    this.lastSpeedDecrease = Date.now();
    
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
    this.ui.clearFireworks();
    this.ui.showPage('game');
    this.showCurrentCharacter();
  }

  goHome() {
    this.isPlaying = false;
    this.isListeningActive = false;
    this.isDriving = false;
    this.finished = [];
    this.gameOver = false;
    
    if (this.sceneManager) {
      this.sceneManager.stopMoving();
      this.sceneManager.stopAnimation();
      this.sceneManager.clear();
    }
    
    this.currentIndex = 0;
    this.ui.hideFinalResult();
    this.ui.showPage('home');
  }

  gameComplete() {
    const positions = [];
    positions.push({ name: '玩家', z: this.playerTrain.distance });
    this.aiTrains.forEach((ai, index) => {
      positions.push({ name: `AI${index + 1}`, z: ai.distance });
    });
    positions.sort((a, b) => b.z - a.z);
    
    let resultText = '比赛结束！\n\n排名：\n';
    positions.forEach((pos, index) => {
      resultText += `${index + 1}. ${pos.name}\n`;
    });
    
    alert(resultText);
    this.goHome();
  }

  showFinalRanking() {
    this.stopDriving();
    this.isListeningActive = false;
    
    let resultText = '🎉 比赛结束！🎉\n\n最终排名：\n\n';
    this.finished.forEach((f, index) => {
      let medal = '';
      if (index === 0) medal = '🥇 ';
      else if (index === 1) medal = '🥈 ';
      else if (index === 2) medal = '🥉 ';
      
      const playerMarker = f.isPlayer ? ' (你)' : '';
      resultText += `${medal}${f.rank}. ${f.name}${playerMarker}\n`;
    });
    
    this.ui.showFinalResult(resultText);
  }
}
