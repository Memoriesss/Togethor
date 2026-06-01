import * as THREE from 'three';

export class Character3D {
  constructor(char, color) {
    this.char = char;
    this.color = color;
    this.group = new THREE.Group();
    this.isAnimating = false;
    
    this.createCharacter();
  }

  createCharacter() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 512;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = '350px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.fillStyle = this.hexToRgba(this.color, 1);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.char, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const geometry = new THREE.BoxGeometry(3, 3, 0.3);
    const material = new THREE.MeshStandardMaterial({ 
      map: texture,
      roughness: 0.3,
      metalness: 0.2,
      transparent: true
    });
    this.charMesh = new THREE.Mesh(geometry, material);
    this.charMesh.position.set(0, 1.5, -8);
    this.charMesh.castShadow = true;
    this.charMesh.receiveShadow = true;
    this.group.add(this.charMesh);

    const edgeGeometry = new THREE.BoxGeometry(3.1, 3.1, 0.4);
    const edges = new THREE.EdgesGeometry(edgeGeometry);
    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: 0x333333,
      linewidth: 2
    });
    const wireframe = new THREE.LineSegments(edges, lineMaterial);
    wireframe.position.copy(this.charMesh.position);
    this.group.add(wireframe);

    const glowGeometry = new THREE.SphereGeometry(2, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: this.color,
      transparent: true,
      opacity: 0.15
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.set(0, 1.5, -8);
    this.group.add(glow);
    this.glowMesh = glow;
  }

  hexToRgba(hex, alpha) {
    const r = (hex >> 16) & 255;
    const g = (hex >> 8) & 255;
    const b = hex & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  getObject() {
    return this.group;
  }

  async show() {
    this.isAnimating = true;
    this.charMesh.scale.set(0, 0, 0);
    this.glowMesh.scale.set(0, 0, 0);
    
    const duration = 0.6;
    const startTime = performance.now();
    
    return new Promise(resolve => {
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = this.easeOutBack(progress);
        
        this.charMesh.scale.set(eased, eased, eased);
        this.glowMesh.scale.set(eased * 0.8, eased * 0.8, eased * 0.8);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.isAnimating = false;
          resolve();
        }
      };
      requestAnimationFrame(animate);
    });
  }

  async hide() {
    this.isAnimating = true;
    const duration = 0.4;
    const startTime = performance.now();
    
    return new Promise(resolve => {
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - this.easeInBack(progress);
        
        this.charMesh.scale.set(eased, eased, eased);
        this.charMesh.position.y += 0.05;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.isAnimating = false;
          resolve();
        }
      };
      requestAnimationFrame(animate);
    });
  }

  async celebrate() {
    this.isAnimating = true;
    const duration = 0.8;
    const startTime = performance.now();
    
    return new Promise(resolve => {
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        this.charMesh.rotation.y += 0.1;
        this.charMesh.position.y = 1.5 + Math.sin(progress * Math.PI * 4) * 0.3;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.charMesh.rotation.y = 0;
          this.charMesh.position.y = 1.5;
          this.isAnimating = false;
          resolve();
        }
      };
      requestAnimationFrame(animate);
    });
  }

  easeOutBack(x) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  }

  easeInBack(x) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * x * x * x - c1 * x * x;
  }
}
