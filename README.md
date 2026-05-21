# 🎮 Tetris Web
Un clon del clásico Tetris desarrollado con React y Vite, con un sistema de clasificación en tiempo real guardado en la nube mediante Firebase Firestore. Diseñado con una arquitectura modular y escalable.

![Tetris Web](https://Tetris Web Reaccionar Vite Firebase

## 🚀 Características principales
Juego Clásico: Físicas y rotaciones clásicas del Tetris original.
Sistema de puntuación: Gana puntos por cada línea completada.
Ranking en Tiempo Real: Guarda tu puntuación y compite contra otros jugadores gracias a la integración con Firebase Firestore.
Diseño Responsive: Interfaz adaptable a diferentes tamaños de pantalla usando Tailwind CSS.
Arquitectura Limpia: Separación de lógica de negocio (Hooks), interfaz (Componentes) y servicios (Firebase).
## 🛠️ Tecnologías Utilizadas
**InterfazFrontend: React 18+ (Vite)
Estilos: Tailwind CSS
Backend / Base de Datos: Firebase (Firestore)
Control de versiones: Git y GitHub
## 📂Arquitectura del Proyecto
El proyecto sigue una arquitectura basada en responsabilidades, separando la lógica del juego de la interfaz y la base de datos:

texto

src/
├── components/     # Componentes visuales (TetrisGame.jsx, Leaderboard.jsx)
├── config/         # Configuración de Firebase (firebase.js)
├── hooks/          # Lógica pura del juego (useTetris.js)
├── models/         # Definición de tipos de datos (JSDoc - Score.js)
├── services/       # Conexión a la base de datos
│   └── data/       # Servicios separados por dominio
│       ├── rankingService.js
│       └── index.js
├── App.jsx         # Enrutamiento y layout principal
└── main.jsx        # Punto de entrada de la aplicación
## ⚙️ Instalación y Puesta en Marcha
Sigue estos pasos para ejecutar el proyecto en tu máquina local:

* 1. Clonar el repositorio
intento

git clone https://github.com/vjp-angelMG1/tetris-web.git
cd tetris-web
* 2. Instalar dependencias
intento

npm install
* 3. Configurar Firebase (Variables de Entorno)
El proyecto requiere cred

Crea un archivo llamado en la raíz del proyecto (donde está )..envpackage.json
Agrega tus credenciales de Firebase con el prefijo (necesario para Vite):VITE_
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

npm run dev
La aplicación se abrirá automáticamente enhttp://localhost:5173.

# 🎮 Controles del Juego
Tecla
Acción
* ⬅️ (Flecha Izq.)	Mudanzas Izquierda
* ➡️ (Flecha Der.)	Mudanza Derecha
* ⬇️ (Flecha Abajo)	Caída rápida
* ⬆️ (Flecha Arriba)	Rotar Pieza

## 💾 Base de Datos (Firestore)
El juego guarda las evaluaciones en una colección llamada **`rankingsrankingses Firebase Firestore. No es necesario crear la colección manualmente; el servicio la creará automáticamente al guardar la primera puntuación.rankingService.js

Estructura del documento en Firestore:

json

{
  "playerName": "Ángel",
  "score": 300,
  "date": "Timestamp de Firebase"
}
## 👨‍💻 Autor
Ángel Montero Gregorio

Proyecto desarrollado como práctica de arquitectura de software, integración de Firebase y lógica de estado en React puro.