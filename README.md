# SAVIA 🌿
> Plataforma interactiva inteligente para el acompañamiento emocional y monitoreo de la salud mental.

SAVIA es un ecosistema digital diseñado para ayudar a las personas a comprender, registrar y nutrir su bienestar emocional. Mediante el uso de inteligencia afectiva (IA) y minería de datos, ofrece un espacio seguro y confidencial de introspección diaria.

---

## 🌟 Características Principales

- **Diario Emocional Inteligente**: Registra estados de ánimo, niveles de energía, hábitos (sueño, hidratación, movimiento) y notas reflexivas en un entorno amigable.
- **Savia Neuro V3 (Cerebro IA)**: Algoritmo predictivo que analiza tus patrones históricos de energía y hábitos para proyectar tu balance del día siguiente.
- **Acompañamiento por IA (Savia Chat)**: Un espacio conversacional empático y de escucha activa, configurado con límites éticos profesionales para no dar consejos invasivos.
- **Reportes Clínicos PDF**: Genera y descarga un reporte formal detallado en formato PDF para compartir con terapeutas o profesionales de la salud.
- **Panel de Administración (Admin Dashboard)**: Herramienta de monitoreo para profesionales con indicadores macro de salud poblacional y detección automática de alertas de riesgo.
- **Botón y Protocolo SOS**: Acceso rápido a directorios de ayuda profesional y soporte geolocalizado en situaciones de crisis.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React.js, Vite, Material UI (MUI), Recharts, Framer Motion, Lottie React.
- **Backend & Base de Datos**: Firebase (Authentication, Firestore, Cloud Functions v2).
- **Procesamiento de Lenguaje**: OpenAI API (Modelos gpt-4o-mini y gpt-3.5-turbo).
- **Herramientas de Exportación**: jsPDF, html2canvas.

---

## ⚙️ Configuración y Configuración Local

### 1. Requisitos Previos
- Node.js (versión 16 o superior)
- Firebase CLI instalado globalmente

### 2. Instalación de Dependencias
En la carpeta raíz del proyecto, ejecuta:
```bash
npm install
```

Y en la carpeta de funciones si vas a desplegar el backend:
```bash
cd functions
npm install
cd ..
```

### 3. Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:
```env
VITE_OPENAI_API_KEY=tu_api_key_de_openai
VITE_FIREBASE_API_KEY=tu_api_key_de_firebase
...
```

Crea también un archivo `.env` en la carpeta `functions/` para el backend basándote en `functions/.env.example`:
```env
OPENAI_API_KEY=tu_api_key_de_openai
```

### 4. Modo de Desarrollo
Inicia el servidor local para ver la aplicación web:
```bash
npm run dev
```

---

## 🔒 Licencia y Propiedad Intelectual

© 2026 Tania Joseline Recendis Díaz. Todos los derechos reservados.  
Este software es desarrollado y distribuido con fines académicos y profesionales. Queda prohibida la copia, reproducción o uso comercial de esta plataforma sin previa autorización.
