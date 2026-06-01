import * as THREE from 'three';

export class Train {
  constructor(color = 0xCC3300, isPlayer = false) {
    this.group = new THREE.Group();
    this.wheels = [];
    this.smokeParticles = [];
    this.isMoving = false;
    this.wheelRotation = 0;
    this.currentSpeed = 40;
    this.maxSpeed = 60;
    this.minSpeed = 30;
    this.baseSpeed = 40;
    this.isPlayer = isPlayer;
    this.score = 0;
    this.positionZ = 0;
    
    this.carCount = 6;
    this.createTrain(color);
  }

  createTrain(mainColor) {
    const bodyGroup = new THREE.Group();
    
    const mainBodyGeometry = new THREE.BoxGeometry(2.8, 1.6, 4.5);
    const mainBodyMaterial = new THREE.MeshStandardMaterial({ 
      color: mainColor,
      roughness: 0.35,
      metalness: 0.2
    });
    const mainBody = new THREE.Mesh(mainBodyGeometry, mainBodyMaterial);
    mainBody.position.set(0, 1, -2);
    mainBody.castShadow = true;
    mainBody.receiveShadow = true;
    bodyGroup.add(mainBody);

    const frontSlopeGeometry = new THREE.BoxGeometry(2.4, 0.8, 1.2);
    const frontSlope = new THREE.Mesh(frontSlopeGeometry, mainBodyMaterial);
    frontSlope.position.set(0, 1.6, -4.5);
    frontSlope.rotation.x = -0.3;
    frontSlope.castShadow = true;
    bodyGroup.add(frontSlope);

    const cabinColor = this.isPlayer ? 0x888888 : mainColor;
    const cabinOpacity = this.isPlayer ? 0.15 : 1;
    
    const cabinGeometry = new THREE.BoxGeometry(2.4, 2, 2.5);
    const cabinMaterial = new THREE.MeshStandardMaterial({ 
      color: cabinColor,
      roughness: 0.4,
      metalness: 0.1,
      transparent: true,
      opacity: cabinOpacity
    });
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabin.position.set(0, 2.4, -0.8);
    cabin.castShadow = true;
    cabin.receiveShadow = true;
    bodyGroup.add(cabin);

    const roofGeometry = new THREE.BoxGeometry(2.5, 0.3, 2.6);
    const roofMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x333333,
      roughness: 0.3,
      metalness: 0.6
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.set(0, 3.5, -0.8);
    roof.castShadow = true;
    bodyGroup.add(roof);

    const chimneyGeometry = new THREE.CylinderGeometry(0.2, 0.28, 1.2, 16);
    const chimneyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x222222,
      roughness: 0.4,
      metalness: 0.7
    });
    const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
    chimney.position.set(0, 4, -2.5);
    chimney.castShadow = true;
    bodyGroup.add(chimney);

    const chimneyTopGeometry = new THREE.CylinderGeometry(0.3, 0.2, 0.4, 16);
    const chimneyTop = new THREE.Mesh(chimneyTopGeometry, chimneyMaterial);
    chimneyTop.position.set(0, 4.7, -2.5);
    chimneyTop.castShadow = true;
    bodyGroup.add(chimneyTop);

    const boilerGeometry = new THREE.CylinderGeometry(0.9, 0.9, 2.5, 24);
    const boilerMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x444444,
      roughness: 0.2,
      metalness: 0.8
    });
    const boiler = new THREE.Mesh(boilerGeometry, boilerMaterial);
    boiler.position.set(0, 1.8, -3.8);
    boiler.rotation.x = Math.PI / 2;
    boiler.castShadow = true;
    bodyGroup.add(boiler);

    const boilerFrontGeometry = new THREE.SphereGeometry(0.9, 24, 24);
    const boilerFront = new THREE.Mesh(boilerFrontGeometry, boilerMaterial);
    boilerFront.position.set(0, 1.8, -5);
    boilerFront.rotation.y = Math.PI / 2;
    boilerFront.castShadow = true;
    bodyGroup.add(boilerFront);

    this.addWindows(bodyGroup);
    this.addHeadlights(bodyGroup);
    this.addWheels(bodyGroup);
    this.addDecorations(bodyGroup);
    this.createSmokeSystem(bodyGroup);

    bodyGroup.position.set(0, 0, 0);
    this.group.add(bodyGroup);

    this.createCars(mainColor);
  }

  createCars(mainColor) {
    const carLength = 4;
    const gap = 0.2;
    const startZ = 6;

    for (let i = 0; i < this.carCount; i++) {
      const carGroup = new THREE.Group();
      const zPos = startZ + i * (carLength + gap);

      const carBodyGeometry = new THREE.BoxGeometry(2.6, 1.8, carLength);
      const carBodyMaterial = new THREE.MeshStandardMaterial({ 
        color: mainColor,
        roughness: 0.4,
        metalness: 0.2
      });
      const carBody = new THREE.Mesh(carBodyGeometry, carBodyMaterial);
      carBody.position.set(0, 0.9, zPos);
      carBody.castShadow = true;
      carBody.receiveShadow = true;
      carGroup.add(carBody);

      const roofGeometry = new THREE.BoxGeometry(2.7, 0.2, carLength + 0.2);
      const roofMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x333333,
        roughness: 0.3,
        metalness: 0.6
      });
      const carRoof = new THREE.Mesh(roofGeometry, roofMaterial);
      carRoof.position.set(0, 1.9, zPos);
      carRoof.castShadow = true;
      carGroup.add(carRoof);

      const glassMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xAADDFF,
        transparent: true,
        opacity: 0.3,
        roughness: 0.05,
        metalness: 0.0,
        side: THREE.DoubleSide,
        depthWrite: false
      });

      const windowGeometry = new THREE.BoxGeometry(0.08, 1, 1.5);
      const leftWindow = new THREE.Mesh(windowGeometry, glassMaterial);
      leftWindow.position.set(-1.31, 1.2, zPos);
      carGroup.add(leftWindow);

      const rightWindow = new THREE.Mesh(windowGeometry, glassMaterial);
      rightWindow.position.set(1.31, 1.2, zPos);
      carGroup.add(rightWindow);

      const frontWindowGeometry = new THREE.BoxGeometry(2.4, 1, 0.08);
      const frontWindow = new THREE.Mesh(frontWindowGeometry, glassMaterial);
      frontWindow.position.set(0, 1.2, zPos + carLength / 2);
      carGroup.add(frontWindow);

      const wheelPositions = [
        { x: -1, y: 0.45, z: zPos - 1.5 },
        { x: 1, y: 0.45, z: zPos - 1.5 },
        { x: -1, y: 0.45, z: zPos + 1.5 },
        { x: 1, y: 0.45, z: zPos + 1.5 }
      ];

      const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.25, 20);
      const wheelMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a1a,
        roughness: 0.2,
        metalness: 0.9
      });

      wheelPositions.forEach((pos) => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(pos.x, pos.y, pos.z);
        wheel.castShadow = true;
        wheel.receiveShadow = true;
        carGroup.add(wheel);
        this.wheels.push(wheel);
      });

      const axleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
      const axleMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x3a3a3a,
        roughness: 0.3,
        metalness: 0.8
      });

      const axle1 = new THREE.Mesh(axleGeometry, axleMaterial);
      axle1.rotation.z = Math.PI / 2;
      axle1.position.set(0, 0.45, zPos - 1.5);
      carGroup.add(axle1);

      const axle2 = new THREE.Mesh(axleGeometry, axleMaterial);
      axle2.rotation.z = Math.PI / 2;
      axle2.position.set(0, 0.45, zPos + 1.5);
      carGroup.add(axle2);

      this.group.add(carGroup);
    }
  }

  createSmokeSystem(parentGroup) {
    this.smokeGroup = new THREE.Group();
    this.smokeTime = 0;
    
    const smokeGeo = new THREE.SphereGeometry(0.3, 8, 8);
    
    for (let i = 0; i < 20; i++) {
      const smokeMat = new THREE.MeshStandardMaterial({
        color: 0x666666,
        transparent: true,
        opacity: 0.4,
        roughness: 0.8
      });
      const smoke = new THREE.Mesh(smokeGeo, smokeMat);
      smoke.position.set(
        (Math.random() - 0.5) * 0.6,
        4.7 + Math.random() * 2,
        -2.5 + (Math.random() - 0.5) * 0.5
      );
      smoke.scale.setScalar(0.5 + Math.random() * 0.5);
      smoke.userData = {
        initialX: smoke.position.x,
        initialY: smoke.position.y,
        initialZ: smoke.position.z,
        speed: 0.005 + Math.random() * 0.005,
        phase: Math.random() * Math.PI * 2
      };
      this.smokeParticles.push(smoke);
      this.smokeGroup.add(smoke);
    }
    
    parentGroup.add(this.smokeGroup);
  }

  addWindows(bodyGroup) {
    const glassMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xAADDFF,
      transparent: true,
      opacity: 0.2,
      roughness: 0.05,
      metalness: 0.0,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const frameMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a1a1a,
      roughness: 0.3,
      metalness: 0.7
    });

    const frontWindowGeometry = new THREE.BoxGeometry(1.8, 1.2, 0.08);
    const frontWindow = new THREE.Mesh(frontWindowGeometry, glassMaterial);
    frontWindow.position.set(0, 2.6, 0.52);
    bodyGroup.add(frontWindow);

    const windowFrameGeometry = new THREE.BoxGeometry(2, 1.4, 0.06);
    const windowFrame = new THREE.Mesh(windowFrameGeometry, frameMaterial);
    windowFrame.position.set(0, 2.6, 0.48);
    bodyGroup.add(windowFrame);

    const sideWindowGeometry = new THREE.BoxGeometry(0.08, 1, 1.2);
    
    const leftWindow = new THREE.Mesh(sideWindowGeometry, glassMaterial);
    leftWindow.position.set(-1.16, 2.5, -0.8);
    bodyGroup.add(leftWindow);

    const rightWindow = new THREE.Mesh(sideWindowGeometry, glassMaterial);
    rightWindow.position.set(1.16, 2.5, -0.8);
    bodyGroup.add(rightWindow);

    const leftSmallWindow = new THREE.Mesh(sideWindowGeometry, glassMaterial);
    leftSmallWindow.position.set(-1.16, 1.3, -2.5);
    bodyGroup.add(leftSmallWindow);

    const rightSmallWindow = new THREE.Mesh(sideWindowGeometry, glassMaterial);
    rightSmallWindow.position.set(1.16, 1.3, -2.5);
    bodyGroup.add(rightSmallWindow);
  }

  addHeadlights(bodyGroup) {
    const headlightGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const headlightMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xFFFF88,
      emissive: 0xFFFF88,
      emissiveIntensity: 1,
      roughness: 0.1,
      metalness: 0.9
    });

    const headlight1 = new THREE.Mesh(headlightGeometry, headlightMaterial);
    headlight1.position.set(-0.6, 1.2, -5.2);
    bodyGroup.add(headlight1);

    const headlight2 = new THREE.Mesh(headlightGeometry, headlightMaterial);
    headlight2.position.set(0.6, 1.2, -5.2);
    bodyGroup.add(headlight2);

    const light1 = new THREE.PointLight(0xFFFF88, 2, 20);
    light1.position.set(-0.6, 1.2, -5.5);
    bodyGroup.add(light1);

    const light2 = new THREE.PointLight(0xFFFF88, 2, 20);
    light2.position.set(0.6, 1.2, -5.5);
    bodyGroup.add(light2);
  }

  addWheels(bodyGroup) {
    const wheelPositions = [
      { x: -1, y: 0.45, z: -0.8 },
      { x: 1, y: 0.45, z: -0.8 },
      { x: -1, y: 0.45, z: -2.2 },
      { x: 1, y: 0.45, z: -2.2 },
      { x: -1, y: 0.45, z: -3.6 },
      { x: 1, y: 0.45, z: -3.6 }
    ];

    const wheelGeometry = new THREE.CylinderGeometry(0.45, 0.45, 0.3, 24);
    const wheelMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a1a1a,
      roughness: 0.2,
      metalness: 0.9
    });

    wheelPositions.forEach((pos, index) => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(pos.x, pos.y, pos.z);
      wheel.castShadow = true;
      wheel.receiveShadow = true;
      bodyGroup.add(wheel);
      this.wheels.push(wheel);
    });

    const axleGeometry = new THREE.CylinderGeometry(0.06, 0.06, 2.2, 8);
    const axleMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x3a3a3a,
      roughness: 0.3,
      metalness: 0.8
    });

    const axle1 = new THREE.Mesh(axleGeometry, axleMaterial);
    axle1.rotation.z = Math.PI / 2;
    axle1.position.set(0, 0.45, -0.8);
    bodyGroup.add(axle1);

    const axle2 = new THREE.Mesh(axleGeometry, axleMaterial);
    axle2.rotation.z = Math.PI / 2;
    axle2.position.set(0, 0.45, -2.2);
    bodyGroup.add(axle2);

    const axle3 = new THREE.Mesh(axleGeometry, axleMaterial);
    axle3.rotation.z = Math.PI / 2;
    axle3.position.set(0, 0.45, -3.6);
    bodyGroup.add(axle3);
  }

  addDecorations(bodyGroup) {
    const cowcatcherGeometry = new THREE.BoxGeometry(2.2, 0.4, 0.6);
    const cowcatcherMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2a2a2a,
      roughness: 0.4,
      metalness: 0.7
    });
    const cowcatcher = new THREE.Mesh(cowcatcherGeometry, cowcatcherMaterial);
    cowcatcher.position.set(0, 0.4, -5.3);
    cowcatcher.castShadow = true;
    bodyGroup.add(cowcatcher);

    const bellGeometry = new THREE.SphereGeometry(0.12, 12, 12);
    const bellMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xFFD700,
      roughness: 0.2,
      metalness: 0.9
    });
    const bell = new THREE.Mesh(bellGeometry, bellMaterial);
    bell.position.set(0, 3.7, -1.5);
    bell.scale.y = 1.3;
    bodyGroup.add(bell);
  }

  getObject() {
    return this.group;
  }

  update(delta) {
    const speedFactor = this.currentSpeed / this.baseSpeed;
    this.wheelRotation += delta * 2.5 * speedFactor;
    this.wheels.forEach(wheel => {
      wheel.rotation.x = this.wheelRotation;
    });

    this.smokeTime += delta;
    this.smokeParticles.forEach((smoke, index) => {
      const userData = smoke.userData;
      smoke.position.y = userData.initialY + Math.sin(this.smokeTime * userData.speed + userData.phase) * 0.3;
      smoke.position.x = userData.initialX + Math.sin(this.smokeTime * userData.speed * 2 + userData.phase) * 0.2;
      smoke.scale.setScalar((0.4 + 0.4 * Math.sin(this.smokeTime * userData.speed + userData.phase) + 0.3) * speedFactor);
      smoke.material.opacity = (0.2 + 0.2 * Math.sin(this.smokeTime * userData.speed * 1.5 + userData.phase)) * speedFactor;
    });
  }

  reset() {
    this.group.position.set(0, 0, 0);
    this.positionZ = 0;
    this.currentSpeed = this.baseSpeed;
  }

  setSpeed(speed) {
    this.currentSpeed = Math.max(this.minSpeed, Math.min(this.maxSpeed, speed));
  }

  increaseSpeed(amount) {
    this.setSpeed(this.currentSpeed + amount);
  }

  decreaseSpeed(amount) {
    this.setSpeed(this.currentSpeed - amount);
  }
}
