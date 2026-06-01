import * as THREE from 'three';

export class SceneManager {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();
    this.animationId = null;
    
    this.trackSegments = [];
    this.decorations = [];
    this.currentTheme = 'mountain';
    this.isMoving = false;
    this.speed = 0.15;
    
    this.themes = {
      mountain: { ground: 0x228B22, sky: 0x87CEEB, accent: 0x8B4513 },
      river: { ground: 0x3CB371, sky: 0x87CEEB, accent: 0x4169E1 },
      sun: { ground: 0xFFD700, sky: 0xFFA500, accent: 0xFF4500 },
      moon: { ground: 0x483D8B, sky: 0x191970, accent: 0xC0C0C0 },
      flower: { ground: 0x98FB98, sky: 0xFFB6C1, accent: 0xFF1493 },
      tree: { ground: 0x228B22, sky: 0x90EE90, accent: 0x006400 },
      bird: { ground: 0x87CEEB, sky: 0xE0F6FF, accent: 0x1E90FF },
      fish: { ground: 0x00CED1, sky: 0x008B8B, accent: 0xFF6347 }
    };
    
    this.init();
  }

  init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB);
    
    const fogColor = 0x87CEEB;
    this.scene.fog = new THREE.Fog(fogColor, 40, 200);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      3000
    );
    this.camera.position.set(0, 5, 6);
    this.camera.lookAt(0, 3, -30);

    this.renderer = new THREE.WebGLRenderer({ 
      canvas: this.container,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.addLights();
    this.createTrack();
    this.addEnvironment();

    window.addEventListener('resize', () => this.onWindowResize());
  }

  addLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(20, 50, 30);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    this.scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0x87CEEB, 0.3);
    fillLight.position.set(-20, 20, -30);
    this.scene.add(fillLight);
  }

  createTrack() {
    for (let i = 0; i < 100; i++) {
      this.addTrackSegment(i);
    }
  }

  addTrackSegment(zIndex) {
    const curved = zIndex > 30 && Math.random() > 0.75;
    const curveOffset = curved ? Math.sin(zIndex * 0.08) * 18 : 0;
    
    const sleeperGeometry = new THREE.BoxGeometry(3, 0.3, 0.6);
    const sleeperMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x5D4E37,
      roughness: 0.8,
      metalness: 0.2
    });
    
    for (let j = 0; j < 4; j++) {
      const sleeper = new THREE.Mesh(sleeperGeometry, sleeperMaterial);
      sleeper.position.set(
        curveOffset + (j - 1.5) * 0.25,
        -0.85,
        -zIndex * 2.2
      );
      sleeper.castShadow = true;
      sleeper.receiveShadow = true;
      this.scene.add(sleeper);
      this.trackSegments.push(sleeper);
    }

    const railGeometry = new THREE.BoxGeometry(0.25, 0.25, 2.2);
    const railMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4A4A4A,
      roughness: 0.3,
      metalness: 0.8
    });

    const railPositions = [-0.8, 0.8];
    railPositions.forEach(offset => {
      const rail = new THREE.Mesh(railGeometry, railMaterial);
      rail.position.set(
        curveOffset + offset,
        -0.65,
        -zIndex * 2.2
      );
      rail.castShadow = true;
      rail.receiveShadow = true;
      this.scene.add(rail);
      this.trackSegments.push(rail);
    });
  }

  addEnvironment() {
    const groundGeometry = new THREE.PlaneGeometry(500, 1500);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x228B22,
      roughness: 0.9,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    ground.position.z = -300;
    ground.receiveShadow = true;
    this.scene.add(ground);

    for (let i = 0; i < 80; i++) {
      this.addDecoration(i);
    }
  }

  addDecoration(index) {
    const z = -index * 15 - 30;
    const side = Math.random() > 0.5 ? 1 : -1;
    const x = side * (8 + Math.random() * 25);

    const themeConfig = this.themes[this.currentTheme];
    const decorationType = Math.floor(Math.random() * 6);
    
    let decoration;
    
    switch(decorationType) {
      case 0:
        decoration = this.createTree(themeConfig.accent);
        break;
      case 1:
        decoration = this.createTallTree(themeConfig.accent);
        break;
      case 2:
        decoration = this.createRock();
        break;
      case 3:
        decoration = this.createBush();
        break;
      case 4:
        decoration = this.createFlower(themeConfig.accent);
        break;
      case 5:
        decoration = this.createHill(themeConfig.accent);
        break;
    }

    if (decoration) {
      decoration.position.set(x, 0, z);
      decoration.castShadow = true;
      decoration.receiveShadow = true;
      decoration.userData = { isDecoration: true };
      this.scene.add(decoration);
      this.decorations.push(decoration);
    }
  }

  createTree(color) {
    const group = new THREE.Group();
    
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x5D4E37,
      roughness: 0.7
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 0.75;
    group.add(trunk);
    
    const foliageGeometry = new THREE.SphereGeometry(1.2, 16, 16);
    const foliageMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x228B22,
      roughness: 0.6
    });
    
    const foliage1 = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage1.position.y = 2.2;
    foliage1.scale.set(1.2, 1.5, 1.2);
    group.add(foliage1);
    
    const foliage2 = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage2.position.y = 3.5;
    foliage2.scale.set(0.9, 1.2, 0.9);
    group.add(foliage2);
    
    return group;
  }

  createTallTree(color) {
    const group = new THREE.Group();
    
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2.5, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4A3728,
      roughness: 0.7
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1.25;
    group.add(trunk);
    
    const foliageGeometry = new THREE.ConeGeometry(1.8, 4, 8);
    const foliageMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1B5E20,
      roughness: 0.6
    });
    
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = 4;
    group.add(foliage);
    
    return group;
  }

  createHill(color) {
    const group = new THREE.Group();
    
    const hillGeometry = new THREE.SphereGeometry(4, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const hillMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4CAF50,
      roughness: 0.8
    });
    const hill = new THREE.Mesh(hillGeometry, hillMaterial);
    hill.scale.y = 0.4;
    hill.position.y = -0.5;
    group.add(hill);
    
    return group;
  }

  createRock() {
    const geometry = new THREE.IcosahedronGeometry(0.7 + Math.random() * 0.5, 1);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x696969,
      roughness: 0.8
    });
    const rock = new THREE.Mesh(geometry, material);
    rock.position.y = -0.4;
    rock.rotation.y = Math.random() * Math.PI * 2;
    return rock;
  }

  createBush() {
    const geometry = new THREE.SphereGeometry(0.6, 12, 12);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x32CD32,
      roughness: 0.7
    });
    const bush = new THREE.Mesh(geometry, material);
    bush.position.y = -0.3;
    return bush;
  }

  createFlower(color) {
    const group = new THREE.Group();
    
    const stemGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 8);
    const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = 0.3;
    group.add(stem);
    
    for (let i = 0; i < 6; i++) {
      const petalGeometry = new THREE.SphereGeometry(0.14, 8, 8);
      const petalMaterial = new THREE.MeshStandardMaterial({ color });
      const petal = new THREE.Mesh(petalGeometry, petalMaterial);
      const angle = (i / 6) * Math.PI * 2;
      petal.position.set(Math.cos(angle) * 0.18, 0.6, Math.sin(angle) * 0.18);
      group.add(petal);
    }
    
    const centerGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const centerMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
    const center = new THREE.Mesh(centerGeometry, centerMaterial);
    center.position.y = 0.6;
    group.add(center);
    
    return group;
  }

  setTheme(theme) {
    this.currentTheme = theme;
    const themeConfig = this.themes[theme] || this.themes.mountain;
    
    this.scene.background = new THREE.Color(themeConfig.sky);
    if (this.scene.fog) {
      this.scene.fog.color.set(themeConfig.sky);
    }
  }

  startMoving() {
    this.isMoving = true;
  }

  stopMoving() {
    this.isMoving = false;
  }

  update() {
    if (!this.isMoving) return;

    const delta = this.clock.getDelta();
    const moveDistance = this.speed * 60 * delta;

    this.trackSegments.forEach(segment => {
      segment.position.z += moveDistance;
    });

    this.decorations.forEach(decoration => {
      decoration.position.z += moveDistance;
      
      if (decoration.position.z > 40) {
        this.scene.remove(decoration);
        const idx = this.decorations.indexOf(decoration);
        if (idx > -1) this.decorations.splice(idx, 1);
        
        this.addDecoration(Math.random() * 100);
      }
    });

    const lastSegment = this.trackSegments[this.trackSegments.length - 1];
    if (lastSegment && lastSegment.position.z > -200) {
      this.addTrackSegment(Math.floor(-lastSegment.position.z / 2.2) + 1);
    }

    this.trackSegments = this.trackSegments.filter(segment => {
      if (segment.position.z > 40) {
        this.scene.remove(segment);
        return false;
      }
      return true;
    });
  }

  addObject(obj) {
    this.scene.add(obj);
  }

  removeObject(obj) {
    this.scene.remove(obj);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  startAnimation(callback) {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      this.update();
      if (callback) callback();
      this.render();
    };
    animate();
  }

  stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  clear() {
    this.trackSegments.forEach(obj => this.scene.remove(obj));
    this.decorations.forEach(obj => this.scene.remove(obj));
    this.trackSegments = [];
    this.decorations = [];
  }
}
