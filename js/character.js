class Character3D {
  constructor(char, color = 0xFF6B6B) {
    this.char = char;
    this.color = color;
    this.group = new THREE.Group();
    this.canvas = null;
    this.texture = null;
    
    this.createCharacter();
  }

  createCharacter() {
    const size = 256;
    this.canvas = document.createElement('canvas');
    this.canvas.width = size;
    this.canvas.height = size;
    
    const ctx = this.canvas.getContext('2d');
    
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, size, size);
    
    ctx.font = 'bold 200px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    
    ctx.fillStyle = '#' + this.color.toString(16).padStart(6, '0');
    ctx.fillText(this.char, size / 2, size / 2);
    
    this.texture = new THREE.CanvasTexture(this.canvas);
    
    const geometry = new THREE.BoxGeometry(3, 3, 0.5);
    const material = new THREE.MeshStandardMaterial({
      map: this.texture,
      transparent: true,
      side: THREE.DoubleSide
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    this.group.add(mesh);
    
    const glowGeometry = new THREE.BoxGeometry(3.2, 3.2, 0.1);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: this.color,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.z = -0.3;
    this.group.add(glow);
    
    this.group.position.set(0, 1.5, -5);
  }

  getObject() {
    return this.group;
  }

  show() {
    return new Promise((resolve) => {
      this.group.scale.set(0, 0, 0);
      
      const startTime = Date.now();
      const duration = 500;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        this.group.scale.set(easeProgress, easeProgress, easeProgress);
        this.group.rotation.y = Math.sin(progress * Math.PI) * 0.2;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      animate();
    });
  }

  hide() {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const duration = 300;
      const startScale = this.group.scale.x;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const scale = startScale * (1 - progress);
        this.group.scale.set(scale, scale, scale);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      animate();
    });
  }

  celebrate() {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const duration = 1000;
      const startY = this.group.position.y;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        this.group.position.y = startY + Math.sin(progress * Math.PI * 4) * 0.5;
        this.group.rotation.y += 0.1;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.group.position.y = startY;
          resolve();
        }
      };
      
      animate();
    });
  }

  update() {
    this.group.rotation.y += 0.005;
  }
}

window.Character3D = Character3D;
