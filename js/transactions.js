import { sampleAddressLocations, latLongToVector3 } from './data.js';

// Transaction Visualization Manager
export class TransactionVisualizer {
    constructor(earth) {
        this.earth = earth;
        this.transactionBeams = [];
        this.addressToLocation = new Map();
    }
    
    // Funktion til at få geografisk position for en adresse
    getLocationForAddress(address) {
        // Tjek om vi allerede har en lokation for denne adresse
        if (this.addressToLocation.has(address)) {
            return this.addressToLocation.get(address);
        }
        
        // Tildel en tilfældig lokation fra vores sample locations
        const randomLocation = sampleAddressLocations[Math.floor(Math.random() * sampleAddressLocations.length)];
        this.addressToLocation.set(address, randomLocation);
        return randomLocation;
    }
    
    // Skab animeret transaktionsstrøm mellem to punkter
    createTransactionBeam(fromAddress, toAddress, amount, txHash) {
        const fromLocation = this.getLocationForAddress(fromAddress);
        const toLocation = this.getLocationForAddress(toAddress);
        
        const startPos = latLongToVector3(fromLocation.lat, fromLocation.lon);
        const endPos = latLongToVector3(toLocation.lat, toLocation.lon);
        
        // Beregn arc højde baseret på distance
        const distance = startPos.distanceTo(endPos);
        const arcHeight = Math.min(distance * 0.4, 3.0);
        
        const midPos = startPos.clone().add(endPos).multiplyScalar(0.5);
        midPos.normalize().multiplyScalar(5 + arcHeight);
        
        // Skab curve
        const curve = new THREE.QuadraticBezierCurve3(startPos, midPos, endPos);
        const points = curve.getPoints(50);
        
        // Skab linje geometri
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        // Vælg farve baseret på beløb
        let color = 0x00ff88; // Grøn for normale beløb
        if (amount > 1000000) { // Hvis over 1 million drops (1000 XRP)
            color = 0xffaa00; // Orange for store beløb
        }
        if (amount > 10000000) { // Hvis over 10 million drops (10,000 XRP)
            color = 0xff0088; // Pink for meget store beløb
        }
        
        const material = new THREE.LineBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.3
        });
        
        const beam = new THREE.Line(geometry, material);
        
        // Tilføj metadata
        beam.userData = {
            fromAddress,
            toAddress,
            amount,
            txHash,
            startTime: Date.now(),
            duration: 3000, // 3 sekunder
            isTransactionBeam: true
        };
        
        this.earth.add(beam);
        this.transactionBeams.push(beam);
        
        // Skab pulserende markører på start og slut punkter
        this.createTransactionMarker(startPos, 0xff0000, 1000); // Rød sender
        this.createTransactionMarker(endPos, 0x00ff00, 1000);   // Grøn modtager
        
        // Skab animeret prik der glider langs stien
        this.createMovingTransactionDot(curve, color, amount, 3000);
        
        return beam;
    }
    
    // Skab kortvarige markører for transaktionspunkter
    createTransactionMarker(position, color, duration) {
        const geometry = new THREE.SphereGeometry(0.08, 8, 8);
        const material = new THREE.MeshBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.8
        });
        const marker = new THREE.Mesh(geometry, material);
        marker.position.copy(position);
        
        marker.userData = {
            startTime: Date.now(),
            duration: duration,
            isTemporaryMarker: true,
            originalOpacity: 0.8
        };
        
        this.earth.add(marker);
        this.transactionBeams.push(marker);
    }
    
    // Skab animeret prik der glider langs transaktionsstien
    createMovingTransactionDot(curve, color, amount, duration) {
        // Skab prikken - størrelse baseret på beløb
        let dotSize = 0.05;
        if (amount > 1000000) dotSize = 0.08;   // Større for store beløb
        if (amount > 10000000) dotSize = 0.12;  // Endnu større for meget store beløb
        
        const dotGeometry = new THREE.SphereGeometry(dotSize, 8, 8);
        const dotMaterial = new THREE.MeshBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: 1.0
        });
        
        const dot = new THREE.Mesh(dotGeometry, dotMaterial);
        
        // Tilføj glød effekt til prikken
        const glowGeometry = new THREE.SphereGeometry(dotSize * 1.5, 8, 8);
        const glowMaterial = new THREE.MeshBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.3
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        dot.add(glow);
        
        // Tilføj metadata til prikken
        dot.userData = {
            curve: curve,
            startTime: Date.now(),
            duration: duration,
            isMovingDot: true,
            originalColor: color,
            amount: amount,
            glow: glow
        };
        
        this.earth.add(dot);
        this.transactionBeams.push(dot);
        
        return dot;
    }
    
    // Opdater animerede prikker
    updateMovingDots() {
        const now = Date.now();
        
        this.transactionBeams.forEach(beam => {
            if (beam.userData && beam.userData.isMovingDot) {
                const elapsed = now - beam.userData.startTime;
                const progress = Math.min(elapsed / beam.userData.duration, 1.0);
                
                // Få position på kurven (0 til 1)
                const position = beam.userData.curve.getPoint(progress);
                beam.position.copy(position);
                
                // Tilføj glød effekt når prikken bevæger sig
                const pulseSpeed = 8; // Hastighed af pulsering
                const glowIntensity = Math.sin(progress * Math.PI * pulseSpeed) * 0.3 + 0.7;
                beam.material.opacity = glowIntensity;
                
                // Animér gløden hvis den findes
                if (beam.userData.glow) {
                    beam.userData.glow.material.opacity = glowIntensity * 0.5;
                    beam.userData.glow.scale.setScalar(1 + Math.sin(elapsed * 0.01) * 0.2);
                }
                
                // Skab lille "hale" effekt ved at skalere prikken
                const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.15;
                beam.scale.setScalar(scale);
                
                // Tilføj rotationseffekt for større transaktioner
                if (beam.userData.amount > 5000000) {
                    beam.rotation.y += 0.1;
                    beam.rotation.x += 0.05;
                }
            }
        });
    }
    
    // Vis transaktioner fra en blok på globussen
    visualizeTransactionsOnGlobe(transactions) {
        transactions.forEach(tx => {
            if (tx.Account && tx.Destination && tx.Amount) {
                // Kun vis Payment transaktioner
                if (tx.TransactionType === 'Payment') {
                    let amount = 0;
                    if (typeof tx.Amount === 'string') {
                        amount = parseInt(tx.Amount); // Amount i drops
                    } else if (tx.Amount && tx.Amount.value) {
                        amount = parseFloat(tx.Amount.value) * 1000000; // Konverter til drops
                    }
                    
                    // Kun vis transaktioner over 1 XRP (1 million drops)
                    if (amount >= 1000000) {
                        this.createTransactionBeam(tx.Account, tx.Destination, amount, tx.hash);
                    }
                }
            }
        });
    }
    
    // Ryd gamle transaktionsstrøm
    cleanupOldTransactionBeams() {
        const now = Date.now();
        
        for (let i = this.transactionBeams.length - 1; i >= 0; i--) {
            const beam = this.transactionBeams[i];
            
            if (beam.userData && beam.userData.startTime) {
                const age = now - beam.userData.startTime;
                
                // Håndter forskellige typer af objekter
                if (beam.userData.isMovingDot) {
                    // For animerede prikker - fjern når animationen er færdig
                    if (age > beam.userData.duration) {
                        this.earth.remove(beam);
                        this.transactionBeams.splice(i, 1);
                        
                        // Dispose geometry og material
                        if (beam.geometry) beam.geometry.dispose();
                        if (beam.material) beam.material.dispose();
                    }
                } else {
                    // For statiske beams og markører - fade out effekt
                    if (age > beam.userData.duration * 0.7) {
                        const fadeProgress = (age - beam.userData.duration * 0.7) / (beam.userData.duration * 0.3);
                        const newOpacity = Math.max(0, 1 - fadeProgress);
                        
                        if (beam.material) {
                            beam.material.opacity = newOpacity;
                        }
                    }
                    
                    // Fjern når tiden er udløbet
                    if (age > beam.userData.duration) {
                        this.earth.remove(beam);
                        this.transactionBeams.splice(i, 1);
                        
                        // Dispose geometry og material
                        if (beam.geometry) beam.geometry.dispose();
                        if (beam.material) beam.material.dispose();
                    }
                }
            }
        }
    }
    
    // Opdater transaktionsstatistikker i UI
    updateTransactionStats() {
        const activeTransactions = this.transactionBeams.filter(beam => 
            beam.userData && beam.userData.isTransactionBeam
        ).length;
        
        const activeMovingDots = this.transactionBeams.filter(beam => 
            beam.userData && beam.userData.isMovingDot
        ).length;
        
        const statsElement = document.getElementById('active-transactions');
        if (statsElement) {
            statsElement.textContent = `${activeTransactions} linjer, ${activeMovingDots} aktive`;
        }
    }
}
