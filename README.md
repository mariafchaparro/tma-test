# 💰 Telegram Mini App - USDT Payment Tests

Una Telegram Mini App simple para realizar pruebas de transacciones USDT en la blockchain TON usando TON Connect.

## 🎯 Características

- ✅ Conexión con wallets TON (Telegram Wallet, TonKeeper, etc.)
- ✅ Envío de USDT entre wallets
- ✅ Interfaz moderna y responsiva
- ✅ Integración con tema de Telegram
- ✅ Versión web standalone (sin Telegram)
- ✅ Transacciones en mainnet (red real)

## 📁 Estructura del Proyecto

```
tma-test/
├── index.html              # TMA principal (dentro de Telegram)
├── app.js                  # Lógica de la TMA
├── web.html                # Versión web standalone
├── web-app.js              # Lógica de la versión web
├── styles.css              # Estilos compartidos
├── ton-connect-manifest.json  # Configuración TON Connect
├── vercel.json             # Configuración de deploy
├── SETUP_GUIDE.md          # Guía de configuración paso a paso
└── .env.example            # Variables de entorno ejemplo
```

## 🚀 Inicio Rápido

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/tma-test.git
cd tma-test
```

### 2. Deploy en Vercel

Sigue la guía completa en [SETUP_GUIDE.md](./SETUP_GUIDE.md)

Quick deploy:
1. Sube el proyecto a GitHub
2. Importa en Vercel
3. Deploy automático
4. Configura la URL en @BotFather

### 3. Configurar el Bot

1. Ve a [@BotFather](https://t.me/BotFather)
2. Configura el Menu Button con tu URL de Vercel
3. Abre el bot y prueba la app

## 🔧 Tecnologías

- **TON Connect UI** - Conexión de wallets
- **Telegram WebApp SDK** - Integración con Telegram
- **Vanilla JavaScript** - Sin frameworks
- **CSS moderno** - Diseño responsivo
- **Vercel** - Hosting gratuito con HTTPS

## 💡 Uso

### En la TMA (dentro de Telegram):

1. Abre tu bot en Telegram
2. Presiona "Abrir App"
3. Conecta tu wallet
4. Ingresa dirección de destino
5. Ingresa cantidad de USDT
6. Confirma la transacción

### En la Web:

1. Abre `https://tu-app.vercel.app/web.html`
2. Conecta TonKeeper (u otra wallet)
3. Sigue los mismos pasos

## ⚠️ Consideraciones Importantes

> [!WARNING]
> Esta app usa **mainnet** (red real de TON). Las transacciones son reales e irreversibles.

- Usa cantidades pequeñas para pruebas (0.1 - 1 USDT)
- Asegúrate de tener TON para gas fees (~0.05 TON por transacción)
- Verifica siempre la dirección de destino antes de enviar
- Las transacciones no se pueden revertir

## 🧪 Testing

### Probar localmente:

```bash
# Usa un servidor local simple
npx serve
# O con Python
python -m http.server 8000
```

**Nota:** Para usar TON Connect necesitas HTTPS. Usa Vercel para testing real.

## 📖 Documentación

- [Guía de Configuración Completa](./SETUP_GUIDE.md)
- [TON Connect Documentation](https://docs.ton.org/develop/dapps/ton-connect/overview)
- [Telegram Mini Apps](https://core.telegram.org/bots/webapps)
- [TON Blockchain](https://ton.org/)

## 🔍 Verificar Transacciones

Puedes ver tus transacciones en:
- [TONScan](https://tonscan.org/)

## 🤝 Contribuciones

Este es un proyecto de ejemplo para aprendizaje. Siéntete libre de:
- Hacer fork
- Mejorar el código
- Agregar funcionalidades
- Reportar issues

## 📝 To-Do

- [ ] Usar librería @ton/ton para construcción correcta de BOC
- [ ] Agregar soporte para otros tokens (TON, USDC, etc.)
- [ ] Historial de transacciones
- [ ] Notificaciones de estado de transacción
- [ ] Multi-idioma

## 📄 Licencia

MIT - Libre para usar y modificar

## 🆘 Soporte

Si tienes problemas:
1. Revisa [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. Verifica la consola del navegador (F12)
3. Revisa que el manifest tenga la URL correcta
4. Prueba la versión web primero

## 🙏 Agradecimientos

- TON Foundation
- Telegram
- Comunidad TON

---

**Hecho con ❤️ para aprender sobre TON y Telegram Mini Apps**
