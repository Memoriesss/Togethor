export class UI {
  constructor() {
    this.elements = {
      startBtn: document.getElementById('start-btn'),
      homeBtn: document.getElementById('home-btn'),
      continueBtn: document.getElementById('continue-btn'),
      castBtn: document.getElementById('cast-btn'),
      currentChar: document.getElementById('current-char'),
      currentPinyin: document.getElementById('current-pinyin'),
      sceneChar: document.getElementById('scene-char'),
      sceneDesc: document.getElementById('scene-desc'),
      sceneImage: document.getElementById('scene-image'),
      progressFill: document.getElementById('progress-fill'),
      hintText: document.getElementById('hint-text'),
      manualInput: document.getElementById('manual-input'),
      submitBtn: document.getElementById('submit-btn')
    };

    this.callbacks = {
      onStart: null,
      onHome: null,
      onContinue: null,
      onCast: null,
      onManualSubmit: null
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

    this.elements.continueBtn.addEventListener('click', () => {
      if (this.callbacks.onContinue) this.callbacks.onContinue();
    });

    this.elements.castBtn.addEventListener('click', () => {
      if (this.callbacks.onCast) this.callbacks.onCast();
    });

    this.elements.submitBtn.addEventListener('click', () => {
      this.handleManualSubmit();
    });

    this.elements.manualInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleManualSubmit();
      }
    });

    this.showPage('home');
  }

  on(eventName, callback) {
    this.callbacks[eventName] = callback;
  }

  handleManualSubmit() {
    const value = this.elements.manualInput.value.trim();
    if (value && this.callbacks.onManualSubmit) {
      this.callbacks.onManualSubmit(value);
    }
    this.elements.manualInput.value = '';
  }

  showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });
    document.getElementById(`${pageName}-page`).classList.add('active');
  }

  updateCharacter(char, pinyin) {
    this.elements.currentChar.textContent = char;
    this.elements.currentPinyin.textContent = pinyin;
  }

  updateProgress(current, total) {
    const progress = (current / total) * 100;
    this.elements.progressFill.style.width = `${progress}%`;
  }

  updateScenePage(char, desc, emoji) {
    this.elements.sceneChar.textContent = char;
    this.elements.sceneDesc.textContent = desc;
    this.elements.sceneImage.textContent = emoji;
  }

  updateHintText(text) {
    this.elements.hintText.textContent = text;
  }

  clearManualInput() {
    this.elements.manualInput.value = '';
  }

  focusManualInput() {
    this.elements.manualInput.focus();
  }

  showFireworks() {
    const page = document.querySelector('.page.active');
    for (let i = 0; i < 12; i++) {
      const firework = document.createElement('div');
      firework.className = 'firework';
      firework.textContent = ['🎉', '✨', '🌟', '💫', '⭐'][Math.floor(Math.random() * 5)];
      firework.style.left = `${Math.random() * 100}%`;
      firework.style.top = `${Math.random() * 50 + 50}%`;
      firework.style.animationDelay = `${Math.random() * 0.5}s`;
      page.appendChild(firework);
      
      setTimeout(() => firework.remove(), 1500);
    }
  }
}
