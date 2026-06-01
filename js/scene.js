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
    this.animals = [];
    this.currentTheme = 'mountain';
    this.isMoving = false;
    this.speed = 0.15;
    this.viewMode = 'third';
    this.worldOffset = 0;
    
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
    this.setCameraView('third');

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
    this.createAnimals();

    window.addEventListener('resize', () => this.onWindowResize());
  }

  setCameraView(mode) {
    this.viewMode = mode;
    if (mode === 'first') {
      this.camera.position.set(0, 2.4, 0.6);
      this.camera.lookAt(0, 2.4, -20);
    } else {
      this.camera.position.set(0, 5, 6);
      this.camera.lookAt(0, 3, -30);
    }
  }

  toggleView() {
    this.setCameraView(this.viewMode === 'first' ? 'third' : 'first');
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

  addTrackSegment(i) {
    const curved = i > 30 && Math.random() > 0.75;
    const curveOffset = curved ? Math.sin(i * 0.08) * 18 : 0;
    
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
        -i * 2.2
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
        -i * 2.2
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

  addDecoration(i) {
    const z = -i * 15 - 30;
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
      decoration.userData = { isDecoration: true, baseZ: z };
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

  createAnimals() {
    for (let i = 0; i < 20; i++) {
      this.addAnimal(i);
    }
  }

  addAnimal(i) {
    const z = -i * 40 - 100;
    const side = Math.random() > 0.5 ? 1 : -1;
    const x = side * (12 + Math.random() * 20);
    
    const animalTypes = ['bunny', 'chick', 'sheep', 'pig'];
    const type = animalTypes[Math.floor(Math.random() * animalTypes.length)];
    
    let animal;
    switch(type) {
      case 'bunny':
        animal = this.createBunny();
        break;
      case 'chick':
        animal = this.createChick();
        break;
      case 'sheep':
        animal = this.createSheep();
        break;
      case 'pig':
        animal = this.createPig();
        break;
    }
    
    animal.position.set(x, 0, z);
    animal.userData = {
      isAnimal: true,
      baseX: x,
      baseZ: z,
      targetX: x,
      targetZ: z,
      state: 'idle',
      animationTime: Math.random() * Math.PI * 2,
      moveSpeed: 0.02 + Math.random() * 0.02
    };
    animal.castShadow = true;
    animal.receiveShadow = true;
    this.scene.add(animal);
    this.animals.push(animal);
  }

  createBunny() {
    const group = new THREE.Group();
    
    const bodyGeo = new THREE.SphereGeometry(0.4, 16, 16);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.7 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.scale.set(1, 0.9, 1.3);
    body.position.y = 0.4;
    group.add(body);
    
    const headGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const head = new THREE.Mesh(headGeo, bodyMat);
    head.position.set(0, 0.7, 0.5);
    group.add(head);
    
    const earGeo = new THREE.CylinderGeometry(0.06, 0.03, 0.5, 8);
    const leftEar = new THREE.Mesh(earGeo, bodyMat);
    leftEar.position.set(-0.12, 1.1, 0.5);
    leftEar.rotation.z = 0.2;
    group.add(leftEar);
    
    const rightEar = new THREE.Mesh(earGeo, bodyMat);
    rightEar.position.set(0.12, 1.1, 0.5);
    rightEar.rotation.z = -0.2;
    group.add(rightEar);
    
    const eyeGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.12, 0.75, 0.75);
    group.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.12, 0.75, 0.75);
    group.add(rightEye);
    
    return group;
  }

  createChick() {
    const group = new THREE.Group();
    
    const bodyGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, roughness: 0.7 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.3;
    group.add(body);
    
    const headGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const head = new THREE.Mesh(headGeo, bodyMat);
    head.position.set(0, 0.55, 0.25);
    group.add(head);
    
    const beakGeo = new THREE.ConeGeometry(0.06, 0.12, 8);
    const beakMat = new THREE.MeshStandardMaterial({ color: 0xFF8C00 });
    const beak = new THREE.Mesh(beakGeo, beakMat);
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, 0.52, 0.42);
    group.add(beak);
    
    const eyeGeo = new THREE.SphereGeometry(0.03, 8, 8);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.08, 0.58, 0.38);
    group.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.08, 0.58, 0.38);
    group.add(rightEye);
    
    return group;
  }

  createSheep() {
    const group = new THREE.Group();
    
    const bodyGeo = new THREE.SphereGeometry(0.5, 16, 16);
    const woolMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.8 });
    const body = new THREE.Mesh(bodyGeo, woolMat);
    body.scale.set(1.2, 0.9, 1.5);
    body.position.y = 0.5;
    group.add(body);
    
    const headGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.7 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 0.65, 0.65);
    group.add(head);
    
    const earGeo = new THREE.ConeGeometry(0.08, 0.15, 8);
    const leftEar = new THREE.Mesh(earGeo, headMat);
    leftEar.position.set(-0.2, 0.8, 0.55);
    leftEar.rotation.z = 0.5;
    group.add(leftEar);
    
    const rightEar = new THREE.Mesh(earGeo, headMat);
    rightEar.position.set(0.2, 0.8, 0.55);
    rightEar.rotation.z = -0.5;
    group.add(rightEar);
    
    const eyeGeo = new THREE.SphereGeometry(0.03, 8, 8);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.08, 0.68, 0.82);
    group.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.08, 0.68, 0.82);
    group.add(rightEye);
    
    return group;
  }

  createPig() {
    const group = new THREE.Group();
    
    const bodyGeo = new THREE.SphereGeometry(0.45, 16, 16);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xFFB6C1, roughness: 0.7 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.scale.set(1.1, 0.85, 1.4);
    body.position.y = 0.45;
    group.add(body);
    
    const headGeo = new THREE.SphereGeometry(0.28, 16, 16);
    const head = new THREE.Mesh(headGeo, bodyMat);
    head.position.set(0, 0.6, 0.6);
    group.add(head);
    
    const snoutGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.12, 12);
    const snout = new THREE.Mesh(snoutGeo, bodyMat);
    snout.rotation.x = Math.PI / 2;
    snout.position.set(0, 0.55, 0.82);
    group.add(snout);
    
    const earGeo = new THREE.ConeGeometry(0.1, 0.18, 8);
    const leftEar = new THREE.Mesh(earGeo, bodyMat);
    leftEar.position.set(-0.2, 0.82, 0.5);
    leftEar.rotation.z = 0.6;
    group.add(leftEar);
    
    const rightEar = new THREE.Mesh(earGeo, bodyMat);
    rightEar.position.set(0.2, 0.82, 0.5);
    rightEar.rotation.z = -0.6;
    group.add(rightEar);
    
    const eyeGeo = new THREE.SphereGeometry(0.03, 8, 8);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.1, 0.65, 0.78);
    group.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.1, 0.65, 0.78);
    group.add(rightEye);
    
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
    const delta = this.clock.getDelta();
    const moveDistance = this.isMoving ? this.speed * 60 * delta : 0;

    this.trackSegments.forEach(segment => {
      segment.position.z += moveDistance;
    });

    this.decorations.forEach(decoration => {
      decoration.position.z += moveDistance;
    });

    this.animals.forEach(animal => {
      animal.position.z += moveDistance;
      animal.userData.animationTime += delta;
      
      const distanceToTrain = Math.sqrt(
        (animal.position.x) ** 2 + 
        (animal.position.z - 2) ** 2
      );
      
      if (distanceToTrain < 20 && Math.abs(animal.position.z - 2) < 15) {
        animal.userData.state = 'attracted';
        
        const targetX = (Math.random() - 0.5) * 8;
        const targetZ = animal.position.z + (Math.random() - 0.5) * 2;
        
        const dx = targetX - animal.position.x;
        const dz = targetZ - animal.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist > 0.5) {
          animal.position.x += (dx / dist) * animal.userData.moveSpeed;
          animal.position.z += (dz / dist) * animal.userData.moveSpeed * 0.5;
        }
        
        animal.position.y = 0.1 * Math.abs(Math.sin(animal.userData.animationTime * 4)) + 0.01;
        animal.rotation.y = Math.atan2(dx, dz);
      } else {
        animal.userData.state = 'idle';
        animal.position.y = 0.05 * Math.sin(animal.userData.animationTime * 2);
        animal.rotation.y = Math.sin(animal.userData.animationTime * 0.5) * 0.3;
      }
    });

    this.worldOffset += moveDistance;

    this.trackSegments = this.trackSegments.filter(segment => {
      if (segment.position.z > 40) {
        this.scene.remove(segment);
        return false;
      }
      if (segment.position.z < -250 && this.trackSegments.length < 200) {
        this.addTrackSegment(Math.floor((this.worldOffset - 150) / 2.2) + Math.floor(Math.random() * 10));
      }
      return true;
    });

    this.animals = this.animals.filter(animal => {
      if (animal.position.z > 50) {
        this.scene.remove(animal);
        const newZ = -200 - Math.random() * 100;
        this.addAnimal(Math.floor(Math.abs(newZ) / 40));
        return false;
      }
      return true;
    });

    this.decorations = this.decorations.filter(dec => {
      if (dec.position.z > 50) {
        this.scene.remove(dec);
        return false;
      }
      if (dec.position.z < -300 && this.decorations.length < 100) {
        this.addDecoration(Math.floor(Math.random() * 100));
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
    this.animals.forEach(obj => this.scene.remove(obj));
    this.trackSegments = [];
    this.decorations = [];
    this.animals = [];
  }
}
