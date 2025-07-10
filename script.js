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

// Musekontroller til at dreje kloden
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;
controls.enableRotate = true;
controls.autoRotate = false;
controls.minDistance = 7;
controls.maxDistance = 20;

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

// ✔️ Tilføj marker/punkt (følger jorden)
function addMarker(lat, lon) {
    const position = latLongToVector3(lat, lon);

    const geometry = new THREE.SphereGeometry(0.1, 8, 8);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const marker = new THREE.Mesh(geometry, material);

    marker.position.copy(position);
    earth.add(marker);
}

// ✔️ Tegn bue (visuelt) og lav animeret skud (dynamisk)
function createShootingArc(fromLat, fromLon, toLat, toLon) {
    const start = latLongToVector3(fromLat, fromLon);
    const end = latLongToVector3(toLat, toLon);

    const mid = start.clone().add(end).multiplyScalar(0.5);
    mid.normalize().multiplyScalar(5 + 1.5);

    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);

    // Tegn buen (visuelt)
    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0x00ffff });
    const arc = new THREE.Line(geometry, material);
    earth.add(arc);

    // Kugle der flyver (dynamisk)
    const sphereGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
    const movingSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(movingSphere);

    // Gem rute og kugle til animation (baseret på lat/lon)
    animations.push({
        fromLat,
        fromLon,
        toLat,
        toLon,
        sphere: movingSphere,
        progress: Math.random()
    });
}

// ✔️ Liste over aktive animationer
const animations = [];

// XRP Ledger WebSocket forbindelse
let ws;
let recentBlocks = [];
const maxBlocks = 10;

function connectToXRPLedger() {
    const connectionStatus = document.getElementById('connection-status');
    const ledgerBlocks = document.getElementById('ledger-blocks');
    
    // Forbind til XRP Ledger WebSocket
    ws = new WebSocket('wss://xrplcluster.com');
    
    ws.onopen = function() {
        console.log('Forbundet til XRP Ledger');
        connectionStatus.textContent = 'Forbundet til XRP Ledger';
        connectionStatus.className = 'connection-status connected';
        
        // Lyt efter nye ledger lukninger
        const subscribeMessage = {
            "command": "subscribe",
            "streams": ["ledger"]
        };
        ws.send(JSON.stringify(subscribeMessage));
    };
    
    ws.onmessage = function(event) {
        const data = JSON.parse(event.data);
        
        if (data.type === 'ledgerClosed') {
            addNewBlock(data);
        }
    };
    
    ws.onclose = function() {
        console.log('Forbindelse til XRP Ledger lukket');
        connectionStatus.textContent = 'Forbindelse afbrudt';
        connectionStatus.className = 'connection-status disconnected';
        
        // Prøv at forbinde igen efter 3 sekunder
        setTimeout(connectToXRPLedger, 3000);
    };
    
    ws.onerror = function(error) {
        console.error('XRP Ledger WebSocket fejl:', error);
    };
}

function addNewBlock(ledgerData) {
    const block = {
        ledgerIndex: ledgerData.ledger_index,
        ledgerHash: ledgerData.ledger_hash,
        timestamp: new Date().toLocaleTimeString(),
        txnCount: ledgerData.txn_count || 0
    };
    
    // Tilføj til begyndelsen af listen
    recentBlocks.unshift(block);
    
    // Behold kun de seneste 10 blokke
    if (recentBlocks.length > maxBlocks) {
        recentBlocks = recentBlocks.slice(0, maxBlocks);
    }
    
    updateBlockDisplay();
}

function updateBlockDisplay() {
    const ledgerBlocks = document.getElementById('ledger-blocks');
    
    if (recentBlocks.length === 0) {
        ledgerBlocks.innerHTML = '<div class="ledger-block">Venter på data...</div>';
        return;
    }
    
    ledgerBlocks.innerHTML = recentBlocks.map(block => `
        <div class="ledger-block">
            <div class="block-number">#${block.ledgerIndex}</div>
            <div class="block-time">${block.timestamp} - ${block.txnCount} txn</div>
        </div>
    `).join('');
}

// Start XRP Ledger forbindelse
connectToXRPLedger();

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

    // Opdater musekontroller
    controls.update();

    // Jordens rotation (langsommere nu da vi selv kan dreje)
    earth.rotation.y += 0.0005;

    // Animation af kugler på buerne
    animations.forEach(obj => {
        obj.progress += 0.01;
        if (obj.progress > 1) obj.progress = 0;

        // Beregn ny start og slut position baseret på jordens rotation
        const start = latLongToVector3(obj.fromLat, obj.fromLon).applyAxisAngle(
            new THREE.Vector3(0, 1, 0),
            earth.rotation.y
        );
        const end = latLongToVector3(obj.toLat, obj.toLon).applyAxisAngle(
            new THREE.Vector3(0, 1, 0),
            earth.rotation.y
        );
        const mid = start.clone().add(end).multiplyScalar(0.5);
        mid.normalize().multiplyScalar(5 + 1.5);

        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);

        const point = curve.getPoint(obj.progress);
        obj.sphere.position.copy(point);
    });

    renderer.render(scene, camera);
}
animate();
