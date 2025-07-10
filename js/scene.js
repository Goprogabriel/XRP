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
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(5, 3, 5);
        this.scene.add(directionalLight);
    }
    
    setupEarth() {
        const earthGeometry = new THREE.SphereGeometry(5, 64, 64);
        const earthTexture = new THREE.TextureLoader().load('earth_texture.jpg');
        const earthMaterial = new THREE.MeshStandardMaterial({ map: earthTexture });
        this.earth = new THREE.Mesh(earthGeometry, earthMaterial);
        this.scene.add(this.earth);
        
        this.camera.position.z = 10;
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    render() {
        this.controls.update();
        this.earth.rotation.y += 0.0005;
        this.renderer.render(this.scene, this.camera);
    }
}
