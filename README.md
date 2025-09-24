# 🎯 Jeopardy Trivia - Tech Edition

Una aplicación web de trivia basada en Jeopardy con preguntas de tecnología, diseñada para grupos de personas que compiten en tiempo real. Combina la emoción del juego clásico con tecnología moderna y un diseño gamer atractivo.

## 🎮 Objetivo del Juego

**Jeopardy Trivia Tech Edition** es una experiencia de trivia interactiva donde:

- **Hosts** pueden crear salas de juego y gestionar sesiones
- **Jugadores** compiten respondiendo preguntas de tecnología en tiempo real
- **Sistema de puntuación** automático con ranking en vivo
- **Experiencia inmersiva** con música de suspenso y animaciones
- **Diseño responsive** que funciona en móviles, tablets y desktop

### 🏆 Características Principales

- ⚡ **Tiempo real** con WebSockets para sincronización instantánea
- 🎨 **Diseño gamer** con efectos neón y animaciones fluidas
- 🎵 **Música de suspenso** durante el juego
- 🏅 **Sistema de puntuación** automático con podio animado
- ⏱️ **Temporizadores** para preguntas (15s) y transiciones
- 📱 **Responsive design** para todos los dispositivos
- 🔄 **Gestión de estado** avanzada con React

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        JEOPARDY TRIVIA                          │
│                      Tech Edition v1.0                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │    BACKEND      │    │   DATABASE      │
│                 │    │                 │    │                 │
│  Next.js 14     │◄──►│  FastAPI        │◄──►│   SQLite        │
│  React 18       │    │  Python 3.11   │    │   SQLAlchemy    │
│  TypeScript     │    │  WebSockets     │    │                 │
│  Tailwind CSS   │    │  Pydantic       │    │                 │
│  Framer Motion  │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   HOST PANEL    │    │   API ENDPOINTS │    │   PERSISTENCE   │
│                 │    │                 │    │                 │
│ • Game Control  │    │ • /register     │    │ • Users         │
│ • Player List   │    │ • /start-game   │    │ • Questions     │
│ • Question Mgmt│    │ • /next-question│    │ • User Answers  │
│ • Leaderboard   │    │ • /submit-answer│    │ • Scores        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│  PLAYER PANEL   │    │   WEBSOCKETS     │
│                 │    │                 │
│ • Registration  │    │ • Real-time     │
│ • Game Board   │    │ • Broadcasting   │
│ • Answer Input  │    │ • State Sync    │
│ • Results       │    │ • Notifications │
└─────────────────┘    └─────────────────┘
```

## 🛠️ Stack Tecnológico

### **Backend (Python)**
- **FastAPI** - Framework web moderno y rápido
- **WebSockets** - Comunicación en tiempo real
- **SQLAlchemy** - ORM para base de datos
- **Pydantic** - Validación de datos
- **SQLite** - Base de datos ligera y portable
- **Uvicorn** - Servidor ASGI de alto rendimiento

### **Frontend (React/Next.js)**
- **Next.js 14** - Framework React con SSR/SSG
- **React 18** - Biblioteca de UI con hooks modernos
- **TypeScript** - Tipado estático para mayor robustez
- **Tailwind CSS** - Framework CSS utility-first
- **Framer Motion** - Animaciones fluidas y profesionales
- **Lucide React** - Iconografía moderna

### **DevOps & Deployment**
- **Docker** - Contenedores para consistencia
- **Docker Compose** - Orquestación de servicios
- **Kubernetes** - Despliegue en clusters
- **Nginx Ingress** - Load balancing y routing
- **Persistent Volumes** - Almacenamiento de datos

## 🎮 Flujo del Juego

### **1. Configuración Inicial**
```
Host → Selecciona "SER HOST" → Abre registro → Genera URL única
```

### **2. Registro de Jugadores**
```
Jugadores → Acceden con URL → Registran nombre → Esperan inicio
```

### **3. Inicio del Juego**
```
Host → "INICIAR JUEGO" → Countdown 30s → Primera pregunta automática
```

### **4. Desarrollo del Juego**
```
Pregunta (15s) → Respuestas → Resultados → Siguiente pregunta
```

### **5. Finalización**
```
Última pregunta → "¡TENEMOS UN GANADOR!" → Podio final → Estadísticas
```

## 🚀 Despliegue

### **Docker Compose (Desarrollo)**
```bash
# Clonar repositorio
git clone <repository-url>
cd jeopardy

# Construir y ejecutar
docker-compose up --build -d

# Verificar servicios
docker-compose ps
docker-compose logs -f
```

### **Kubernetes (Producción)**
```bash
# Aplicar manifiestos
kubectl apply -k k8s/

