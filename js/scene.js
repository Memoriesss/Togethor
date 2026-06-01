class SceneManager {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.objects = [];
    this.animationId = null;
    this.trackSegments = [];
    this.currentTheme = 'mountain';
    this.isMoving = false;
    this.speed = 0;
    this.cameraOffset = new THREE.Vector3(0, 2.5, 0);
    
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

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.copy(this.cameraOffset);
    this.camera.lookAt(0, 2, -5);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);

    this.addLights();
    this.createInitialTrack();

    window.addEventListener('resize', () => this.onWindowResize());
  }

  setTheme(theme) {
    this.currentTheme = theme;
    const themeConfig = this.themes[theme] || this.themes.mountain;
    
    this.scene.background = new THREE.Color(themeConfig.sky);
  }

  addLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 30, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);
  }

  createInitialTrack() {
    for (let i = 0; i < 50; i++) {
      this.addTrackSegment(i, false);
    }
    this.addEnvironment();
  }

  addTrackSegment(zIndex, isCurved = false) {
    const themeConfig = this.themes[this.currentTheme] || this.themes.mountain;
    
    const sleeperGeometry = new THREE.BoxGeometry(3, 0.3, 0.6);
    const sleeperMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const sleeper = new THREE.Mesh(sleeperGeometry, sleeperMaterial);
    
    let xOffset = 0;
    if (isCurved) {
      xOffset = Math.sin(zIndex * 0.3) * 2;
    }
    
    sleeper.position.set(xOffset, -0.8, -zIndex * 2.5);
    sleeper.castShadow = true;
    sleeper.receiveShadow = true;
    this.scene.add(sleeper);
    this.trackSegments.push(sleeper);
    this.objects.push(sleeper);

    for (let j = 0; j < 2; j++) {
      const railGeometry = new THREE.BoxGeometry(0.25, 0.25, 2.5);
      const railMaterial = new THREE.MeshStandardMaterial({ color: 0x696969 });
      const rail = new THREE.Mesh(railGeometry, railMaterial);
      rail.position.set(xOffset + (j === 0 ? -0.8 : 0.8), -0.5, -zIndex * 2.5);
      rail.castShadow = true;
      rail.receiveShadow = true;
      this.scene.add(rail);
      this.trackSegments.push(rail);
      this.objects.push(rail);
    }
  }

  addEnvironment() {
    const themeConfig = this.themes[this.currentTheme] || this.themes.mountain;
    
    const groundGeometry = new THREE.PlaneGeometry(200, 500);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: themeConfig.ground,
      side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.1;
    ground.position.z = -100;
    ground.receiveShadow = true;
    this.scene.add(ground);
    this.objects.push(ground);

    for (let i = 0; i < 30; i++) {
      this.addDecoration(i);
    }
  }

  addDecoration(index) {
    const themeConfig = this.themes[this.currentTheme] || this.themes.mountain;
    const z = -index * 15 - 10;
    const side = Math.random() > 0.5 ? 1 : -1;
    const x = side * (8 + Math.random() * 10);

    const decorationType = Math.floor(Math.random() * 4);
    
    let decoration;
    
    switch(decorationType) {
      case 0:
        const treeGroup = this.createTree(themeConfig.accent);
        treeGroup.position.set(x, 0, z);
        decoration = treeGroup;
        break;
      case 1:
        const rockGeometry = new THREE.DodecahedronGeometry(0.8 + Math.random() * 0.5);
        const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x696969 });
        decoration = new THREE.Mesh(rockGeometry, rockMaterial);
        decoration.position.set(x, -0.5, z);
        break;
      case 2:
        const bushGeometry = new THREE.IcosahedronGeometry(0.6, 1);
        const bushMaterial = new THREE.MeshStandardMaterial({ color: 0x32CD32 });
        decoration = new THREE.Mesh(bushGeometry, bushMaterial);
        decoration.position.set(x, -0.5, z);
        break;
      case 3:
        const flowerGroup = this.createFlower(themeConfig.accent);
        flowerGroup.position.set(x, 0, z);
        decoration = flowerGroup;
        break;
    }

    if (decoration) {
      decoration.castShadow = true;
      decoration.receiveShadow = true;
      this.scene.add(decoration);
      this.objects.push(decoration);
    }
  }

  createTree(color) {
    const group = new THREE.Group();
    
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 0.75;
    group.add(trunk);
    
    const foliageGeometry = new THREE.ConeGeometry(1.2, 2.5, 8);
    const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = 2.5;
    group.add(foliage);
    
    const foliage2Geometry = new THREE.ConeGeometry(0.9, 2, 8);
    const foliage2 = new THREE.Mesh(foliage2Geometry, foliageMaterial);
    foliage2.position.y = 3.8;
    group.add(foliage2);
    
    return group;
  }

  createFlower(color) {
    const group = new THREE.Group();
    
    const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8);
    const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = 0.3;
    group.add(stem);
    
    for (let i = 0; i < 5; i++) {
      const petalGeometry = new THREE.SphereGeometry(0.15, 8, 8);
      const petalMaterial = new THREE.MeshStandardMaterial({ color });
      const petal = new THREE.Mesh(petalGeometry, petalMaterial);
      const angle = (i / 5) * Math.PI * 2;
      petal.position.set(Math.cos(angle) * 0.2, 0.6, Math.sin(angle) * 0.2);
      group.add(petal);
    }
    
    const centerGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const centerMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
    const center = new THREE.Mesh(centerGeometry, centerMaterial);
    center.position.y = 0.6;
    group.add(center);
    
    return group;
  }

  startMoving() {
    this.isMoving = true;
    this.speed = 0.15;
  }

  stopMoving() {
    this.isMoving = false;
    this.speed = 0;
  }

  update() {
    if (!this.isMoving) return;

    this.trackSegments.forEach(segment => {
      segment.position.z += this.speed;
    });

    this.objects.forEach(obj => {
      if (obj.userData && obj.userData.isDecoration) {
        obj.position.z += this.speed;
      } else if (obj.geometry && obj.geometry.type === 'PlaneGeometry') {
        obj.position.z += this.speed * 0.5;
      }
    });

    this.cleanupFarObjects();

    if (this.trackSegments.length > 0) {
      const lastSegment = this.trackSegments[this.trackSegments.length - 1];
      if (lastSegment.position.z > -100) {
        const isCurved = Math.random() > 0.7;
        this.addTrackSegment(Math.floor(-lastSegment.position.z / 2.5) + 1, isCurved);
        
        if (Math.random() > 0.8) {
          this.addDecoration(Math.random() * 100);
        }
      }
    }
  }

  cleanupFarObjects() {
    this.trackSegments = this.trackSegments.filter(segment => {
      if (segment.position.z > 20) {
        this.scene.remove(segment);
        const idx = this.objects.indexOf(segment);
        if (idx > -1) this.objects.splice(idx, 1);
        return false;
      }
      return true;
    });

    this.objects = this.objects.filter(obj => {
      if (obj.userData && obj.userData.isDecoration && obj.position.z > 20) {
        this.scene.remove(obj);
        return false;
      }
      return true;
    });
  }

  addObject(obj) {
    this.scene.add(obj);
    this.objects.push(obj);
  }

  removeObject(obj) {
    this.scene.remove(obj);
    const index = this.objects.indexOf(obj);
    if (index > -1) {
      this.objects.splice(index, 1);
    }
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
    this.objects.forEach(obj => {
      this.scene.remove(obj);
    });
    this.objects = [];
    this.trackSegments = [];
  }
}

window.SceneManager = SceneManager;
