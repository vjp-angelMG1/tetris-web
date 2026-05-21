# 🎮 Tetris Web
¡Hola! Este es mi clon del clásico Tetris desarrollado 100% en web, sin usar motores gráficos como Unity o Unreal. Todo está construido con React puro, JavaScript y un poco de matemáticas para las colisiones. Además, cuenta con un sistema de clasificación en tiempo real guardado en la nube mediante Firebase Firestore.

Reaccionar Vite Firebase

## 🚀 Características principales
Juego Clásico Web: Físicas, gravedad y rotaciones del Tetris originales programadas desde cero.
Selector de Dificultad: ¿Te resulta fácil? Cambia entre Fácil, Media y Difícil y la velocidad de caída cambiará al instante.
Sistema de puntuación: Gana puntos por cada línea que logres completar.
Ranking en Tiempo Real: Guarda tu puntuación con tu nombre y compite contra otros jugadores gracias a la integración con Firebase Firestore.
Diseño Responsive: Interfaz adaptable a PC, tablets y móviles (incluye botones táctiles para jugar en el smartphone).
Arquitectura Limpia: Separación de lógica de negocio (Hooks), interfaz (Componentes) y servicios (Firebase).
## 🛠️ Tecnologías utilizadas
Frontend: React 18+ (con Vite)
Estilos: CSS puro con variables personalizadas (Custom Properties)
Backend / Base de Datos: Firebase (Firestore)
Control de versiones: Git y GitHub
## 📂 Arquitectura del proyecto
El proyecto sigue una arquitectura basada en responsabilidades, separando la lógica del juego de la interfaz y la base de datos para que sea escalable y fácil de mantener:

texto

src/
├── config/         # Configuración de Firebase (firebase.js)
├── hooks/          # Lógica pura del juego (useTetris.js)
├── models/         # Definición de tipos de datos (JSDoc - Score.js)
├── services/       # Conexión a la base de datos
│   └── data/       # Servicios separados por dominio
│       ├── rankingService.js
│       └── index.js
├── App.jsx         # Layout principal y componentes integrados
├── App.css         # Estilos visuales y variables CSS
└── main.jsx        # Punto de entrada de la aplicación
## ⚙️ Instalación y puesta en marcha
Si quieres echarle un vistazo en tu máquina local, sigue estos pasos:

* 1. Clonar el repositorio
intento

git clone https://github.com/vjp-angelMG1/tetris-web.git
cd tetris-web
* 2. Instalar dependencias
intento

npm install
* 3. Configurar Firebase (Variables de Entorno)
El proyecto requiere credenciales de Firebase para conectarse con el ranking. Por seguridad, estas credenciales no están en el repositorio.

Crea un archivo llamado en la raíz del proyecto (donde está )..envpackage.json
Agrega tus credenciales de Firebase con el prefijo (necesario para que Vite lo lea):VITE_
entorno

VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
(Asegúrate de tener creada una base de datos de Firestore en modo de prueba en tu consola de Firebase).

* 4. Ejecutar la aplicación
intento

**npm run dev**
La aplicación se abrirá automáticamente en http://localhost:5173. y tambien se puede ver en: https://tetris-web-5a724.web.app/#

## 🎮 Controles del juego
Tecla
Acción
⬅️ (Flecha Izq.)	Mover izquierda
➡️ (Flecha Der.)	Mover derecha
⬇️ (Flecha Abajo)	Caída rápida
⬆️ (Flecha Arriba)	Rotar pieza

(En los dispositivos móviles aparecerán botones táctiles en la pantalla).

## 💾 Base de datos (Firestore)
El juego guarda las evaluaciones en una colección llamada en Firebase Firestore. No es necesario crear la colección manualmente; el servicio la creará automáticamente al guardar la primera puntuación.rankingsrankingService.js

Estructura del documento en Firestore:

json

{
  "playerName": "Ángel",
  "score": 300
}
## 👨‍💻 Autor
Ángel Montero Gregorio

Proyecto desarrollado como práctica de arquitectura de software, integración de Firebase y lógica de estado en React puro. ¡Cualquier comentario es bienvenido!