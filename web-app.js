/* ============================================
   Web Version - USDT Payment (without Telegram)
   ============================================ */

// ============= CONFIGURATION =============
const USDT_CONTRACT_ADDRESS = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs'; // USDT on TON mainnet
const MANIFEST_URL = window.location.origin + '/ton-connect-manifest.json';

// ============= STATE =============
let tonConnectUI = null;
let connectedWallet = null;

// ============= INITIALIZATION =============
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Web App iniciando...');
    
    // Initialize TON Connect
    await initTonConnect();
    
    // Setup event listeners
    setupEventListeners();
    
    console.log('Web App inicializada correctamente');
});

// ============= TON CONNECT =============
async function initTonConnect() {
    try {
        tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
            manifestUrl: MANIFEST_URL,
            buttonRootId: 'ton-connect-button'
        });

        // Listen for wallet connection status changes
        tonConnectUI.onStatusChange(wallet => {
            if (wallet) {
                handleWalletConnected(wallet);
            } else {
                handleWalletDisconnected();
            }
        });

        // Check if already connected
        const currentWallet = tonConnectUI.wallet;
        if (currentWallet) {
            handleWalletConnected(currentWallet);
        }

        console.log('TON Connect inicializado');
    } catch (error) {
        console.error('Error inicializando TON Connect:', error);
        showStatus('Error al inicializar TON Connect: ' + error.message, 'error');
    }
}

function handleWalletConnected(wallet) {
    console.log('Wallet conectada:', wallet);
    connectedWallet = wallet;
    
    // Show wallet info
    const walletInfo = document.getElementById('wallet-info');
    const addressElement = document.getElementById('connected-address');
    
    const address = wallet.account.address;
    const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
    
    addressElement.textContent = shortAddress;
    addressElement.title = address;
    walletInfo.classList.remove('hidden');
    
    // Enable send button
    document.getElementById('send-usdt').disabled = false;
    
    showStatus('✅ Wallet conectada exitosamente', 'success');
}

function handleWalletDisconnected() {
    console.log('Wallet desconectada');
    connectedWallet = null;
    
    // Hide wallet info
    const walletInfo = document.getElementById('wallet-info');
    walletInfo.classList.add('hidden');
    
    // Disable send button
    document.getElementById('send-usdt').disabled = true;
    
    showStatus('Wallet desconectada', 'info');
}

// ============= EVENT LISTENERS =============
function setupEventListeners() {
    const sendBtn = document.getElementById('send-usdt');
    sendBtn.addEventListener('click', handleSendPayment);
}

// ============= PAYMENT LOGIC =============
async function handleSendPayment() {
    const destinationAddress = document.getElementById('destination-address').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    
    // Validation
    if (!destinationAddress) {
        showStatus('⚠️ Por favor ingresa una dirección de destino', 'warning');
        return;
    }
    
    if (!amount || amount <= 0) {
        showStatus('⚠️ Por favor ingresa una cantidad válida', 'warning');
        return;
    }
    
    if (!connectedWallet) {
        showStatus('⚠️ Por favor conecta tu wallet primero', 'warning');
        return;
    }
    
    // Validate TON address format
    if (!destinationAddress.startsWith('EQ') && !destinationAddress.startsWith('UQ')) {
        showStatus('⚠️ La dirección debe ser una dirección TON válida (empieza con EQ o UQ)', 'warning');
        return;
    }
    
    try {
        showLoading(true);
        showStatus(`Preparando transacción de ${amount} USDT...`, 'info');
        
        await sendUSDTTransaction(destinationAddress, amount);
        
    } catch (error) {
        console.error('Error en el pago:', error);
        showStatus('❌ Error: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function sendUSDTTransaction(toAddress, amount) {
    try {
        // Convert USDT amount to nano-units (USDT has 6 decimals on TON)
        const nanoAmount = Math.floor(amount * 1000000);
        
        // Create the jetton transfer body
        const body = createJettonTransferBody(toAddress, nanoAmount);
        
        // Transaction structure for TON Connect
        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 360, // Valid for 6 minutes
            messages: [
                {
                    address: USDT_CONTRACT_ADDRESS, // USDT contract
                    amount: '100000000', // 0.1 TON for gas fees
                    payload: body
                }
            ]
        };
        
        console.log('Enviando transacción:', transaction);
        
        // Send transaction
        const result = await tonConnectUI.sendTransaction(transaction);
        
        console.log('Transacción enviada:', result);
        
        showStatus(`✅ Transacción enviada exitosamente!\nHash: ${result.boc.slice(0, 20)}...`, 'success');
        
        alert('¡Transacción enviada exitosamente!');
        
    } catch (error) {
        console.error('Error enviando transacción:', error);
        
        if (error.message.includes('cancel')) {
            showStatus('❌ Transacción cancelada por el usuario', 'warning');
        } else {
            showStatus('❌ Error al enviar transacción: ' + error.message, 'error');
        }
        
        throw error;
    }
}

// Create jetton transfer body
function createJettonTransferBody(destinationAddress, amount) {
    // Simplified version - for production use proper TON libraries
    const transferPayload = {
        type: 'jetton-transfer',
        queryId: Date.now(),
        amount: amount.toString(),
        destination: destinationAddress,
        responseDestination: connectedWallet.account.address,
        forwardAmount: '1',
        forwardPayload: ''
    };
    
    return btoa(JSON.stringify(transferPayload));
}

// ============= UI HELPERS =============
function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (show) {
        overlay.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
    }
}

function showStatus(message, type = 'info') {
    const statusBox = document.getElementById('status');
    const statusContent = statusBox.querySelector('.status-content');
    
    statusContent.textContent = message;
    statusBox.className = `status-box ${type}`;
    statusBox.classList.remove('hidden');
    
    // Auto-hide after 5 seconds for success/info
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            statusBox.classList.add('hidden');
        }, 5000);
    }
}

console.log('Web App script cargado');
