# 📱 Guía de Configuración - TMA con Pagos USDT

Esta guía te llevará paso a paso para configurar y probar tu Telegram Mini App.

## 📋 Prerrequisitos

Antes de empezar, asegúrate de tener:

- ✅ Bot de Telegram creado con @BotFather
- ✅ Bot token guardado
- ✅ Cuenta de TonKeeper configurada
- ✅ Telegram Wallet con algo de USDT
- ✅ Un poco de TON en ambas wallets (para gas fees)
- ✅ Cuenta de Vercel (gratis en vercel.com)

---

## 🚀 Paso 1: Configurar el Bot de Telegram

### 1.1 Configurar el Mini App en @BotFather

Abre Telegram y habla con [@BotFather](https://t.me/BotFather):

```
/mybots
[Selecciona tu bot]
Bot Settings → Menu Button → Configure Menu Button
```

**URL a configurar:** Aquí pondrás la URL de Vercel después del deploy (Paso 3)

Por ahora déjala temporalmente como: `https://ejemplo.com`

---

## 🌐 Paso 2: Deploy en Vercel

### 2.1 Crear cuenta en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Regístrate con GitHub (recomendado)

### 2.2 Subir proyecto a GitHub

```bash
# Desde tu carpeta del proyecto
git init
git add .
git commit -m "Initial commit - TMA USDT"
git branch -M main

# Crear repositorio en GitHub y conectar
git remote add origin https://github.com/TU_USUARIO/tma-test.git
git push -u origin main
```

### 2.3 Deploy en Vercel

1. En Vercel, haz clic en "Add New Project"
2. Importa tu repositorio de GitHub
3. Configuración:
   - **Framework Preset:** Other
   - **Build Command:** (dejar vacío)
   - **Output Directory:** (dejar vacío)
4. Haz clic en "Deploy"
5. Espera a que termine el deploy

### 2.4 Obtener tu URL

Después del deploy verás algo como: `https://tma-test-xxxxx.vercel.app`

**¡GUARDA ESTA URL!**

### 2.5 Actualizar manifest

Edita `ton-connect-manifest.json` con tu URL de Vercel:

```json
{
  "url": "https://tma-test-xxxxx.vercel.app",
  "name": "USDT Payment TMA",
  "iconUrl": "https://tma-test-xxxxx.vercel.app/icon.png",
  "termsOfUseUrl": "https://tma-test-xxxxx.vercel.app",
  "privacyPolicyUrl": "https://tma-test-xxxxx.vercel.app"
}
```

Haz commit y push de los cambios. Vercel se actualizará automáticamente.

---

## 🤖 Paso 3: Configurar URL en el Bot

Ahora vuelve a @BotFather:

```
/mybots
[Selecciona tu bot]
Bot Settings → Menu Button → Configure Menu Button
```

**URL:**
```
https://TU-URL-DE-VERCEL.vercel.app
```

**Texto del botón:** `Abrir App`

---

## 💰 Paso 4: Preparar Wallets

### 4.1 Telegram Wallet

1. Abre [@wallet](https://t.me/wallet) en Telegram
2. Ve a Settings → TON Space
3. Copia tu dirección (empieza con `EQ...`)
4. Asegúrate de tener:
   - Al menos 1 USDT
   - Al menos 0.1 TON (para fees)

### 4.2 TonKeeper

1. Abre TonKeeper
2. Copia tu dirección de recepción
3. Ten también algo de TON para fees

---

## 🧪 Paso 5: Probar la TMA

### 5.1 Abrir la TMA

1. Abre tu bot en Telegram
2. Presiona el botón "Abrir App" (o el menú)
3. La TMA debería cargarse

### 5.2 Prueba 1: Conectar Wallet

1. Presiona el botón "Connect Wallet"
2. Selecciona tu wallet (Telegram Wallet o TonKeeper)
3. Autoriza la conexión
4. Deberías ver tu dirección conectada

### 5.3 Prueba 2: Enviar USDT a otra Wallet de Telegram

1. Pide a un amigo su dirección de Telegram Wallet (o usa otra tuya)
2. Ingresa la dirección en "Dirección de destino"
3. Ingresa cantidad (ej: 0.5 USDT)
4. Presiona "Pagar a Wallet Telegram"
5. Confirma en tu wallet
6. ✅ Debería procesarse la transacción

### 5.4 Prueba 3: Enviar USDT a TonKeeper

1. Copia tu dirección de TonKeeper
2. Ingresa la dirección en "Dirección de destino"
3. Ingresa cantidad (ej: 0.5 USDT)
4. Presiona "Pagar a TonKeeper"
5. Confirma en tu wallet
6. ✅ El USDT debería llegar a TonKeeper

---

## 🌍 Paso 6: Probar Versión Web

### 6.1 Abrir versión web

Abre en tu navegador:
```
https://TU-URL-DE-VERCEL.vercel.app/web.html
```

### 6.2 Conectar y enviar

1. Conecta TonKeeper (u otra wallet compatible)
2. Haz el mismo proceso de envío
3. Confirma que funciona igual que en la TMA

---

## 🔍 Verificar Transacciones

Puedes verificar tus transacciones en:

**TON Explorer:**
- https://tonscan.org/
- Busca por tu dirección o hash de transacción

---

## ⚠️ Problemas Comunes

### Error: "Wallet not connected"
- Asegúrate de presionar el botón "Connect Wallet" primero
- Verifica que autorizaste la conexión

### Error: "Invalid address"
- Las direcciones TON empiezan con `EQ` o `UQ`
- Asegúrate de copiar la dirección completa
- No incluyas espacios

### Error: "Insufficient funds"
- Verifica que tienes suficiente USDT
- Verifica que tienes suficiente TON para fees (~0.05 TON por transacción)

### La TMA no carga
- Verifica que la URL en @BotFather sea correcta
- Verifica que el deploy de Vercel fue exitoso
- Intenta abrir la URL directamente en navegador

### Transacción pendiente
- Las transacciones en TON pueden tardar 5-30 segundos
- Revisa en https://tonscan.org/

---

## 📝 Notas Importantes

> [!IMPORTANT]
> - **Mainnet Real:** Estás usando dinero real. Usa cantidades pequeñas para pruebas.
> - **Gas Fees:** Cada transacción consume aproximadamente 0.05-0.1 TON en fees.
> - **Irreversible:** Las transacciones blockchain no se pueden revertir.

> [!TIP]
> - Guarda las direcciones que uses frecuentemente
> - Verifica siempre la dirección de destino antes de enviar
> - Empieza con cantidades muy pequeñas (0.1-0.5 USDT)

---

## 🆘 Soporte

Si tienes problemas:

1. Revisa la consola del navegador (F12) para errores
2. Verifica que todos los archivos estén en Vercel
3. Verifica que el manifest.json tenga la URL correcta
4. Prueba primero la versión web para descartar problemas de Telegram

---

## 🎉 ¡Listo!

Ahora tienes una TMA funcional para enviar USDT. Puedes:
- Modificar el diseño en `styles.css`
- Agregar más funcionalidades en `app.js`
- Crear múltiples páginas
- Integrar con tu backend

**¡Diviértete desarrollando! 🚀**
