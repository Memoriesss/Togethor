import * as THREE from 'three';

export class Train {
  constructor() {
    this.group = new THREE.Group();
    this.wheels = [];
    this.pistons = [];
    this.smokeParticles = null;
    this.isMoving = false;
    this.wheelRotation = 0;
    
    this.createTrain();
  }

  createTrain() {
    const bodyGroup = new THREE.Group();
    
    const mainBodyGeometry = new THREE.BoxGeometry(2.8, 1.6, 4.5);
    const mainBodyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xCC3300,
      roughness: 0.35,
      metalness: 0.25
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

    const cabinGeometry = new THREE.BoxGeometry(2.4, 2, 2.5);
    const cabinMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xCC4422,
      roughness: 0.4,
      metalness: 0.2
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
    this.addSmokeSystem(bodyGroup);

    bodyGroup.position.set(0, 0, 0);
    this.group.add(bodyGroup);
  }

  addWindows(bodyGroup) {
    const glassMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x87CEEB,
      roughness: 0.1,
      metalness: 0.3,
      transparent: true,
      opacity: 0.7
    });

    const frontWindowGeometry = new THREE.BoxGeometry(1.6, 1.2, 0.15);
    const frontWindow = new THREE.Mesh(frontWindowGeometry, glassMaterial);
    frontWindow.position.set(0, 2.6, 0.45);
    bodyGroup.add(frontWindow);

    const windowFrameGeometry = new THREE.BoxGeometry(1.8, 1.4, 0.08);
    const frameMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a1a1a,
      roughness: 0.3,
      metalness: 0.7
    });
    const windowFrame = new THREE.Mesh(windowFrameGeometry, frameMaterial);
    windowFrame.position.set(0, 2.6, 0.42);
    bodyGroup.add(windowFrame);

    const sideWindowGeometry = new THREE.BoxGeometry(0.12, 1, 1.2);
    
    const leftWindow = new THREE.Mesh(sideWindowGeometry, glassMaterial);
    leftWindow.position.set(-1.16, 2.5, -0.8);
    bodyGroup.add(leftWindow);

    const rightWindow = new THREE.Mesh(sideWindowGeometry, glassMaterial);
    rightWindow.position.set(1.16, 2.5, -0.8);
    bodyGroup.add(rightWindow);

    const smallWindowGeometry = new THREE.BoxGeometry(0.12, 0.8, 0.8);
    
    const leftSmallWindow = new THREE.Mesh(smallWindowGeometry, glassMaterial);
    leftSmallWindow.position.set(-1.16, 1.3, -2.5);
    bodyGroup.add(leftSmallWindow);

    const rightSmallWindow = new THREE.Mesh(smallWindowGeometry, glassMaterial);
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

    const spokeGeometry = new THREE.BoxGeometry(0.08, 0.4, 0.32);
    const spokeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4a4a4a,
      roughness: 0.3,
      metalness: 0.8
    });

    wheelPositions.forEach((pos, index) => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(pos.x, pos.y, pos.z);
      wheel.castShadow = true;
      wheel.receiveShadow = true;
      bodyGroup.add(wheel);
      this.wheels.push(wheel);

      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const spoke = new THREE.Mesh(spokeGeometry, spokeMaterial);
        spoke.position.set(
          pos.x + Math.cos(angle) * 0.15,
          pos.y,
          pos.z + Math.sin(angle) * 0.15
        );
        spoke.rotation.z = Math.PI / 2;
        spoke.rotation.y = angle;
        bodyGroup.add(spoke);
      }
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

    for (let i = 0; i < 5; i++) {
      const barGeometry = new THREE.BoxGeometry(0.08, 0.6, 0.08);
      const bar = new THREE.Mesh(barGeometry, cowcatcherMaterial);
      bar.position.set(-1 + i * 0.5, 0.7, -5.5);
      bar.rotation.x = 0.3;
      bodyGroup.add(bar);
    }

    const numberBoardGeometry = new THREE.BoxGeometry(0.8, 0.5, 0.05);
    const numberBoardMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xFFCC00,
      roughness: 0.3,
      metalness: 0.5
    });
    const numberBoard = new THREE.Mesh(numberBoardGeometry, numberBoardMaterial);
    numberBoard.position.set(0, 2.6, -5.05);
    bodyGroup.add(numberBoard);

    const stripeGeometry = new THREE.BoxGeometry(2.4, 0.15, 0.05);
    const stripeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xFFCC00,
      roughness: 0.3,
      metalness: 0.5
    });
    
    const stripe1 = new THREE.Mesh(stripeGeometry, stripeMaterial);
    stripe1.position.set(0, 2, -5.05);
    bodyGroup.add(stripe1);

    const stripe2 = new THREE.Mesh(stripeGeometry, stripeMaterial);
    stripe2.position.set(0, 1.7, -5.05);
    bodyGroup.add(stripe2);

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

  addSmokeSystem(bodyGroup) {
    const smokeGeometry = new THREE.BufferGeometry();
    const smokeCount = 50;
    const smokePositions = new Float32Array(smokeCount * 3);
    const smokeOpacities = new Float32Array(smokeCount);
    const smokeSizes = new Float32Array(smokeCount);

    for (let i = 0; i < smokeCount; i++) {
      smokePositions[i * 3] = (Math.random() - 0.5) * 0.8;
      smokePositions[i * 3 + 1] = 4.8 + Math.random() * 4;
      smokePositions[i * 3 + 2] = -2.5 + (Math.random() - 0.5) * 0.5;
      smokeOpacities[i] = Math.random();
      smokeSizes[i] = 0.3 + Math.random() * 0.5;
    }

    smokeGeometry.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
    smokeGeometry.setAttribute('opacity', new THREE.BufferAttribute(smokeOpacities, 1));
    smokeGeometry.setAttribute('size', new THREE.BufferAttribute(smokeSizes, 1));

    const smokeMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0xCCCCCC) }
      },
      vertexShader: `
        attribute float size;
        attribute float opacity;
        varying float vOpacity;
        uniform float time;
        
        void main() {
          vOpacity = opacity * 0.6;
          vec3 pos = position;
          pos.y += time * 0.8;
          pos.x += sin(time * 2.0 + position.y) * 0.05;
          pos.z += cos(time * 1.5 + position.y) * 0.03;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (400.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vOpacity;
        uniform vec3 color;
        
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = (1.0 - dist * 2.0) * vOpacity;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    this.smokeParticles = new THREE.Points(smokeGeometry, smokeMaterial);
    this.smokeParticles.userData = { material: smokeMaterial };
    bodyGroup.add(this.smokeParticles);
  }

  getObject() {
    return this.group;
  }

  update(delta) {
    this.wheelRotation += delta * 2.5;
    this.wheels.forEach(wheel => {
      wheel.rotation.x = this.wheelRotation;
    });

    if (this.smokeParticles && this.smokeParticles.userData.material) {
      this.smokeParticles.userData.material.uniforms.time.value += delta;
    }
  }

  reset() {
    this.group.position.set(0, 0, 0);
  }
}
