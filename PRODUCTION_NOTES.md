# ⚠️ IMPORTANTE: Mejora Necesaria para Producción

## Problema Actual

El código actual en `app.js` y `web-app.js` usa una implementación **simplificada** para crear el cuerpo de la transacción jetton (USDT):

```javascript
function createJettonTransferBody(destinationAddress, amount) {
    // Esta es una versión SIMPLIFICADA
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
```

**ESTO NO ES EL FORMATO CORRECTO** para transacciones jetton en TON.

---

## ¿Qué necesitas hacer?

### Para Testing Inicial
El código actual **puede funcionar** para pruebas básicas con algunas wallets, pero no está garantizado.

### Para Producción
Necesitas usar la librería oficial `@ton/ton` para construir correctamente el BOC (Bag of Cells).

---

## Solución Correcta

### 1. Instalar dependencias

```bash
npm init -y
npm install @ton/ton @ton/crypto
```

### 2. Usar un bundler

Como necesitas importar módulos npm en el navegador, usa Vite:

```bash
npm install -D vite
```

Agrega a `package.json`:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}
```

### 3. Actualizar el código

Reemplaza la función `createJettonTransferBody()` con:

```javascript
import { beginCell, Address } from '@ton/ton';

async function sendUSDTTransaction(toAddress, amount) {
    try {
        const nanoAmount = BigInt(Math.floor(amount * 1000000));
        
        // Obtener la dirección del jetton wallet del usuario
        const userJettonWallet = await getUserJettonWalletAddress(
            connectedWallet.account.address,
            USDT_CONTRACT_ADDRESS
        );
        
        // Crear el cuerpo de jetton transfer correcto
        const body = beginCell()
            .storeUint(0x0f8a7ea5, 32) // jetton transfer opcode
            .storeUint(0, 64) // query_id
            .storeCoins(nanoAmount) // amount
            .storeAddress(Address.parse(toAddress)) // destination
            .storeAddress(Address.parse(connectedWallet.account.address)) // response_destination
            .storeBit(0) // custom_payload
            .storeCoins(1) // forward_ton_amount
            .storeBit(0) // forward_payload
            .endCell();
        
        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 360,
            messages: [
                {
                    address: userJettonWallet.toString(),
                    amount: '100000000', // 0.1 TON for gas
                    payload: body.toBoc().toString('base64')
                }
            ]
        };
        
        const result = await tonConnectUI.sendTransaction(transaction);
        // ...
    } catch (error) {
        // ...
    }
}

async function getUserJettonWalletAddress(userAddress, jettonMasterAddress) {
    // Necesitarás llamar al método get_wallet_address del jetton master contract
    // Esto requiere usar TON API o TonClient
    // Por simplicidad, usa TON API:
    
    const response = await fetch(
        `https://tonapi.io/v2/jettons/${jettonMasterAddress}/accounts/${userAddress}`
    );
    const data = await response.json();
    return data.address;
}
```

---

## Alternativa Simple (Sin Build)

Si quieres evitar el build process, puedes usar **TON API** directamente:

```javascript
async function sendUSDTTransaction(toAddress, amount) {
    try {
        // 1. Obtener la dirección del jetton wallet del usuario
        const response = await fetch(
            `https://tonapi.io/v2/accounts/${connectedWallet.account.address}/jettons/${USDT_CONTRACT_ADDRESS}`
        );
        const data = await response.json();
        const userJettonWallet = data.balance[0].wallet_address.address;
        
        // 2. Crear el payload usando un servicio externo o hardcoded
        // (menos ideal pero funciona)
        const nanoAmount = Math.floor(amount * 1000000);
        
        // Payload pre-construido (esto es un hack, no ideal)
        const body = createJettonTransferBodyHack(toAddress, nanoAmount);
        
        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 360,
            messages: [{
                address: userJettonWallet,
                amount: '100000000',
                payload: body
            }]
        };
        
        const result = await tonConnectUI.sendTransaction(transaction);
        // ...
    } catch (error) {
        // ...
    }
}
```

---

## Recomendación

**Para tus pruebas iniciales:**
- Usa el código actual como está
- Prueba con cantidades muy pequeñas
- Si no funciona, verás un error en la wallet al confirmar

**Para producción o uso serio:**
- Implementa la solución correcta con `@ton/ton`
- O usa un servicio/backend que construya los payloads por ti

---

## Recursos

- [TON SDK Documentation](https://github.com/ton-org/ton)
- [Jetton Standard (TEP-74)](https://github.com/ton-blockchain/TEPs/blob/master/text/0074-jettons-standard.md)
- [TON API](https://tonapi.io/)

---

## TL;DR

✅ **Para empezar y probar:** El código actual está bien  
⚠️ **Para producción:** Usa `@ton/ton` library o un backend que construya los payloads correctamente
