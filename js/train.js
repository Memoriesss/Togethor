import * as THREE from 'three';

export class Train {
  constructor() {
    this.group = new THREE.Group();
    this.wheels = [];
    this.isMoving = false;
    this.wheelRotation = 0;
    
    this.createTrain();
  }

  createTrain() {
    const bodyGroup = new THREE.Group();
    
    const bodyGeometry = new THREE.BoxGeometry(2.8, 1.4, 4);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xFF4500,
      roughness: 0.4,
      metalness: 0.2
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.set(0, 0.9, -1.8);
    body.castShadow = true;
    body.receiveShadow = true;
    bodyGroup.add(body);

    const cabinGeometry = new THREE.BoxGeometry(2.2, 1.6, 2);
    const cabinMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xFF6347,
      roughness: 0.4,
      metalness: 0.2
    });
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabin.position.set(0, 2, -0.5);
    cabin.castShadow = true;
    cabin.receiveShadow = true;
    bodyGroup.add(cabin);

    const frontGeometry = new THREE.CylinderGeometry(0.3, 0.45, 1.2, 16);
    const frontMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x333333,
      roughness: 0.3,
      metalness: 0.7
    });
    const front = new THREE.Mesh(frontGeometry, frontMaterial);
    front.position.set(0, 2, -3.2);
    front.castShadow = true;
    bodyGroup.add(front);

    const frontWindowGeometry = new THREE.BoxGeometry(1.4, 1, 0.1);
    const glassMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x87CEEB,
      roughness: 0.1,
      metalness: 0.3,
      transparent: true,
      opacity: 0.8
    });
    const frontWindow = new THREE.Mesh(frontWindowGeometry, glassMaterial);
    frontWindow.position.set(0, 2, 0.45);
    bodyGroup.add(frontWindow);

    const sideWindowGeometry = new THREE.BoxGeometry(0.1, 0.9, 1);
    const sideWindow1 = new THREE.Mesh(sideWindowGeometry, glassMaterial);
    sideWindow1.position.set(-1.05, 2, -0.5);
    bodyGroup.add(sideWindow1);

    const sideWindow2 = new THREE.Mesh(sideWindowGeometry, glassMaterial);
    sideWindow2.position.set(1.05, 2, -0.5);
    bodyGroup.add(sideWindow2);

    const windowFrameGeometry = new THREE.BoxGeometry(1.6, 1.2, 0.05);
    const frameMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2F4F4F,
      roughness: 0.5,
      metalness: 0.5
    });
    const windowFrame = new THREE.Mesh(windowFrameGeometry, frameMaterial);
    windowFrame.position.set(0, 2, 0.42);
    bodyGroup.add(windowFrame);

    const chimneyGeometry = new THREE.CylinderGeometry(0.18, 0.22, 0.9, 12);
    const chimneyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2F4F4F,
      roughness: 0.4,
      metalness: 0.6
    });
    const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
    chimney.position.set(0, 3, -2.2);
    chimney.castShadow = true;
    bodyGroup.add(chimney);

    const smokeParticles = this.createSmokeParticles();
    bodyGroup.add(smokeParticles);

    const wheelPositions = [
      [-0.85, 0.4, -0.6],
      [0.85, 0.4, -0.6],
      [-0.85, 0.4, -2.8],
      [0.85, 0.4, -2.8]
    ];

    const wheelGeometry = new THREE.CylinderGeometry(0.38, 0.38, 0.25, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2F2F2F,
      roughness: 0.3,
      metalness: 0.8
    });

    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(...pos);
      wheel.castShadow = true;
      wheel.receiveShadow = true;
      bodyGroup.add(wheel);
      this.wheels.push(wheel);
    });

    const axleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.8, 8);
    const axleMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4A4A4A,
      roughness: 0.3,
      metalness: 0.7
    });
    
    const axle1 = new THREE.Mesh(axleGeometry, axleMaterial);
    axle1.rotation.z = Math.PI / 2;
    axle1.position.set(0, 0.4, -0.6);
    bodyGroup.add(axle1);
    
    const axle2 = new THREE.Mesh(axleGeometry, axleMaterial);
    axle2.rotation.z = Math.PI / 2;
    axle2.position.set(0, 0.4, -2.8);
    bodyGroup.add(axle2);

    const bumperGeometry = new THREE.BoxGeometry(1.8, 0.15, 0.2);
    const bumperMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1E90FF,
      roughness: 0.3,
      metalness: 0.7
    });
    const bumper = new THREE.Mesh(bumperGeometry, bumperMaterial);
    bumper.position.set(0, 0.5, -3.5);
    bumper.castShadow = true;
    bodyGroup.add(bumper);

    const headlightGeometry = new THREE.SphereGeometry(0.12, 12, 12);
    const headlightMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xFFFF00,
      emissive: 0xFFFF00,
      emissiveIntensity: 0.5,
      roughness: 0.1,
      metalness: 0.9
    });
    
    const headlight1 = new THREE.Mesh(headlightGeometry, headlightMaterial);
    headlight1.position.set(-0.5, 0.7, -3.5);
    bodyGroup.add(headlight1);
    
    const headlight2 = new THREE.Mesh(headlightGeometry, headlightMaterial);
    headlight2.position.set(0.5, 0.7, -3.5);
    bodyGroup.add(headlight2);

    this.group.add(bodyGroup);
    this.group.position.set(0, 0, 0);
  }

  createSmokeParticles() {
    const particleCount = 20;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const opacities = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.5;
      positions[i * 3 + 1] = Math.random() * 3;
      positions[i * 3 + 2] = -2 + (Math.random() - 0.5) * 0.3;
      opacities[i] = Math.random();
      sizes[i] = 0.1 + Math.random() * 0.2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0x888888) }
      },
      vertexShader: `
        attribute float size;
        attribute float opacity;
        varying float vOpacity;
        uniform float time;
        
        void main() {
          vOpacity = opacity;
          vec3 pos = position;
          pos.y += time * 0.3;
          pos.x += sin(time + position.y) * 0.02;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
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
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    particles.userData = { isSmoke: true, material };
    
    return particles;
  }

  getObject() {
    return this.group;
  }

  update(delta) {
    this.wheelRotation += delta * 3;
    this.wheels.forEach(wheel => {
      wheel.rotation.x = this.wheelRotation;
    });

    this.group.traverse(child => {
      if (child.userData && child.userData.isSmoke && child.userData.material) {
        child.userData.material.uniforms.time.value += delta;
      }
    });
  }

  reset() {
    this.group.position.set(0, 0, 0);
  }
}