# Verificar despliegue
kubectl get all -n jeopardy
kubectl get ingress -n jeopardy
```

### **Desarrollo Local**
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

## 📊 Estructura del Proyecto

```
jeopardy/
├── 📁 backend/                    # API FastAPI
│   ├── main.py                   # Servidor principal
│   ├── requirements.txt          # Dependencias Python
│   └── Dockerfile               # Imagen del backend
├── 📁 frontend/                   # Aplicación Next.js
│   ├── app/
│   │   ├── components/           # Componentes React
│   │   │   ├── HostPanel.tsx    # Panel del host
│   │   │   ├── PlayerPanel.tsx  # Panel del jugador
│   │   │   ├── GameBoard.tsx    # Tablero de juego
│   │   │   └── Leaderboard.tsx  # Ranking
│   │   ├── styles/
│   │   │   └── globals.css       # Estilos globales
│   │   ├── layout.tsx           # Layout principal
│   │   └── page.tsx             # Página de inicio
│   ├── package.json             # Dependencias Node.js
│   ├── tailwind.config.js       # Configuración Tailwind
│   └── Dockerfile               # Imagen del frontend
├── 📁 k8s/                       # Manifiestos Kubernetes
│   ├── namespace.yaml           # Namespace
│   ├── configmap.yaml           # Configuración
│   ├── backend-deployment.yaml  # Backend K8s
│   ├── frontend-deployment.yaml # Frontend K8s
│   ├── ingress.yaml              # Nginx Ingress
│   └── README.md               # Guía K8s
├── questions.txt                 # Preguntas del juego
├── docker-compose.yml           # Orquestación Docker
├── start.sh                     # Script Linux/Mac
├── start.ps1                    # Script Windows
└── README.md                    # Este archivo
```

## 🎯 Características Técnicas

### **Comunicación en Tiempo Real**
- **WebSockets** para sincronización instantánea
- **Broadcasting** de eventos a todos los clientes
- **Estado compartido** entre host y jugadores
- **Reconexión automática** en caso de desconexión

### **Gestión de Estado**
- **Estado del juego** centralizado en backend
- **Sincronización** automática con frontend
- **Persistencia** de datos en SQLite
- **Recuperación** de estado tras reinicio

### **Experiencia de Usuario**
- **Animaciones fluidas** con Framer Motion
- **Efectos visuales** con partículas y gradientes
- **Música de suspenso** durante el juego
- **Feedback visual** inmediato en respuestas
- **Responsive design** para todos los dispositivos

### **Seguridad y Rendimiento**
- **Validación** de datos con Pydantic
- **Sanitización** de inputs del usuario
- **Rate limiting** en endpoints críticos
- **Health checks** para monitoreo
- **Resource limits** en contenedores

## 🔧 Configuración

### **Variables de Entorno**
```bash
# Backend
DATABASE_URL=sqlite:///./data/jeopardy.db

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### **Personalización**
- **Preguntas**: Editar `questions.txt`
- **Temporizadores**: Modificar en código
- **Estilos**: Personalizar `tailwind.config.js`
- **Música**: Configurar `window.__SUSPENSE_URL__`

## 📈 Monitoreo y Logs

### **Docker Compose**
```bash
# Ver logs en tiempo real
docker-compose logs -f

# Logs específicos
docker-compose logs -f backend
docker-compose logs -f frontend
```

### **Kubernetes**
```bash
# Logs de pods
kubectl logs -f deployment/jeopardy-backend -n jeopardy
kubectl logs -f deployment/jeopardy-frontend -n jeopardy

# Estado de recursos
kubectl get all -n jeopardy
kubectl describe ingress jeopardy-ingress -n jeopardy
```

## 🎨 Diseño y UX

### **Tema Visual**
- **Colores neón**: Cyan, amarillo, azul con efectos de brillo
- **Fondo oscuro**: Gradientes con partículas flotantes
- **Animaciones**: Transiciones suaves y profesionales
- **Tipografía**: Fuentes modernas y legibles

### **Componentes de UI**
- **Botones neón** con efectos hover y click
- **Temporizadores** con animaciones pulsantes
- **Tarjetas de preguntas** con bordes brillantes
- **Ranking animado** con podio y efectos
- **Efectos de partículas** en el fondo

## 🚀 Roadmap y Mejoras Futuras

### **Próximas Características**
- [ ] **Más preguntas** y categorías temáticas
- [ ] **Sistema de logros** y badges
- [ ] **Estadísticas detalladas** de rendimiento
- [ ] **Modo multijugador** con salas privadas
- [ ] **Integración** con redes sociales
- [ ] **App móvil** nativa

### **Mejoras Técnicas**
- [ ] **Base de datos** PostgreSQL/MySQL
- [ ] **Cache Redis** para mejor rendimiento
- [ ] **CDN** para assets estáticos
- [ ] **CI/CD** pipeline automatizado
- [ ] **Monitoring** con Prometheus/Grafana

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Para contribuir:

1. **Fork** el repositorio
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

### **Guías de Contribución**
- Sigue las convenciones de código existentes
- Añade tests para nuevas funcionalidades
- Actualiza la documentación según sea necesario
- Asegúrate de que todos los tests pasen

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT**. Ver el archivo `LICENSE` para más detalles.

## 🎉 ¡Disfruta Jugando!

**Jeopardy Trivia Tech Edition** está diseñado para ser una experiencia divertida y educativa. ¡Perfecto para:

- 🏢 **Equipos de trabajo** - Team building y diversión
- 🎓 **Educación** - Aprendizaje interactivo de tecnología
- 👥 **Grupos de amigos** - Competencia amigable
- 🎪 **Eventos** - Entretenimiento en vivo

¡Que tengas una excelente experiencia jugando! 🚀🎮

---

**Desarrollado con ❤️ usando tecnologías modernas**