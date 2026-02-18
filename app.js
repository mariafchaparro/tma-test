/* ============================================
   Telegram Mini App - USDT Payment Tests
   Uses @ton/ton via esm.sh for proper BOC construction
   ============================================ */

import { beginCell, Address, toNano } from 'https://esm.sh/@ton/ton@15?bundle';

// ============= CONFIGURATION =============
// USDT jetton master contract on TON mainnet
const USDT_CONTRACT_ADDRESS = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs';
const MANIFEST_URL = window.location.origin + '/ton-connect-manifest.json';

// USDT has 6 decimals on TON (not 9 like TON native)
const USDT_DECIMALS = 6;

// ============= STATE =============
let tonConnectUI = null;
let telegramWebApp = null;
let connectedWallet = null;

// ============= INITIALIZATION =============
document.addEventListener('DOMContentLoaded', async () => {
    console.log('App iniciando...');

    // Initialize Telegram WebApp
    initTelegramWebApp();

    // Initialize TON Connect
    await initTonConnect();

    // Setup event listeners
    setupEventListeners();

    console.log('App inicializada correctamente');
});

// ============= TELEGRAM WEBAPP =============
function initTelegramWebApp() {
    if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
        telegramWebApp = Telegram.WebApp;
        telegramWebApp.ready();
        telegramWebApp.expand();
        applyTelegramTheme();
        console.log('Telegram WebApp inicializado');
        console.log('User data:', telegramWebApp.initDataUnsafe.user);
    } else {
        console.warn('No se está ejecutando dentro de Telegram');
    }
}

function applyTelegramTheme() {
    if (!telegramWebApp) return;
    const params = telegramWebApp.themeParams;
    if (params.bg_color) document.documentElement.style.setProperty('--tg-bg-color', params.bg_color);
    if (params.text_color) document.documentElement.style.setProperty('--tg-text-color', params.text_color);
    if (params.button_color) document.documentElement.style.setProperty('--tg-button-color', params.button_color);
    if (params.button_text_color) document.documentElement.style.setProperty('--tg-button-text-color', params.button_text_color);
}

// ============= TON CONNECT =============
async function initTonConnect() {
    try {
        tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
            manifestUrl: MANIFEST_URL,
            buttonRootId: 'ton-connect-button'
        });

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

    const walletInfo = document.getElementById('wallet-info');
    const addressElement = document.getElementById('connected-address');
    const address = wallet.account.address;
    const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

    addressElement.textContent = shortAddress;
    addressElement.title = address;
    walletInfo.classList.remove('hidden');

    enablePaymentButtons();
    showStatus('✅ Wallet conectada exitosamente', 'success');
}

function handleWalletDisconnected() {
    console.log('Wallet desconectada');
    connectedWallet = null;

    document.getElementById('wallet-info').classList.add('hidden');
    disablePaymentButtons();
    showStatus('Wallet desconectada', 'info');
}

// ============= EVENT LISTENERS =============
function setupEventListeners() {
    document.getElementById('pay-telegram-wallet').addEventListener('click', () => handlePayment('usdt'));
    document.getElementById('pay-tonkeeper').addEventListener('click', () => handlePayment('ton'));
}

function enablePaymentButtons() {
    document.getElementById('pay-telegram-wallet').disabled = false;
    document.getElementById('pay-tonkeeper').disabled = false;
}

function disablePaymentButtons() {
    document.getElementById('pay-telegram-wallet').disabled = true;
    document.getElementById('pay-tonkeeper').disabled = true;
}

// ============= PAYMENT ROUTER =============
async function handlePayment(type) {
    const destinationAddress = document.getElementById('destination-address').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);

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
    if (!destinationAddress.startsWith('EQ') && !destinationAddress.startsWith('UQ')) {
        showStatus('⚠️ La dirección debe ser una dirección TON válida (empieza con EQ o UQ)', 'warning');
        return;
    }

    try {
        showLoading(true);
        if (type === 'ton') {
            showStatus(`Preparando envío de ${amount} TON...`, 'info');
            await sendTONTransaction(destinationAddress, amount);
        } else {
            showStatus(`Preparando envío de ${amount} USDT...`, 'info');
            await sendUSDTTransaction(destinationAddress, amount);
        }
    } catch (error) {
        console.error('Error en el pago:', error);
        // Error messages are already shown inside the send functions
    } finally {
        showLoading(false);
    }
}

