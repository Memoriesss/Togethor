import { EventEmitter } from './eventemitter.js';

export class UI extends EventEmitter {
  constructor() {
    super();
    this.setupElements();
    this.setupEventListeners();
  }

  setupElements() {
    this.pages = {
      home: document.getElementById('home-page'),
      game: document.getElementById('game-page'),
      scene: document.getElementById('scene-page')
    };

    this.buttons = {
      start: document.getElementById('start-btn'),
      home: document.getElementById('home-btn'),
      continue: document.getElementById('continue-btn'),
      cast: document.getElementById('cast-btn'),
      viewToggle: document.getElementById('view-toggle-btn'),
      submit: document.getElementById('submit-btn')
    };

    this.elements = {
      character: document.getElementById('character-display'),
      pinyin: document.getElementById('pinyin-display'),
      progressBar: document.getElementById('progress-bar'),
      hintText: document.getElementById('hint-text'),
      manualInput: document.getElementById('manual-input'),
      fireworks: document.getElementById('fireworks'),
      questionUI: document.getElementById('question-ui'),
      inputArea: document.querySelector('.input-area'),
      racePanel: document.getElementById('race-panel')
    };
  }

  setupEventListeners() {
    if (this.buttons.start) {
      this.buttons.start.addEventListener('click', () => {
        this.emit('onStart');
      });
    }

    if (this.buttons.home) {
      this.buttons.home.addEventListener('click', () => {
        this.emit('onHome');
      });
    }

    if (this.buttons.continue) {
      this.buttons.continue.addEventListener('click', () => {
        this.emit('onContinue');
      });
    }

    if (this.buttons.cast) {
      this.buttons.cast.addEventListener('click', () => {
        this.emit('onCast');
      });
    }

    if (this.buttons.viewToggle) {
      this.buttons.viewToggle.addEventListener('click', () => {
        this.emit('onViewToggle');
      });
    }

    if (this.buttons.submit) {
      this.buttons.submit.addEventListener('click', () => {
        const value = this.elements.manualInput.value.trim();
        if (value) {
          this.emit('onManualSubmit', value);
          this.elements.manualInput.value = '';
        }
      });
    }

    if (this.elements.manualInput) {
      this.elements.manualInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const value = this.elements.manualInput.value.trim();
          if (value) {
            this.emit('onManualSubmit', value);
            this.elements.manualInput.value = '';
          }
        }
      });
    }
  }

  showPage(pageName) {
    Object.keys(this.pages).forEach(page => {
      if (this.pages[page]) {
        this.pages[page].style.display = page === pageName ? 'block' : 'none';
      }
    });
  }

  updateCharacter(char, pinyin) {
    if (this.elements.character) {
      this.elements.character.textContent = char;
    }
    if (this.elements.pinyin) {
      this.elements.pinyin.textContent = pinyin;
    }
  }

  updateProgress(current, total) {
    if (this.elements.progressBar) {
      const percentage = (current / total) * 100;
      this.elements.progressBar.style.width = `${percentage}%`;
    }
  }

  updateHintText(text) {
    if (this.elements.hintText) {
      this.elements.hintText.textContent = text;
    }
  }

  showQuestionUI() {
    if (this.elements.questionUI) {
      this.elements.questionUI.style.display = 'block';
    }
  }

  hideQuestionUI() {
    if (this.elements.questionUI) {
      this.elements.questionUI.style.display = 'none';
    }
  }

  clearManualInput() {
    if (this.elements.manualInput) {
      this.elements.manualInput.value = '';
    }
  }

  focusManualInput() {
    if (this.elements.manualInput) {
      this.elements.manualInput.focus();
    }
  }

  showFireworks() {
    if (this.elements.fireworks) {
      this.elements.fireworks.innerHTML = '';
      
      for (let i = 0; i < 20; i++) {
        const firework = document.createElement('div');
        firework.className = 'firework';
        firework.style.left = `${Math.random() * 100}%`;
        firework.style.top = `${Math.random() * 100}%`;
        firework.style.animationDelay = `${Math.random() * 0.5}s`;
        firework.style.backgroundColor = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'][Math.floor(Math.random() * 6)];
        this.elements.fireworks.appendChild(firework);
      }
      
      this.elements.fireworks.style.display = 'block';
      
      setTimeout(() => {
        if (this.elements.fireworks) {
          this.elements.fireworks.style.display = 'none';
          this.elements.fireworks.innerHTML = '';
        }
      }, 2000);
    }
  }

  clearFireworks() {
    if (this.elements.fireworks) {
      this.elements.fireworks.style.display = 'none';
      this.elements.fireworks.innerHTML = '';
    }
  }

  updateRaceUI(positions) {
    if (!this.elements.racePanel) return;
    
    this.elements.racePanel.innerHTML = '';
    
    positions.forEach((pos, index) => {
      const raceItem = document.createElement('div');
      raceItem.className = 'race-item';
      if (pos.isPlayer) {
        raceItem.classList.add('player-item');
      }
      
      const rankBadge = document.createElement('span');
      rankBadge.className = 'rank-badge';
      rankBadge.textContent = index + 1;
      
      const nameSpan = document.createElement('span');
      nameSpan.className = 'race-name';
      nameSpan.textContent = pos.name;
      nameSpan.style.color = pos.color;
      
      const speedSpan = document.createElement('span');
      speedSpan.className = 'race-speed';
      speedSpan.textContent = `${pos.speed} km/h`;
      
      raceItem.appendChild(rankBadge);
      raceItem.appendChild(nameSpan);
      raceItem.appendChild(speedSpan);
      
      this.elements.racePanel.appendChild(raceItem);
    });
  }

  showInputArea() {
    if (this.elements.inputArea) {
      this.elements.inputArea.style.display = 'flex';
    }
  }

  hideInputArea() {
    if (this.elements.inputArea) {
      this.elements.inputArea.style.display = 'none';
    }
  }
}
