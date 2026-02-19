/* ============================================
   Telegram Mini App - USDT Payment Tests
   BOC construido manualmente (sin dependencias externas)
   Compatible con Telegram Mini App y navegador web
   ============================================ */

// ============= CONFIGURATION =============
// USDT jetton master contract on TON mainnet
const USDT_CONTRACT_ADDRESS = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs';
const MANIFEST_URL = window.location.origin + '/ton-connect-manifest.json';
const USDT_DECIMALS = 6; // USDT tiene 6 decimales en TON

// ============= STATE =============
let tonConnectUI = null;
let telegramWebApp = null;
let connectedWallet = null;

// ============= INITIALIZATION =============
document.addEventListener('DOMContentLoaded', async () => {
    console.log('App iniciando...');
    initTelegramWebApp();
    await initTonConnect();
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

        const currentWallet = tonConnectUI.wallet;
        if (currentWallet) handleWalletConnected(currentWallet);

        console.log('TON Connect inicializado');
    } catch (error) {
        console.error('Error inicializando TON Connect:', error);
        showStatus('Error al inicializar TON Connect: ' + error.message, 'error');
    }
}

function handleWalletConnected(wallet) {
    connectedWallet = wallet;
    const walletInfo = document.getElementById('wallet-info');
    const addressElement = document.getElementById('connected-address');
    const address = wallet.account.address;
    addressElement.textContent = `${address.slice(0, 6)}...${address.slice(-4)}`;
    addressElement.title = address;
    walletInfo.classList.remove('hidden');
    enablePaymentButtons();
    showStatus('✅ Wallet conectada exitosamente', 'success');
}

function handleWalletDisconnected() {
    connectedWallet = null;
    document.getElementById('wallet-info').classList.add('hidden');
    disablePaymentButtons();
    showStatus('Wallet desconectada', 'info');
}

// ============= EVENT LISTENERS =============
function setupEventListeners() {
    document.getElementById('pay-btn').addEventListener('click', () => handlePayment());
}

function enablePaymentButtons() {
    document.getElementById('pay-btn').disabled = false;
}

function disablePaymentButtons() {
    document.getElementById('pay-btn').disabled = true;
}

// ============= PAYMENT ROUTER =============
async function handlePayment() {
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
        showStatus(`Preparando envío de ${amount} USDT...`, 'info');
        await sendUSDTTransaction(destinationAddress, amount);
    } catch (error) {
        console.error('Error en el pago:', error);
    } finally {
        showLoading(false);
    }
}

// ============= SEND USDT (jetton transfer - TEP-74) =============
async function sendUSDTTransaction(toAddress, amount) {
    try {
        // USDT tiene 6 decimales
        const usdtAmount = BigInt(Math.round(amount * 10 ** USDT_DECIMALS));

        // Construir el payload BOC del jetton transfer manualmente
        // Siguiendo el estándar TEP-74: https://github.com/ton-blockchain/TEPs/blob/master/text/0074-jettons-standard.md
        const payloadBase64 = buildJettonTransferBOC(toAddress, usdtAmount);

        // El mensaje va al contrato USDT master (que lo redirige a tu jetton wallet)
        // Se necesita TON para el gas (~0.05-0.1 TON)
        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 360,
            messages: [
                {
                    address: USDT_CONTRACT_ADDRESS,
                    amount: '50000000',    // 0.05 TON para gas (en nanotons)
                    payload: payloadBase64 // BOC del jetton transfer
                }
            ]
        };

        console.log('Enviando USDT:', { toAddress, amount, usdtAmount: usdtAmount.toString() });
        const result = await tonConnectUI.sendTransaction(transaction);
        console.log('Resultado:', result);

        showStatus(`✅ ${amount} USDT enviados exitosamente!`, 'success');
        if (telegramWebApp) telegramWebApp.showAlert(`¡${amount} USDT enviados exitosamente!`);

    } catch (error) {
        console.error('Error enviando USDT:', error);
        const msg = error?.message || String(error);
        if (msg.toLowerCase().includes('cancel') || msg.toLowerCase().includes('reject') || msg.toLowerCase().includes('declined')) {
            showStatus('❌ Transacción cancelada por el usuario', 'warning');
        } else {
            showStatus('❌ Error al enviar USDT: ' + msg, 'error');
        }
        throw error;
    }
}