// ============= SEND TON (nativo, sin payload) =============
async function sendTONTransaction(toAddress, amount) {
    try {
        // 1 TON = 1,000,000,000 nanotons
        const nanoAmount = String(Math.floor(amount * 1_000_000_000));

        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 360,
            messages: [
                {
                    address: toAddress,
                    amount: nanoAmount
                    // No payload needed for native TON transfer ✅
                }
            ]
        };

        console.log('Enviando TON:', transaction);
        const result = await tonConnectUI.sendTransaction(transaction);
        console.log('Resultado:', result);

        showStatus(`✅ ${amount} TON enviados exitosamente!\nBOC: ${result.boc.slice(0, 20)}...`, 'success');
        if (telegramWebApp) telegramWebApp.showAlert(`¡${amount} TON enviados exitosamente!`);

    } catch (error) {
        console.error('Error enviando TON:', error);
        const msg = error?.message || String(error);
        if (msg.toLowerCase().includes('cancel') || msg.toLowerCase().includes('reject')) {
            showStatus('❌ Transacción cancelada por el usuario', 'warning');
        } else {
            showStatus('❌ Error al enviar TON: ' + msg, 'error');
        }
        throw error;
    }
}

// ============= SEND USDT (jetton transfer con BOC correcto via @ton/ton) =============
async function sendUSDTTransaction(toAddress, amount) {
    try {
        // USDT tiene 6 decimales en TON
        const usdtNanoAmount = BigInt(Math.floor(amount * 10 ** USDT_DECIMALS));

        // Obtener la jetton wallet del usuario para el contrato USDT
        // El mensaje va al contrato USDT master, que redirige a la jetton wallet del usuario
        const senderAddress = connectedWallet.account.address;

        // Construir el payload de jetton transfer usando @ton/ton (TEP-74)
        // Ref: https://github.com/ton-blockchain/TEPs/blob/master/text/0074-jettons-standard.md
        const body = beginCell()
            .storeUint(0x0f8a7ea5, 32)          // op: jetton transfer
            .storeUint(BigInt(Date.now()), 64)   // query_id
            .storeCoins(usdtNanoAmount)           // amount en nano-USDT
            .storeAddress(Address.parse(toAddress))       // destination
            .storeAddress(Address.parse(senderAddress))   // response_destination (exceso de TON vuelve al sender)
            .storeBit(0)                          // custom_payload: none
            .storeCoins(toNano('0.000000001'))    // forward_ton_amount: 1 nanoton para notificación
            .storeBit(0)                          // forward_payload: none
            .endCell();

        // Convertir BOC a base64 para TON Connect
        const payloadBase64 = body.toBoc().toString('base64');

        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 360,
            messages: [
                {
                    address: USDT_CONTRACT_ADDRESS, // Contrato USDT master en TON
                    amount: '100000000',            // 0.1 TON para cubrir gas fees
                    payload: payloadBase64          // BOC correcto ✅
                }
            ]
        };

        console.log('Enviando USDT:', transaction);
        const result = await tonConnectUI.sendTransaction(transaction);
        console.log('Resultado:', result);

        showStatus(`✅ ${amount} USDT enviados exitosamente!\nBOC: ${result.boc.slice(0, 20)}...`, 'success');
        if (telegramWebApp) telegramWebApp.showAlert(`¡${amount} USDT enviados exitosamente!`);

    } catch (error) {
        console.error('Error enviando USDT:', error);
        const msg = error?.message || String(error);
        if (msg.toLowerCase().includes('cancel') || msg.toLowerCase().includes('reject')) {
            showStatus('❌ Transacción cancelada por el usuario', 'warning');
        } else {
            showStatus('❌ Error al enviar USDT: ' + msg, 'error');
        }
        throw error;
    }
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

    // Auto-hide after 5 seconds for success/info messages
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            statusBox.classList.add('hidden');
        }, 5000);
    }
}

function formatAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

console.log('App script cargado (ES module con @ton/ton)');
