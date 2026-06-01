import { EventEmitter } from './eventemitter.js';

export class UI extends EventEmitter {
  constructor() {
    super();
    this.minimapCanvas = null;
    this.minimapCtx = null;
    this.setupElements();
    this.setupEventListeners();
    // 不在这里初始化小地图，等游戏开始时再初始化
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
      racePanel: document.getElementById('race-panel'),
      countdownDisplay: document.getElementById('countdown-display'),
      countdownText: document.getElementById('countdown-text'),
      finalResult: document.getElementById('final-result'),
      finalResultText: document.getElementById('final-result-text'),
      backHomeBtn: document.getElementById('back-home-btn')
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
    
    if (this.elements.backHomeBtn) {
      this.elements.backHomeBtn.addEventListener('click', () => {
        this.emit('onHome');
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

  showCountdown(count) {
    if (this.elements.countdownDisplay) {
      if (this.elements.countdownText) {
        this.elements.countdownText.textContent = count;
      }
      this.elements.countdownDisplay.style.display = 'flex';
      this.elements.countdownDisplay.classList.add('countdown-animate');
    }
  }

  updateCountdown(count) {
    if (this.elements.countdownDisplay && this.elements.countdownText) {
      this.elements.countdownText.textContent = count;
      
      this.elements.countdownDisplay.classList.remove('countdown-animate');
      void this.elements.countdownDisplay.offsetWidth;
      this.elements.countdownDisplay.classList.add('countdown-animate');
    }
  }

  hideCountdown() {
    if (this.elements.countdownDisplay) {
      this.elements.countdownDisplay.style.display = 'none';
    }
  }

  showFinalResult(resultText) {
    if (this.elements.finalResult) {
      if (this.elements.finalResultText) {
        this.elements.finalResultText.textContent = resultText;
      }
      this.elements.finalResult.style.display = 'flex';
      
      this.showFireworks();
    }
  }

  hideFinalResult() {
    if (this.elements.finalResult) {
      this.elements.finalResult.style.display = 'none';
    }
  }

  initMinimap() {
    this.minimapCanvas = document.getElementById('minimap');
    if (this.minimapCanvas) {
      this.minimapCanvas.width = 220;
      this.minimapCanvas.height = 280;
      this.minimapCtx = this.minimapCanvas.getContext('2d');
      // 先简单绘制一个背景，确保能看到
      this.minimapCtx.fillStyle = '#F5F5F5';
      this.minimapCtx.fillRect(0, 0, 220, 280);
      this.minimapCtx.fillStyle = '#20B2AA';
      this.minimapCtx.font = 'bold 16px Arial';
      this.minimapCtx.textAlign = 'center';
      this.minimapCtx.fillText('🗺️ 小地图', 110, 30);
    }
  }

  updateMinimap(playerDistance, finishLineDistance, aiDistances) {
    if (!this.minimapCtx) return;
    
    const ctx = this.minimapCtx;
    const width = this.minimapCanvas.width;
    const height = this.minimapCanvas.height;
    
    // 绘制背景
    ctx.fillStyle = '#F5F5F5';
    ctx.fillRect(0, 0, width, height);
    
    // 绘制标题
    ctx.fillStyle = '#20B2AA';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🗺️ 小地图', width / 2, 30);
    
    const padding = 20;
    const trackCenterX = width / 2;
    const mapHeight = height - 60; // 剩余高度用于地图
    const scale = mapHeight / Math.max(finishLineDistance, playerDistance + 100, 500);
    
    // 绘制三条轨道线
    const trackOffsets = [-25, 0, 25];
    trackOffsets.forEach((offset, index) => {
      ctx.strokeStyle = index === 1 ? '#757575' : '#A0A0A0';
      ctx.lineWidth = index === 1 ? 4 : 2;
      ctx.beginPath();
      ctx.moveTo(trackCenterX + offset, height - 30);
      ctx.lineTo(trackCenterX + offset, 40);
      ctx.stroke();
    });
    
    // 绘制终点线
    const finishY = height - 30 - finishLineDistance * scale;
    if (finishY > 40) {
      ctx.strokeStyle = '#FF4500';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(padding, finishY);
      ctx.lineTo(width - padding, finishY);
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = '#FF4500';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🏁 终点', width / 2, finishY - 5);
    }
    
    // 绘制玩家火车
    const playerY = height - 30 - playerDistance * scale;
    if (playerY > 40 && playerY < height - 30) {
      this.drawTrainIcon(ctx, trackCenterX, playerY, '#CC3300', true);
    }
    
    // 绘制AI火车
    const aiColors = ['#2196F3', '#4CAF50'];
    aiDistances.forEach((aiDist, index) => {
      const aiY = height - 30 - aiDist * scale;
      if (aiY > 40 && aiY < height - 30) {
        this.drawTrainIcon(ctx, trackCenterX + trackOffsets[index * 2], aiY, aiColors[index], false);
      }
    });
  }

  drawTrainIcon(ctx, x, y, color, isPlayer) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, isPlayer ? 8 : 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x, y, isPlayer ? 4 : 3, 0, Math.PI * 2);
    ctx.fill();
    
    if (isPlayer) {
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  setTrackCurveData(curveData) {
    this.trackCurveData = curveData;
  }
}
