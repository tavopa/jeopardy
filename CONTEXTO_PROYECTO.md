# 🎯 CONTEXTO DEL PROYECTO JEOPARDY TRIVIA

## 📋 RESUMEN DEL PROYECTO

**Aplicación web de trivia basada en Jeopardy** con preguntas de tecnología, diseñada para grupos de personas que compiten en tiempo real. El proyecto está **100% funcional** y desplegado en contenedores Docker.

## 🏗️ ARQUITECTURA TÉCNICA

### Backend (Python + FastAPI)
- **Framework:** FastAPI con WebSockets para comunicación en tiempo real
- **Base de datos:** SQLite con SQLAlchemy ORM
- **Puerto:** 8000
- **Archivo principal:** `backend/main.py`
- **Dependencias:** `requirements.txt`

### Frontend (Next.js + React)
- **Framework:** Next.js 14 con React 18
- **Estilos:** Tailwind CSS con efectos neón y animaciones
- **Animaciones:** Framer Motion para transiciones fluidas
- **Puerto:** 3000
- **Componentes principales:**
  - `page.tsx` - Página principal con selección de rol
  - `HostPanel.tsx` - Panel de control del host
  - `PlayerPanel.tsx` - Interfaz del jugador
  - `GameBoard.tsx` - Tablero de preguntas
  - `Leaderboard.tsx` - Ranking de jugadores

### DevOps
- **Docker Compose** para despliegue en contenedores
- **Base de datos:** SQLite persistente
- **Scripts:** `start.sh` (Linux/Mac) y `start.ps1` (Windows)

## 🎮 FLUJO DEL JUEGO IMPLEMENTADO

### 1. Inicio del Host
- Host selecciona "SER HOST"
- Abre registro y genera URL con parámetro `?room=timestamp`
- Ve lista de jugadores registrados en tiempo real

### 2. Registro de Jugadores
- Jugadores acceden con URL → Van directo al formulario de registro
- No ven pantalla de selección Host/Jugador
- Se registran con su nombre

### 3. Inicio del Juego
- Host presiona "INICIAR JUEGO"
- Cuenta regresiva de 30 segundos visible para todos
- Sistema lanza automáticamente la primera pregunta

### 4. Desarrollo del Juego
- Cada pregunta tiene 15 segundos para responder
- Host controla transiciones con "SIGUIENTE PREGUNTA"
- Sistema calcula puntuación automáticamente
- Ranking en tiempo real

### 5. Finalización
- Host controla cuándo terminar
- Ranking final con ganadores
- Estadísticas del juego

## 🔧 FUNCIONALIDADES TÉCNICAS IMPLEMENTADAS

### WebSockets en Tiempo Real
- **Conexión:** `ws://localhost:8000/ws`
- **Mensajes:**
  - `registration_started` - Registro abierto
  - `game_started` - Juego iniciado con countdown
  - `new_question` - Nueva pregunta
  - `game_finished` - Juego terminado

### Base de Datos
- **Tablas:**
  - `users` - Jugadores registrados
  - `questions` - Preguntas del juego
  - `user_answers` - Respuestas de jugadores
- **Relaciones:** Usuario → Respuestas → Puntuación

### API Endpoints
- `POST /register` - Registrar jugador
- `GET /users` - Lista de jugadores
- `POST /start-registration` - Abrir registro
- `POST /start-game` - Iniciar juego
- `POST /start-first-question` - Lanzar primera pregunta
- `POST /next-question` - Siguiente pregunta
- `POST /submit-answer` - Enviar respuesta

## 🎨 DISEÑO Y UX

### Tema Visual
- **Colores neón:** Cyan, amarillo, azul con efectos de brillo
- **Fondo:** Gradientes oscuros con partículas flotantes
- **Animaciones:** Transiciones suaves con Framer Motion
- **Responsive:** Funciona en móviles, tablets y desktop

### Componentes de UI
- **Botones neón** con efectos hover
- **Temporizadores** con animaciones pulsantes
- **Tarjetas de preguntas** con bordes brillantes
- **Ranking** con podio animado
- **Efectos de partículas** en el fondo

## 📁 ESTRUCTURA DE ARCHIVOS

```
jeopardy/
├── backend/
│   ├── main.py              # API FastAPI + WebSockets
│   ├── requirements.txt     # Dependencias Python
│   └── Dockerfile          # Imagen del backend
├── frontend/
│   ├── app/
│   │   ├── components/      # Componentes React
│   │   │   ├── HostPanel.tsx
│   │   │   ├── PlayerPanel.tsx
│   │   │   ├── GameBoard.tsx
│   │   │   └── Leaderboard.tsx
│   │   ├── styles/
│   │   │   └── globals.css  # Estilos con efectos neón
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── Dockerfile
├── questions.txt           # 15 preguntas de tecnología
├── docker-compose.yml      # Configuración de contenedores
├── start.sh               # Script de inicio (Linux/Mac)
├── start.ps1              # Script de inicio (Windows)
└── README.md              # Documentación
```

