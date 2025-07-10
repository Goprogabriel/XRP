// Main Application
import { SceneManager } from './js/scene.js';
import { ValidatorNetwork } from './js/validators.js';
import { TransactionVisualizer } from './js/transactions.js';
import { XRPLedgerManager } from './js/xrp-ledger.js';
import { UIManager } from './js/ui.js';

class XRPVisualizationApp {
    constructor() {
        this.init();
    }
    
    init() {
        // Initialiser scene
        this.sceneManager = new SceneManager();
        
        // Initialiser validator network
        this.validatorNetwork = new ValidatorNetwork(this.sceneManager.earth);
        this.validatorNetwork.initializeValidatorNetwork();
        
        // Initialiser transaction visualizer
        this.transactionVisualizer = new TransactionVisualizer(this.sceneManager.earth);
        
        // Initialiser XRP Ledger manager
        this.xrpLedgerManager = new XRPLedgerManager(
            this.transactionVisualizer, 
            this.validatorNetwork
        );
        
        // Initialiser UI manager
        this.uiManager = new UIManager(this.validatorNetwork);
        
        // Show welcome notification
        setTimeout(() => {
            this.uiManager.showNotification('XRP Ledger Visualization startet', 'success');
        }, 1000);
        
        // Gør camera tilgængelig globalt for UI events
        window.camera = this.sceneManager.camera;
        
        // Gør app tilgængelig globalt for UI callbacks
        window.xrpApp = this;
        
        // Start forbindelse til XRP Ledger
        this.xrpLedgerManager.connectToXRPLedger();
        
        // Update connection status in UI
        this.uiManager.updateConnectionStatus(false);
        
        // Simulate connection success after delay
        setTimeout(() => {
            this.uiManager.updateConnectionStatus(true);
            this.uiManager.showNotification('Forbundet til XRP Ledger', 'success');
        }, 3000);
        
        // Start regelmæssige opdateringer
        this.startRegularUpdates();
        
        // Start animation loop
        this.animate();
    }
    
    startRegularUpdates() {
        // Simuler regelmæssig validator aktivitet
        setInterval(() => {
            this.validatorNetwork.simulateValidatorActivity();
        }, 5000);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Render scene
        this.sceneManager.render();
        
        // Animér validators
        this.validatorNetwork.animateValidators();
        
        // Opdater animerede transaktioner
        this.transactionVisualizer.updateMovingDots();
        
        // Ryd gamle transaktioner
        this.transactionVisualizer.cleanupOldTransactionBeams();
        
        // Opdater transaktionsstatistikker
        this.transactionVisualizer.updateTransactionStats();
    }
    
    // Metoder til at eksponere funktionalitet til UI
    showTransactions(ledgerIndex) {
        this.xrpLedgerManager.showTransactions(ledgerIndex);
    }
    
    closeTransactionPanel() {
        this.uiManager.closeTransactionPanel();
    }
    
    closeValidatorInfo() {
        this.uiManager.closeValidatorInfo();
    }
}

// Gør funktioner tilgængelige globalt for HTML callbacks
window.closeTransactionPanel = () => window.xrpApp.closeTransactionPanel();
window.closeValidatorInfo = () => window.xrpApp.closeValidatorInfo();

// Start applikationen når DOM er klar
document.addEventListener('DOMContentLoaded', () => {
    new XRPVisualizationApp();
});
