import { xrpValidatorNodes, latLongToVector3 } from './data.js';

// Validator Network Manager
export class ValidatorNetwork {
    constructor(earth) {
        this.earth = earth;
        this.validatorMarkers = new Map();
        this.validatorConnections = [];
    }
    
    // Tilføj XRP validator marker
    addValidatorMarker(validator) {
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
        
        this.earth.add(marker);
        this.validatorMarkers.set(validator.pubkey, marker);
        
        // Tilføj tekst label
        this.addValidatorLabel(validator, marker);
        
        return marker;
    }
    
    addValidatorLabel(validator, marker) {
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
        
        // Tilføj label til marker's userData så det kan roteres med jorden
        marker.userData.label = label;
        this.earth.add(label);
    }
    
    // Vis forbindelser mellem validators
    createValidatorConnection(validator1, validator2) {
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
        
        this.earth.add(connection);
        this.validatorConnections.push(connection);
        
        return connection;
    }
    
    // Initialiser XRP validator network
    initializeValidatorNetwork() {
        // Tilføj alle validator markører
        xrpValidatorNodes.forEach(validator => {
            this.addValidatorMarker(validator);
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
                    this.createValidatorConnection(xrpValidatorNodes[i], xrpValidatorNodes[j]);
                }
            }
        }
    }
    
    // Simuler validator aktivitet
    simulateValidatorActivity() {
        // Vælg tilfældige validators til aktivitet
        const activeValidators = xrpValidatorNodes.filter(() => Math.random() < 0.3);
        
        activeValidators.forEach(validator => {
            const marker = this.validatorMarkers.get(validator.pubkey);
            if (marker) {
                // Skab pulserende lys effekt
                marker.material.emissiveIntensity = 0.8;
                setTimeout(() => {
                    marker.material.emissiveIntensity = 0.3;
                }, 500);
            }
        });
    }
    
    // Animér validator markører
    animateValidators() {
        this.validatorMarkers.forEach((marker, pubkey) => {
            if (marker.userData) {
                marker.userData.pulsePhase += 0.05;
                const scale = 1 + Math.sin(marker.userData.pulsePhase) * 0.1;
                marker.scale.setScalar(scale);
            }
        });
    }
    
    // Få validator markers for raycasting
    getValidatorMarkers() {
        return Array.from(this.validatorMarkers.values());
    }
}