## 🚀 COMANDOS DE DESPLIEGUE

### Desarrollo Local
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

### Docker (Recomendado)
```bash
# Construir y ejecutar
docker-compose up --build -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

## 📊 PREGUNTAS Y DATOS

### Formato de Preguntas
```
¿Pregunta?
A) Opción A
B) Opción B
C) Opción C
D) Opción D
correcta:A
```

### Preguntas Incluidas (15)
- Lenguajes de programación (Python, JavaScript, Java, C++)
- Frameworks (React, Angular, Vue.js)
- Tecnologías (Docker, Git, APIs, HTML, CSS)
- Conceptos (Algoritmos, OOP, NoSQL)
- Sistemas operativos (Linux, Windows)

## 🔄 ESTADO ACTUAL DEL PROYECTO

### ✅ COMPLETADO
- [x] Backend Python con FastAPI
- [x] Frontend Next.js con Tailwind
- [x] Base de datos SQLite
- [x] WebSockets para tiempo real
- [x] Sistema de puntuación
- [x] Diseño gamer con animaciones
- [x] Docker Compose
- [x] 15 preguntas de tecnología
- [x] Lanzamiento automático de primera pregunta
- [x] Cuenta regresiva visible para jugadores
- [x] Detección de URL con parámetro room
- [x] Corrección de problemas de renderizado
- [x] Estado local en PlayerPanel

### 🎯 FUNCIONALIDADES PRINCIPALES
1. **Host puede crear salas** y generar URLs
2. **Jugadores se unen** con URLs directas
3. **Cuenta regresiva** de 30 segundos visible
4. **Preguntas automáticas** con 15 segundos cada una
5. **Sistema de puntuación** en tiempo real
6. **Ranking de jugadores** con podio animado
7. **Controles del host** para gestionar el flujo
8. **Diseño responsive** para todos los dispositivos

## 🐛 PROBLEMAS RESUELTOS

### 1. Lanzamiento de Primera Pregunta
- **Problema:** Las preguntas no se lanzaban automáticamente
- **Solución:** Agregado endpoint `/start-first-question` y lógica automática

### 2. Cuenta Regresiva para Jugadores
- **Problema:** Solo el host veía la cuenta regresiva
- **Solución:** Broadcast de mensajes WebSocket a todos los jugadores

### 3. Detección de URL con Room
- **Problema:** Jugadores veían pantalla de selección
- **Solución:** Detección de parámetro `?room=` y redirección directa

### 4. Preguntas Mostrándose al Host
- **Problema:** Host veía las preguntas en lugar de solo controlar
- **Solución:** Separación de interfaces - Host ve controles, Jugadores ven preguntas

### 5. Estado de Juego en PlayerPanel
- **Problema:** `gameState` se quedaba en "waiting"
- **Solución:** Estado local `localGameState` que se actualiza con WebSockets

## 🎮 CÓMO USAR LA APLICACIÓN

### Para el Host:
1. Abrir http://localhost:3000
2. Seleccionar "SER HOST"
3. Hacer clic en "ABRIR REGISTRO"
4. Compartir la URL generada
5. Hacer clic en "INICIAR JUEGO" cuando todos estén listos
6. Usar "SIGUIENTE PREGUNTA" para controlar el flujo

### Para los Jugadores:
1. Abrir la URL compartida por el host
2. Ingresar nombre y hacer clic en "ENTRAR A LA SALA"
3. Esperar a que el host inicie el juego
4. Ver cuenta regresiva de 30 segundos
5. Responder preguntas dentro del tiempo límite
6. Ver ranking en tiempo real

## 🔧 CONFIGURACIÓN TÉCNICA

### Variables de Entorno
- `NEXT_PUBLIC_API_URL=http://localhost:8000`
- `DATABASE_URL=sqlite:///./data/jeopardy.db`

### Puertos
- Frontend: 3000
- Backend: 8000
- WebSocket: ws://localhost:8000/ws

### Base de Datos
- SQLite local con persistencia
- Tablas: users, questions, user_answers
- Relaciones automáticas con SQLAlchemy

## 📈 PRÓXIMAS MEJORAS POTENCIALES

1. **Más preguntas** - Expandir el archivo `questions.txt`
2. **Categorías** - Organizar preguntas por temas
3. **Dificultad** - Niveles de preguntas
4. **Estadísticas** - Historial de juegos
5. **Multimedia** - Preguntas con imágenes
6. **Idiomas** - Soporte multiidioma
7. **Temas** - Diferentes temas visuales
8. **Móvil** - App nativa

## 🎯 ESTADO FINAL

**El proyecto está 100% funcional** con todas las características solicitadas:
- ✅ Diseño gamer con animaciones
- ✅ Sistema de puntuación automático
- ✅ WebSockets en tiempo real
- ✅ Docker Compose para despliegue
- ✅ 15 preguntas de tecnología
- ✅ Flujo completo de juego
- ✅ Responsive design
- ✅ Controles del host
- ✅ Ranking de jugadores

**Listo para usar en producción** con `docker-compose up --build -d`
