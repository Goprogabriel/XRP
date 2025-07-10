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

// ✔️ Tilføj XRP validator marker
function addValidatorMarker(validator) {
    const position = latLongToVector3(validator.lat, validator.lon);

    // Større grøn kugle for validators
    const geometry = new THREE.SphereGeometry(0.15, 16, 16);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0x00ff88,
        emissive: 0x002200,
        emissiveIntensity: 0.3
    });
    const marker = new THREE.Mesh(geometry, material);
    marker.position.copy(position);
    
    // Tilføj validator data til marker
    marker.userData = {
        validator: validator,
        originalScale: 1,
        pulsePhase: Math.random() * Math.PI * 2,
        isValidator: true
    };
    
    earth.add(marker);
    validatorMarkers.set(validator.pubkey, marker);
    
    // Tilføj tekst label
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    context.font = '14px Arial';
    context.fillStyle = 'rgba(255, 255, 255, 0.9)';
    context.textAlign = 'center';
    context.fillText(validator.city, 128, 28);
    context.fillText(validator.country, 128, 45);
    
    const texture = new THREE.CanvasTexture(canvas);
    const labelGeometry = new THREE.PlaneGeometry(1.2, 0.3);
    const labelMaterial = new THREE.MeshBasicMaterial({ 
        map: texture, 
        transparent: true,
        alphaTest: 0.1
    });
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    
    const labelPosition = latLongToVector3(validator.lat, validator.lon, 5.8);
    label.position.copy(labelPosition);
    label.lookAt(camera.position);
    
    // Tilføj label til marker's userData så det kan roteres med jorden
    marker.userData.label = label;
    earth.add(label);
    
    return marker;
}

// ✔️ Vis forbindelser mellem validators
function createValidatorConnection(validator1, validator2) {
    const start = latLongToVector3(validator1.lat, validator1.lon);
    const end = latLongToVector3(validator2.lat, validator2.lon);
    
    // Beregn buens højde baseret på distancen
    const distance = start.distanceTo(end);
    const arcHeight = Math.min(distance * 0.3, 2.5);
    
    const mid = start.clone().add(end).multiplyScalar(0.5);
    mid.normalize().multiplyScalar(5 + arcHeight);
    
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const points = curve.getPoints(50);
    
    // Grøn linje for validator forbindelser
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ 
        color: 0x00ff88,
        transparent: true,
        opacity: 0.3
    });
    const connection = new THREE.Line(geometry, material);
    
    earth.add(connection);
    validatorConnections.push(connection);
    
    return connection;
}

// ✔️ Initialiser XRP validator network
function initializeValidatorNetwork() {
    // Tilføj alle validator markører
    xrpValidatorNodes.forEach(validator => {
        addValidatorMarker(validator);
    });
    
    // Opret forbindelser mellem validators (simuleret netværk)
    for (let i = 0; i < xrpValidatorNodes.length; i++) {
        for (let j = i + 1; j < xrpValidatorNodes.length; j++) {
            // Kun vis forbindelser til nærmeste validators for at undgå rod
            const distance = Math.sqrt(
                Math.pow(xrpValidatorNodes[i].lat - xrpValidatorNodes[j].lat, 2) +
                Math.pow(xrpValidatorNodes[i].lon - xrpValidatorNodes[j].lon, 2)
            );
            
            if (distance < 50 || Math.random() < 0.2) { // Vis kun nogle forbindelser
                createValidatorConnection(xrpValidatorNodes[i], xrpValidatorNodes[j]);
            }
        }
    }
}

// ✔️ Simuler validator aktivitet
function simulateValidatorActivity() {
    // Vælg tilfældige validators til aktivitet
    const activeValidators = xrpValidatorNodes.filter(() => Math.random() < 0.3);
    
    activeValidators.forEach(validator => {
        const marker = validatorMarkers.get(validator.pubkey);
        if (marker) {
            // Skab pulserende lys effekt
            marker.material.emissiveIntensity = 0.8;
            setTimeout(() => {
                marker.material.emissiveIntensity = 0.3;
            }, 500);
        }
    });
}