// ============= BOC BUILDER (TEP-74 Jetton Transfer) =============
// Construye el payload BOC correcto para transferencia de jetton
// sin depender de librerías externas.
// Ref: https://docs.ton.org/develop/dapps/asset-processing/jettons
function buildJettonTransferBOC(destinationAddress, amount) {
    // Decodificar la dirección TON (formato base64url friendly)
    const destAddrBytes = decodeTONAddress(destinationAddress);
    const senderAddrBytes = decodeTONAddress(connectedWallet.account.address);

    // Construir el mensaje TL-B para jetton transfer
    // op(32) | query_id(64) | amount(var) | dest(addr) | resp_dest(addr) | custom_payload(1) | fwd_ton(var) | fwd_payload(1)
    const writer = new BitWriter();

    // op: 0x0f8a7ea5 (jetton transfer)
    writer.writeUint32(0x0f8a7ea5);

    // query_id: 64 bits
    writer.writeUint64(BigInt(Date.now()));

    // amount: VarUInteger 16 (coins)
    writer.writeCoins(amount);

    // destination address
    writer.writeAddress(destAddrBytes.workchain, destAddrBytes.hash);

    // response_destination (exceso de TON vuelve al sender)
    writer.writeAddress(senderAddrBytes.workchain, senderAddrBytes.hash);

    // custom_payload: Maybe bit = 0 (none)
    writer.writeBit(0);

    // forward_ton_amount: 1 nanoton (para notificación al destino)
    writer.writeCoins(1n);

    // forward_payload: Either bit = 0 (none)
    writer.writeBit(0);

    // Convertir a BOC y luego a base64
    return buildBOC(writer.getBytes(), writer.getBitLength());
}

// ============= TON ADDRESS DECODER =============
function decodeTONAddress(address) {
    console.log('address', address);

    // 1. Limpiar la entrada (quitar espacios y saltos de línea)
    const clean = address.trim().replace(/-/g, '+').replace(/_/g, '/');

    // 2. Añadir padding para que la longitud sea múltiplo de 4
    let base64 = clean;
    while (base64.length % 4) {
        base64 += '=';
    }

    // 3. Decodificar
    let bytes;
    try {
        const binary = atob(base64);
        bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    } catch (e) {
        throw new Error('Dirección TON inválida (no es base64 válido): ' + address);
    }

    // 4. Validar longitud (debe ser 36 bytes)
    if (bytes.length !== 36) {
        throw new Error('Dirección TON inválida (longitud incorrecta): ' + address);
    }

    const workchain = bytes[1] === 0xff ? -1 : bytes[1];
    const hash = bytes.slice(2, 34);

    return { workchain, hash };
}

// ============= BIT WRITER =============
class BitWriter {
    constructor() {
        this.bytes = new Uint8Array(128);
        this.bitPos = 0;
    }

    writeBit(bit) {
        const byteIdx = Math.floor(this.bitPos / 8);
        const bitIdx = 7 - (this.bitPos % 8);
        if (bit) this.bytes[byteIdx] |= (1 << bitIdx);
        this.bitPos++;
    }

    writeUint(value, bits) {
        for (let i = bits - 1; i >= 0; i--) {
            this.writeBit((Number(value) >> i) & 1);
        }
    }

    writeUint32(value) { this.writeUint(value, 32); }

    writeUint64(value) {
        // Escribir 64 bits de un BigInt
        const hi = Number(value >> 32n) & 0xFFFFFFFF;
        const lo = Number(value & 0xFFFFFFFFn);
        this.writeUint(hi, 32);
        this.writeUint(lo, 32);
    }

