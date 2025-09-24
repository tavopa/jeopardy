# 🎯 Jeopardy Trivia - Tech Edition

Una aplicación web de trivia basada en Jeopardy con preguntas de tecnología, diseñada para grupos de personas que quieren competir en tiempo real.

## 🚀 Características

- **Juego en tiempo real** con WebSockets
- **Diseño gamer** con animaciones llamativas
- **Sistema de puntuación** automático
- **Ranking de jugadores** en vivo
- **Temporizadores** para preguntas y respuestas
- **Interfaz responsive** para móviles y desktop
- **Preguntas de tecnología** precargadas

## 🎮 Cómo Jugar

### Para el Host:
1. Selecciona "SER HOST" en la pantalla principal
2. Haz clic en "ABRIR REGISTRO" para generar la URL de la sala
3. Comparte la URL con los jugadores
4. Haz clic en "INICIAR JUEGO" cuando todos estén listos
5. Controla el flujo del juego con "SIGUIENTE PREGUNTA"

### Para los Jugadores:
1. Selecciona "JUGAR" en la pantalla principal
2. Ingresa tu nombre
3. Espera a que el host inicie el juego
4. Responde las preguntas dentro del tiempo límite
5. ¡Compite por el primer lugar!

## 🛠️ Tecnologías Utilizadas

### Backend:
- **Python 3.11** con FastAPI
- **SQLAlchemy** para base de datos
- **WebSockets** para comunicación en tiempo real
- **SQLite** como base de datos local

### Frontend:
- **Next.js 14** con React 18
- **Tailwind CSS** para estilos
- **Framer Motion** para animaciones
- **TypeScript** para tipado

### DevOps:
- **Docker** y **Docker Compose**
- **Contenedores** para despliegue

## 📦 Instalación y Despliegue

### Prerrequisitos:
- Docker
- Docker Compose

### Pasos:

1. **Clona el repositorio:**
```bash
git clone <repository-url>
cd jeopardy
```

2. **Construye y ejecuta los contenedores:**
```bash
docker-compose up --build
```

3. **Accede a la aplicación:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

### Desarrollo Local:

#### Backend:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```

## 📝 Formato de Preguntas

Las preguntas se cargan desde el archivo `questions.txt` con el siguiente formato:

```
¿Cuál es el lenguaje de programación más popular?
A) Python
B) JavaScript
C) Java
D) C++
correcta:A
```

## 🎯 Flujo del Juego

1. **Registro**: El host abre el registro y comparte la URL
2. **Inicio**: Cuenta regresiva de 30 segundos
3. **Preguntas**: Cada pregunta tiene 15 segundos para responder
4. **Transición**: 5 segundos entre preguntas
5. **Final**: Ranking final con ganadores

## 🎨 Características del Diseño

- **Tema oscuro** con colores neón
- **Animaciones fluidas** con Framer Motion
- **Efectos de partículas** en el fondo
- **Gradientes** y efectos de brillo
- **Responsive design** para todos los dispositivos

## 🔧 Configuración

### Variables de Entorno:
- `NEXT_PUBLIC_API_URL`: URL del backend (por defecto: http://localhost:8000)
- `DATABASE_URL`: URL de la base de datos SQLite

### Personalización:
- Modifica `questions.txt` para agregar más preguntas
- Ajusta los temporizadores en el código
- Personaliza los colores en `tailwind.config.js`

## 📊 Estructura del Proyecto

```
jeopardy/
├── backend/
│   ├── main.py              # API principal
│   ├── requirements.txt     # Dependencias Python
│   └── Dockerfile          # Imagen del backend
├── frontend/
│   ├── app/
│   │   ├── components/      # Componentes React
│   │   ├── styles/         # Estilos CSS
│   │   └── page.tsx        # Página principal
│   ├── package.json        # Dependencias Node.js
│   └── Dockerfile          # Imagen del frontend
├── questions.txt           # Preguntas del juego
├── docker-compose.yml      # Configuración de contenedores
└── README.md              # Este archivo
```

## 🚀 Despliegue en Producción

Para desplegar en producción:

1. **Configura las variables de entorno**
2. **Usa un dominio personalizado**
3. **Configura SSL/TLS**
4. **Usa una base de datos externa** (PostgreSQL, MySQL)

```bash
# Ejemplo para producción
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🎉 ¡Disfruta Jugando!

¡Que tengas una excelente experiencia jugando Jeopardy Tech Edition! 🚀
