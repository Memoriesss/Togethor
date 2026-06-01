import * as THREE from 'three';

export class SceneManager {
  constructor(canvasId) {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.isMoving = false;
    this.speed = 0.8;
    this.clock = new THREE.Clock();
    this.trackSegments = [];
    this.decorations = [];
    this.animals = [];
    this.isFirstPerson = false;
    this.cameraGroup = new THREE.Group();
    this.animationFrameId = null;
    this.animationCallback = null;
    this.trackOffsets = [-4, 0, 4];
    this.totalDistance = 0;
    
    this.trackCurve = [];
    this.currentCurveIndex = 0;
    this.slopeSegments = [];

    this.init(canvasId);
  }

  init(canvasId) {
    const canvas = document.getElementById(canvasId);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB);
    this.scene.fog = new THREE.Fog(0x87CEEB, 30, 80);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.generateTrackLine();
    this.addLights();
    this.createTrackFromLine();
    this.createSlopes();
    this.addDecorationsAroundTrack();
    this.addAnimalsAroundTrack();
    this.setupCamera();

    window.addEventListener('resize', () => this.onResize());
  }

  addLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    this.scene.add(directionalLight);

    const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x228B22, 0.4);
    this.scene.add(hemisphereLight);
  }

  setupCamera() {
    this.cameraOffset = { x: 0, y: 8, z: 18 };
    this.cameraLookOffset = { x: 0, y: 0, z: -10 };
    this.updateCameraPosition();
  }

  updateCameraPosition() {
    const trackPos = this.getTrackPosition(this.totalDistance);
    this.camera.position.set(
      trackPos.x + this.cameraOffset.x,
      trackPos.y + this.cameraOffset.y,
      5 + this.cameraOffset.z
    );
    this.camera.lookAt(
      trackPos.x + this.cameraLookOffset.x,
      trackPos.y + this.cameraLookOffset.y,
      5 + this.cameraLookOffset.z
    );
  }

  toggleView() {
    this.isFirstPerson = !this.isFirstPerson;
    if (this.isFirstPerson) {
      this.cameraOffset = { x: 0, y: 1, z: 3 };
      this.cameraLookOffset = { x: 0, y: 0.5, z: -15 };
    } else {
      this.cameraOffset = { x: 0, y: 8, z: 18 };
      this.cameraLookOffset = { x: 0, y: 0, z: -10 };
    }
    this.updateCameraPosition();
  }

  generateTrackLine() {
    this.trackCurve = [];
    let currentX = 0;
    let currentY = 0;
    let direction = 0;
    
    for (let i = 0; i < 500; i++) {
      const segmentType = Math.random();
      
      if (segmentType < 0.25) {
        direction += (Math.random() - 0.5) * 0.06;
      } else if (segmentType < 0.4) {
        direction += 0.04;
      } else if (segmentType < 0.55) {
        direction -= 0.04;
      }
      
      direction = Math.max(-0.25, Math.min(0.25, direction));
      
      currentX += direction * 2;
      currentX = Math.max(-10, Math.min(10, currentX));
      
      const slopeChange = Math.random() < 0.08 ? (Math.random() - 0.5) * 1.2 : 0;
      currentY += slopeChange;
      currentY = Math.max(-2.5, Math.min(5, currentY));
      
      this.trackCurve.push({
        x: currentX,
        y: currentY,
        direction: direction,
        slopeChange: slopeChange
      });
    }
  }

  createTrackFromLine() {
    for (let i = 0; i < 500; i++) {
      const curveIndex = i % this.trackCurve.length;
      const curveData = this.trackCurve[curveIndex];
      
      for (let trackIndex = 0; trackIndex < 3; trackIndex++) {
        this.addTrackSegment(i, trackIndex, curveData);
      }
    }
  }

  addTrackSegment(i, trackIndex, curveData) {
    const offsetX = this.trackOffsets[trackIndex];
    const baseX = curveData ? curveData.x : 0;
    const baseY = curveData ? curveData.y : 0;
    const curveX = baseX + offsetX;
    const curveY = baseY;

    const sleeperGeometry = new THREE.BoxGeometry(3.5, 0.2, 0.5);
    const sleeperMaterial = new THREE.MeshStandardMaterial({
      color: 0x5D4037,
      roughness: 0.8
    });
    const sleeper = new THREE.Mesh(sleeperGeometry, sleeperMaterial);
    sleeper.position.set(curveX, curveY - 0.8, -i * 2);
    sleeper.castShadow = true;
    sleeper.receiveShadow = true;
    sleeper.userData = { trackIndex, baseX: curveX, baseY: curveY, segmentIndex: i, originalOffsetX: offsetX };
    this.scene.add(sleeper);
    this.trackSegments.push(sleeper);

    const railGeometry = new THREE.BoxGeometry(0.15, 0.15, 2.2);
    const railMaterial = new THREE.MeshStandardMaterial({
      color: 0x757575,
      roughness: 0.3,
      metalness: 0.7
    });

    const railLeft = new THREE.Mesh(railGeometry, railMaterial);
    railLeft.position.set(curveX - 0.6, curveY - 0.65, -i * 2);
    railLeft.castShadow = true;
    railLeft.receiveShadow = true;
    railLeft.userData = { trackIndex, baseX: curveX, baseY: curveY, segmentIndex: i, originalOffsetX: offsetX };
    this.scene.add(railLeft);
    this.trackSegments.push(railLeft);

    const railRight = new THREE.Mesh(railGeometry, railMaterial);
    railRight.position.set(curveX + 0.6, curveY - 0.65, -i * 2);
    railRight.castShadow = true;
    railRight.receiveShadow = true;
    railRight.userData = { trackIndex, baseX: curveX, baseY: curveY, segmentIndex: i, originalOffsetX: offsetX };
    this.scene.add(railRight);
    this.trackSegments.push(railRight);
  }

  createSlopes() {
    const slopeTypes = ['up', 'down', 'hill', 'valley'];
    
    for (let i = 0; i < 25; i++) {
      const startZ = -i * 40 - 60;
      const slopeType = slopeTypes[Math.floor(Math.random() * slopeTypes.length)];
      const width = 10 + Math.random() * 10;
      const height = 2.5 + Math.random() * 4.5;
      
      this.createSlopeSegment(startZ, width, height, slopeType);
    }
  }

  createSlopeSegment(startZ, width, height, type) {
    const slopeGeometry = new THREE.PlaneGeometry(width * 2, 35);
    const slopeMaterial = new THREE.MeshStandardMaterial({
      color: type === 'hill' ? 0x8B7355 : type === 'valley' ? 0x654321 : 0x6B8E23,
      roughness: 0.9,
      side: THREE.DoubleSide
    });
    
    const slope = new THREE.Mesh(slopeGeometry, slopeMaterial);
    
    if (type === 'up') {
      slope.rotation.x = -Math.PI / 4;
      slope.position.set(28, height / 2, startZ);
    } else if (type === 'down') {
      slope.rotation.x = Math.PI / 4;
      slope.position.set(28, -height / 2, startZ);
    } else if (type === 'hill') {
      const hillGeometry = new THREE.ConeGeometry(width, height * 2, 16);
      const hillMaterial = new THREE.MeshStandardMaterial({
        color: 0x228B22,
        roughness: 0.9
      });
      const hill = new THREE.Mesh(hillGeometry, hillMaterial);
      hill.position.set(28, height, startZ);
      hill.castShadow = true;
      hill.receiveShadow = true;
      this.scene.add(hill);
      
      this.slopeSegments.push({
        type: 'hill',
        mesh: hill,
        startZ: startZ
      });
      return;
    } else if (type === 'valley') {
      const valleyGeometry = new THREE.ConeGeometry(width, height * 2, 16);
      const valleyMaterial = new THREE.MeshStandardMaterial({
        color: 0x1E90FF,
        roughness: 0.9
      });
      const valley = new THREE.Mesh(valleyGeometry, valleyMaterial);
      valley.rotation.x = Math.PI;
      valley.position.set(28, -height, startZ);
      valley.castShadow = true;
      valley.receiveShadow = true;
      this.scene.add(valley);
      
      this.slopeSegments.push({
        type: 'valley',
        mesh: valley,
        startZ: startZ
      });
      return;
    }
    
    slope.castShadow = true;
    slope.receiveShadow = true;
    this.scene.add(slope);
    
    this.slopeSegments.push({
      type: type,
      mesh: slope,
      startZ: startZ
    });
  }

  addDecorationsAroundTrack() {
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

    for (let i = 0; i < 120; i++) {
      this.addDecorationAroundTrack(i);
    }
  }

  addDecorationAroundTrack(i) {
    const z = -i * 10 - 25;
    const curveIndex = Math.floor((Math.abs(z) / 2) % this.trackCurve.length);
    const curveData = this.trackCurve[curveIndex] || { x: 0, y: 0 };
    
    const side = Math.random() > 0.5 ? 1 : -1;
    const distance = 12 + Math.random() * 25;
    const x = curveData.x + side * distance;

    const decorationType = Math.floor(Math.random() * 6);
    
    let decoration;
    
    switch(decorationType) {
      case 0:
        decoration = this.createTree(0x228B22);
        break;
      case 1:
        decoration = this.createTallTree(0x2E7D32);
        break;
      case 2:
        decoration = this.createRock();
        break;
      case 3:
        decoration = this.createBush();
        break;
      case 4:
        decoration = this.createFlower(0xFF69B4);
        break;
      case 5:
        decoration = this.createHill();
        break;
    }

    if (decoration) {
      decoration.position.set(x, curveData.y, z);
      decoration.castShadow = true;
      decoration.receiveShadow = true;
      decoration.userData = { isDecoration: true, baseZ: z, baseY: curveData.y, baseX: x };
      this.scene.add(decoration);
      this.decorations.push(decoration);
    }
  }

  createTree(color) {
    const group = new THREE.Group();
    
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x5D4E37,
      roughness: 0.9
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 0.75;
    group.add(trunk);
    
    const leavesGeometry = new THREE.ConeGeometry(1, 2.5, 8);
    const leavesMaterial = new THREE.MeshStandardMaterial({ 
      color: color,
      roughness: 0.7
    });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = 2.8;
    group.add(leaves);
    
    const leaves2 = new THREE.Mesh(
      new THREE.ConeGeometry(0.75, 2, 8),
      leavesMaterial
    );
    leaves2.position.y = 3.6;
    group.add(leaves2);
    
    return group;
  }

  createTallTree(color) {
    const group = new THREE.Group();
    
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 4, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4E342E,
      roughness: 0.9
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 2;
    group.add(trunk);
    
    const leavesGeometry = new THREE.SphereGeometry(1.8, 12, 12);
    const leavesMaterial = new THREE.MeshStandardMaterial({ 
      color: color,
      roughness: 0.7
    });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = 5;
    leaves.scale.y = 1.3;
    group.add(leaves);
    
    return group;
  }

  createRock() {
    const group = new THREE.Group();
    
    const rockGeometry = new THREE.DodecahedronGeometry(0.6, 0);
    const rockMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x757575,
      roughness: 0.8
    });
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    rock.rotation.x = Math.random() * 0.3;
    rock.rotation.z = Math.random() * 0.3;
    rock.scale.set(
      0.8 + Math.random() * 0.5,
      0.6 + Math.random() * 0.4,
      0.8 + Math.random() * 0.5
    );
    rock.position.y = 0.4;
    group.add(rock);
    
    return group;
  }

  createBush() {
    const group = new THREE.Group();
    
    const bushGeometry = new THREE.SphereGeometry(0.5, 8, 8);
    const bushMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x558B2F,
      roughness: 0.9
    });
    
    const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
    bush1.position.y = 0.4;
    group.add(bush1);
    
    const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
    bush2.position.set(0.3, 0.35, 0.2);
    bush2.scale.set(0.8, 0.8, 0.8);
    group.add(bush2);
    
    const bush3 = new THREE.Mesh(bushGeometry, bushMaterial);
    bush3.position.set(-0.25, 0.3, -0.15);
    bush3.scale.set(0.7, 0.7, 0.7);
    group.add(bush3);
    
    return group;
  }

  createFlower(color) {
    const group = new THREE.Group();
    
    const stemGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6);
    const stemMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4CAF50,
      roughness: 0.8
    });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = 0.25;
    group.add(stem);
    
    const petalGeometry = new THREE.SphereGeometry(0.12, 8, 8);
    const petalMaterial = new THREE.MeshStandardMaterial({ 
      color: color,
      roughness: 0.5
    });
    
    for (let i = 0; i < 5; i++) {
      const petal = new THREE.Mesh(petalGeometry, petalMaterial);
      const angle = (i / 5) * Math.PI * 2;
      petal.position.set(
        Math.cos(angle) * 0.12,
        0.55,
        Math.sin(angle) * 0.12
      );
      petal.scale.y = 0.6;
      group.add(petal);
    }
    
    const centerGeometry = new THREE.SphereGeometry(0.06, 8, 8);
    const centerMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xFFC107,
      roughness: 0.4
    });
    const center = new THREE.Mesh(centerGeometry, centerMaterial);
    center.position.y = 0.55;
    group.add(center);
    
    return group;
  }

  createHill() {
    const group = new THREE.Group();
    
    const hillGeometry = new THREE.ConeGeometry(4, 3, 16);
    const hillMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x388E3C,
      roughness: 0.9
    });
    const hill = new THREE.Mesh(hillGeometry, hillMaterial);
    hill.position.y = 1.5;
    group.add(hill);
    
    return group;
  }

  addAnimalsAroundTrack() {
    for (let i = 0; i < 25; i++) {
      this.addAnimalAroundTrack(i);
    }
  }

  addAnimalAroundTrack(i) {
    const z = -i * 22 - 45;
    const curveIndex = Math.floor((Math.abs(z) / 2) % this.trackCurve.length);
    const curveData = this.trackCurve[curveIndex] || { x: 0, y: 0 };
    
    const side = Math.random() > 0.5 ? 1 : -1;
    const distance = 8 + Math.random() * 18;
    const x = curveData.x + side * distance;

    const animalType = Math.floor(Math.random() * 3);
    let animal;
    
    switch(animalType) {
      case 0:
        animal = this.createBunny();
        break;
      case 1:
        animal = this.createChick();
        break;
      case 2:
        animal = this.createPig();
        break;
    }

    if (animal) {
      animal.position.set(x, 0, z);
      animal.userData = {
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

  createPig() {
    const group = new THREE.Group();
    
    const bodyGeo = new THREE.SphereGeometry(0.5, 16, 16);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xF48FB1, roughness: 0.7 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.scale.set(1.2, 0.9, 1.4);
    body.position.y = 0.5;
    group.add(body);
    
    const headGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const head = new THREE.Mesh(headGeo, bodyMat);
    head.position.set(0, 0.65, 0.6);
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

  startMoving() {
    this.isMoving = true;
  }

  stopMoving() {
    this.isMoving = false;
  }

  updateSceneObjects(moveDistance) {
    this.trackSegments.forEach(segment => {
      segment.position.z += moveDistance;
      if (segment.position.z > 60) {
        segment.position.z -= 1000;
        
        const curveIndex = Math.floor(-segment.position.z / 2) % this.trackCurve.length;
        const curveData = this.trackCurve[curveIndex] || { x: 0, y: 0 };
        segment.position.x = curveData.x + segment.userData.originalOffsetX;
        segment.position.y = curveData.y - 0.8;
      }
    });

    this.slopeSegments.forEach(slope => {
      slope.mesh.position.z += moveDistance;
      if (slope.mesh.position.z > 60) {
        slope.mesh.position.z -= 1000;
      }
    });

    this.decorations.forEach(decoration => {
      decoration.position.z += moveDistance;
      if (decoration.position.z > 60) {
        decoration.position.z -= 1000;
        
        const curveIndex = Math.floor(-decoration.position.z / 2) % this.trackCurve.length;
        const curveData = this.trackCurve[curveIndex] || { x: 0, y: 0 };
        decoration.position.y = curveData.y;
        decoration.position.x = decoration.userData.baseX;
      }
    });

    this.animals.forEach(animal => {
      animal.position.z += moveDistance;
      animal.userData.animationTime += 0.016;
      
      const distanceToTrain = Math.sqrt(
        (animal.position.x) ** 2 + 
        (animal.position.z - 5) ** 2
      );
      
      if (distanceToTrain < 28 && animal.position.z > -18 && animal.position.z < 28) {
        animal.userData.state = 'attracted';
        
        const targetX = (Math.random() - 0.5) * 6;
        const targetZ = animal.position.z + (Math.random() - 0.5) * 2;
        
        const dx = targetX - animal.position.x;
        const dz = targetZ - animal.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist > 0.5) {
          animal.position.x += (dx / dist) * animal.userData.moveSpeed;
        }
        
        animal.position.y = 0.15 * Math.abs(Math.sin(animal.userData.animationTime * 5)) + 0.01;
        animal.rotation.y = Math.atan2(dx, dz);
      } else {
        animal.userData.state = 'idle';
        animal.position.y = 0.05 * Math.sin(animal.userData.animationTime * 2);
        animal.rotation.y = Math.sin(animal.userData.animationTime * 0.5) * 0.3;
      }
      
      if (animal.position.z > 50) {
        animal.position.z -= 1000;
      }
    });
  }

  update(delta, averageSpeed) {
    if (averageSpeed === undefined) {
      averageSpeed = 40;
    }
    const moveDistance = averageSpeed / 40 * this.speed * 60 * delta;
    this.totalDistance += moveDistance;

    this.trackSegments.forEach(segment => {
      segment.position.z += moveDistance;
      if (segment.position.z > 60) {
        segment.position.z -= 1000;
        
        const curveIndex = Math.floor(-segment.position.z / 2) % this.trackCurve.length;
        const curveData = this.trackCurve[curveIndex] || { x: 0, y: 0 };
        segment.position.x = curveData.x + segment.userData.originalOffsetX;
        segment.position.y = curveData.y - 0.8;
      }
    });

    this.slopeSegments.forEach(slope => {
      slope.mesh.position.z += moveDistance;
      if (slope.mesh.position.z > 60) {
        slope.mesh.position.z -= 1000;
      }
    });

    this.decorations.forEach(decoration => {
      decoration.position.z += moveDistance;
      if (decoration.position.z > 60) {
        decoration.position.z -= 1000;
        
        const curveIndex = Math.floor(-decoration.position.z / 2) % this.trackCurve.length;
        const curveData = this.trackCurve[curveIndex] || { x: 0, y: 0 };
        decoration.position.y = curveData.y;
        decoration.position.x = decoration.userData.baseX;
      }
    });

    this.animals.forEach(animal => {
      animal.position.z += moveDistance;
      animal.userData.animationTime += delta;
      
      const distanceToTrain = Math.sqrt(
        (animal.position.x) ** 2 + 
        (animal.position.z) ** 2
      );
      
      if (distanceToTrain < 25 && animal.position.z > -20 && animal.position.z < 20) {
        animal.userData.state = 'attracted';
        
        const targetX = (Math.random() - 0.5) * 6;
        const targetZ = animal.position.z + (Math.random() - 0.5) * 2;
        
        const dx = targetX - animal.position.x;
        const dz = targetZ - animal.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist > 0.5) {
          animal.position.x += (dx / dist) * animal.userData.moveSpeed;
        }
        
        animal.position.y = 0.15 * Math.abs(Math.sin(animal.userData.animationTime * 5)) + 0.01;
        animal.rotation.y = Math.atan2(dx, dz);
      } else {
        animal.userData.state = 'idle';
        animal.position.y = 0.05 * Math.sin(animal.userData.animationTime * 2);
        animal.rotation.y = Math.sin(animal.userData.animationTime * 0.5) * 0.3;
      }
      
      if (animal.position.z > 30) {
        animal.position.z -= 1000;
      }
    });
  }

  startAnimation(callback) {
    this.animationCallback = callback;
    this.animate();
  }

  stopAnimation() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(() => this.animate());
    
    const delta = this.clock.getDelta();
    
    if (this.animationCallback) {
      this.animationCallback(delta);
    }

    this.renderer.render(this.scene, this.camera);
  }

  addObject(object) {
    this.scene.add(object);
  }

  removeObject(object) {
    this.scene.remove(object);
  }

  getTrackPosition(distance) {
    const segmentIndex = Math.floor(distance / 2) % this.trackCurve.length;
    const curveData = this.trackCurve[segmentIndex] || { x: 0, y: 0 };
    return {
      x: curveData.x,
      y: curveData.y,
      direction: curveData.direction || 0
    };
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  clear() {
    this.stopAnimation();
    this.stopMoving();
    
    this.trackSegments.forEach(segment => {
      this.scene.remove(segment);
    });
    this.trackSegments = [];
    
    this.decorations.forEach(decoration => {
      this.scene.remove(decoration);
    });
    this.decorations = [];
    
    this.animals.forEach(animal => {
      this.scene.remove(animal);
    });
    this.animals = [];
    
    this.slopeSegments.forEach(slope => {
      this.scene.remove(slope.mesh);
    });
    this.slopeSegments = [];
  }
}
