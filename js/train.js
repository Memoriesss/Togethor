class Train {
  constructor() {
    this.group = new THREE.Group();
    this.wheels = [];
    this.isMoving = false;
    this.speed = 0;
    
    this.createTrain();
  }

  createTrain() {
    const bodyGeometry = new THREE.BoxGeometry(2, 1.5, 3);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xFF6B6B });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;
    body.castShadow = true;
    this.group.add(body);

    const cabinGeometry = new THREE.BoxGeometry(1.5, 1.2, 1.5);
    const cabinMaterial = new THREE.MeshStandardMaterial({ color: 0xFF8E53 });
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabin.position.set(0, 1.8, 0.5);
    cabin.castShadow = true;
    this.group.add(cabin);

    const chimneyGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1, 16);
    const chimneyMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
    chimney.position.set(0, 2.5, -1);
    chimney.castShadow = true;
    this.group.add(chimney);

    const windowGeometry = new THREE.PlaneGeometry(0.5, 0.5);
    const windowMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x87CEEB, 
      side: THREE.DoubleSide 
    });
    
    for (let i = 0; i < 2; i++) {
      const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
      window1.position.set(i === 0 ? -0.76 : 0.76, 2, 0.5);
      window1.rotation.y = i === 0 ? -Math.PI / 2 : Math.PI / 2;
      this.group.add(window1);
    }

    const wheelPositions = [
      [-0.8, 0, -1],
      [0.8, 0, -1],
      [-0.8, 0, 1],
      [0.8, 0, 1]
    ];

    wheelPositions.forEach(pos => {
      const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 16);
      const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(pos[0], pos[1], pos[2]);
      wheel.castShadow = true;
      this.group.add(wheel);
      this.wheels.push(wheel);
    });

    const frontGeometry = new THREE.CylinderGeometry(0.1, 0.3, 0.8, 8);
    const frontMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
    const front = new THREE.Mesh(frontGeometry, frontMaterial);
    front.rotation.x = Math.PI / 2;
    front.position.set(0, 0.5, -2);
    front.castShadow = true;
    this.group.add(front);

    this.group.position.z = 5;
  }

  getObject() {
    return this.group;
  }

  moveForward(distance, duration = 2000) {
    return new Promise((resolve) => {
      this.isMoving = true;
      const startZ = this.group.position.z;
      const targetZ = startZ - distance;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        this.group.position.z = startZ - distance * easeProgress;
        
        this.wheels.forEach(wheel => {
          wheel.rotation.x += 0.1;
        });

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.isMoving = false;
          resolve();
        }
      };

      animate();
    });
  }

  reset() {
    this.group.position.z = 5;
    this.group.position.x = 0;
    this.group.rotation.y = 0;
  }

  update() {
    if (this.isMoving) {
      this.wheels.forEach(wheel => {
        wheel.rotation.x += 0.05;
      });
    }
  }
}

window.Train = Train;
