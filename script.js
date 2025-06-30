// Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lys
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(5, 3, 5);
scene.add(directionalLight);

// Jordkloden
const earthGeometry = new THREE.SphereGeometry(5, 64, 64);
const earthTexture = new THREE.TextureLoader().load('earth_texture.jpg');
const earthMaterial = new THREE.MeshStandardMaterial({ map: earthTexture });
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

// Kamera
camera.position.z = 10;

// ✔️ Konverter latitude/longitude til 3D position
function latLongToVector3(lat, lon, radius = 5) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = (radius * Math.sin(phi) * Math.sin(theta));
    const y = (radius * Math.cos(phi));

    return new THREE.Vector3(x, y, z);
}

// ✔️ Tilføj marker/punkt
function addMarker(lat, lon) {
    const position = latLongToVector3(lat, lon);

    const geometry = new THREE.SphereGeometry(0.1, 8, 8);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const marker = new THREE.Mesh(geometry, material);

    marker.position.copy(position);
    scene.add(marker);
}

// ✔️ Tegn bue og lav animeret "skud"
function createShootingArc(fromLat, fromLon, toLat, toLon) {
    const start = latLongToVector3(fromLat, fromLon);
    const end = latLongToVector3(toLat, toLon);

    const mid = start.clone().add(end).multiplyScalar(0.5);
    mid.normalize().multiplyScalar(5 + 1.5); // Højde på buen

    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);

    // Tegn buen (valgfrit)
    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0x00ffff });
    const arc = new THREE.Line(geometry, material);
    scene.add(arc);

    // Kuglen der bevæger sig
    const sphereGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
    const movingSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(movingSphere);

    // Tilføj til animationslisten
    animations.push({
        curve: curve,
        sphere: movingSphere,
        progress: Math.random() // Start et tilfældigt sted
    });
}

// ✔️ Liste over aktive animationer
const animations = [];

// ✔️ Punkter
addMarker(55.6761, 12.5683);    // København
addMarker(40.7128, -74.0060);   // New York
addMarker(35.6762, 139.6503);   // Tokyo

// ✔️ Buer med skud
createShootingArc(55.6761, 12.5683, 40.7128, -74.0060);  // København → New York
createShootingArc(40.7128, -74.0060, 35.6762, 139.6503); // New York → Tokyo
createShootingArc(35.6762, 139.6503, 55.6761, 12.5683);  // Tokyo → København

// ✔️ Responsivt
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ✔️ Animation
function animate() {
    requestAnimationFrame(animate);

    earth.rotation.y += 0.001;

    // Animation af kugler på buerne
    animations.forEach(obj => {
        obj.progress += 0.01; // Speed – juster op/ned

        if (obj.progress > 1) {
            obj.progress = 0; // Loop igen
        }

        const point = obj.curve.getPoint(obj.progress);
        obj.sphere.position.copy(point);
    });

    renderer.render(scene, camera);
}
animate();