// addMarker function removed - not needed for XRP validators

// ✔️ Tegn bue (visuelt) og lav animeret skud (dynamisk) - removed for XRP validators only

// ✔️ Liste over aktive animationer - simplified for validators only
const animations = [];

// XRP Validator nodes med geografiske positioner
const xrpValidatorNodes = [
    { 
        name: "Ripple Lab (San Francisco)", 
        lat: 37.7749, 
        lon: -122.4194, 
        pubkey: "nHUPKoGr78vEFANjXfLpGYuBqPwXXq1dHgTaJrfGtQnZcFjFdJPR",
        country: "USA",
        city: "San Francisco"
    },
    { 
        name: "Ripple Lab (Dublin)", 
        lat: 53.3498, 
        lon: -6.2603, 
        pubkey: "nHUTh2DRMx4TH8iNc3qYnFLzLXpqxoVZBJMUHNbxJEkQdLNSqpXH",
        country: "Ireland",
        city: "Dublin"
    },
    { 
        name: "Ripple Lab (Singapore)", 
        lat: 1.3521, 
        lon: 103.8198, 
        pubkey: "nHUP3pWBaEHcfzTdDBdKj9yFfSTJUdJGz6PRAskLJCHtmLTDRKvH",
        country: "Singapore",
        city: "Singapore"
    },
    { 
        name: "Coil (New York)", 
        lat: 40.7128, 
        lon: -74.0060, 
        pubkey: "nHUryiyDqEtyWVtFG24AAhaYjMf9FRLietQcQrcbdN5PjjWjCRKN",
        country: "USA",
        city: "New York"
    },
    { 
        name: "Bithomp (Netherlands)", 
        lat: 52.3676, 
        lon: 4.9041, 
        pubkey: "nHULqGBkJtWeNFjhTzYeAsHA3qKKS7HoBh8CV3BAGTGMZuepEhWC",
        country: "Netherlands",
        city: "Amsterdam"
    },
    { 
        name: "XRPL Labs (Netherlands)", 
        lat: 52.3676, 
        lon: 4.9041, 
        pubkey: "nHUn13jKRSvyRW5HGPqmMjvAJGELzSLVZpKAMBXTMKNcLnYtJSgH",
        country: "Netherlands",
        city: "Amsterdam"
    },
    { 
        name: "Alloy Networks (USA)", 
        lat: 39.0458, 
        lon: -76.6413, 
        pubkey: "nHUDHXNKHtQnPn6pKfGpEcbSvw8VhGbBPQFhKWo4kqEYhpMqZwdh",
        country: "USA",
        city: "Baltimore"
    },
    { 
        name: "Gatehub (UK)", 
        lat: 51.5074, 
        lon: -0.1278, 
        pubkey: "nHUkKNxGWFqM41U5YWDdBvhQmEUvNGmUqMGcFnfT4gRQdRPEpJcS",
        country: "UK",
        city: "London"
    },
    { 
        name: "Sologenic (Canada)", 
        lat: 43.6532, 
        lon: -79.3832, 
        pubkey: "nHUBqFKgCsS7P6RmxXQyNVnVk2PVVvEMkjhXCJCk8kfmZtQJhDDd",
        country: "Canada",
        city: "Toronto"
    },
    { 
        name: "Validator (Tokyo)", 
        lat: 35.6762, 
        lon: 139.6503, 
        pubkey: "nHUVFHTdJwdNUbUeUJFW5q4NQHxBYGfJsZNHdBrUnTNzQCpGHnLY",
        country: "Japan",
        city: "Tokyo"
    },
    { 
        name: "Validator (Sydney)", 
        lat: -33.8688, 
        lon: 151.2093, 
        pubkey: "nHUKVKfBmYdSVKuPRMKjmyDqBFZjKfxJbVtHDTM4TQEJ3RaKdVUH",
        country: "Australia",
        city: "Sydney"
    },
    { 
        name: "Validator (Mumbai)", 
        lat: 19.0760, 
        lon: 72.8777, 
        pubkey: "nHUJunGYCLWqZFvxGBNFfBnpwYxBGJhKGQfFnJNqRSgEQJgHsVfv",
        country: "India",
        city: "Mumbai"
    },
    { 
        name: "Validator (São Paulo)", 
        lat: -23.5505, 
        lon: -46.6333, 
        pubkey: "nHUKoGrxnHwcKpJrVSgRSZBLFq8qmJGLdDxKLKgLJGSfGhLwRrxK",
        country: "Brazil",
        city: "São Paulo"
    },
    { 
        name: "Validator (Frankfurt)", 
        lat: 50.1109, 
        lon: 8.6821, 
        pubkey: "nHUJbHBY7fGWMjJsTSjVmLGxPzhhqBbczK4ysBG1BNWPCqJgMjwS",
        country: "Germany",
        city: "Frankfurt"
    },
    { 
        name: "Validator (Seoul)", 
        lat: 37.5665, 
        lon: 126.9780, 
        pubkey: "nHUKBvTyqfVMN3LXZNNfFYcnhqBCQHdLFLcqVNNWzBMSdQGGLjGD",
        country: "South Korea",
        city: "Seoul"
    }
];

