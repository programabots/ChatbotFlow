# Guía de Deployment para Render

Este es tu chatbot de WhatsApp para atención al cliente con respuestas predefinidas.

## 📥 Descargar el Código

### Opción 1: Desde Replit (Recomendado)
1. Ve al menú "..." en la parte superior de tu workspace
2. Selecciona "Download as zip"
3. Extrae el archivo ZIP en tu computadora

### Opción 2: Git Clone
```bash
git clone tu-replit-repo-url
cd tu-proyecto
```

## 🚀 Deployment en Render

### 1. Preparar tu Repositorio
1. Sube tu código a GitHub (si no está ya)
2. Asegúrate de que estos archivos estén incluidos:
   - `Dockerfile` ✅
   - `render.yaml` ✅
   - Todo el código fuente ✅

### 2. Crear Servicio en Render
1. Ve a [render.com](https://render.com) y crea una cuenta
2. Conecta tu cuenta de GitHub
3. Haz clic en "New Web Service"
4. Selecciona tu repositorio del chatbot
5. Configurar:
   - **Name**: `whatsapp-chatbot`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### 3. Variables de Entorno
En Render, agrega estas variables de entorno:

```
NODE_ENV=production
PORT=5000
WHATSAPP_VERIFY_TOKEN=tu_token_verificacion
WHATSAPP_ACCESS_TOKEN=tu_token_acceso_whatsapp
WHATSAPP_PHONE_NUMBER_ID=tu_numero_telefono_id
```

### 4. Configurar WhatsApp Business API
1. Obtén credenciales de Meta Business:
   - Access Token
   - Phone Number ID
   - Verify Token
2. Configura el webhook en Meta:
   - URL: `https://tu-app.onrender.com/api/webhook/whatsapp`
   - Verify Token: (el mismo que configuraste)

## 🔧 Configuración Post-Deployment

### URLs Importantes
- **Dashboard**: `https://tu-app.onrender.com`
- **Webhook**: `https://tu-app.onrender.com/api/webhook/whatsapp`
- **API**: `https://tu-app.onrender.com/api/*`

### Funcionalidades Incluidas
- ✅ Dashboard administrativo completo
- ✅ Gestión de respuestas automáticas
- ✅ Vista de conversaciones
- ✅ Analíticas en tiempo real
- ✅ Configuración del bot
- ✅ Webhook para WhatsApp

## 📱 Conectar con WhatsApp Business

1. **Meta Business Manager**:
   - Configura tu aplicación de WhatsApp
   - Agrega el webhook URL
   - Verifica el token

2. **Pruebas**:
   - Usa el chat preview en el dashboard
   - Envía mensajes de prueba
   - Verifica respuestas automáticas

## 🛠️ Tecnologías Usadas
- **Frontend**: React + TailwindCSS + shadcn/ui
- **Backend**: Express.js + TypeScript
- **Base de Datos**: Memoria (para desarrollo) / PostgreSQL (para producción)
- **WhatsApp**: Business API webhook integration

## 📞 Soporte
Si necesitas ayuda:
1. Revisa los logs en Render
2. Verifica las variables de entorno
3. Confirma que el webhook esté activo

¡Tu chatbot está listo para atender clientes! 🎉