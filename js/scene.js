// Three.js Scene Setup
export class SceneManager {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.setupControls();
        this.setupLighting();
        this.setupEarth();
        this.setupEventListeners();
    }

    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.enableRotate = true;
        this.controls.autoRotate = false;
        this.controls.minDistance = 7;
        this.controls.maxDistance = 20;
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(5, 3, 5);
        this.scene.add(directionalLight);

        // Spot light for glow
        const spotLight = new THREE.SpotLight(0x00ff88, 1);
        spotLight.position.set(-10, 10, 10);
        this.scene.add(spotLight);
    }

    setupEarth() {
        const earthGeometry = new THREE.SphereGeometry(5, 64, 64);
        const earthTexture = new THREE.TextureLoader().load('earth_texture.jpg');
        const earthMaterial = new THREE.MeshStandardMaterial({
            map: earthTexture,
            roughness: 0.7,
            metalness: 0.2
        });
        this.earth = new THREE.Mesh(earthGeometry, earthMaterial);
        this.scene.add(this.earth);

        // Add a subtle atmosphere glow
        const atmosphereGeometry = new THREE.SphereGeometry(5.1, 64, 64);
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
            color: 0x00aaff,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.scene.add(atmosphere);

        this.camera.position.z = 12;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    toggleAutoRotate() {
        this.controls.autoRotate = !this.controls.autoRotate;
        return this.controls.autoRotate;
    }

    resetCamera() {
        this.controls.reset();
        this.camera.position.set(0, 0, 10);
        this.camera.lookAt(0, 0, 0);
    }

    render() {
        this.controls.update();
        this.earth.rotation.y += 0.0005;
        this.renderer.render(this.scene, this.camera);
    }
}
