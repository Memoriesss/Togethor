class SceneManager {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.objects = [];
    this.animationId = null;
    
    this.init();
  }

  init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 5, 15);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);

    this.addLights();
    this.addGround();
    this.addTracks();

    window.addEventListener('resize', () => this.onWindowResize());
  }

  addLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
  }

  addGround() {
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x90EE90,
      side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  addTracks() {
    for (let i = 0; i < 20; i++) {
      const sleeperGeometry = new THREE.BoxGeometry(2, 0.3, 0.5);
      const sleeperMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
      const sleeper = new THREE.Mesh(sleeperGeometry, sleeperMaterial);
      sleeper.position.set(0, -0.8, -i * 2);
      sleeper.castShadow = true;
      this.scene.add(sleeper);

      for (let j = 0; j < 2; j++) {
        const railGeometry = new THREE.BoxGeometry(0.2, 0.2, 2);
        const railMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
        const rail = new THREE.Mesh(railGeometry, railMaterial);
        rail.position.set(j === 0 ? -0.6 : 0.6, -0.5, -i * 2);
        rail.castShadow = true;
        this.scene.add(rail);
      }
    }
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
  }
}

window.SceneManager = SceneManager;
