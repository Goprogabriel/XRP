// Modern UI Event Handling
export class UIManager {
    constructor(validatorNetwork) {
        this.validatorNetwork = validatorNetwork;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.setupEventListeners();
        this.setupModernInteractions();
    }
    
    setupEventListeners() {
        // Mouse/click events til validator markers
        window.addEventListener('click', (event) => this.onMouseClick(event));
        
        // Hover effects for 3D objects
        window.addEventListener('mousemove', (event) => this.onMouseMove(event));
        
        // Luk transaktionspanel ved klik udenfor
        document.getElementById('transaction-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeTransactionPanel();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        
        // Window resize handler
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupModernInteractions() {
        // Add pulse effect to connection status
        this.animateConnectionStatus();
        
        // Add smooth transitions to panels
        this.addPanelTransitions();
        
        // Setup modern loading states
        this.setupLoadingStates();
    }

    animateConnectionStatus() {
        const statusEl = document.getElementById('connection-status');
        if (statusEl) {
            statusEl.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        }
    }

    addPanelTransitions() {
        const panels = ['ledger-info', 'validator-info', 'legend'];
        panels.forEach(panelId => {
            const panel = document.getElementById(panelId);
            if (panel) {
                panel.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
            }
        });
    }

    setupLoadingStates() {
        // Add shimmer effect to loading elements
        const style = document.createElement('style');
        style.textContent = `
            .shimmer {
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
            }
            @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
        `;
        document.head.appendChild(style);
    }

    onKeyDown(event) {
        // ESC key to close panels
        if (event.key === 'Escape') {
            this.closeTransactionPanel();
            this.closeValidatorInfo();
        }
        
        // Space to toggle legend visibility
        if (event.key === ' ') {
            event.preventDefault();
            this.toggleLegend();
        }
    }

    onWindowResize() {
        // Handle responsive adjustments
        const isMobile = window.innerWidth <= 768;
        const panels = document.querySelectorAll('.glass-panel');
        
        panels.forEach(panel => {
            if (isMobile) {
                panel.style.transform = 'scale(0.9)';
            } else {
                panel.style.transform = 'scale(1)';
            }
        });
    }

    onMouseMove(event) {
        // Update mouse position for raycasting
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Add subtle hover effects
        this.updateHoverEffects();
    }

    updateHoverEffects() {
        if (!window.camera) return;
        
        this.raycaster.setFromCamera(this.mouse, window.camera);
        const validatorObjects = this.validatorNetwork.getValidatorMarkers();
        const intersects = this.raycaster.intersectObjects(validatorObjects);
        
        // Reset all hover states
        validatorObjects.forEach(obj => {
            if (obj.material) {
                obj.material.emissive.setHex(0x000000);
            }
        });
        
        // Apply hover effect to intersected object
        if (intersects.length > 0) {
            const hoveredObject = intersects[0].object;
            if (hoveredObject.material) {
                hoveredObject.material.emissive.setHex(0x004400);
            }
            document.body.style.cursor = 'pointer';
        } else {
            document.body.style.cursor = 'default';
        }
    }
    
    onMouseClick(event) {
        // Beregn mouse position i normalized device coordinates
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Opdater raycaster
        this.raycaster.setFromCamera(this.mouse, window.camera);
        
        // Find intersections med validator markers
        const validatorObjects = this.validatorNetwork.getValidatorMarkers();
        const intersects = this.raycaster.intersectObjects(validatorObjects);
        
        if (intersects.length > 0) {
            const clickedMarker = intersects[0].object;
            if (clickedMarker.userData && clickedMarker.userData.validator) {
                this.showValidatorInfo(clickedMarker.userData.validator);
                this.addClickRipple(event);
            }
        }
    }

    addClickRipple(event) {
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: rgba(0, 255, 136, 0.6);
            pointer-events: none;
            z-index: 9999;
            transform: translate(-50%, -50%);
            left: ${event.clientX}px;
            top: ${event.clientY}px;
            animation: ripple 0.6s ease-out;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(ripple);
        setTimeout(() => {
            ripple.remove();
            style.remove();
        }, 600);
    }
    
    // Vis validator info med moderne animation
    showValidatorInfo(validator) {
        const infoPanel = document.getElementById('validator-info');
        const nameElement = document.getElementById('validator-name');
        const locationElement = document.getElementById('validator-location');
        const pubkeyElement = document.getElementById('validator-pubkey');
        const statusElement = document.getElementById('validator-status');
        
        // Add loading state
        this.setValidatorLoading(true);
        
        // Simulate data loading delay for smooth UX
        setTimeout(() => {
            nameElement.textContent = validator.name;
            locationElement.textContent = `${validator.city}, ${validator.country}`;
            pubkeyElement.textContent = validator.pubkey.substring(0, 20) + '...';
            statusElement.textContent = 'Aktiv';
            statusElement.style.color = 'var(--primary-color)';
            
            this.setValidatorLoading(false);
            infoPanel.style.display = 'block';
            
            // Add success animation
            infoPanel.classList.add('glow-effect');
            setTimeout(() => infoPanel.classList.remove('glow-effect'), 2000);
        }, 200);
    }

    setValidatorLoading(isLoading) {
        const details = document.getElementById('validator-details');
        if (isLoading) {
            details.classList.add('shimmer');
        } else {
            details.classList.remove('shimmer');
        }
    }

    toggleLegend() {
        const legend = document.getElementById('legend');
        if (legend.style.display === 'none') {
            legend.style.display = 'block';
            legend.style.animation = 'slideInUp 0.5s ease';
        } else {
            legend.style.animation = 'slideOutDown 0.5s ease';
            setTimeout(() => legend.style.display = 'none', 500);
        }
    }
    
    // Luk validator info med animation
    closeValidatorInfo() {
        const infoPanel = document.getElementById('validator-info');
        infoPanel.style.animation = 'slideOutLeft 0.3s ease';
        setTimeout(() => {
            infoPanel.style.display = 'none';
            infoPanel.style.animation = '';
        }, 300);
    }
    
    // Luk transaktionspanel med animation
    closeTransactionPanel() {
        const overlay = document.getElementById('transaction-overlay');
        const panel = document.getElementById('transaction-panel');
        
        panel.style.animation = 'slideOutScale 0.3s ease';
        overlay.style.animation = 'fadeOut 0.3s ease';
        
        setTimeout(() => {
            overlay.style.display = 'none';
            panel.style.animation = '';
            overlay.style.animation = '';
        }, 300);
    }

    // Update connection status with modern styling
    updateConnectionStatus(isConnected) {
        const statusEl = document.getElementById('connection-status');
        if (isConnected) {
            statusEl.className = 'connection-status connected';
            statusEl.innerHTML = '<span>Forbundet til XRP Ledger</span>';
        } else {
            statusEl.className = 'connection-status disconnected';
            statusEl.innerHTML = '<span>Forbinder til XRP Ledger...</span>';
        }
    }

    // Modern notification system
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 24px;
            right: 24px;
            padding: 16px 24px;
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border-radius: 12px;
            border: 1px solid var(--glass-border);
            color: var(--text-primary);
            font-size: 14px;
            font-weight: 500;
            z-index: 1001;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;
        
        const colors = {
            info: 'var(--secondary-color)',
            success: 'var(--primary-color)',
            warning: 'var(--warning-color)',
            error: 'var(--error-color)'
        };
        
        notification.style.borderColor = colors[type];
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 8px; height: 8px; border-radius: 50%; background: ${colors[type]}; animation: pulse 2s infinite;"></div>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}