// Aktive validator nodes og deres markører
const validatorMarkers = new Map();
const validatorConnections = [];

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
    
    // Simuler validator aktivitet når ny blok kommer
    simulateValidatorActivity();
    
    updateBlockDisplay();
}

function updateBlockDisplay() {
    const ledgerBlocks = document.getElementById('ledger-blocks');
    
    if (recentBlocks.length === 0) {
        ledgerBlocks.innerHTML = '<div class="ledger-block">Venter på data...</div>';
        return;
    }
    
    ledgerBlocks.innerHTML = recentBlocks.map(block => `
        <div class="ledger-block" onclick="showTransactions(${block.ledgerIndex})">
            <div class="block-number">#${block.ledgerIndex}</div>
            <div class="block-time">${block.timestamp} - ${block.txnCount} txn</div>
        </div>
    `).join('');
}

// Funktion til at vise transaktioner for en specifik blok
async function showTransactions(ledgerIndex) {
    const overlay = document.getElementById('transaction-overlay');
    const title = document.getElementById('transaction-title');
    const content = document.getElementById('transaction-content');
    
    // Vis overlay
    overlay.style.display = 'flex';
    title.textContent = `Transaktioner i blok #${ledgerIndex}`;
    content.innerHTML = '<div class="loading-spinner">Henter transaktioner...</div>';
    
    try {
        // Hent transaktioner fra XRP Ledger
        const response = await fetch('https://xrplcluster.com', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                method: 'ledger',
                params: [{
                    ledger_index: ledgerIndex,
                    transactions: true,
                    expand: true
                }]
            })
        });
        
        const data = await response.json();
        
        if (data.result && data.result.ledger && data.result.ledger.transactions) {
            const transactions = data.result.ledger.transactions;
            displayTransactions(transactions);
        } else {
            content.innerHTML = '<div class="loading-spinner">Ingen transaktioner fundet i denne blok.</div>';
        }
    } catch (error) {
        console.error('Fejl ved hentning af transaktioner:', error);
        content.innerHTML = '<div class="loading-spinner" style="color: #ff4444;">Fejl ved hentning af transaktioner.</div>';
    }
}

