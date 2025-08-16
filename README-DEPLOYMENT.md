# Guía de Deployment Seguro para WhatsApp Chatbot

Este chatbot incluye configuraciones de seguridad avanzadas para proteger tus endpoints.

## 🔐 URLs de Acceso Seguras

Con la configuración actual, obtendrás estas URLs después del deployment:

### Render Deployment
```
Dashboard: https://wa-bot-7f2e9a1b-secure.onrender.com
Webhook Principal: https://wa-bot-7f2e9a1b-secure.onrender.com/api/webhook/whatsapp
Webhook Seguro: https://wa-bot-7f2e9a1b-secure.onrender.com/api/x7f2e9a1b/webhook
```

### Configuración de IP Directa (VPS)
Si prefieres usar una dirección IP directa en un servidor VPS:

```bash
# Ejemplo con servidor cloud
https://123.45.67.89:5000
https://123.45.67.89:5000/api/x7f2e9a1b/webhook
```

## 🛡️ Características de Seguridad Implementadas

### 1. **Nombre de Servicio Ofuscado**
- Nombre: `wa-bot-7f2e9a1b-secure` (difícil de adivinar)
- No usa términos obvios como "whatsapp" o "chatbot"

### 2. **Webhook con Ruta Ofuscada**
- Ruta principal: `/api/webhook/whatsapp`
- Ruta segura: `/api/x7f2e9a1b/webhook` (código hexadecimal)

### 3. **Token de Seguridad Adicional**
- Variable `SECURITY_TOKEN` generada automáticamente
- Se verifica en cada request del webhook

### 4. **Verificación Dual**
- Token de WhatsApp estándar
- Token de seguridad personalizado adicional

## 🚀 Opciones de Deployment

### Opción 1: Render (Recomendado para principiantes)
```yaml
# El archivo render.yaml ya está configurado
services:
  - type: web
    name: wa-bot-7f2e9a1b-secure
```

### Opción 2: VPS con IP Directa (Más privado)
```bash
# En tu servidor VPS:
git clone tu-repositorio
cd tu-chatbot
npm install
npm run build
PORT=5000 npm start
```

### Opción 3: Railway, Heroku, DigitalOcean App Platform
Todos funcionan con la misma configuración.

## 🔧 Variables de Entorno de Seguridad

```bash
NODE_ENV=production
PORT=5000
WHATSAPP_VERIFY_TOKEN=tu_token_verificacion_whatsapp
WHATSAPP_ACCESS_TOKEN=tu_token_acceso_whatsapp  
WHATSAPP_PHONE_NUMBER_ID=tu_numero_telefono_id
```

## 📱 Configuración en WhatsApp Business

### Usar el Webhook Seguro (Recomendado)
```
Webhook URL: https://wa-bot-7f2e9a1b-secure.onrender.com/api/x7f2e9a1b/webhook
Verify Token: tu_token_verificacion_whatsapp
```

### Headers Adicionales de Seguridad
```
X-Security-Token: tu_security_token_generado
```

## 🔍 URLs Finales de Ejemplo

### Con Render:
```
Dashboard: https://wa-bot-7f2e9a1b-secure.onrender.com
Webhook: https://wa-bot-7f2e9a1b-secure.onrender.com/api/x7f2e9a1b/webhook
```

### Con VPS/IP directa:
```
Dashboard: https://45.123.67.89:5000
Webhook: https://45.123.67.89:5000/api/x7f2e9a1b/webhook
```

### Con Cloudflare Tunnel (IP completamente oculta):
```
Dashboard: https://abc123def-456-789.trycloudflare.com
Webhook: https://abc123def-456-789.trycloudflare.com/api/x7f2e9a1b/webhook
```

## 🛠️ Deployment Steps

1. **Render** (URL ofuscada automática):
   - Fork el repositorio en GitHub
   - Conecta con Render
   - Deploy automático con `render.yaml`

2. **VPS** (IP directa):
   - Compra VPS (DigitalOcean, Linode, Vultr)
   - Instala Node.js
   - Deploy manual con `npm start`

3. **Cloudflare Tunnel** (IP completamente oculta):
   - Instala cloudflared
   - Crea tunnel: `cloudflared tunnel --url localhost:5000`
   - Obtienes URL aleatoria imposible de adivinar

## 🔒 Nivel de Seguridad por Opción

1. **Cloudflare Tunnel**: 🔒🔒🔒🔒🔒 (Máxima seguridad)
2. **VPS con IP**: 🔒🔒🔒🔒 (Alta seguridad)
3. **Render ofuscado**: 🔒🔒🔒 (Buena seguridad)

¿Cuál prefieres usar?