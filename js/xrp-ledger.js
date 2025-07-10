// XRP Ledger Integration
export class XRPLedgerManager {
    constructor(transactionVisualizer, validatorNetwork) {
        this.transactionVisualizer = transactionVisualizer;
        this.validatorNetwork = validatorNetwork;
        this.ws = null;
        this.recentBlocks = [];
        this.maxBlocks = 10;
    }
    
    connectToXRPLedger() {
        const connectionStatus = document.getElementById('connection-status');
        
        // Forbind til XRP Ledger WebSocket
        this.ws = new WebSocket('wss://xrplcluster.com');
        
        this.ws.onopen = () => {
            console.log('Forbundet til XRP Ledger');
            connectionStatus.innerHTML = '<span>Forbundet til XRP Ledger</span>';
            connectionStatus.className = 'connection-status connected';
            
            // Show success notification if UI manager is available
            if (window.xrpApp && window.xrpApp.uiManager) {
                window.xrpApp.uiManager.showNotification('Forbundet til XRP Ledger', 'success');
            }
            
            // Lyt efter nye ledger lukninger
            const subscribeMessage = {
                "command": "subscribe",
                "streams": ["ledger"]
            };
            this.ws.send(JSON.stringify(subscribeMessage));
        };
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === 'ledgerClosed') {
                this.addNewBlock(data);
            }
        };
        
        this.ws.onclose = () => {
            console.log('Forbindelse til XRP Ledger lukket');
            connectionStatus.innerHTML = '<span>Forbindelse afbrudt</span>';
            connectionStatus.className = 'connection-status disconnected';
            
            // Show error notification if UI manager is available
            if (window.xrpApp && window.xrpApp.uiManager) {
                window.xrpApp.uiManager.showNotification('Forbindelse afbrudt', 'error');
            }
            
            // Prøv at forbinde igen efter 3 sekunder
            setTimeout(() => this.connectToXRPLedger(), 3000);
        };
        
        this.ws.onerror = (error) => {
            console.error('XRP Ledger WebSocket fejl:', error);
            if (window.xrpApp && window.xrpApp.uiManager) {
                window.xrpApp.uiManager.showNotification('Forbindelsesfejl', 'error');
            }
        };
    }
    
    addNewBlock(ledgerData) {
        const block = {
            ledgerIndex: ledgerData.ledger_index,
            ledgerHash: ledgerData.ledger_hash,
            timestamp: new Date().toLocaleTimeString(),
            txnCount: ledgerData.txn_count || 0
        };
        
        // Tilføj til begyndelsen af listen
        this.recentBlocks.unshift(block);
        
        // Behold kun de seneste 10 blokke
        if (this.recentBlocks.length > this.maxBlocks) {
            this.recentBlocks = this.recentBlocks.slice(0, this.maxBlocks);
        }
        
        // Simuler validator aktivitet når ny blok kommer
        this.validatorNetwork.simulateValidatorActivity();
        
        // Automatisk hent og vis transaktioner på globussen
        this.fetchAndVisualizeTransactions(ledgerData.ledger_index);
        
        this.updateBlockDisplay();
    }
    
    // Hent og visualiser transaktioner automatisk
    async fetchAndVisualizeTransactions(ledgerIndex) {
        try {
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
                
                // Vis transaktioner på globussen
                this.transactionVisualizer.visualizeTransactionsOnGlobe(transactions);
                
                console.log(`Visualiseret ${transactions.length} transaktioner fra blok #${ledgerIndex}`);
            }
        } catch (error) {
            console.error('Fejl ved hentning af transaktioner for visualisering:', error);
        }
    }
    
    updateBlockDisplay() {
        const ledgerBlocks = document.getElementById('ledger-blocks');
        
        if (this.recentBlocks.length === 0) {
            ledgerBlocks.innerHTML = '<div class="ledger-block"><div class="block-number">Venter på data...</div><div class="block-time">Indlæser...</div></div>';
            return;
        }
        
        ledgerBlocks.innerHTML = this.recentBlocks.map((block, index) => {
            const isLatest = index === 0;
            const glowClass = isLatest ? 'glow-effect' : '';
            
            return `
                <div class="ledger-block ${glowClass}" onclick="window.xrpApp.showTransactions(${block.ledgerIndex})" style="animation-delay: ${index * 0.1}s;">
                    <div class="block-number">#${block.ledgerIndex}</div>
                    <div class="block-time">${block.timestamp} • ${block.txnCount} txn</div>
                </div>
            `;
        }).join('');
        
        // Add shimmer effect to latest block
        if (this.recentBlocks.length > 0) {
            setTimeout(() => {
                const latestBlock = ledgerBlocks.querySelector('.ledger-block');
                if (latestBlock) {
                    latestBlock.classList.remove('glow-effect');
                }
            }, 2000);
        }
    }
    
    // Vis transaktioner for en specifik blok
    async showTransactions(ledgerIndex) {
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
                this.displayTransactions(transactions);
                
                // Vis også transaktioner på globussen
                this.transactionVisualizer.visualizeTransactionsOnGlobe(transactions);
            } else {
                content.innerHTML = '<div class="loading-spinner">Ingen transaktioner fundet i denne blok.</div>';
            }
        } catch (error) {
            console.error('Fejl ved hentning af transaktioner:', error);
            content.innerHTML = '<div class="loading-spinner" style="color: #ff4444;">Fejl ved hentning af transaktioner.</div>';
        }
    }
    
    // Vis transaktioner i panelet
    displayTransactions(transactions) {
        const content = document.getElementById('transaction-content');
        
        if (transactions.length === 0) {
            content.innerHTML = '<div class="loading-spinner">Ingen transaktioner i denne blok.</div>';
            return;
        }
        
        const transactionHTML = transactions.map((tx, index) => {
            const txType = tx.TransactionType || 'Ukendt';
            const account = tx.Account || 'N/A';
            const destination = tx.Destination || 'N/A';
            const amount = tx.Amount || 'N/A';
            const fee = tx.Fee || 'N/A';
            const hash = tx.hash || 'N/A';
            
            // Formatér beløb
            let formattedAmount = 'N/A';
            let amountColor = 'var(--primary-color)';
            if (amount && typeof amount === 'string') {
                const xrpAmount = parseInt(amount) / 1000000;
                formattedAmount = xrpAmount.toFixed(6) + ' XRP';
                
                // Color based on amount
                if (xrpAmount > 10000) {
                    amountColor = 'var(--accent-color)';
                } else if (xrpAmount > 1000) {
                    amountColor = 'var(--warning-color)';
                }
            } else if (amount && typeof amount === 'object') {
                formattedAmount = amount.value + ' ' + amount.currency;
                amountColor = 'var(--secondary-color)';
            }
            
            // Formatér fee
            let formattedFee = 'N/A';
            if (fee && typeof fee === 'string') {
                formattedFee = (parseInt(fee) / 1000000).toFixed(6) + ' XRP';
            }
            
            // Get transaction type emoji
            const typeEmoji = {
                'Payment': '💸',
                'OfferCreate': '🏪',
                'OfferCancel': '❌',
                'TrustSet': '🤝',
                'AccountSet': '⚙️',
                'SetRegularKey': '🔑',
                'SignerListSet': '📝'
            }[txType] || '📋';
            
            return `
                <div class="transaction-item" style="animation-delay: ${index * 0.1}s;">
                    <div class="transaction-hash">${hash}</div>
                    <div class="transaction-details">
                        <div>
                            <div style="margin-bottom: 8px;"><strong>${typeEmoji} Type:</strong> ${txType}</div>
                            <div style="margin-bottom: 4px;"><strong>📤 Fra:</strong> <span class="tooltip" data-tooltip="${account}">${account.substring(0, 20)}...</span></div>
                            <div><strong>📥 Til:</strong> <span class="tooltip" data-tooltip="${destination}">${destination.substring(0, 20)}...</span></div>
                        </div>
                        <div style="text-align: right;">
                            <div class="transaction-amount" style="color: ${amountColor};">${formattedAmount}</div>
                            <div class="transaction-fee">Fee: ${formattedFee}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        content.innerHTML = transactionHTML;
        
        // Add entrance animation
        setTimeout(() => {
            const items = content.querySelectorAll('.transaction-item');
            items.forEach((item, index) => {
                setTimeout(() => {
                    item.style.animation = 'slideInUp 0.5s ease forwards';
                }, index * 100);
            });
        }, 100);
    }
}