    writeCoins(amount) {
        // VarUInteger 16: primero 4 bits de longitud, luego el valor
        if (amount === 0n || amount === 0) {
            this.writeUint(0, 4); // length = 0
            return;
        }
        const bigAmount = BigInt(amount);
        // Calcular cuántos bytes necesitamos
        let byteLen = 0;
        let temp = bigAmount;
        while (temp > 0n) { temp >>= 8n; byteLen++; }
        this.writeUint(byteLen, 4);
        // Escribir los bytes del valor (big-endian)
        for (let i = byteLen - 1; i >= 0; i--) {
            const byte = Number((bigAmount >> BigInt(i * 8)) & 0xFFn);
            this.writeUint(byte, 8);
        }
    }

    writeAddress(workchain, hashBytes) {
        // addr_std$10 anycast:(Maybe Anycast) workchain_id:int8 address:bits256
        this.writeBit(1); // addr_std prefix bit 1
        this.writeBit(0); // addr_std prefix bit 0
        this.writeBit(0); // anycast = none
        // workchain_id: int8
        const wc = workchain < 0 ? workchain + 256 : workchain;
        this.writeUint(wc, 8);
        // address: 256 bits
        for (let i = 0; i < 32; i++) {
            this.writeUint(hashBytes[i], 8);
        }
    }

    getBytes() {
        const totalBytes = Math.ceil(this.bitPos / 8);
        return this.bytes.slice(0, totalBytes);
    }

    getBitLength() { return this.bitPos; }
}

// ============= BOC BUILDER =============
// Construye un BOC (Bag of Cells) mínimo de una sola celda
function buildBOC(dataBytes, bitLength) {
    // BOC serialization format (simplified, single cell, no refs)
    // Magic: b5ee9c72
    // has_idx=0, has_crc32c=1, has_cache_bits=0, flags=0, size_bytes=1
    // off_bytes=1, cells=1, roots=1, absent=0, tot_cells_size, root_list, index, cells_data, crc32c

    const cellData = serializeCell(dataBytes, bitLength);
    const totalCellSize = cellData.length;

    // Header
    const header = new Uint8Array([
        0xb5, 0xee, 0x9c, 0x72, // magic
        0x01,                    // has_idx=0, has_crc32c=0, has_cache_bits=0, flags=0, size_bytes=1
        0x01,                    // off_bytes=1
        0x01,                    // cells=1
        0x01,                    // roots=1
        0x00,                    // absent=0
        totalCellSize & 0xff,    // tot_cells_size (1 byte)
        0x00,                    // root_list: root[0]=0
    ]);

    // Combinar header + cell data
    const boc = new Uint8Array(header.length + cellData.length);
    boc.set(header, 0);
    boc.set(cellData, header.length);

    // Convertir a base64
    let binary = '';
    boc.forEach(b => binary += String.fromCharCode(b));
    return btoa(binary);
}

function serializeCell(dataBytes, bitLength) {
    // Descriptor bytes
    const d1 = 0; // refs_count=0, is_exotic=0, has_hashes=0, level=0
    const d2 = Math.floor(bitLength / 8) * 2 + (bitLength % 8 !== 0 ? 1 : 0);

    // Augmented data (añadir completion tag si no es múltiplo de 8)
    let augmented;
    if (bitLength % 8 === 0) {
        augmented = dataBytes;
    } else {
        augmented = new Uint8Array(dataBytes.length);
        augmented.set(dataBytes);
        const lastByte = augmented[augmented.length - 1];
        const usedBits = bitLength % 8;
        // Completion tag: poner 1 en el bit siguiente al último bit de datos
        augmented[augmented.length - 1] = (lastByte & (0xFF << (8 - usedBits))) | (1 << (7 - usedBits));
    }

    const cell = new Uint8Array(2 + augmented.length);
    cell[0] = d1;
    cell[1] = d2;
    cell.set(augmented, 2);
    return cell;
}

// ============= UI HELPERS =============
function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (show) overlay.classList.remove('hidden');
    else overlay.classList.add('hidden');
}

function showStatus(message, type = 'info') {
    const statusBox = document.getElementById('status');
    const statusContent = statusBox.querySelector('.status-content');
    statusContent.textContent = message;
    statusBox.className = `status-box ${type}`;
    statusBox.classList.remove('hidden');
    if (type === 'success' || type === 'info') {
        setTimeout(() => statusBox.classList.add('hidden'), 5000);
    }
}

console.log('App script cargado');