// Funktion til at vise transaktioner i panelet
function displayTransactions(transactions) {
    const content = document.getElementById('transaction-content');
    
    if (transactions.length === 0) {
        content.innerHTML = '<div class="loading-spinner">Ingen transaktioner i denne blok.</div>';
        return;
    }
    
    const transactionHTML = transactions.map(tx => {
        const txType = tx.TransactionType || 'Ukendt';
        const account = tx.Account || 'N/A';
        const destination = tx.Destination || 'N/A';
        const amount = tx.Amount || 'N/A';
        const fee = tx.Fee || 'N/A';
        const hash = tx.hash || 'N/A';
        
        // Formatér beløb
        let formattedAmount = 'N/A';
        if (amount && typeof amount === 'string') {
            formattedAmount = (parseInt(amount) / 1000000).toFixed(6) + ' XRP';
        } else if (amount && typeof amount === 'object') {
            formattedAmount = amount.value + ' ' + amount.currency;
        }
        
        // Formatér fee
        let formattedFee = 'N/A';
        if (fee && typeof fee === 'string') {
            formattedFee = (parseInt(fee) / 1000000).toFixed(6) + ' XRP';
        }
        
        return `
            <div class="transaction-item">
                <div class="transaction-hash">Hash: ${hash}</div>
                <div class="transaction-details">
                    <div>
                        <strong>Type:</strong> ${txType}<br>
                        <strong>Fra:</strong> ${account.substring(0, 20)}...<br>
                        <strong>Til:</strong> ${destination.substring(0, 20)}...
                    </div>
                    <div>
                        <div class="transaction-amount">${formattedAmount}</div>
                        <div class="transaction-fee">Fee: ${formattedFee}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    content.innerHTML = transactionHTML;
}

// Funktion til at lukke transaktionspanelet
function closeTransactionPanel() {
    const overlay = document.getElementById('transaction-overlay');
    overlay.style.display = 'none';
}

// Gør funktionen tilgængelig globalt
window.closeTransactionPanel = closeTransactionPanel;

// Luk transaktionspanel ved klik udenfor
document.getElementById('transaction-overlay').addEventListener('click', function(e) {
    if (e.target === this) {
        closeTransactionPanel();
    }
});

// Funktion til at vise validator info
function showValidatorInfo(validator) {
    const infoPanel = document.getElementById('validator-info');
    const nameElement = document.getElementById('validator-name');
    const locationElement = document.getElementById('validator-location');
    const pubkeyElement = document.getElementById('validator-pubkey');
    const statusElement = document.getElementById('validator-status');
    
    nameElement.textContent = validator.name;
    locationElement.textContent = `${validator.city}, ${validator.country}`;
    pubkeyElement.textContent = validator.pubkey.substring(0, 20) + '...';
    statusElement.textContent = 'Aktiv';
    statusElement.style.color = '#00ff88';
    
    infoPanel.style.display = 'block';
}

// Funktion til at lukke validator info
function closeValidatorInfo() {
    document.getElementById('validator-info').style.display = 'none';
}

// Gør funktionen tilgængelig globalt
window.closeValidatorInfo = closeValidatorInfo;

// Mouse/click events til validator markers
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
    // Beregn mouse position i normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Opdater raycaster
    raycaster.setFromCamera(mouse, camera);
    
    // Find intersections med validator markers
    const validatorObjects = Array.from(validatorMarkers.values());
    const intersects = raycaster.intersectObjects(validatorObjects);
    
    if (intersects.length > 0) {
        const clickedMarker = intersects[0].object;
        if (clickedMarker.userData && clickedMarker.userData.validator) {
            showValidatorInfo(clickedMarker.userData.validator);
        }
    }
}

// Tilføj event listener til click
window.addEventListener('click', onMouseClick);

// Start XRP Ledger forbindelse
connectToXRPLedger();

// Initialiser XRP validator network
initializeValidatorNetwork();

// Simuler regelmæssig validator aktivitet
setInterval(simulateValidatorActivity, 5000);

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

    // Animér validator markører med pulserende effekt
    validatorMarkers.forEach((marker, pubkey) => {
        if (marker.userData) {
            marker.userData.pulsePhase += 0.05;
            const scale = 1 + Math.sin(marker.userData.pulsePhase) * 0.1;
            marker.scale.setScalar(scale);
        }
    });

    renderer.render(scene, camera);
}
animate();
