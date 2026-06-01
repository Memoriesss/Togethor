class UI {
  constructor() {
    this.currentPage = null;
    this.pages = {
      home: document.getElementById('home-page'),
      game: document.getElementById('game-page'),
      scene: document.getElementById('scene-page')
    };
    
    this.elements = {
      startBtn: document.getElementById('start-btn'),
      homeBtn: document.getElementById('home-btn'),
      listenBtn: document.getElementById('listen-btn'),
      continueBtn: document.getElementById('continue-btn'),
      castBtn: document.getElementById('cast-btn'),
      currentChar: document.getElementById('current-char'),
      currentPinyin: document.getElementById('current-pinyin'),
      sceneChar: document.getElementById('scene-char'),
      sceneDesc: document.getElementById('scene-desc'),
      sceneImage: document.getElementById('scene-image'),
      progressFill: document.getElementById('progress-fill')
    };

    this.callbacks = {
      onStart: null,
      onHome: null,
      onListen: null,
      onContinue: null,
      onCast: null
    };

    this.init();
  }

  init() {
    this.elements.startBtn.addEventListener('click', () => {
      if (this.callbacks.onStart) this.callbacks.onStart();
    });

    this.elements.homeBtn.addEventListener('click', () => {
      if (this.callbacks.onHome) this.callbacks.onHome();
    });

    this.elements.listenBtn.addEventListener('click', () => {
      if (this.callbacks.onListen) this.callbacks.onListen();
    });

    this.elements.continueBtn.addEventListener('click', () => {
      if (this.callbacks.onContinue) this.callbacks.onContinue();
    });

    this.elements.castBtn.addEventListener('click', () => {
      if (this.callbacks.onCast) this.callbacks.onCast();
    });

    this.showPage('home');
  }

  showPage(pageName) {
    Object.values(this.pages).forEach(page => {
      page.classList.remove('active');
    });

    if (this.pages[pageName]) {
      this.pages[pageName].classList.add('active');
      this.currentPage = pageName;
    }
  }

  updateCharacter(char, pinyin) {
    this.elements.currentChar.textContent = char;
    this.elements.currentPinyin.textContent = pinyin;
  }

  updateScenePage(char, desc, emoji) {
    this.elements.sceneChar.textContent = char;
    this.elements.sceneDesc.textContent = desc;
    this.elements.sceneImage.textContent = emoji;
  }

  setListeningState(isListening) {
    if (isListening) {
      this.elements.listenBtn.classList.add('listening');
      this.elements.listenBtn.textContent = '🎤';
    } else {
      this.elements.listenBtn.classList.remove('listening');
      this.elements.listenBtn.textContent = '🎤';
    }
  }

  showFireworks() {
    const emojis = ['🎉', '⭐', '🌟', '✨', '🎊', '💫'];
    
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const firework = document.createElement('div');
        firework.className = 'firework';
        firework.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        firework.style.left = Math.random() * 100 + '%';
        firework.style.top = Math.random() * 50 + 50 + '%';
        document.body.appendChild(firework);

        setTimeout(() => {
          firework.remove();
        }, 1500);
      }, i * 100);
    }
  }

  updateProgress(current, total) {
    const percent = (current / total) * 100;
    this.elements.progressFill.style.width = percent + '%';
  }

  on(event, callback) {
    if (this.callbacks.hasOwnProperty(event)) {
      this.callbacks[event] = callback;
    }
  }
}

window.UI = UI;
