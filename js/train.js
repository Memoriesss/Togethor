class Train {
  constructor() {
    this.group = new THREE.Group();
    this.wheels = [];
    this.isMoving = false;
    this.wheelRotation = 0;
    
    this.createTrain();
  }

  createTrain() {
    const bodyGeometry = new THREE.BoxGeometry(2.5, 1.2, 3.5);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xFF4500 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.set(0, 0.8, -1.5);
    body.castShadow = true;
    body.receiveShadow = true;
    this.group.add(body);

    const cabinGeometry = new THREE.BoxGeometry(2, 1.5, 1.8);
    const cabinMaterial = new THREE.MeshStandardMaterial({ color: 0xFF6347 });
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabin.position.set(0, 2, -0.5);
    cabin.castShadow = true;
    cabin.receiveShadow = true;
    this.group.add(cabin);

    const frontGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1, 12);
    const frontMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const front = new THREE.Mesh(frontGeometry, frontMaterial);
    front.position.set(0, 2, -3);
    front.castShadow = true;
    this.group.add(front);

    const windowGeometry = new THREE.PlaneGeometry(1.2, 0.8);
    const windowMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x87CEEB, 
      side: THREE.DoubleSide 
    });
    const frontWindow = new THREE.Mesh(windowGeometry, windowMaterial);
    frontWindow.position.set(0, 2, 0.4);
    this.group.add(frontWindow);

    const sideWindow1 = new THREE.Mesh(windowGeometry, windowMaterial);
    sideWindow1.scale.set(0.5, 0.8, 1);
    sideWindow1.position.set(-1, 2, -0.5);
    sideWindow1.rotation.y = Math.PI / 2;
    this.group.add(sideWindow1);

    const sideWindow2 = new THREE.Mesh(windowGeometry, windowMaterial);
    sideWindow2.scale.set(0.5, 0.8, 1);
    sideWindow2.position.set(1, 2, -0.5);
    sideWindow2.rotation.y = -Math.PI / 2;
    this.group.add(sideWindow2);

    const wheelPositions = [
      [-0.9, 0.3, -0.8],
      [0.9, 0.3, -0.8],
      [-0.9, 0.3, -2.2],
      [0.9, 0.3, -2.2]
    ];

    for (let i = 0; i < 4; i++) {
      const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
      const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wheelPositions[i * 3], wheelPositions[i * 3 + 1], wheelPositions[i * 3 + 2]);
      wheel.castShadow = true;
      wheel.receiveShadow = true;
      this.group.add(wheel);
      this.wheels.push(wheel);
    }

    const chimneyGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.8, 12);
    const chimneyMaterial = new THREE.MeshStandardMaterial({ color: 0x2F4F4F });
    const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
    chimney.position.set(0, 2.8, -2);
    chimney.castShadow = true;
    this.group.add(chimney);

    this.group.position.set(0, 0, 0);
  }

  getObject() {
    return this.group;
  }

  update() {
    this.wheelRotation += 0.2;
    this.wheels.forEach(wheel => {
      wheel.rotation.x = this.wheelRotation;
    });
  }

  reset() {
    this.group.position.set(0, 0, 0);
  }
}

window.Train = Train;
