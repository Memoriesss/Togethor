class GameManager {
  constructor() {
    this.characters = [];
    this.currentIndex = 0;
    this.sceneManager = null;
    this.train = null;
    this.currentCharacter = null;
    this.speechRecognizer = null;
    this.ui = null;
    this.isPlaying = false;
    this.presentationRequest = null;
    
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
      if (this.train) this.train.update();
      if (this.currentCharacter) this.currentCharacter.update();
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
    this.ui.updateHintText('正在听你说...');
    this.ui.clearManualInput();
    
    if (this.currentCharacter) {
      this.sceneManager.removeObject(this.currentCharacter.getObject());
    }
    
    this.currentCharacter = new Character3D(charData.char, charData.color);
    this.sceneManager.addObject(this.currentCharacter.getObject());
    
    await this.currentCharacter.show();
    
    // 自动开始语音识别
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
        // 继续监听
        setTimeout(() => this.keepListening(), 500);
      }
    } catch (error) {
      console.error('语音识别错误:', error);
      // 出错后继续尝试
      if (this.isListeningActive) {
        setTimeout(() => this.keepListening(), 1000);
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
    
    await this.train.moveForward(10, 1500);
    
    this.showScenePage();
  }

  handleIncorrect() {
    alert('再试一次吧！');
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
    
    if (this.sceneManager) {
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

window.GameManager = GameManager;
