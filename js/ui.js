import { EventEmitter } from './eventemitter.js';

export class UI extends EventEmitter {
  constructor() {
    super();
    this.minimapCanvas = null;
    this.minimapCtx = null;
    this.setupElements();
    this.setupEventListeners();
    this.initMinimap();
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
      
      const label = document.createElement('div');
      label.className = 'minimap-label';
      label.textContent = '🗺️ 小地图';
      label.style.position = 'absolute';
      label.style.top = '5px';
      label.style.left = '50%';
      label.style.transform = 'translateX(-50%)';
      label.style.fontSize = '1rem';
      label.style.fontWeight = 'bold';
      label.style.color = '#20B2AA';
      label.style.pointerEvents = 'none';
      this.minimapCanvas.parentElement.style.position = 'relative';
      this.minimapCanvas.parentElement.appendChild(label);
    }
  }

  updateMinimap(playerDistance, finishLineDistance, aiDistances) {
    if (!this.minimapCtx) return;
    
    const ctx = this.minimapCtx;
    const width = this.minimapCanvas.width;
    const height = this.minimapCanvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    const padding = 15;
    const trackWidth = width - padding * 2;
    const trackHeight = height - padding * 2 - 20;
    
    ctx.fillStyle = '#F5F5F5';
    ctx.fillRect(0, 0, width, height);
    
    const startZ = Math.max(0, playerDistance - 50);
    const endZ = startZ + 100;
    const scale = trackHeight / 100;
    
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 8;
    ctx.beginPath();
    
    const sampleCount = 20;
    for (let i = 0; i <= sampleCount; i++) {
      const z = startZ + (endZ - startZ) * (i / sampleCount);
      const segmentIndex = Math.floor(z / 2) % 500;
      const x = padding + (this.trackCurveData && this.trackCurveData[segmentIndex] 
        ? (this.trackCurveData[segmentIndex].x + 10) / 20 * trackWidth 
        : trackWidth / 2);
      const y = height - padding - 20 - (z - startZ) * scale;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    
    const trackOffsets = [-4, 0, 4];
    trackOffsets.forEach((offset, index) => {
      ctx.strokeStyle = index === 1 ? '#757575' : 'rgba(117, 117, 117, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      for (let i = 0; i <= sampleCount; i++) {
        const z = startZ + (endZ - startZ) * (i / sampleCount);
        const segmentIndex = Math.floor(z / 2) % 500;
        const baseX = this.trackCurveData && this.trackCurveData[segmentIndex] 
          ? (this.trackCurveData[segmentIndex].x + 10) / 20 * trackWidth 
          : trackWidth / 2;
        const x = padding + baseX + offset * 5;
        const y = height - padding - 20 - (z - startZ) * scale;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    });
    
    const playerY = height - padding - 20 - (playerDistance - startZ) * scale;
    const playerX = padding + trackWidth / 2;
    
    this.drawTrainIcon(ctx, playerX, playerY, '#CC3300', true);
    
    aiDistances.forEach((aiDist, index) => {
      const aiY = height - padding - 20 - (aiDist - startZ) * scale;
      const colors = ['#3498DB', '#9B59B6', '#2ECC71'];
      this.drawTrainIcon(ctx, playerX, aiY, colors[index], false);
    });
    
    const finishY = height - padding - 20 - (finishLineDistance - startZ) * scale;
    if (finishY > padding && finishY < height - padding - 20) {
      ctx.strokeStyle = '#FF4500';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(padding, finishY);
      ctx.lineTo(width - padding, finishY);
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = '#FF4500';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🏁', width / 2, finishY - 5);
    }
    
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('↑ ' + Math.floor(startZ) + 'm', padding, height - 5);
    ctx.textAlign = 'right';
    ctx.fillText('↓ ' + Math.floor(endZ) + 'm', width - padding, height - 5);
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
