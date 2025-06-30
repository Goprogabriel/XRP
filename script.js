// Scene setup
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
const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

// Jordkloden
const geometry = new THREE.SphereGeometry(5, 64, 64);
const texture = new THREE.TextureLoader().load('earth_texture.jpg');
const material = new THREE.MeshStandardMaterial({ map: texture });
const earth = new THREE.Mesh(geometry, material);
scene.add(earth);

// Kamera
camera.position.z = 10;

// ✔️ Funktion til at konvertere lat/lon til 3D position
function latLongToVector3(lat, lon, radius = 5) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = (radius * Math.sin(phi) * Math.sin(theta));
    const y = (radius * Math.cos(phi));

    return new THREE.Vector3(x, y, z);
}

// ✔️ Funktion til at tilføje et punkt
function addMarker(lat, lon) {
    const position = latLongToVector3(lat, lon);

    const geometry = new THREE.SphereGeometry(0.1, 8, 8); // Punkt størrelse
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Rød
    const marker = new THREE.Mesh(geometry, material);

    marker.position.copy(position);
    scene.add(marker);
}

// ✔️ Test punkter
addMarker(55.6761, 12.5683);    // København
addMarker(40.7128, -74.0060);   // New York
addMarker(35.6762, 139.6503);   // Tokyo

// ✔️ Responsivt
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ✔️ Animation
function animate() {
    requestAnimationFrame(animate);
    earth.rotation.y += 0.001; // Drejer langsomt
    scene.rotation.y += 0;     // (Kan aktiveres hvis hele scenen skal rotere)
    renderer.render(scene, camera);
}
animate();
